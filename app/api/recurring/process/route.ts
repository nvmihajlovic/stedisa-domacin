import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/recurring/process
 * Proces all due recurring expenses and incomes
 * This should be called daily via cron job or scheduled task
 */
export async function POST(req: Request) {
  try {
    // Verify authorization (optional: add secret key check)
    const authHeader = req.headers.get('authorization')
    const expectedKey = process.env.CRON_SECRET_KEY || 'your-secret-key-here'
    
    if (authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    console.log(`🔄 Processing recurring transactions at ${now.toISOString()}`)

    // Find all active recurring expenses that are due
    const dueExpenses = await prisma.recurringExpense.findMany({
      where: {
        isActive: true,
        nextExecutionAt: {
          lte: now
        }
      },
      include: {
        user: true
      }
    })

    console.log(`📊 Found ${dueExpenses.length} due recurring expenses`)

    let created = 0
    let errors = 0

    // Process each recurring expense
    for (const recurring of dueExpenses) {
      try {
        // Create new expense
        await prisma.expense.create({
          data: {
            userId: recurring.userId,
            amount: recurring.amount,
            description: recurring.description,
            categoryId: recurring.categoryId,
            date: new Date(),
            isRecurring: true,
            recurringExpenseId: recurring.id,
            currency: 'RSD', // Default currency
            paymentMethod: 'cash'
          }
        })

        // Calculate next execution date based on frequency
        const nextDate = calculateNextExecutionDate(
          recurring.nextExecutionAt,
          recurring.frequency,
          recurring.dayOfMonth
        )

        // Update recurring expense with next execution date
        await prisma.recurringExpense.update({
          where: { id: recurring.id },
          data: {
            nextExecutionAt: nextDate
          }
        })

        created++
        console.log(`✅ Created expense: ${recurring.description} for user ${recurring.userId}`)
      } catch (error) {
        errors++
        console.error(`❌ Error creating expense for ${recurring.id}:`, error)
      }
    }

    // Process recurring savings goals
    const dueSavingsGoals = await prisma.savingsGoal.findMany({
      where: {
        isActive: true,
        isRecurring: true,
        recurringDayOfMonth: {
          not: null
        }
      },
      include: {
        user: true,
        category: true
      }
    })

    let createdSavings = 0

    for (const savingsGoal of dueSavingsGoals) {
      try {
        const today = now.getDate()
        
        // Check if today matches the recurring day
        if (savingsGoal.recurringDayOfMonth === today && savingsGoal.recurringAmount) {
          // Create automatic contribution
          await prisma.savingsContribution.create({
            data: {
              savingsGoalId: savingsGoal.id,
              userId: savingsGoal.userId,
              amount: savingsGoal.recurringAmount,
              currency: savingsGoal.currency,
              description: 'Automatsko mesečno štedenje',
              isAutomatic: true
            }
          })

          // Update savings goal current amount
          await prisma.savingsGoal.update({
            where: { id: savingsGoal.id },
            data: {
              currentAmount: {
                increment: savingsGoal.recurringAmount
              }
            }
          })

          // Create expense entry for tracking (special savings category)
          await prisma.expense.create({
            data: {
              userId: savingsGoal.userId,
              amount: savingsGoal.recurringAmount,
              description: `Štednja: ${savingsGoal.name}`,
              categoryId: savingsGoal.categoryId,
              date: new Date(),
              isRecurring: true,
              currency: savingsGoal.currency,
              paymentMethod: 'transfer'
            }
          })

          createdSavings++
          console.log(`💰 Created automatic savings contribution: ${savingsGoal.name} for user ${savingsGoal.userId}`)
        }
      } catch (error) {
        errors++
        console.error(`❌ Error creating savings contribution for ${savingsGoal.id}:`, error)
      }
    }

    // Find and process recurring incomes
    const dueIncomes = await prisma.recurringIncome.findMany({
      where: {
        isActive: true,
        nextExecutionAt: {
          lte: now
        }
      },
      include: {
        user: true
      }
    })

    console.log(`📊 Found ${dueIncomes.length} due recurring incomes`)

    let createdIncomes = 0

    for (const recurring of dueIncomes) {
      try {
        // Create new income
        await prisma.income.create({
          data: {
            userId: recurring.userId,
            amount: recurring.amount,
            description: recurring.description,
            categoryId: recurring.categoryId,
            date: new Date(),
            isRecurring: true,
            recurringIncomeId: recurring.id,
            currency: 'RSD'
          }
        })

        // Calculate next execution date
        const nextDate = calculateNextExecutionDate(
          recurring.nextExecutionAt,
          recurring.frequency,
          recurring.dayOfMonth
        )

        // Update recurring income
        await prisma.recurringIncome.update({
          where: { id: recurring.id },
          data: {
            nextExecutionAt: nextDate
          }
        })

        createdIncomes++
        console.log(`✅ Created income: ${recurring.description} for user ${recurring.userId}`)
      } catch (error) {
        errors++
        console.error(`❌ Error creating income for ${recurring.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      processedAt: now.toISOString(),
      expenses: {
        created,
        errors
      },
      incomes: {
        created: createdIncomes,
        errors
      },
      savings: {
        created: createdSavings,
        errors: 0
      }
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Error processing recurring transactions:', error)
    return NextResponse.json(
      { error: 'Failed to process recurring transactions' },
      { status: 500 }
    )
  }
}

/**
 * Calculate next execution date based on frequency
 */
function calculateNextExecutionDate(
  currentDate: Date,
  frequency: string,
  dayOfMonth: number | null
): Date {
  const next = new Date(currentDate)
  
  switch (frequency) {
    case 'monthly':
      // Add 1 month
      next.setMonth(next.getMonth() + 1)
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))
      }
      break
      
    case 'quarterly':
      // Add 3 months
      next.setMonth(next.getMonth() + 3)
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))
      }
      break
      
    case 'semi-annually':
      // Add 6 months
      next.setMonth(next.getMonth() + 6)
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))
      }
      break
      
    case 'yearly':
      // Add 1 year
      next.setFullYear(next.getFullYear() + 1)
      if (dayOfMonth) {
        next.setDate(Math.min(dayOfMonth, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()))
      }
      break
      
    case 'weekly':
      // Add 7 days
      next.setDate(next.getDate() + 7)
      break
      
    default:
      // Default to monthly
      next.setMonth(next.getMonth() + 1)
  }
  
  return next
}
