const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Brišem test kategorije...\n')

  const user = await prisma.user.findUnique({
    where: { email: 'nvmihajlovic@gmail.com' }
  })

  // Backup categories from the original database
  const backupExpenseNames = [
    'Hrana i piće', 'Gorivo', 'Hemija', 'Kozmetika', 'Odeća', 'Obuća',
    'Komunalije', 'Energija', 'Pokućstvo', 'Restorani', 'Zabava', 'Putovanje',
    'Stanarina', 'Pokloni', 'Kredit', 'Lična nega', 'Rekreacija',
    'Održavanje doma', 'Održavanje vozila', 'Registracija vozila',
    'Školarina', 'Porezi', 'Osiguranje', 'Bankarski troškovi',
    'Alimentacija', 'Pretplate', 'Ostalo'
  ]

  const backupIncomeNames = [
    'Lični dohodak', 'Prihod od rente', 'Honorar', 'Napojnica', 'Ostalo'
  ]

  // Get all categories
  const allExpense = await prisma.category.findMany({ where: { userId: user.id } })
  const allIncome = await prisma.incomeCategory.findMany({ where: { userId: user.id } })

  console.log('📦 Proveravam kategorije troškova:')
  for (const cat of allExpense) {
    if (!backupExpenseNames.includes(cat.name)) {
      try {
        await prisma.category.delete({ where: { id: cat.id } })
        console.log(`  🗑️  Obrisana: "${cat.name}" (nije u backup-u)`)
      } catch (e) {
        console.log(`  ⚠️  Ne mogu obrisati "${cat.name}": ${e.code}`)
      }
    } else {
      console.log(`  ✓  "${cat.name}"`)
    }
  }

  console.log('\n💰 Proveravam kategorije prihoda:')
  for (const cat of allIncome) {
    if (!backupIncomeNames.includes(cat.name)) {
      try {
        await prisma.incomeCategory.delete({ where: { id: cat.id } })
        console.log(`  🗑️  Obrisana: "${cat.name}" (nije u backup-u)`)
      } catch (e) {
        console.log(`  ⚠️  Ne mogu obrisati "${cat.name}": ${e.code}`)
      }
    } else {
      console.log(`  ✓  "${cat.name}"`)
    }
  }

  console.log('\n✅ Završeno!')
  
  const finalExpense = await prisma.category.count({ where: { userId: user.id } })
  const finalIncome = await prisma.incomeCategory.count({ where: { userId: user.id } })
  console.log(`\n📊 FINALNO: ${finalExpense} kategorija troškova + ${finalIncome} kategorija prihoda`)
}

main()
  .catch((e) => {
    console.error('❌ Greška:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
