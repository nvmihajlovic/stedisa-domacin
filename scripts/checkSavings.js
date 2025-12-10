const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking Savings Goals and Contributions...\n')

  // Check all savings goals
  const savingsGoals = await prisma.savingsGoal.findMany({
    include: {
      category: true,
      contributions: true,
      user: { select: { email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log(`📊 Total Savings Goals: ${savingsGoals.length}\n`)
  
  savingsGoals.forEach((goal, idx) => {
    console.log(`${idx + 1}. ${goal.name}`)
    console.log(`   User: ${goal.user.email}`)
    console.log(`   Current: ${goal.currentAmount} / Target: ${goal.targetAmount} RSD`)
    console.log(`   Group ID: ${goal.groupId || 'Personal'}`)
    console.log(`   Category: ${goal.category?.name || 'N/A'}`)
    console.log(`   Contributions: ${goal.contributions.length}`)
    console.log(`   isActive: ${goal.isActive}\n`)
  })

  // Check recent expenses with Štednja category
  const stednjaExpenses = await prisma.expense.findMany({
    where: { 
      category: { isSavings: true }
    },
    include: {
      category: true,
      savingsContributions: { include: { savingsGoal: true } },
      user: { select: { email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  console.log(`\n📋 Štednja Expenses: ${stednjaExpenses.length}\n`)
  
  stednjaExpenses.forEach((exp, idx) => {
    console.log(`${idx + 1}. ${exp.description} - ${exp.amount} ${exp.currency}`)
    console.log(`   User: ${exp.user.email}`)
    console.log(`   Category: ${exp.category.name}`)
    console.log(`   Group ID: ${exp.groupId || 'Personal'}`)
    console.log(`   Savings Contributions: ${exp.savingsContributions.length}`)
    if (exp.savingsContributions.length > 0) {
      exp.savingsContributions.forEach(sc => {
        console.log(`      -> Goal: ${sc.savingsGoal.name} (${sc.amount} RSD)`)
      })
    }
    console.log()
  })

  await prisma.$disconnect()
}

main().catch(console.error)
