import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/cron/process-recurring
 * Process all due recurring transactions and create actual transactions
 * 
 * IMPORTANT: This should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 * For security, verify the request comes from authorized source
 * 
 * Vercel Cron setup:
 * 1. Create vercel.json in project root:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-recurring",
 *     "schedule": "0 0 * * *"  // Daily at midnight
 *   }]
 * }
 * 
 * 2. Add CRON_SECRET to .env and Vercel environment variables
 * 3. This endpoint will be called automatically every day
 */
export async function GET(req: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    let processedCount = 0
    const errors: any[] = []

    // 1. Process recurring expenses
    const dueExpenses = await prisma.recurringExpense.findMany({
      where: {
        isActive: true,
        nextExecutionAt: {
          lte: now // Due date is today or in the past
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`Found ${dueExpenses.length} due recurring expenses`)

    for (const recurring of dueExpenses) {
      try {
        // Create actual expense
        await prisma.expense.create({
          data: {
            userId: recurring.userId,
            amount: recurring.amount,
            description: recurring.description,
            categoryId: recurring.categoryId,
            date: now,
            isRecurring: true,
            recurringExpenseId: recurring.id
          }
        })

        // Calculate next execution date
        const nextExecution = calculateNextExecution(
          recurring.frequency,
          recurring.dayOfMonth,
          recurring.dayOfWeek,
          now
        )

        // Update recurring expense
        await prisma.recurringExpense.update({
          where: { id: recurring.id },
          data: { nextExecutionAt: nextExecution }
        })

        processedCount++
        console.log(`✓ Created expense for ${recurring.user.name}: ${recurring.description}`)
      } catch (error: any) {
        console.error(`✗ Failed to process expense ${recurring.id}:`, error)
        errors.push({
          type: 'expense',
          id: recurring.id,
          description: recurring.description,
          error: error.message
        })
      }
    }

    // 2. Process recurring incomes
    const dueIncomes = await prisma.recurringIncome.findMany({
      where: {
        isActive: true,
        nextExecutionAt: {
          lte: now
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`Found ${dueIncomes.length} due recurring incomes`)

    for (const recurring of dueIncomes) {
      try {
        // Create actual income
        await prisma.income.create({
          data: {
            userId: recurring.userId,
            amount: recurring.amount,
            description: recurring.description,
            categoryId: recurring.categoryId,
            date: now,
            isRecurring: true,
            recurringIncomeId: recurring.id
          }
        })

        // Calculate next execution date
        const nextExecution = calculateNextExecution(
          recurring.frequency,
          recurring.dayOfMonth,
          recurring.dayOfWeek,
          now
        )

        // Update recurring income
        await prisma.recurringIncome.update({
          where: { id: recurring.id },
          data: { nextExecutionAt: nextExecution }
        })

        processedCount++
        console.log(`✓ Created income for ${recurring.user.name}: ${recurring.description}`)
      } catch (error: any) {
        console.error(`✗ Failed to process income ${recurring.id}:`, error)
        errors.push({
          type: 'income',
          id: recurring.id,
          description: recurring.description,
          error: error.message
        })
      }
    }

    // Return summary
    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} recurring transactions`,
      data: {
        processed: processedCount,
        expenses: dueExpenses.length,
        incomes: dueIncomes.length,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: now.toISOString()
      }
    })
  } catch (error) {
    console.error('Fatal error in cron job:', error)
    return NextResponse.json(
      { error: 'Failed to process recurring transactions' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Calculate next execution date based on frequency
 */
function calculateNextExecution(
  frequency: string,
  dayOfMonth: number | null,
  dayOfWeek: number | null,
  fromDate: Date
): Date {
  const next = new Date(fromDate)

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break

    case 'weekly':
      if (dayOfWeek !== null) {
        // Move to next occurrence of specified day
        const currentDay = next.getDay()
        const daysUntilNext = (dayOfWeek - currentDay + 7) % 7 || 7
        next.setDate(next.getDate() + daysUntilNext)
      } else {
        next.setDate(next.getDate() + 7)
      }
      break

    case 'monthly':
      if (dayOfMonth) {
        next.setMonth(next.getMonth() + 1)
        next.setDate(dayOfMonth)
        
        // Handle months with fewer days
        if (next.getDate() !== dayOfMonth) {
          next.setDate(0) // Last day of previous month
        }
      } else {
        next.setMonth(next.getMonth() + 1)
      }
      break

    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break

    default:
      // Default to monthly
      next.setMonth(next.getMonth() + 1)
  }

  return next
}

/**
 * Manual trigger for testing (only in development)
 * POST /api/cron/process-recurring
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Manual trigger only available in development' },
      { status: 403 }
    )
  }

  // In development, allow manual trigger without auth
  return GET(req)
}
