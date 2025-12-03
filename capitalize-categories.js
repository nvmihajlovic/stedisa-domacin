const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔤 Ažuriram kategorije sa malim početnim slovom...\n')

  const user = await prisma.user.findUnique({
    where: { email: 'nvmihajlovic@gmail.com' }
  })

  // Get all expense categories
  const expenseCategories = await prisma.category.findMany({ 
    where: { userId: user.id }
  })
  
  console.log('📦 Kategorije troškova:')
  for (const cat of expenseCategories) {
    const firstChar = cat.name.charAt(0)
    if (firstChar === firstChar.toLowerCase()) {
      const newName = firstChar.toUpperCase() + cat.name.slice(1)
      await prisma.category.update({
        where: { id: cat.id },
        data: { name: newName }
      })
      console.log(`  ✅ "${cat.name}" → "${newName}"`)
    } else {
      console.log(`  ✓  "${cat.name}"`)
    }
  }

  // Get all income categories
  const incomeCategories = await prisma.incomeCategory.findMany({ 
    where: { userId: user.id }
  })
  
  console.log('\n💰 Kategorije prihoda:')
  for (const cat of incomeCategories) {
    const firstChar = cat.name.charAt(0)
    if (firstChar === firstChar.toLowerCase()) {
      const newName = firstChar.toUpperCase() + cat.name.slice(1)
      await prisma.incomeCategory.update({
        where: { id: cat.id },
        data: { name: newName }
      })
      console.log(`  ✅ "${cat.name}" → "${newName}"`)
    } else {
      console.log(`  ✓  "${cat.name}"`)
    }
  }

  console.log('\n🎉 Sve kategorije ažurirane!')
  
  // Count final stats
  const finalExpense = await prisma.category.count({ where: { userId: user.id } })
  const finalIncome = await prisma.incomeCategory.count({ where: { userId: user.id } })
  console.log(`📊 Ukupno: ${finalExpense} kategorija troškova + ${finalIncome} kategorija prihoda`)
}

main()
  .catch((e) => {
    console.error('❌ Greška:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
