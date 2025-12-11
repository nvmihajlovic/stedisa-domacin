import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUser } from "@/lib/auth";
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { processOCRText, normalizeVendor, suggestCategoryFromContext } from '@/lib/ocr-utils';
import { suggestCategory } from '@/lib/categorySuggestion';
import heicConvert from 'heic-convert';

const prisma = new PrismaClient();

// Initialize Google Vision client
let visionClient: ImageAnnotatorClient | null = null;

function getVisionClient() {
  if (!visionClient) {
    try {
      // Option 1: Use service account JSON path from env
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        visionClient = new ImageAnnotatorClient({
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        });
      }
      // Option 2: Use inline credentials from env (for Vercel)
      else if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
        visionClient = new ImageAnnotatorClient({
          credentials: {
            client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          },
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        });
      }
      // Option 3: Fallback to default credentials
      else {
        visionClient = new ImageAnnotatorClient();
      }
    } catch (error) {
      console.error('Failed to initialize Google Vision client:', error);
      throw new Error('OCR service not configured');
    }
  }
  return visionClient;
}

// Helper: Preprocess image for better OCR
async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  try {
    // Apply image enhancements for better OCR accuracy
    return await sharp(buffer)
      .resize(3000, 3000, { // Povećaj rezoluciju za bolju čitljivost
        fit: 'inside',
        withoutEnlargement: false
      })
      .grayscale() // Konvertuj u grayscale
      .normalize() // Normalizuj kontrast
      .sharpen() // Oštrina
      .toBuffer();
  } catch (error) {
    console.log("Preprocessing failed, using original image");
    return buffer;
  }
}

// Helper: Extract text from PDF (with fallback to OCR)
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  let text = "";
  
  // 1. Pokušaj direktno čitanje teksta iz PDF-a
  try {
    const pdfParse = require("pdf-parse");
    const pdfData = await pdfParse(buffer);
    text = pdfData.text || "";
    console.log(`📄 PDF text extraction: ${text.length} characters`);
    
    if (text.trim().length > 50) {
      console.log("✅ PDF has extractable text, using direct extraction");
      return text;
    }
  } catch (error) {
    console.log("⚠️ Direct PDF text extraction failed");
  }

  // 2. PDF je verovatno skeniran - ne možemo da ga konvertujemo server-side
  console.log("❌ PDF nema teksta ili je skeniran dokument");
  throw new Error(
    "PDF dokument ne sadrži čitljiv tekst ili je skeniran. " +
    "Molimo Vas da:\n" +
    "1. Fotografišete račun telefonom/kamerom, ili\n" +
    "2. Napravite screenshot PDF-a i uploadujte kao sliku (PNG/JPG)\n\n" +
    "OCR sistema savršeno čita slike računa!"
  );
}

// Helper: Perform OCR on image
async function performOCR(buffer: Buffer): Promise<string> {
  console.log("🔍 Starting OCR process...");
  
  // Preprocess sliku
  const processedBuffer = await preprocessImage(buffer);
  
  // Kreiraj worker sa srpskim i engleskim jezikom
  const workerPath = path.join(
    process.cwd(),
    'node_modules',
    'tesseract.js',
    'src',
    'worker-script',
    'node',
    'index.js'
  );

  const worker = await createWorker(['srp', 'eng'], 1, {
    workerPath: workerPath,
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  // OCR sa dodatnim konfiguracijama za bolje prepoznavanje
  const { data: { text, confidence } } = await worker.recognize(processedBuffer, {
    rotateAuto: true, // Automatska rotacija
  });

  await worker.terminate();

  console.log(`✅ OCR completed with ${confidence}% confidence`);
  console.log(`📝 Extracted ${text.length} characters`);
  
  return text;
}

export async function POST(req: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let ocrLog;

  try {
    const formData = await req.formData();
    const file = formData.get("receipt") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log(`\n📤 Processing file: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)} KB)`);

    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // Automatska detekcija tipa fajla
    const isPDF = file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf');
    const isHEIC = file.type === "image/heic" || file.type === "image/heif" || /\.(heic|heif)$/i.test(file.name);
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|bmp|gif|tiff|tif|heic|heif|avif)$/i.test(file.name);

    console.log(`📋 File type: ${isPDF ? 'PDF' : isHEIC ? 'HEIC/HEIF' : isImage ? 'Image' : 'Unknown'}`);

    // Validacija formata
    if (!isPDF && !isImage) {
      return NextResponse.json(
        { error: "Nepodržan format. Podržani: JPG, PNG, WEBP, BMP, GIF, TIFF, HEIC, HEIF, AVIF, PDF" },
        { status: 400 }
      );
    }

    // Konverzija HEIC/HEIF u JPEG pre OCR obrade
    if (isHEIC) {
      try {
        console.log("🔄 Converting HEIC/HEIF to JPEG...");
        const jpegBuffer = await heicConvert({
          buffer: buffer,
          format: 'JPEG',
          quality: 0.95
        });
        buffer = Buffer.from(jpegBuffer);
        console.log("✅ HEIC conversion successful");
      } catch (conversionError) {
        console.error("❌ HEIC conversion failed:", conversionError);
        return NextResponse.json(
          { error: "Greška pri konverziji HEIC formata. Pokušajte sa JPG ili PNG." },
          { status: 500 }
        );
      }
    }

    // Kreiranje OCR log entry
    ocrLog = await prisma.oCRLog.create({
      data: {
        userId: user.userId,
        imageUrl: "",
        status: "pending",
      },
    });

    console.log(`🆔 OCR Log ID: ${ocrLog.id}`);

    // Google Vision OCR Processing
    let extractedText = "";

    try {
      console.log("🚀 Processing with Google Vision API...");
      
      // Convert buffer to base64
      const base64Image = buffer.toString('base64');
      
      // Call Google Vision API
      const client = getVisionClient();
      const [result] = await client.textDetection({
        image: {
          content: base64Image,
        },
      });

      const detections = result.textAnnotations;
      
      if (!detections || detections.length === 0) {
        throw new Error('No text detected in image');
      }

      // Extract full text (first annotation contains all text)
      extractedText = detections[0].description || '';
      console.log(`✅ Google Vision extracted ${extractedText.length} characters`);
      console.log(`\n📊 Extracted text preview:\n${extractedText.substring(0, 300)}...\n`);

      // Process text with our utility functions
      const ocrResult = processOCRText(extractedText);

      // Use new intelligent category suggestion system
      let suggestedCategoryObject: any = null;
      
      console.log(`🤖 Using new ML-based category suggestion system...`);
      console.log(`📝 OCR extracted vendor: "${ocrResult.vendor}"`);
      console.log(`📄 Text length: ${extractedText.length} chars`);
      
      // Call the new suggestion engine with OCR text
      const suggestion = await suggestCategory(
        user.userId,
        extractedText,
        ocrResult.vendor
      );

      console.log(`🔍 Suggestion result:`, suggestion);

      if (suggestion) {
        console.log(`✅ Category suggested: "${suggestion.categoryName}" (confidence: ${(suggestion.confidence * 100).toFixed(0)}%, source: ${suggestion.source})`);
        
        // Fetch full category details
        const category = await prisma.category.findUnique({
          where: { id: suggestion.categoryId },
        });

        console.log(`🔍 Category lookup for ID ${suggestion.categoryId}:`, category ? `Found: ${category.name}` : 'NOT FOUND');

        if (category) {
          suggestedCategoryObject = {
            id: category.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            confidence: suggestion.confidence,
            source: suggestion.source,
            isUserPreference: suggestion.source === 'user_learning',
            vendorName: suggestion.vendorName,
          };
          
          console.log(`✅ Final suggestion object:`, suggestedCategoryObject);
          
          // Update vendor name from suggestion if available
          if (suggestion.vendorName) {
            ocrResult.vendor = suggestion.vendorName;
          }
        } else {
          console.log(`❌ Category ID ${suggestion.categoryId} not found in database!`);
        }
      } else {
        console.log(`⚠️ No category suggestion found`);
      }

      // Format data for compatibility with existing ReceiptUploader
      const extractedData = {
        amount: ocrResult.amount,
        date: ocrResult.date?.toISOString().split('T')[0], // Format as YYYY-MM-DD
        description: ocrResult.vendor || 'Trošak',
        items: ocrResult.items,
        confidence: ocrResult.confidence,
        // Suggested category with full details
        suggestedCategory: suggestedCategoryObject,
        isUserPreference: suggestedCategoryObject?.isUserPreference || false,
        vendorName: ocrResult.vendor, // Pass vendor name for mapping
        rawText: extractedText, // Include raw OCR text
      };

      console.log("💰 Extracted data:", {
        amount: extractedData.amount,
        date: extractedData.date,
        description: extractedData.description,
        confidence: ocrResult.confidence,
        itemsCount: extractedData.items?.length || 0,
        suggestedCategory: extractedData.suggestedCategory
      });

      // Update log sa rezultatima
      await prisma.oCRLog.update({
        where: { id: ocrLog.id },
        data: {
          extractedData: extractedData as any,
          status: "success",
        },
      });

      return NextResponse.json({
        success: true,
        extractedData,
        ocrLogId: ocrLog.id,
        metadata: {
          fileType: isPDF ? 'pdf' : 'image',
          textLength: extractedText.length,
          processingMethod: 'google-vision',
          confidence: ocrResult.confidence
        }
      });

    } catch (processingError) {
      console.error("❌ Processing error:", processingError);

      await prisma.oCRLog.update({
        where: { id: ocrLog.id },
        data: {
          status: "failed",
          errorMessage:
            processingError instanceof Error
              ? processingError.message
              : "Obrada nije uspela",
        },
      });

      // Handle specific Google Vision errors
      let errorMessage = "Obrada fajla nije uspela. Molimo unesite podatke ručno.";
      
      if (processingError instanceof Error) {
        if (processingError.message.includes('credentials')) {
          errorMessage = "OCR servis nije konfigurisan. Molimo kontaktirajte administratora.";
        } else if (processingError.message.includes('No text detected')) {
          errorMessage = "Nije detektovan tekst na slici. Molimo fotografišite račun jasnije.";
        } else {
          errorMessage = processingError.message;
        }
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        ocrLogId: ocrLog.id,
      });
    }

  } catch (error) {
    console.error("❌ Fatal error:", error);
    
    if (ocrLog) {
      await prisma.oCRLog.update({
        where: { id: ocrLog.id },
        data: {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }

    return NextResponse.json(
      { 
        error: "Došlo je do greške pri obradi fajla",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

function extractReceiptData(text: string): {
  amount?: number;
  date?: string;
  items?: string[];
  description?: string;
} {
  const data: { amount?: number; date?: string; items?: string[]; description?: string } = {};

  console.log("\n🔍 Starting data extraction...");

  // 1. OPIS / KATEGORIJA - Prošireni rečnik
  const servicePatterns = [
    // Komunalne usluge
    { pattern: /elektri[cč]n[aoeiu]*\s*energ[ij][jua]|EPS|ЕПС|Elektroprivreda|Електропривреда|struja|струја/i, name: "Električna energija" },
    { pattern: /vodosnabdevanje|vodovod|водоснабдевање|водовод|BVK|БВК|Beogradski vodovod|Београдски водовод|JKP|voda|вода/i, name: "Voda i kanalizacija" },
    { pattern: /grejanje|toplana|грејање|топлана|CG EKO|heating/i, name: "Grejanje" },
    { pattern: /\bgas\b|\bгас\b|Srbijagas|Србијагас|prirodni gas|природни гас/i, name: "Gas" },
    
    // Telekomunikacije
    { pattern: /telefon[ij]*|телефон[ij]*|telekom|телеком|Yettel|A1\s*Srbija|VIP\s*mobile|mobilni|мобилни/i, name: "Telefon" },
    { pattern: /internet|интернет|SBB|Supernova|broadband/i, name: "Internet" },
    { pattern: /TV\s*pretplata|kablovska|кабловска|EON|SBB/i, name: "TV pretplata" },
    
    // Osiguranje i finansije
    { pattern: /osiguranje|осигурање|insurance|polisa|полиса|DDOR|Dunav|Generali/i, name: "Osiguranje" },
    { pattern: /kredit|кредит|rata|рата|loan|credit/i, name: "Kredit/Rata" },
    
    // Transport
    { pattern: /parking|паркинг|parkiranje|паркирање|garaža|гаража/i, name: "Parking" },
    { pattern: /gorivo|гориво|benzin|бензин|NIS|nafta|нафта|diesel|дизел/i, name: "Gorivo" },
    { pattern: /prevoz|превоз|bus plus|busplus|karte|карте|GSP|transport/i, name: "Prevoz" },
    
    // Trgovina
    { pattern: /market|маркет|prodavnica|продавница|supermarket|супермаркет|Maxi|Макси|Idea|Идеа|Univerexport|Унивеrекспорт|Roda|Рода|Mercator|Меркатор|Lidl|Лидл/i, name: "Kupovina - Market" },
    { pattern: /apoteka|апотека|pharmacy|lekovi|лекови|Benu|Бену/i, name: "Apoteka" },
    { pattern: /restoran|ресторан|kafić|кафић|kafe|кафе|restaurant|coffee|кофе/i, name: "Restoran/Kafić" },
    { pattern: /pekara|пекара|hleb|хлеб|bakery/i, name: "Pekara" },
    
    // Zdravstvo i nega
    { pattern: /doktor|доктор|ordinacija|ординација|pregled|преглед|clinic|клиника/i, name: "Zdravstvo" },
    { pattern: /frizerski|фризерски|berber|berberin|barber|salon/i, name: "Frizerski salon" },
    { pattern: /kozmetika|козметика|cosmetics|dm|DM Drogerie/i, name: "Kozmetika" },
    
    // Obrazovanje
    { pattern: /škola|школа|school|fakultet|факултет|university|kurs|курс/i, name: "Obrazovanje" },
    { pattern: /knjiga|књига|book|knjižara|књижara/i, name: "Knjige" },
    
    // Ostalo
    { pattern: /zakup|закуп|kirija|кирија|rent|stanarina|станарина/i, name: "Kirija" },
    { pattern: /porez|порез|tax|taksa|такса|opština|општина/i, name: "Porez/Taksa" },
  ];

  for (const { pattern, name } of servicePatterns) {
    if (text.match(pattern)) {
      data.description = name;
      console.log(`✅ Category detected: ${name}`);
      break;
    }
  }

  // 2. IZNOS - Multi-pass ekstakcija
  let amount = 0;

  // Pass 1: Prioritetni patern sa ključnim rečima (latinica i ćirilica)
  const priorityAmountPatterns = [
    // Ukupan iznos, ukupno, ukupno sa PDV-om, svega, total, total with VAT
    /(?:ukupan\s*iznos|укупан\s*износ|ukupno\s*sa\s*pdv|укупно\s*са\s*пдв|ukupno\s*sa\s*porezom|укупно\s*са\s*порезом|total\s*with\s*vat|total\s*with\s*tax|grand\s*total|za\s*uplatu|za\s*isplatu|ukupno|укупно|сума|suma|iznos|износ|total|svega|свега|sveukupno|свеукупно|vrednost|вредност|naplata|наплата)[:\s]*[=]?\s*(\d{1,3}(?:[.,\s]\d{3})*[.,]\d{1,2})\s*(?:RSD|rsd|дин|din|DIN|ДИН)?/gi,
    /(?:ukupan\s*iznos|укупан\s*износ|ukupno\s*sa\s*pdv|укупно\s*са\s*пдв|ukupno\s*sa\s*porezom|укупно\s*са\s*порезом|total\s*with\s*vat|total\s*with\s*tax|grand\s*total|za\s*uplatu|za\s*isplatu|ukupno|укупно|сума|suma|iznos|износ|total|svega|свега|sveukupno|свеукупно|vrednost|вредност)[:\s]*[=]?\s*(\d{1,}[.,]\d{1,2})\s*(?:RSD|rsd|дин|din|DIN|ДИН)?/gi,
  ];

  for (const pattern of priorityAmountPatterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      for (const match of matches) {
        const amountStr = match[1]
          .replace(/\s/g, '')
          .replace(/\./g, '')
          .replace(',', '.');
        
        const foundAmount = parseFloat(amountStr);
        if (foundAmount > amount && foundAmount < 10000000) {
          amount = foundAmount;
          console.log(`💰 Amount found (priority): ${amount} RSD from "${match[0]}"`);
        }
      }
    }
  }

  // Pass 2: Ako nije našao, traži brojeve sa valutom (bez ključnih reči)
  if (!amount) {
    const lines = text.split('\n');
    for (const line of lines) {
      // Preskoči linije sa kodovima i šiframa
      if (line.match(/(?:MB|PIB|MAK|JIB|JMBG|ПИБ|МБ|ПАК|Broj|Број|ID|Šifra|Šifrа|Kod|Код|Region|Period|Periop|obračun|обрачун|racun|račun|model)/i)) {
        continue;
      }
      
      // Traži broj sa valutom
      const amountMatches = [
        line.match(/(\d{1,3}(?:[.,\s]\d{3})+[.,]\d{1,2})\s*(?:RSD|rsd|дин|din|DIN|ДИН)/i),
        line.match(/(\d{1,}[.,]\d{1,2})\s*(?:RSD|rsd|дин|din|DIN|ДИН)/i)
      ];

      for (const match of amountMatches) {
        if (match) {
          const amountStr = match[1]
            .replace(/\s/g, '')
            .replace(/\./g, '')
            .replace(',', '.');
          
          const foundAmount = parseFloat(amountStr);
          if (foundAmount > amount && foundAmount < 10000000) {
            amount = foundAmount;
            console.log(`💰 Amount found (currency): ${amount} RSD from line "${line.trim()}"`);
          }
        }
      }
    }
  }

  // Pass 3: Fallback - najveći broj koji liči na iznos
  if (!amount) {
    const numberMatches = Array.from(text.matchAll(/(\d{1,3}(?:[.,]\d{3})+[.,]\d{2}|\d{1,}[.,]\d{2})/g));
    
    for (const match of numberMatches) {
      const amountStr = match[1]
        .replace(/\./g, '')
        .replace(',', '.');
      
      const foundAmount = parseFloat(amountStr);
      if (foundAmount > amount && foundAmount > 10 && foundAmount < 10000000) {
        amount = foundAmount;
        console.log(`💰 Amount found (fallback): ${amount} from "${match[0]}"`);
      }
    }
  }

  if (amount > 0) {
    data.amount = Math.round(amount * 100) / 100; // Round to 2 decimals
  }

  // 3. DATUM - Multi-format ekstakcija sa prioritetom
  const datePatterns = [
    // Prioritetni paterni - datum izdavanja računa
    /(?:datum\s+izdavanja|датум\s+издавања|datum\s+računa|датум\s+рачуна|račun\s+broj.*?datum|рачун\s+број.*?датум)[:\s]*(\d{1,2}[.\/\-]\d{1,2}[.\/\-]\d{4})/i,
    /(?:račun\s+broj)[^\d]*\d+[^\d]+(\d{1,2}[.\/\-]\d{1,2}[.\/\-]\d{4})/i,
    // Opšti paterni
    /(?:datum|датум|date|izdato|издато)[:\s]*(\d{1,2}[.\/\-]\d{1,2}[.\/\-]\d{4})/i,
    // Bilo koji datum (fallback) - ali izuzmi period obračuna
    /(?!period|период).*?(\d{1,2}[.\/\-]\d{1,2}[.\/\-]\d{4})/i,
    // YYYY-MM-DD format
    /(\d{4}[.\/\-]\d{1,2}[.\/\-]\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const dateStr = match[1] || match[0];
      
      // Parse i konvertuj u YYYY-MM-DD
      let parsedDate = null;
      
      // DD.MM.YYYY format
      if (dateStr.match(/^\d{1,2}[.\/\-]\d{1,2}[.\/\-]\d{4}$/)) {
        const parts = dateStr.split(/[.\/\-]/);
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        parsedDate = `${year}-${month}-${day}`;
      }
      // YYYY-MM-DD format
      else if (dateStr.match(/^\d{4}[.\/\-]\d{1,2}[.\/\-]\d{1,2}$/)) {
        const parts = dateStr.split(/[.\/\-]/);
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        parsedDate = `${year}-${month}-${day}`;
      }
      
      if (parsedDate) {
        // Validacija datuma (ne u budućnosti, ne stariji od 5 godina)
        const date = new Date(parsedDate);
        const now = new Date();
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(now.getFullYear() - 5);
        
        if (date <= now && date >= fiveYearsAgo) {
          data.date = parsedDate;
          console.log(`📅 Date found: ${parsedDate}`);
          break;
        }
      }
    }
  }

  // 4. STAVKE - Ekstrakcija itemsa
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  data.items = lines
    .filter(line => {
      // Filter linije koje možda sadrže stavke
      return (
        line.length > 3 &&
        line.length < 100 &&
        !line.match(/^\d+$/) &&
        !line.match(/^[:\-=_]+$/) &&
        !line.match(/^(РСД|RSD|DIN|дин)$/i) &&
        !line.match(/^\d{1,2}[.\/\-]\d{1,2}[.\/\-]\d{4}$/)
      );
    })
    .slice(0, 15); // Max 15 stavki

  console.log(`📝 Extracted ${data.items.length} items`);
  console.log("\n✅ Data extraction complete\n");

  return data;
}

// GET endpoint for testing (returns API status)
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if credentials are configured
    const hasCredentials = !!(
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_PRIVATE_KEY)
    );

    return NextResponse.json({
      success: true,
      status: hasCredentials ? 'configured' : 'not-configured',
      message: hasCredentials
        ? 'Google Vision OCR is ready ✅'
        : 'Google Cloud credentials not found. Set GOOGLE_APPLICATION_CREDENTIALS or inline credentials. See GOOGLE-CLOUD-SETUP.md',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
