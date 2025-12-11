import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const budgetId = params.id
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'monthly'

    // Get budget details
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: {
        category: true,
      },
    })

    if (!budget || budget.userId !== user.userId) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    // Calculate date range
    const now = new Date()
    const startDate = period === 'monthly'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), 0, 1)

    const endDate = period === 'monthly'
      ? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      : new Date(now.getFullYear(), 11, 31, 23, 59, 59)

    // If budget is for specific category, just return total spent
    if (budget.categoryId) {
      const expenses = await prisma.expense.findMany({
        where: {
          userId: user.userId,
          categoryId: budget.categoryId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      const totalSpent = expenses.reduce((sum, exp) => sum + (exp.amountInRSD || exp.amount), 0)

      return NextResponse.json({
        totalSpent,
        categories: [],
      })
    }

    // For overall budget, get spending by category
    const expenses = await prisma.expense.findMany({
      where: {
        userId: user.userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    })

    // Group by category
    const categoryMap = new Map<string, {
      categoryId: string
      categoryName: string
      categoryIcon: string
      categoryColor: string
      spent: number
    }>()

    let totalSpent = 0

    for (const expense of expenses) {
      const catId = expense.categoryId
      const amount = expense.amountInRSD || 0

      totalSpent += amount

      if (categoryMap.has(catId)) {
        categoryMap.get(catId)!.spent += amount
      } else {
        categoryMap.set(catId, {
          categoryId: catId,
          categoryName: expense.category.name,
          categoryIcon: expense.category.icon || '📦',
          categoryColor: expense.category.color || '#666',
          spent: amount,
        })
      }
    }

    // Convert to array and calculate percentages
    const categories = Array.from(categoryMap.values())
      .map(cat => ({
        ...cat,
        percentage: totalSpent > 0 ? (cat.spent / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.spent - a.spent)

    return NextResponse.json({
      totalSpent,
      categories,
    })
  } catch (error) {
    console.error('Error fetching budget breakdown:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
