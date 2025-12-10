const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking all users and their recent expenses...\n')

  const users = await prisma.user.findMany({
    select: { 
      id: true, 
      email: true, 
      activeGroupId: true 
    }
  })

  for (const user of users) {
    console.log(`\n👤 User: ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Active Group: ${user.activeGroupId || 'None'}`)

    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    console.log(`   Recent Expenses: ${expenses.length}`)
    expenses.forEach((exp, idx) => {
      console.log(`   ${idx + 1}. ${exp.description} - ${exp.amount} ${exp.currency}`)
      console.log(`      Category: ${exp.category.name} (isSavings: ${exp.category.isSavings})`)
      console.log(`      Date: ${exp.date}`)
    })
  }

  await prisma.$disconnect()
}

main().catch(console.error)
