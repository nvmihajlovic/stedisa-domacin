const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Dodajem kategorije...')

  // Get the user
  const user = await prisma.user.findUnique({
    where: { email: 'nvmihajlovic@gmail.com' }
  })

  if (!user) {
    console.error('❌ Korisnik nije pronađen!')
    return
  }

  console.log('✅ Korisnik pronađen:', user.email)

  // Seed default expense categories
  const expenseCategories = [
    { name: 'Hrana', icon: 'Hamburger', color: '#FFB3E6' },
    { name: 'Transport', icon: 'Car', color: '#7FDFFF' },
    { name: 'Zabava', icon: 'MusicNotes', color: '#E8D9FF' },
    { name: 'Računi', icon: 'Receipt', color: '#FFC107' },
    { name: 'Ostalo', icon: 'DotsThree', color: '#FF8A80' },
  ]

  // Seed default income categories
  const incomeCategories = [
    { name: 'Plata', icon: 'Money', color: '#6FFFC4' },
    { name: 'Freelance', icon: 'Laptop', color: '#7FDFFF' },
    { name: 'Ostalo', icon: 'DotsThree', color: '#E8D9FF' },
  ]

  for (const cat of expenseCategories) {
    await prisma.category.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        userId: user.id,
      }
    })
    console.log('  ✅ Kreirana kategorija troškova:', cat.name)
  }

  for (const cat of incomeCategories) {
    await prisma.incomeCategory.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        userId: user.id,
      }
    })
    console.log('  ✅ Kreirana kategorija prihoda:', cat.name)
  }

  console.log('\n🎉 Sve kategorije uspešno dodate!')
}

main()
  .catch((e) => {
    console.error('❌ Greška:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
