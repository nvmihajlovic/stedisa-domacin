import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/export/pdf-data
 * Get data for PDF export (expenses, incomes, statistics)
 * Query params:
 *  - startDate: YYYY-MM-DD
 *  - endDate: YYYY-MM-DD
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')
    const expenseIds = searchParams.get('expenseIds')
    const incomeIds = searchParams.get('incomeIds')

    let startDate: Date | undefined
    let endDate: Date | undefined

    // Handle expense IDs or date range
    let expenseWhere: any = { userId: user.id }
    if (expenseIds) {
      expenseWhere.id = {
        in: expenseIds.split(',').filter(id => id.trim() !== '')
      }
    } else if (startDateStr && endDateStr) {
      startDate = new Date(startDateStr)
      endDate = new Date(endDateStr)
      endDate.setHours(23, 59, 59, 999)
      expenseWhere.date = {
        gte: startDate,
        lte: endDate,
      }
    } else {
      return NextResponse.json(
        { error: 'Either expenseIds or date range (startDate & endDate) is required' },
        { status: 400 }
      )
    }

    // Fetch expenses
    const expenses = await prisma.expense.findMany({
      where: expenseWhere,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Handle income IDs or date range
    let incomeWhere: any = { userId: user.id }
    if (incomeIds) {
      incomeWhere.id = {
        in: incomeIds.split(',').filter(id => id.trim() !== '')
      }
    } else if (startDate && endDate) {
      incomeWhere.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    // Fetch incomes
    const incomes = await prisma.income.findMany({
      where: incomeWhere,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Calculate totals
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0)
    const balance = totalIncome - totalExpense

    // Group expenses by category
    const expensesByCategory: { [key: string]: { name: string; total: number; icon?: string } } = {}
    
    expenses.forEach((expense) => {
      const catName = expense.category?.name || 'Ostalo'
      if (!expensesByCategory[catName]) {
        expensesByCategory[catName] = {
          name: catName,
          total: 0,
          icon: expense.category?.icon || undefined,
        }
      }
      expensesByCategory[catName].total += expense.amount
    })

    const expensesByCategoryArray = Object.values(expensesByCategory)
      .map((cat) => ({
        ...cat,
        percentage: (cat.total / totalExpense) * 100,
      }))
      .sort((a, b) => b.total - a.total)

    // Format period string
    const periodStr = `${startDate.toLocaleDateString('sr-RS')} - ${endDate.toLocaleDateString('sr-RS')}`

    return NextResponse.json({
      title: 'Finansijski izveštaj',
      period: periodStr,
      totalIncome,
      totalExpense,
      balance,
      expenses: expenses.map((exp) => ({
        date: exp.date.toISOString(),
        description: exp.description,
        amount: exp.amount,
        category: exp.category?.name || 'Ostalo',
      })),
      incomes: incomes.map((inc) => ({
        date: inc.date.toISOString(),
        description: inc.description,
        amount: inc.amount,
        category: inc.category?.name || 'Ostalo',
      })),
      expensesByCategory: expensesByCategoryArray,
    })
  } catch (error) {
    console.error('Error generating PDF data:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF data' },
      { status: 500 }
    )
  }
}
