const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.savingsGoal.deleteMany({
    where: {
      name: 'Štednja - Cilj',
      currentAmount: 0
    }
  })
  
  console.log(`Deleted ${result.count} empty Štednja goals`)
  await prisma.$disconnect()
}

main().catch(console.error)
