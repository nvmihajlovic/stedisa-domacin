// Currency conversion service using ExchangeRate-API
// Free tier: 1,500 requests/month

interface ExchangeRates {
  [currency: string]: number
}

interface CachedRates {
  rates: ExchangeRates
  timestamp: number
}

// Cache za kurseve (1 sat)
let cachedRates: CachedRates | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 sat u milisekundama

/**
 * Dohvata kurseve valuta od ExchangeRate-API
 * Keširano 1 sat da ne bi trošili besplatne kredite
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // Proveri keš
  if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION) {
    return cachedRates.rates
  }

  try {
    // ExchangeRate-API (besplatno, 1500 zahteva mesečno)
    // Base currency je RSD
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/RSD')
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }

    const data = await response.json()
    
    cachedRates = {
      rates: data.rates,
      timestamp: Date.now()
    }

    return data.rates
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    
    // Fallback hardcoded kursevi ako API ne radi
    return {
      RSD: 1,
      EUR: 0.0085, // ~117 RSD = 1 EUR
      USD: 0.0093, // ~107 RSD = 1 USD
    }
  }
}

/**
 * Konvertuje iznos iz jedne valute u drugu
 * @param amount - Iznos za konverziju
 * @param fromCurrency - Valuta iz koje konvertujemo
 * @param toCurrency - Valuta u koju konvertujemo
 * @returns Konvertovani iznos
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const rates = await getExchangeRates()

  // Konverzija preko RSD kao base valute
  // Prvo konvertuj u RSD, pa iz RSD u target valutu
  const amountInRSD = fromCurrency === 'RSD' 
    ? amount 
    : amount / (rates[fromCurrency] || 1)

  const convertedAmount = toCurrency === 'RSD'
    ? amountInRSD
    : amountInRSD * (rates[toCurrency] || 1)

  return convertedAmount
}

/**
 * Formatira iznos sa valutom
 * @param amount - Iznos
 * @param currency - Valuta (RSD, EUR, USD)
 * @returns Formatiran string
 */
export function formatCurrency(amount: number, currency: string): string {
  const formatted = new Intl.NumberFormat('sr-RS', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${formatted} ${currency}`
}

/**
 * Dobija simbola valute
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: { [key: string]: string } = {
    RSD: 'RSD',
    EUR: '€',
    USD: '$',
  }
  return symbols[currency] || currency
}
