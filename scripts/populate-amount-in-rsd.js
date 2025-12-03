const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Fallback kursevi ako API ne radi
const fallbackRates = {
  RSD: 1,
  EUR: 0.0085,
  USD: 0.0093
}

async function getExchangeRates() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/RSD')
    if (response.ok) {
      const data = await response.json()
      return data.rates
    }
  } catch (error) {
    console.log('⚠️  API nije dostupan, koristim fallback kurseve')
  }
  return fallbackRates
}

function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  if (fromCurrency === toCurrency) return amount
  
  // Konverzija preko RSD kao baze
  const amountInRSD = fromCurrency === 'RSD' 
    ? amount 
    : amount / (rates[fromCurrency] || 1)
  
  const converted = toCurrency === 'RSD'
    ? amountInRSD
    : amountInRSD * (rates[toCurrency] || 1)
  
  return converted
}

async function main() {
  console.log('🔄 Popunjavam amountInRSD za sve troškove i prihode...\n')
  
  const rates = await getExchangeRates()
  console.log('📊 Kursevi:', rates, '\n')
  
  // Ažuriraj troškove
  const expenses = await prisma.expense.findMany({
    where: {
      OR: [
        { amountInRSD: null },
        { amountInRSD: 0 }
      ]
    }
  })
  
  console.log(`💰 Pronađeno ${expenses.length} troškova za ažuriranje`)
  
  for (const expense of expenses) {
    const currency = expense.currency || 'RSD'
    const amountInRSD = convertCurrency(expense.amount, currency, 'RSD', rates)
    
    await prisma.expense.update({
      where: { id: expense.id },
      data: { amountInRSD }
    })
    
    console.log(`  ✓ ${expense.description}: ${expense.amount} ${currency} → ${amountInRSD.toFixed(2)} RSD`)
  }
  
  // Ažuriraj prihode
  const incomes = await prisma.income.findMany({
    where: {
      OR: [
        { amountInRSD: null },
        { amountInRSD: 0 }
      ]
    }
  })
  
  console.log(`\n💵 Pronađeno ${incomes.length} prihoda za ažuriranje`)
  
  for (const income of incomes) {
    const currency = income.currency || 'RSD'
    const amountInRSD = convertCurrency(income.amount, currency, 'RSD', rates)
    
    await prisma.income.update({
      where: { id: income.id },
      data: { amountInRSD }
    })
    
    console.log(`  ✓ ${income.description}: ${income.amount} ${currency} → ${amountInRSD.toFixed(2)} RSD`)
  }
  
  console.log('\n✅ Gotovo! Svi iznosi su konvertovani u RSD.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
