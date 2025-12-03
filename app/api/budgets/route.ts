import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/budgets
 * Fetch all budgets for the authenticated user
 * Query params:
 *  - period: "MONTHLY" | "YEARLY" (optional)
 *  - categoryId: filter by category (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period')
    const categoryId = searchParams.get('categoryId')

    const where: any = { userId: user.id }
    if (period) where.period = period
    if (categoryId) where.categoryId = categoryId

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate current spending for each budget
    const now = new Date()
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const startDate = budget.period === 'MONTHLY'
          ? new Date(now.getFullYear(), now.getMonth(), 1)
          : new Date(now.getFullYear(), 0, 1)

        const endDate = budget.period === 'MONTHLY'
          ? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
          : new Date(now.getFullYear(), 11, 31, 23, 59, 59)

        const where: any = {
          userId: user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        }

        if (budget.categoryId) {
          where.categoryId = budget.categoryId
        }

        const expenses = await prisma.expense.findMany({ where })
        const spent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
        const percentage = (spent / budget.amount) * 100

        return {
          ...budget,
          spent,
          percentage: Math.min(percentage, 100),
          remaining: Math.max(budget.amount - spent, 0),
        }
      })
    )

    return NextResponse.json(budgetsWithSpending, { status: 200 })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/budgets
 * Create a new budget
 * Body: { categoryId?: string, amount: number, period: "MONTHLY" | "YEARLY" }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { categoryId, amount, period } = body

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    if (!period || !['MONTHLY', 'YEARLY'].includes(period)) {
      return NextResponse.json(
        { error: 'Period must be MONTHLY or YEARLY' },
        { status: 400 }
      )
    }

    // Check if category exists (if provided)
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: user.id },
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
    }

    // Check if budget already exists for this category + period
    const existing = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        categoryId: categoryId || null,
        period,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Budget already exists for this category and period' },
        { status: 400 }
      )
    }

    const budget = await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: categoryId || null,
        amount,
        period,
      },
      include: {
        category: true,
      },
    })

    console.log(`📊 Created budget: ${amount} RSD ${period} for ${budget.category?.name || 'Overall'}`)

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    )
  }
}
