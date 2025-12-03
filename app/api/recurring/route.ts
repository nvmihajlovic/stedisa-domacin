import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

/**
 * GET /api/recurring
 * Fetch all recurring transactions for current user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'expense' or 'income' or null (both)
    const activeOnly = searchParams.get('active') === 'true'

    // Fetch recurring expenses
    let expenses: any[] = []
    if (!type || type === 'expense') {
      expenses = await prisma.recurringExpense.findMany({
        where: {
          userId: user.id,
          ...(activeOnly && { isActive: true })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { nextExecutionAt: 'asc' }
      })
    }

    // Fetch recurring incomes
    let incomes: any[] = []
    if (!type || type === 'income') {
      incomes = await prisma.recurringIncome.findMany({
        where: {
          userId: user.id,
          ...(activeOnly && { isActive: true })
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { nextExecutionAt: 'asc' }
      })
    }

    // Transform to unified format
    const recurringTransactions = [
      ...expenses.map((e: any) => ({ ...e, type: 'expense' })),
      ...incomes.map((i: any) => ({ ...i, type: 'income' }))
    ].sort((a, b) => 
      new Date(a.nextExecutionAt).getTime() - new Date(b.nextExecutionAt).getTime()
    )

    return NextResponse.json({
      success: true,
      data: recurringTransactions
    })
  } catch (error) {
    console.error('Error fetching recurring transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recurring transactions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/recurring
 * Create new recurring transaction
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      type, // 'expense' or 'income'
      amount,
      description,
      categoryId,
      frequency, // 'daily', 'weekly', 'monthly', 'yearly'
      dayOfMonth,
      dayOfWeek,
      startDate
    } = body

    // Validate required fields
    if (!type || !amount || !description || !categoryId || !frequency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['expense', 'income'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be expense or income' },
        { status: 400 }
      )
    }

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(frequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency' },
        { status: 400 }
      )
    }

    // Calculate next execution date
    const nextExecution = calculateNextExecution(frequency, dayOfMonth, dayOfWeek, startDate)

    // Create recurring transaction
    let recurring: any
    if (type === 'expense') {
      recurring = await prisma.recurringExpense.create({
        data: {
          userId: user.id,
          amount: parseFloat(amount),
          description,
          categoryId,
          frequency,
          dayOfMonth: dayOfMonth || null,
          dayOfWeek: dayOfWeek || null,
          isActive: true,
          nextExecutionAt: nextExecution
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
    } else {
      recurring = await prisma.recurringIncome.create({
        data: {
          userId: user.id,
          amount: parseFloat(amount),
          description,
          categoryId,
          frequency,
          dayOfMonth: dayOfMonth || null,
          dayOfWeek: dayOfWeek || null,
          isActive: true,
          reminderEnabled: true,
          nextExecutionAt: nextExecution
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
    }

    return NextResponse.json({
      success: true,
      message: 'Recurring transaction created',
      data: { ...recurring, type }
    })
  } catch (error) {
    console.error('Error creating recurring transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create recurring transaction' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Calculate next execution date based on frequency
 */
function calculateNextExecution(
  frequency: string,
  dayOfMonth?: number,
  dayOfWeek?: number,
  startDate?: string
): Date {
  const now = startDate ? new Date(startDate) : new Date()
  const next = new Date(now)

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break

    case 'weekly':
      if (dayOfWeek !== undefined && dayOfWeek !== null) {
        // Set to next occurrence of specified day (0 = Sunday, 6 = Saturday)
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
        
        // Handle months with fewer days (e.g., Feb 30 -> Feb 28)
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
      next.setMonth(next.getMonth() + 1) // Default to monthly
  }

  return next
}
