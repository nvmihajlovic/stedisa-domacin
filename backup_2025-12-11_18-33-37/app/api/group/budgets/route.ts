import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

// GET /api/group/budgets?groupId=xxx
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const period = searchParams.get('period') || 'MONTHLY'

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID required' }, { status: 400 })
    }

    // Verify user is member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.userId,
        leftAt: null,
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 })
    }

    // Get budgets for this group
    const budgets = await prisma.budget.findMany({
      where: {
        groupId,
        period,
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate spending for each budget
    const now = new Date()
    const startDate = period === 'MONTHLY'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), 0, 1)

    const endDate = period === 'MONTHLY'
      ? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      : new Date(now.getFullYear(), 11, 31, 23, 59, 59)

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const where: any = {
          groupId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        }

        if (budget.categoryId) {
          where.categoryId = budget.categoryId
        }

        const expenses = await prisma.expense.findMany({ where })
        const spent = expenses.reduce((sum, exp) => sum + exp.amountInRSD, 0)
        const percentage = (spent / budget.amount) * 100
        const remaining = budget.amount - spent

        return {
          ...budget,
          spent,
          percentage,
          remaining,
        }
      })
    )

    return NextResponse.json(budgetsWithSpending)
  } catch (error) {
    console.error('Error fetching group budgets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/group/budgets - Create group budget
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { groupId, categoryId, amount, period } = body

    if (!groupId || !amount || !period) {
      return NextResponse.json(
        { error: 'Group ID, amount, and period are required' },
        { status: 400 }
      )
    }

    // Verify user is owner or admin of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.userId,
        leftAt: null,
        role: {
          in: ['owner', 'admin'],
        },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only group owners and admins can create budgets' },
        { status: 403 }
      )
    }

    // Check if budget already exists
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: user.userId,
        groupId,
        categoryId: categoryId || null,
        period,
      },
    })

    if (existingBudget) {
      return NextResponse.json(
        { error: 'Budget already exists for this group and category' },
        { status: 400 }
      )
    }

    // Create budget
    const budget = await prisma.budget.create({
      data: {
        userId: user.userId,
        groupId,
        categoryId: categoryId || null,
        amount: parseFloat(amount),
        period,
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    console.log(`✅ Group budget created: ${budget.id}`)

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Error creating group budget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
