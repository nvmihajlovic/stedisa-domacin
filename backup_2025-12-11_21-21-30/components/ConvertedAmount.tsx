'use client'

import { useEffect, useState } from 'react'

interface ConvertedAmountProps {
  amount: number
  fromCurrency: string
  toCurrency: string
  className?: string
}

interface ExchangeRates {
  [currency: string]: number
}

export default function ConvertedAmount({ 
  amount, 
  fromCurrency, 
  toCurrency,
  className = '' 
}: ConvertedAmountProps) {
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [rates, setRates] = useState<ExchangeRates | null>(null)

  useEffect(() => {
    // Učitaj kurseve iz API-ja
    async function fetchRates() {
      try {
        const response = await fetch('/api/currency/rates')
        if (response.ok) {
          const data = await response.json()
          setRates(data.rates)
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error)
      }
    }

    fetchRates()
  }, [])

  useEffect(() => {
    if (!rates) return

    // Konvertuj iznos
    const amountInRSD = fromCurrency === 'RSD' 
      ? amount 
      : amount / (rates[fromCurrency] || 1)

    const converted = toCurrency === 'RSD'
      ? amountInRSD
      : amountInRSD * (rates[toCurrency] || 1)

    setConvertedAmount(converted)
  }, [amount, fromCurrency, toCurrency, rates])

  // Ako su iste valute, ne prikazuj konverziju
  if (fromCurrency === toCurrency) {
    return null
  }

  if (convertedAmount === null) {
    return null
  }

  const formatted = new Intl.NumberFormat('sr-RS', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedAmount)

  return (
    <div className={`text-xs italic ${className}`} style={{ color: '#A5A4B6', opacity: 0.7 }}>
      ≈ {formatted} {toCurrency}
    </div>
  )
}
