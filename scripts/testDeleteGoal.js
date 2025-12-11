const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testDelete() {
  console.log('🧪 Testing savings goal deletion...\n')

  // Find a goal to delete (preferably empty one)
  const goals = await prisma.savingsGoal.findMany({
    include: {
      contributions: true,
      user: { select: { email: true } }
    },
    orderBy: { currentAmount: 'asc' }
  })

  console.log(`Found ${goals.length} savings goals:\n`)
  
  goals.forEach((goal, idx) => {
    console.log(`${idx + 1}. ${goal.name}`)
    console.log(`   ID: ${goal.id}`)
    console.log(`   User: ${goal.user.email}`)
    console.log(`   Amount: ${goal.currentAmount} / ${goal.targetAmount}`)
    console.log(`   Contributions: ${goal.contributions.length}`)
    console.log(`   Can delete: ${goal.contributions.length === 0 ? 'YES ✅' : 'Has contributions ⚠️'}`)
    console.log()
  })

  console.log('\n💡 To manually delete a goal:')
  console.log('   await prisma.savingsGoal.delete({ where: { id: "GOAL_ID" } })')

  await prisma.$disconnect()
}

testDelete().catch(console.error)
