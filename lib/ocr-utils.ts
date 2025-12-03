/**
 * OCR Utility Functions
 * Handles text extraction, amount parsing, date detection, and vendor recognition
 */

export interface OCRResult {
  rawText: string
  amount?: number
  date?: Date
  vendor?: string
  confidence: number
  items?: string[]
}

/**
 * Suggest category based on text content analysis
 * Analyzes keywords in the entire text to suggest appropriate category
 */
export function suggestCategoryFromContext(text: string, vendor?: string): string | null {
  const lowerText = text.toLowerCase()
  const lowerVendor = vendor?.toLowerCase() || ''
  
  // Režije (Utilities)
  if (
    /(?:електропривреда|eps|struja|el\. energija|električna energija|за исплату)/i.test(text) ||
    /(?:srbijagas|gas|grejanje)/i.test(text) ||
    /(?:водовод|vodovod|вода|water)/i.test(text) ||
    /(?:yettel|vip mobile|mts|telenor|telekom|mobile)/i.test(text) ||
    /(?:sbb|супернова|supernova|tv|internet|kablovska)/i.test(text)
  ) {
    return 'Režije'
  }
  
  // Supermarket
  if (
    /(?:maxi|lidl|aldi|mercator|idea|roda|tempo|dis)/i.test(lowerVendor) ||
    /(?:market|продавница|supermarket)/i.test(lowerText)
  ) {
    return 'Supermarket'
  }
  
  // Gorivo
  if (
    /(?:nis petrol|omv|mol|petrol|benzin|dizel|nafta|gorivo)/i.test(text)
  ) {
    return 'Gorivo'
  }
  
  // Restorani
  if (
    /(?:restoran|restaurant|kafana|cafe|caffe|кафе)/i.test(text)
  ) {
    return 'Restorani'
  }
  
  // Zdravlje
  if (
    /(?:апотека|apoteka|pharmacy|lilly|benu)/i.test(text)
  ) {
    return 'Zdravlje'
  }
  
  // Transport
  if (
    /(?:parking|паркинг|такси|taxi|uber|car go|bus)/i.test(lowerText)
  ) {
    return 'Transport'
  }
  
  // Nameštaj
  if (
    /(?:ikea|jysk|lesnina|nameštaj|namestaj|furniture|kauč|krevet)/i.test(text)
  ) {
    return 'Nameštaj'
  }
  
  // Odeća
  if (
    /(?:zara|h&m|fashion|moda|одећа|odeca|cipele|patike)/i.test(text)
  ) {
    return 'Odeća'
  }
  
  // Tehnika
  if (
    /(?:gigatron|tehnomanija|laptop|telefon|kompjuter)/i.test(text)
  ) {
    return 'Tehnika'
  }
  
  return null
}

/**
  confidence: number
  items?: string[]
}

/**
 * Extract amount from OCR text
 * Handles formats: 1.234,56 | 1234.56 | 1 234,56 RSD | TOTAL: 5000
 * Improved for Serbian receipts (EPS, stores, etc.)
 */
export function extractAmount(text: string): { amount: number; confidence: number } | null {
  const amountPatterns = [
    // Priority 1: "Ukupno za uplatu/naplatu" - NAJČEŠĆI na računima
    /(?:ukupno\s+(?:za\s+)?(?:uplatu|naplatu)|укупно\s+(?:за\s+)?(?:уплату|наплату))[\s:]*(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,

    // Priority 2: "Za uplatu" variants (EPS i slični računi)
    /(?:за\s+уплату|za\s+uplatu|за\s+исплату)[\s\S]{0,80}?(\d{1,2}[.,]\d{3}[.,]\d{2})\s*(?:дин|din|rsd)?/i,

    // Priority 3: "Ukupan iznos" / "Ukupno"
    /(?:ukupan\s+iznos|укупан\s+износ|ukupno\s+rsd|укупно\s+рсд)[\s:]*(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,

    // Priority 4: "Total sa PDV" / "Ukupno sa PDV"
    /(?:total\s+sa\s+pdv|ukupno\s+sa\s+pdv|тотал\s+са\s+пдв|укупно\s+са\s+пдв)[\s:]*(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,

    // Priority 5: "Svega za uplatu" / "Iznos za uplatu"
    /(?:svega\s+za\s+uplatu|свега\s+за\s+уплату|iznos\s+za\s+uplatu|износ\s+за\s+уплату)[\s:]*(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,

    // Priority 6: "Svega sa PDV" / "Svega"
    /(?:svega\s+sa\s+pdv|свега\s+са\s+пдв|svega|свега)[\s:]+(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,

    // Priority 7: Generic "TOTAL:", "UKUPNO:", "IZNOS:", "SUMA:" (with colon)
    /(?:укупно|ukupno|total|тотал|suma|сума|iznos|износ)[\s]*:[\s]*(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,

    // Priority 8: Numbers with currency marker
    /(\d{1,2}[.,]\d{3}[.,]\d{2})\s*(?:rsd|din|dinara|динара|дин)/i,
  ]

  const lines = text.split('\n')
  
  // Try patterns in order - RETURN FIRST MATCH from ANY keyword pattern
  for (let i = 0; i < amountPatterns.length; i++) {
    const pattern = amountPatterns[i]
    
    for (const line of lines) {
      // Skip lines that look like account numbers or IDs
      if (/(?:šifra|sifra|broj\s+računa|broj\s+racuna|ID\s+računa|naplatni\s+broj|ed\s+broj|konto|партнер|partner\s+ID)/i.test(line)) {
        continue
      }

      // Skip lines that clearly contain dates with date keywords
      if (/\d{1,2}\.\d{1,2}\.\d{4}/.test(line) && /(?:datum|date|period|rok|važeći|vazi)/i.test(line)) {
        continue
      }

      const match = line.match(pattern)
      if (match) {
        const amountStr = match[1]
          .replace(/\s/g, '') // Remove spaces
          .replace(/\./g, '') // Remove thousand separators (dots)
          .replace(',', '.') // Convert decimal comma to dot
        
        const amount = parseFloat(amountStr)
        
        // Validate amount range (10 RSD to 10M RSD)
        if (!isNaN(amount) && amount >= 10 && amount < 10000000) {
          const confidence = i < 5 ? 0.95 : i < 7 ? 0.90 : 0.85;
          console.log(`✅ Found amount ${amount} RSD (pattern ${i + 1}: "${amountPatterns[i].source.substring(0, 40)}...", confidence ${confidence}) from line: "${line.trim()}"`);
          return { amount, confidence }
        }
      }
    }
  }

  // Fallback: find well-formatted number (X.XXX,XX format only)
  // Only trigger if > 1000 RSD to avoid small partial prices
  let maxAmountFallback = 0
  let maxLineFallback = ''

  for (const line of lines) {
    // Skip lines with problematic keywords
    if (/(?:datum|date|period|rok|plaćanja|izdavanja|šifra|sifra|broj|ID|račun|racun|naplatni|ed\s+broj|konto|partner)/i.test(line)) {
      continue
    }

    // Match ONLY well-formatted large numbers: X.XXX,XX or XX.XXX,XX (Serbian format)
    const formattedMatch = line.match(/\b(\d{1,2}[.]\d{3}[,]\d{2})\b/)

    if (formattedMatch) {
      const cleanedStr = formattedMatch[1]
        .replace(/\./g, '')
        .replace(',', '.')

      const amount = parseFloat(cleanedStr)
      
      // Fallback only for amounts > 1000 RSD and < 100,000 RSD
      if (!isNaN(amount) && amount > 1000 && amount < 100000 && amount > maxAmountFallback) {
        maxAmountFallback = amount
        maxLineFallback = line.trim()
      }
    }
  }

  if (maxAmountFallback > 0) {
    console.log(`💡 Fallback: Found formatted amount ${maxAmountFallback} RSD from line: "${maxLineFallback}"`);
    return { amount: maxAmountFallback, confidence: 0.65 }
  }

  console.log(`❌ No valid amount found in OCR text`);
  return null
}

/**
 * Extract date from OCR text
 * Handles formats: DD.MM.YYYY | DD/MM/YYYY | YYYY-MM-DD | 29.11.2025.
 */
export function extractDate(text: string): { date: Date; confidence: number } | null {
  const datePatterns = [
    // DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
    /(\d{1,2})[./-](\d{1,2})[./-](\d{4})/,
    // YYYY-MM-DD
    /(\d{4})-(\d{1,2})-(\d{1,2})/,
    // DD.MM.YY
    /(\d{1,2})[./-](\d{1,2})[./-](\d{2})\b/,
  ]

  const lines = text.split('\n').slice(0, 10) // Only check first 10 lines (dates are usually at top)

  for (const pattern of datePatterns) {
    for (const line of lines) {
      const match = line.match(pattern)
      if (match) {
        let day: number, month: number, year: number

        if (pattern === datePatterns[1]) {
          // YYYY-MM-DD format
          year = parseInt(match[1])
          month = parseInt(match[2])
          day = parseInt(match[3])
        } else if (pattern === datePatterns[2]) {
          // DD.MM.YY format (2-digit year)
          day = parseInt(match[1])
          month = parseInt(match[2])
          year = parseInt(match[3]) + 2000 // Assume 20xx
        } else {
          // DD.MM.YYYY format
          day = parseInt(match[1])
          month = parseInt(match[2])
          year = parseInt(match[3])
        }

        // Validate date
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2020 && year <= 2030) {
          const date = new Date(year, month - 1, day)
          // Check if date is valid (handles Feb 30, etc.)
          if (date.getDate() === day && date.getMonth() === month - 1) {
            return { date, confidence: 0.85 }
          }
        }
      }
    }
  }

  // Default to today if no date found
  return { date: new Date(), confidence: 0.3 }
}

/**
 * Extract vendor/store name from OCR text
 * Usually in first 3 lines, often in all caps
 */
export function extractVendor(text: string): { vendor: string; confidence: number } | null {
  const lines = text.split('\n').filter(line => line.trim().length > 0)
  
  if (lines.length === 0) return null

  // First line is often the vendor name
  const firstLine = lines[0].trim()
  
  // Check if first line is all caps or has common store patterns
  const isAllCaps = firstLine === firstLine.toUpperCase() && firstLine.length > 3
  const hasStoreName = /(?:d\.o\.o\.|doo|market|shop|store|prodavnica|restoran|cafe)/i.test(firstLine)

  if (isAllCaps || hasStoreName) {
    return { vendor: firstLine, confidence: 0.8 }
  }

  // Try second line
  if (lines.length > 1) {
    const secondLine = lines[1].trim()
    const isAllCaps2 = secondLine === secondLine.toUpperCase() && secondLine.length > 3
    if (isAllCaps2) {
      return { vendor: secondLine, confidence: 0.6 }
    }
  }

  // Fallback: use first line anyway
  return { vendor: firstLine, confidence: 0.4 }
}

/**
 * Extract individual items from receipt (optional feature)
 * Only extracts items for store/supermarket receipts, skips utility bills
 */
export function extractItems(text: string): string[] {
  const items: string[] = []
  const lines = text.split('\n')

  // Detect if this is a utility bill (electricity, gas, water, phone, etc.)
  const isUtilityBill = /(?:електропривреда|eps|srbijagas|water|телеком|yettel|vip|mts|telenor|комуналне|комуналије)/i.test(text)
  
  // Don't extract items for utility bills - they're not useful
  if (isUtilityBill) {
    return []
  }

  for (const line of lines) {
    // Skip lines that are likely headers, footers, or totals
    if (
      /(?:ukupno|total|svega|pdv|vat|datum|date|adresa|address|účun|račun|period|број)/i.test(line) ||
      line.trim().length < 3
    ) {
      continue
    }

    // Look for lines with prices (item + price pattern)
    const itemMatch = line.match(/(.+?)\s+(\d+[.,]\d{2})/)
    if (itemMatch) {
      const itemName = itemMatch[1].trim()
      // Filter out dates, numbers, single words
      if (itemName.length > 2 && itemName.length < 50 && !/^\d+$/.test(itemName)) {
        items.push(itemName)
      }
    }
  }

  return items.slice(0, 20) // Max 20 items
}

/**
 * Main function to process OCR text and extract all data
 */
export function processOCRText(rawText: string): OCRResult {
  const amountResult = extractAmount(rawText)
  const dateResult = extractDate(rawText)
  const vendorResult = extractVendor(rawText)
  const items = extractItems(rawText)

  // Calculate overall confidence (average of individual confidences)
  const confidences = [
    amountResult?.confidence || 0,
    dateResult?.confidence || 0,
    vendorResult?.confidence || 0,
  ]
  const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length

  return {
    rawText,
    amount: amountResult?.amount,
    date: dateResult?.date,
    vendor: vendorResult?.vendor,
    confidence: avgConfidence,
    items: items.length > 0 ? items : undefined,
  }
}

/**
 * Known vendors database (can be expanded or moved to database)
 * Used to normalize vendor names and auto-assign categories
 */
export const KNOWN_VENDORS: Record<string, { name: string; category: string }> = {
  // Supermarketi
  'MAXI': { name: 'Maxi', category: 'Supermarket' },
  'IDEA': { name: 'Idea', category: 'Supermarket' },
  'MERCATOR': { name: 'Mercator', category: 'Supermarket' },
  'DIS': { name: 'Dis', category: 'Supermarket' },
  'LIDL': { name: 'Lidl', category: 'Supermarket' },
  'AMAN': { name: 'Aman', category: 'Supermarket' },
  'RODA': { name: 'Roda', category: 'Supermarket' },
  
  // Gorivo
  'NIS': { name: 'NIS Petrol', category: 'Gorivo' },
  'GAZPROM': { name: 'Gazprom', category: 'Gorivo' },
  'MOL': { name: 'MOL', category: 'Gorivo' },
  'LUKOIL': { name: 'Lukoil', category: 'Gorivo' },
  
  // Restorani
  'MCDONALDS': { name: "McDonald's", category: 'Restorani' },
  'KFC': { name: 'KFC', category: 'Restorani' },
  'STARBUCKS': { name: 'Starbucks', category: 'Restorani' },
  
  // Zdravlje/Apoteke
  'DM': { name: 'DM Drogerie', category: 'Zdravlje' },
  'LILLY': { name: 'Lilly', category: 'Zdravlje' },
  
  // Komunalije
  'ЕЛЕКТРОПРИВРЕДА': { name: 'EPS Elektroprivreda', category: 'Režije' },
  'EPS': { name: 'EPS Elektroprivreda', category: 'Režije' },
  'SRBIJAGAS': { name: 'Srbijagas', category: 'Režije' },
  'VODOVOD': { name: 'Vodovod', category: 'Režije' },
}

/**
 * Normalize vendor name using known vendors database
 */
export function normalizeVendor(rawVendor: string): { name: string; category?: string } {
  const upper = rawVendor.toUpperCase()
  
  for (const [key, value] of Object.entries(KNOWN_VENDORS)) {
    if (upper.includes(key)) {
      return value
    }
  }

  return { name: rawVendor }
}
