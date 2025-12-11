import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Brišem dummy podatke...')

  // Uzmi prvog korisnika
  const user = await prisma.user.findFirst()
  
  if (!user) {
    console.log('❌ Nema korisnika u bazi!')
    return
  }

  // Obriši troškove
  const deletedExpenses = await prisma.expense.deleteMany({
    where: { userId: user.id }
  })

  // Obriši prihode
  const deletedIncomes = await prisma.income.deleteMany({
    where: { userId: user.id }
  })

  console.log(`✓ Obrisano ${deletedExpenses.count} troškova`)
  console.log(`✓ Obrisano ${deletedIncomes.count} prihoda`)
  console.log('\n✅ Svi dummy podaci su obrisani!')
}

main()
  .catch((e) => {
    console.error('❌ Greška:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
