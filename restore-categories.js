const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Dodajem sve kategorije iz backup-a...')

  const user = await prisma.user.findUnique({
    where: { email: 'nvmihajlovic@gmail.com' }
  })

  if (!user) {
    console.error('❌ Korisnik nije pronađen!')
    return
  }

  console.log('✅ Korisnik pronađen:', user.email)

  // Check existing categories
  const existingExpense = await prisma.category.findMany({ where: { userId: user.id } })
  const existingIncome = await prisma.incomeCategory.findMany({ where: { userId: user.id } })
  console.log(`📋 Trenutno: ${existingExpense.length} kategorija troškova, ${existingIncome.length} kategorija prihoda`)

  const expenseCategories = [
    { name: 'hrana i piće', icon: 'ForkKnife', color: '#FF6B6B' },
    { name: 'gorivo', icon: 'GasPump', color: '#FFA500' },
    { name: 'hemija', icon: 'Drop', color: '#95E1D3' },
    { name: 'kozmetika', icon: 'Sparkle', color: '#FF85A2' },
    { name: 'odeća', icon: 'TShirt', color: '#A8E6CF' },
    { name: 'obuća', icon: 'ShoppingBag', color: '#FFD93D' },
    { name: 'komunalije', icon: 'House', color: '#4C8BEA' },
    { name: 'energija', icon: 'Lightning', color: '#FFE66D' },
    { name: 'pokućstvo', icon: 'Armchair', color: '#C490E4' },
    { name: 'restorani', icon: 'ForkKnife', color: '#FF6B9D' },
    { name: 'zabava', icon: 'FilmSlate', color: '#A8D8EA' },
    { name: 'putovanje', icon: 'AirplaneTilt', color: '#FFB6C1' },
    { name: 'stanarina', icon: 'Buildings', color: '#B4A7D6' },
    { name: 'pokloni', icon: 'Gift', color: '#FFAAA5' },
    { name: 'kredit', icon: 'CreditCard', color: '#E4586E' },
    { name: 'lična nega', icon: 'User', color: '#F8B195' },
    { name: 'rekreacija', icon: 'Barbell', color: '#92A8D1' },
    { name: 'održavanje doma', icon: 'Wrench', color: '#88B04B' },
    { name: 'održavanje vozila', icon: 'Car', color: '#5B84B1' },
    { name: 'registracija vozila', icon: 'FileText', color: '#FC766A' },
    { name: 'školarina', icon: 'GraduationCap', color: '#5F4B8B' },
    { name: 'porezi', icon: 'ChartBar', color: '#E69A8D' },
    { name: 'osiguranje', icon: 'ShieldCheck', color: '#42EADD' },
    { name: 'bankarski troškovi', icon: 'Bank', color: '#CDB599' },
    { name: 'alimentacija', icon: 'UsersThree', color: '#DD4A48' },
    { name: 'pretplate', icon: 'DeviceMobile', color: '#9F70FF' },
    { name: 'ostalo', icon: 'Package', color: '#7A7A8C' },
  ]

  const incomeCategories = [
    { name: 'lični dohodak', icon: 'Money', color: '#45D38A' },
    { name: 'prihod od rente', icon: 'Buildings', color: '#2ECC71' },
    { name: 'honorar', icon: 'CurrencyCircleDollar', color: '#27AE60' },
    { name: 'napojnica', icon: 'Hand', color: '#1ABC9C' },
    { name: 'ostalo', icon: 'TrendUp', color: '#16A085' },
  ]

  console.log('\n📦 Dodajem kategorije troškova...')
  for (const cat of expenseCategories) {
    // Check if already exists
    const exists = await prisma.category.findFirst({
      where: { 
        name: cat.name,
        userId: user.id 
      }
    })
    
    if (!exists) {
      await prisma.category.create({
        data: {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          userId: user.id,
        }
      })
      console.log('  ✅', cat.name)
    } else {
      console.log('  ⏭️ ', cat.name, '(već postoji)')
    }
  }

  console.log('\n💰 Dodajem kategorije prihoda...')
  for (const cat of incomeCategories) {
    // Check if already exists
    const exists = await prisma.incomeCategory.findFirst({
      where: { 
        name: cat.name,
        userId: user.id 
      }
    })
    
    if (!exists) {
      await prisma.incomeCategory.create({
        data: {
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          userId: user.id,
        }
      })
      console.log('  ✅', cat.name)
    } else {
      console.log('  ⏭️ ', cat.name, '(već postoji)')
    }
  }

  console.log('\n🎉 Sve kategorije uspešno vraćene iz backup-a!')
  console.log(`📊 Ukupno: ${expenseCategories.length} kategorija troškova + ${incomeCategories.length} kategorija prihoda`)
}

main()
  .catch((e) => {
    console.error('❌ Greška:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
