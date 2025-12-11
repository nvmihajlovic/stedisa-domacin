import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Uzmi prvog korisnika iz baze
  const user = await prisma.user.findFirst()
  
  if (!user) {
    console.log('❌ Nema korisnika u bazi! Prvo se registrujte.')
    return
  }

  console.log(`✓ Korisnik pronađen: ${user.email}`)

  // Kategorije troškova
  const expenseCategories = [
    { name: 'Hrana i piće', icon: '🍔', color: '#FF6B6B' },
    { name: 'Transport', icon: '🚗', color: '#4ECDC4' },
    { name: 'Računi', icon: '💡', color: '#FFE66D' },
    { name: 'Zabava', icon: '🎮', color: '#A8E6CF' },
    { name: 'Zdravlje', icon: '💊', color: '#FF8B94' },
    { name: 'Odeća', icon: '👕', color: '#C7CEEA' },
  ]

  // Kategorije prihoda
  const incomeCategories = [
    { name: 'Plata', icon: '💰', color: '#95E1D3' },
    { name: 'Freelance', icon: '💻', color: '#F38181' },
    { name: 'Investicije', icon: '📈', color: '#AA96DA' },
  ]

  console.log('📦 Kreiram kategorije...')

  // Kreiraj kategorije troškova
  const createdExpenseCategories = []
  for (const cat of expenseCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: user.id }
    })
    if (!existing) {
      const created = await prisma.category.create({
        data: { ...cat, userId: user.id }
      })
      createdExpenseCategories.push(created)
    } else {
      createdExpenseCategories.push(existing)
    }
  }

  // Kreiraj kategorije prihoda
  const createdIncomeCategories = []
  for (const cat of incomeCategories) {
    const existing = await prisma.incomeCategory.findFirst({
      where: { name: cat.name, userId: user.id }
    })
    if (!existing) {
      const created = await prisma.incomeCategory.create({
        data: { ...cat, userId: user.id }
      })
      createdIncomeCategories.push(created)
    } else {
      createdIncomeCategories.push(existing)
    }
  }

  console.log(`✓ Kategorije kreirane: ${createdExpenseCategories.length} troškovi, ${createdIncomeCategories.length} prihodi`)

  // Generisi podatke za poslednjih 6 meseci
  const today = new Date()
  let totalExpenses = 0
  let totalIncomes = 0

  console.log('💸 Kreiram troškove i prihode...')

  for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
    const month = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1)
    const monthName = month.toLocaleString('sr-RS', { month: 'long', year: 'numeric' })
    
    console.log(`  📅 ${monthName}`)

    // 4 troška po mesecu
    for (let i = 0; i < 4; i++) {
      const category = createdExpenseCategories[Math.floor(Math.random() * createdExpenseCategories.length)]
      const day = Math.floor(Math.random() * 28) + 1
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      
      const amounts = [1200, 2500, 3800, 5000, 1800, 4200, 2200, 3000]
      const amount = amounts[Math.floor(Math.random() * amounts.length)]
      
      const descriptions: Record<string, string[]> = {
        'Hrana i piće': ['Kupovina u marketu', 'Restoran', 'Pekara', 'Kafe bar'],
        'Transport': ['Gorivo', 'Taksi', 'Servis automobila', 'Parkiranje'],
        'Računi': ['Struja', 'Voda', 'Internet', 'Telefon'],
        'Zabava': ['Bioskop', 'Koncert', 'Teretana', 'Netflix'],
        'Zdravlje': ['Apoteka', 'Lekar', 'Vitamini', 'Laboratorija'],
        'Odeća': ['Patike', 'Jakna', 'Pantalone', 'Majica'],
      }
      
      const desc = descriptions[category.name]?.[Math.floor(Math.random() * 4)] || 'Trošak'

      await prisma.expense.create({
        data: {
          amount,
          categoryId: category.id,
          date,
          description: desc,
          userId: user.id,
        }
      })
      
      totalExpenses++
    }

    // 3 prihoda po mesecu
    for (let i = 0; i < 3; i++) {
      const category = createdIncomeCategories[Math.floor(Math.random() * createdIncomeCategories.length)]
      const day = Math.floor(Math.random() * 28) + 1
      const date = new Date(month.getFullYear(), month.getMonth(), day)
      
      const amounts = [50000, 75000, 30000, 45000, 25000, 60000]
      const amount = amounts[Math.floor(Math.random() * amounts.length)]
      
      const descriptions: Record<string, string[]> = {
        'Plata': ['Mesečna plata', 'Bonus', 'Nadoknada'],
        'Freelance': ['Projekat web dizajn', 'Logo dizajn', 'WordPress sajt'],
        'Investicije': ['Dividende', 'Kamata', 'Profit od akcija'],
      }
      
      const desc = descriptions[category.name]?.[Math.floor(Math.random() * 3)] || 'Prihod'

      await prisma.income.create({
        data: {
          amount,
          categoryId: category.id,
          date,
          description: desc,
          userId: user.id,
        }
      })
      
      totalIncomes++
    }
  }

  console.log('\n✅ Dummy podaci uspešno kreirani!')
  console.log(`   💸 Troškovi: ${totalExpenses} unosa`)
  console.log(`   💰 Prihodi: ${totalIncomes} unosa`)
  console.log(`\n🗑️  Za brisanje dummy podataka, pokrenite: npm run seed:clean`)
}

main()
  .catch((e) => {
    console.error('❌ Greška:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
