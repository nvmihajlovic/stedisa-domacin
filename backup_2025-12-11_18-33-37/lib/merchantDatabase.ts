/**
 * Merchant Database - Static mapping of known merchants to categories
 * Over 200+ merchants across various categories
 */

export interface MerchantMapping {
  patterns: string[]; // Keywords to match in merchant name/description
  category: string;   // Category name to suggest
  confidence: number; // Confidence score (0-1)
}

export const MERCHANT_DATABASE: MerchantMapping[] = [
  // ========================================
  // 🛒 HRANA I PIĆE (Supermarketi, Marketi)
  // ========================================
  {
    patterns: ['maxi', 'maxy', 'макси'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['idea', 'идеа', 'idea market'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['roda', 'рода'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['dis', 'дис', 'dis market'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['aman', 'аман'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['tempo', 'темпо'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['univerexport', 'универекспорт'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['metro', 'metro cash'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['mercator', 'меркатор'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['stop shop', 'stopshop'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['gomex', 'гомекс'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['aroma', 'арома', 'aroma market'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['express', 'експрес', 'express market'],
    category: 'Hrana i piće',
    confidence: 0.90
  },
  {
    patterns: ['retail', 'ритејл'],
    category: 'Hrana i piće',
    confidence: 0.90
  },
  {
    patterns: ['ld market', 'ld маркет'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['fresh', 'фреш', 'fresh & co'],
    category: 'Hrana i piće',
    confidence: 0.90
  },
  {
    patterns: ['продавница', 'market', 'supermarket', 'супермаркет'],
    category: 'Hrana i piće',
    confidence: 0.75
  },

  // Pekare
  {
    patterns: ['hleb & kifle', 'hleb i kifle', 'хлеб'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['trpković', 'трпковић'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['pekabeta', 'пекабета'],
    category: 'Hrana i piće',
    confidence: 0.95
  },
  {
    patterns: ['pekara', 'пекара', 'bakery'],
    category: 'Hrana i piće',
    confidence: 0.85
  },

  // ========================================
  // ⛽ GORIVO I BENZINSKE PUMPE
  // ========================================
  {
    patterns: ['omv', 'омв'],
    category: 'Gorivo',
    confidence: 0.98
  },
  {
    patterns: ['nis petrol', 'нис петрол', 'nis gazprom'],
    category: 'Gorivo',
    confidence: 0.98
  },
  {
    patterns: ['gazprom', 'газпром'],
    category: 'Gorivo',
    confidence: 0.98
  },
  {
    patterns: ['mol', 'мол', 'mol petrol'],
    category: 'Gorivo',
    confidence: 0.98
  },
  {
    patterns: ['lukoil', 'лукоил'],
    category: 'Gorivo',
    confidence: 0.98
  },
  {
    patterns: ['eko', 'еко', 'eko petrol'],
    category: 'Gorivo',
    confidence: 0.98
  },
  {
    patterns: ['knez petrol', 'кнез петрол'],
    category: 'Gorivo',
    confidence: 0.98
  },
  {
    patterns: ['petrol', 'петрол', 'benzinska', 'бензинска', 'pumpa', 'пумпа'],
    category: 'Gorivo',
    confidence: 0.80
  },

  // ========================================
  // 💡 REŽIJE / KOMUNALIJE (Komunalna preduzeća, Struja, Gas, Voda, Internet)
  // ========================================
  // Struja
  {
    patterns: ['eps', 'епс', 'elektroprivreda', 'електропривреда', 'elektroprivreda srbije', 'електропривреда србије'],
    category: 'Stanovanje i komunalije',
    confidence: 0.98
  },
  {
    patterns: ['ed beograd', 'ед београд', 'elektrodistribucija beograd'],
    category: 'Stanovanje i komunalije',
    confidence: 0.98
  },
  {
    patterns: ['ed novi sad', 'elektrodistribucija novi sad'],
    category: 'Stanovanje i komunalije',
    confidence: 0.98
  },
  {
    patterns: ['ed niš', 'ed nis', 'elektrodistribucija nis'],
    category: 'Stanovanje i komunalije',
    confidence: 0.98
  },
  {
    patterns: ['struja', 'струја', 'električna energija', 'електрична енергија'],
    category: 'Stanovanje i komunalije',
    confidence: 0.90
  },
  
  // Gas
  {
    patterns: ['srbijagas', 'србијагас', 'srbija gas'],
    category: 'Stanovanje i komunalije',
    confidence: 0.98
  },
  {
    patterns: ['beogas', 'беогас'],
    category: 'Stanovanje i komunalije',
    confidence: 0.98
  },
  {
    patterns: ['gas', 'гас', 'grejanje', 'грејање', 'топлана'],
    category: 'Stanovanje i komunalije',
    confidence: 0.85
  },
  
  // Voda
  {
    patterns: ['bvk', 'бвк', 'beogradski vodovod', 'београдски водовод'],
    category: 'Stanovanje i komunalije',
    confidence: 0.98
  },
  {
    patterns: ['jkp vodovod', 'јкп водовод'],
    category: 'Stanovanje i komunalije',
    confidence: 0.95
  },
  {
    patterns: ['vodovod', 'водовод', 'voda', 'вода', 'kanalizacija', 'канализација'],
    category: 'Stanovanje i komunalije',
    confidence: 0.85
  },
  
  // Internet i TV
  {
    patterns: ['sbb', 'сбб'],
    category: 'Stanovanje i komunalije',
    confidence: 0.98
  },
  {
    patterns: ['supernova', 'супернова'],
    category: 'Stanovanje i komunalije',
    confidence: 0.98
  },
  {
    patterns: ['orion telekom', 'орион телеком'],
    category: 'Stanovanje i komunalije',
    confidence: 0.98
  },
  {
    patterns: ['total tv', 'тотал тв'],
    category: 'Stanovanje i komunalije',
    confidence: 0.98
  },
  {
    patterns: ['kablovska', 'кабловска', 'tv pretplata', 'internet pretplata'],
    category: 'Stanovanje i komunalije',
    confidence: 0.85
  },
  
  // Telefon (fiksni)
  {
    patterns: ['telekom srbija', 'телеком србија', 'telekom fiksni'],
    category: 'Stanovanje i komunalije',
    confidence: 0.95
  },
  {
    patterns: ['fiksni telefon', 'фиксни телефон'],
    category: 'Stanovanje i komunalije',
    confidence: 0.85
  },
  
  // Opšte
  {
    patterns: ['komunalije', 'комуналије', 'režije', 'режије', 'računi', 'рачуни'],
    category: 'Stanovanje i komunalije',
    confidence: 0.80
  },

  // ========================================
  // 🍕 RESTORANI I KAFIĆI
  // ========================================
  // Fast Food
  {
    patterns: ['mcdonalds', 'мекдоналдс', "mcdonald's", 'mekdonalds'],
    category: 'Restoran/Kafić',
    confidence: 0.98
  },
  {
    patterns: ['kfc', 'кентаки'],
    category: 'Restoran/Kafić',
    confidence: 0.98
  },
  {
    patterns: ['burger king', 'бургер кинг'],
    category: 'Restoran/Kafić',
    confidence: 0.98
  },
  {
    patterns: ['subway', 'сабвеј'],
    category: 'Restoran/Kafić',
    confidence: 0.98
  },
  {
    patterns: ['walter', 'валтер'],
    category: 'Restoran/Kafić',
    confidence: 0.95
  },
  {
    patterns: ['pizza hut', 'пица хат'],
    category: 'Restoran/Kafić',
    confidence: 0.95
  },
  {
    patterns: ['dominos', 'доминос'],
    category: 'Restoran/Kafić',
    confidence: 0.95
  },

  // Kafići
  {
    patterns: ['costa', 'коста', 'costa coffee'],
    category: 'Restoran/Kafić',
    confidence: 0.95
  },
  {
    patterns: ['starbucks', 'старбакс'],
    category: 'Restoran/Kafić',
    confidence: 0.95
  },
  {
    patterns: ['coffee dream', 'кофе дрим'],
    category: 'Restoran/Kafić',
    confidence: 0.95
  },
  {
    patterns: ['black turtle', 'блек туртле'],
    category: 'Restoran/Kafić',
    confidence: 0.95
  },
  {
    patterns: ['coffeedream', 'coffee to go'],
    category: 'Restoran/Kafić',
    confidence: 0.90
  },

  // Generic patterns
  {
    patterns: ['restoran', 'ресторан', 'restaurant'],
    category: 'Restoran/Kafić',
    confidence: 0.85
  },
  {
    patterns: ['kafić', 'кафић', 'caffe', 'cafe', 'кафе', 'coffee', 'кофи'],
    category: 'Restoran/Kafić',
    confidence: 0.85
  },
  {
    patterns: ['pizzeria', 'пицерија', 'pizza'],
    category: 'Restoran/Kafić',
    confidence: 0.85
  },
  {
    patterns: ['bar', 'бар', 'pub', 'паб'],
    category: 'Restoran/Kafić',
    confidence: 0.80
  },

  // ========================================
  // 🏥 APOTEKE I ZDRAVLJE
  // ========================================
  {
    patterns: ['benu', 'бену', 'benu apoteka'],
    category: 'Zdravlje',
    confidence: 0.98
  },
  {
    patterns: ['jankovic', 'јанковић', 'janković'],
    category: 'Zdravlje',
    confidence: 0.98
  },
  {
    patterns: ['zegin', 'зегин'],
    category: 'Zdravlje',
    confidence: 0.98
  },
  {
    patterns: ['farmanova', 'farmanова'],
    category: 'Zdravlje',
    confidence: 0.98
  },
  {
    patterns: ['apoteka beograd', 'апотека београд'],
    category: 'Zdravlje',
    confidence: 0.98
  },
  {
    patterns: ['apoteka', 'апотека', 'pharmacy', 'фармација'],
    category: 'Zdravlje',
    confidence: 0.90
  },
  {
    patterns: ['dom zdravlja', 'дом здравља', 'health center'],
    category: 'Zdravlje',
    confidence: 0.95
  },
  {
    patterns: ['poliklinika', 'поликлиника'],
    category: 'Zdravlje',
    confidence: 0.95
  },
  {
    patterns: ['bel medic', 'бел медиц'],
    category: 'Zdravlje',
    confidence: 0.95
  },
  {
    patterns: ['razvitak', 'развитак'],
    category: 'Zdravlje',
    confidence: 0.95
  },

  // ========================================
  // 💄 LEPOTA I NEGA
  // ========================================
  {
    patterns: ['dm', 'дм', 'dm drogerie'],
    category: 'Lepota i nega',
    confidence: 0.98
  },
  {
    patterns: ['lilly', 'лили', 'lilly drogerie'],
    category: 'Lepota i nega',
    confidence: 0.98
  },
  {
    patterns: ['golden rose', 'голден роуз'],
    category: 'Lepota i nega',
    confidence: 0.95
  },
  {
    patterns: ['kozmo', 'козмо'],
    category: 'Lepota i nega',
    confidence: 0.95
  },
  {
    patterns: ['notino', 'нотино'],
    category: 'Lepota i nega',
    confidence: 0.95
  },
  {
    patterns: ['sephora', 'сефора'],
    category: 'Lepota i nega',
    confidence: 0.95
  },
  {
    patterns: ['douglas', 'даглас'],
    category: 'Lepota i nega',
    confidence: 0.95
  },
  {
    patterns: ['drogerija', 'дрогерија', 'drogerie'],
    category: 'Lepota i nega',
    confidence: 0.85
  },

  // ========================================
  // 👕 ODEĆA I OBUĆA
  // ========================================
  {
    patterns: ['zara', 'зара'],
    category: 'Odeća i obuća',
    confidence: 0.98
  },
  {
    patterns: ['h&m', 'hm', 'hennes'],
    category: 'Odeća i obuća',
    confidence: 0.98
  },
  {
    patterns: ['c&a', 'ca'],
    category: 'Odeća i obuća',
    confidence: 0.98
  },
  {
    patterns: ['new yorker', 'њу јоркер'],
    category: 'Odeća i obuća',
    confidence: 0.98
  },
  {
    patterns: ['lc waikiki', 'ваикики'],
    category: 'Odeća i obuća',
    confidence: 0.98
  },
  {
    patterns: ['terranova', 'теранова'],
    category: 'Odeća i obuća',
    confidence: 0.98
  },
  {
    patterns: ['reserved', 'резервед'],
    category: 'Odeća i obuća',
    confidence: 0.98
  },
  {
    patterns: ['bershka', 'бершка'],
    category: 'Odeća i obuća',
    confidence: 0.98
  },
  {
    patterns: ['pull&bear', 'pull and bear'],
    category: 'Odeća i obuća',
    confidence: 0.98
  },
  {
    patterns: ['mango', 'манго'],
    category: 'Odeća i obuća',
    confidence: 0.98
  },
  {
    patterns: ['sport vision', 'спорт визион'],
    category: 'Odeća i obuća',
    confidence: 0.95
  },
  {
    patterns: ['office shoes', 'офис шуз'],
    category: 'Odeća i obuća',
    confidence: 0.95
  },
  {
    patterns: ['bata', 'бата'],
    category: 'Odeća i obuća',
    confidence: 0.95
  },
  {
    patterns: ['humanic', 'хуманиц'],
    category: 'Odeća i obuća',
    confidence: 0.95
  },
  {
    patterns: ['deichmann', 'дајхман'],
    category: 'Odeća i obuća',
    confidence: 0.95
  },

  // ========================================
  // 🔧 TEHNIKA I ELEKTRONIKA
  // ========================================
  {
    patterns: ['gigatron', 'гигатрон'],
    category: 'Tehnika',
    confidence: 0.98
  },
  {
    patterns: ['tehnomanija', 'техноманија'],
    category: 'Tehnika',
    confidence: 0.98
  },
  {
    patterns: ['emmi', 'еми'],
    category: 'Tehnika',
    confidence: 0.98
  },
  {
    patterns: ['comtrade', 'комтрејд'],
    category: 'Tehnika',
    confidence: 0.98
  },
  {
    patterns: ['mobilni svet', 'мобилни свет'],
    category: 'Tehnika',
    confidence: 0.95
  },
  {
    patterns: ['samsung store', 'самсунг'],
    category: 'Tehnika',
    confidence: 0.95
  },
  {
    patterns: ['apple store', 'епл'],
    category: 'Tehnika',
    confidence: 0.95
  },
  {
    patterns: ['mi store', 'xiaomi'],
    category: 'Tehnika',
    confidence: 0.95
  },
  {
    patterns: ['winwin', 'вин вин'],
    category: 'Tehnika',
    confidence: 0.95
  },

  // ========================================
  // 🏠 NAMEŠTAJ I DOM
  // ========================================
  {
    patterns: ['ikea', 'икеа'],
    category: 'Kuća i dom',
    confidence: 0.98
  },
  {
    patterns: ['emmezeta', 'емезета'],
    category: 'Kuća i dom',
    confidence: 0.98
  },
  {
    patterns: ['lesnina', 'леснина'],
    category: 'Kuća i dom',
    confidence: 0.98
  },
  {
    patterns: ['jysk', 'јиск'],
    category: 'Kuća i dom',
    confidence: 0.98
  },
  {
    patterns: ['téša', 'теша'],
    category: 'Kuća i dom',
    confidence: 0.98
  },
  {
    patterns: ['forma ideale', 'форма идеале'],
    category: 'Kuća i dom',
    confidence: 0.98
  },
  {
    patterns: ['home box', 'хоум бокс'],
    category: 'Kuća i dom',
    confidence: 0.95
  },
  {
    patterns: ['pepco', 'пепко'],
    category: 'Kuća i dom',
    confidence: 0.95
  },

  // ========================================
  // 🚌 PREVOZ I TRANSPORT
  // ========================================
  {
    patterns: ['gsp beograd', 'гсп београд', 'gsp bg'],
    category: 'Prevoz',
    confidence: 0.98
  },
  {
    patterns: ['busplus', 'бусплус', 'bus plus'],
    category: 'Prevoz',
    confidence: 0.98
  },
  {
    patterns: ['lasta', 'ласта'],
    category: 'Prevoz',
    confidence: 0.95
  },
  {
    patterns: ['niš ekspres', 'ниш експрес'],
    category: 'Prevoz',
    confidence: 0.95
  },
  {
    patterns: ['taxi', 'такси', 'carro', 'yandex', 'bolt', 'uber'],
    category: 'Prevoz',
    confidence: 0.90
  },
  {
    patterns: ['parking', 'паркинг', 'garaža', 'гаража'],
    category: 'Prevoz',
    confidence: 0.85
  },

  // ========================================
  // 🎓 OBRAZOVANJE
  // ========================================
  {
    patterns: ['vulkan', 'вулкан', 'vulkan knjižare'],
    category: 'Obrazovanje',
    confidence: 0.95
  },
  {
    patterns: ['laguna', 'лагуна'],
    category: 'Obrazovanje',
    confidence: 0.95
  },
  {
    patterns: ['delfi', 'делфи'],
    category: 'Obrazovanje',
    confidence: 0.95
  },
  {
    patterns: ['knjižara', 'књижара', 'bookstore'],
    category: 'Obrazovanje',
    confidence: 0.85
  },
  {
    patterns: ['škola', 'школа', 'fakultet', 'факултет', 'univerzitet'],
    category: 'Obrazovanje',
    confidence: 0.90
  },

  // ========================================
  // 🎮 ZABAVA I RAZONODA
  // ========================================
  {
    patterns: ['cineplexx', 'синеплекс'],
    category: 'Zabava',
    confidence: 0.98
  },
  {
    patterns: ['bioskop', 'биоскоп', 'cinema'],
    category: 'Zabava',
    confidence: 0.90
  },
  {
    patterns: ['pozorište', 'позориште', 'theater'],
    category: 'Zabava',
    confidence: 0.90
  },
  {
    patterns: ['muzej', 'музеј', 'museum'],
    category: 'Zabava',
    confidence: 0.90
  },
  {
    patterns: ['gym', 'teretana', 'теретана', 'fitness'],
    category: 'Zabava',
    confidence: 0.85
  },

  // ========================================
  // 💰 FINANSIJE I BANKE
  // ========================================
  {
    patterns: ['intesa', 'интеса'],
    category: 'Banke i finansije',
    confidence: 0.95
  },
  {
    patterns: ['unicredit', 'уникредит'],
    category: 'Banke i finansije',
    confidence: 0.95
  },
  {
    patterns: ['raiffeisen', 'рајфајзен'],
    category: 'Banke i finansije',
    confidence: 0.95
  },
  {
    patterns: ['erste', 'ерсте'],
    category: 'Banke i finansije',
    confidence: 0.95
  },
  {
    patterns: ['komercijalna', 'комерцијална'],
    category: 'Banke i finansije',
    confidence: 0.95
  },
  {
    patterns: ['banka', 'банка', 'bank'],
    category: 'Banke i finansije',
    confidence: 0.85
  },

  // ========================================
  // 📱 TELEKOMUNIKACIJE
  // ========================================
  {
    patterns: ['telekom', 'телеком', 'mts'],
    category: 'Telekomunikacije',
    confidence: 0.98
  },
  {
    patterns: ['telenor', 'теленор'],
    category: 'Telekomunikacije',
    confidence: 0.98
  },
  {
    patterns: ['yettel', 'jettel', 'јетел', 'a1'],
    category: 'Telekomunikacije',
    confidence: 0.98
  },
  {
    patterns: ['sbb', 'сбб'],
    category: 'Telekomunikacije',
    confidence: 0.98
  },

  // ========================================
  // 🐾 KUĆNI LJUBIMCI
  // ========================================
  {
    patterns: ['pet centar', 'пет центар'],
    category: 'Kućni ljubimci',
    confidence: 0.95
  },
  {
    patterns: ['zoo', 'зоо', 'pet shop'],
    category: 'Kućni ljubimci',
    confidence: 0.85
  },
  {
    patterns: ['veterinar', 'ветеринар', 'vet'],
    category: 'Kućni ljubimci',
    confidence: 0.90
  },
];

/**
 * Normalize text for matching (lowercase, remove diacritics, transliterate Cyrillic)
 */
export function normalizeText(text: string): string {
  // Cyrillic to Latin transliteration map
  const cyrillicToLatin: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'ђ': 'dj', 'е': 'e', 'ж': 'z',
    'з': 'z', 'и': 'i', 'ј': 'j', 'к': 'k', 'л': 'l', 'љ': 'lj', 'м': 'm', 'н': 'n',
    'њ': 'nj', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'ћ': 'c', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'c', 'џ': 'dz', 'ш': 's',
  };
  
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .split('')
    .map(char => cyrillicToLatin[char] || char) // Transliterate Cyrillic
    .join('');
}

/**
 * Find matching merchant from database
 */
export function findMerchantMatch(text: string): MerchantMapping | null {
  const normalized = normalizeText(text);
  console.log(`🔍 findMerchantMatch - normalized input: "${normalized.substring(0, 100)}..."`);
  
  // Sort by confidence (highest first)
  const sorted = [...MERCHANT_DATABASE].sort((a, b) => b.confidence - a.confidence);
  
  for (const merchant of sorted) {
    for (const pattern of merchant.patterns) {
      const normalizedPattern = normalizeText(pattern);
      if (normalized.includes(normalizedPattern)) {
        console.log(`✅ Match found! Pattern: "${pattern}" → Category: "${merchant.category}"`);
        return merchant;
      }
    }
  }
  
  console.log(`❌ No match found in ${MERCHANT_DATABASE.length} merchants`);
  return null;
}

/**
 * Extract potential vendor name from OCR text
 */
export function extractVendorName(text: string): string | null {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  // Usually vendor name is in first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Skip lines that look like dates, amounts, or item descriptions
    if (/^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/.test(line)) continue;
    if (/^\d+[.,]\d{2}/.test(line)) continue;
    if (line.length < 3 || line.length > 50) continue;
    
    // Check if this line matches a known merchant
    const match = findMerchantMatch(line);
    if (match) {
      return line;
    }
  }
  
  // If no match, return first meaningful line as potential vendor
  return lines[0] || null;
}
