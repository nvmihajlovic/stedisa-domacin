const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Creating savings contributions for existing Štednja expenses...\n')

  // Find all expenses in Štednja categories that don't have contributions
  const stednjaExpenses = await prisma.expense.findMany({
    where: {
      category: {
        isSavings: true
      },
      savingsContributions: {
        none: {}
      }
    },
    include: {
      category: true,
      user: { select: { email: true } }
    }
  })

  console.log(`Found ${stednjaExpenses.length} Štednja expenses without contributions\n`)

  for (const expense of stednjaExpenses) {
    console.log(`Processing: ${expense.description} - ${expense.amount} ${expense.currency}`)
    console.log(`  User: ${expense.user.email}`)
    console.log(`  Category: ${expense.category.name}`)

    try {
      // Calculate amount in RSD
      const amountInRSD = expense.amountInRSD || expense.amount

      // Find or create savings goal
      let savingsGoal = await prisma.savingsGoal.findFirst({
        where: {
          userId: expense.userId,
          categoryId: expense.categoryId,
          groupId: expense.groupId
        }
      })

      if (!savingsGoal) {
        console.log(`  Creating new savings goal...`)
        savingsGoal = await prisma.savingsGoal.create({
          data: {
            name: `${expense.category.name} - Cilj`,
            targetAmount: 100000, // Default 100,000 RSD
            currentAmount: 0,
            userId: expense.userId,
            categoryId: expense.categoryId,
            groupId: expense.groupId,
            color: expense.category.color || '#FFD700',
            icon: expense.category.icon || 'CurrencyCircleDollar'
          }
        })
        console.log(`  ✅ Created goal: ${savingsGoal.name}`)
      } else {
        console.log(`  Found existing goal: ${savingsGoal.name}`)
      }

      // Create contribution
      const contribution = await prisma.savingsContribution.create({
        data: {
          savingsGoalId: savingsGoal.id,
          amount: amountInRSD,
          description: expense.description,
          expenseId: expense.id,
          userId: expense.userId,
          groupId: expense.groupId,
          createdAt: expense.date // Use expense date as creation date
        }
      })

      console.log(`  ✅ Created contribution: ${contribution.amount} RSD`)

      // Update goal's current amount
      await prisma.savingsGoal.update({
        where: { id: savingsGoal.id },
        data: {
          currentAmount: {
            increment: amountInRSD
          }
        }
      })

      console.log(`  ✅ Updated goal current amount\n`)

    } catch (error) {
      console.error(`  ❌ Error processing expense:`, error.message)
      console.log()
    }
  }

  console.log('\n✅ Migration completed!')

  // Show summary
  const allGoals = await prisma.savingsGoal.findMany({
    include: {
      contributions: true,
      user: { select: { email: true } }
    }
  })

  console.log('\n📊 Summary of all savings goals:')
  allGoals.forEach(goal => {
    console.log(`\n- ${goal.name} (${goal.user.email})`)
    console.log(`  Current: ${goal.currentAmount} / Target: ${goal.targetAmount} RSD`)
    console.log(`  Contributions: ${goal.contributions.length}`)
  })

  await prisma.$disconnect()
}

main().catch(console.error)
