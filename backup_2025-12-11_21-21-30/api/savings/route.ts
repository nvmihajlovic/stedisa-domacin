import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all savings goals
export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const groupFilter = searchParams.get('groupFilter') // 'all' | 'personal' | groupId

    // Get user's active group
    const userWithGroup = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { activeGroupId: true }
    })

    const whereClause: any = {
      userId: user.userId,
      isActive: true
    }

    // Filter by group context - same logic as expenses
    if (groupFilter === 'all') {
      // Show all savings goals (no group filter)
    } else if (groupFilter === 'personal') {
      // Show only personal savings goals (no group)
      whereClause.groupId = null
    } else if (groupFilter && groupFilter !== 'null') {
      // Show savings goals for specific group
      whereClause.groupId = groupFilter
    } else {
      // Default behavior: if user has active group, show ONLY that group's savings
      // Otherwise show personal savings (groupId: null)
      if (userWithGroup?.activeGroupId) {
        whereClause.groupId = userWithGroup.activeGroupId
      } else {
        whereClause.groupId = null
      }
    }

    console.log('📊 Fetching savings goals with filter:', whereClause)

    const savingsGoals = await prisma.savingsGoal.findMany({
      where: whereClause,
      include: {
        category: true,
        group: true,
        contributions: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`✅ Found ${savingsGoals.length} savings goals`)

    return NextResponse.json({ success: true, data: savingsGoals })
  } catch (error: any) {
    console.error('Error fetching savings goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch savings goals', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new savings goal
export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      targetAmount,
      currency,
      categoryId,
      period,
      targetDate,
      isRecurring,
      recurringFrequency,
      recurringDayOfMonth,
      recurringAmount,
      groupId,
      color,
      icon
    } = body

    // Validation
    if (!name || !targetAmount || !categoryId) {
      return NextResponse.json(
        { error: 'Name, target amount, and category are required' },
        { status: 400 }
      )
    }

    if (isRecurring && (!recurringFrequency || !recurringDayOfMonth || !recurringAmount)) {
      return NextResponse.json(
        { error: 'Recurring settings require frequency, day of month, and amount' },
        { status: 400 }
      )
    }

    const savingsGoal = await prisma.savingsGoal.create({
      data: {
        userId: user.userId,
        groupId: groupId || null,
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        currency: currency || 'RSD',
        categoryId,
        period: period || 'monthly',
        targetDate: targetDate ? new Date(targetDate) : null,
        isRecurring: isRecurring || false,
        recurringFrequency: isRecurring ? recurringFrequency : null,
        recurringDayOfMonth: isRecurring ? parseInt(recurringDayOfMonth) : null,
        recurringAmount: isRecurring ? parseFloat(recurringAmount) : null,
        color: color || '#FFD700',
        icon: icon || 'CurrencyDollar'
      },
      include: {
        category: true,
        group: true
      }
    })

    return NextResponse.json({ success: true, data: savingsGoal }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating savings goal:', error)
    return NextResponse.json(
      { error: 'Failed to create savings goal', details: error.message },
      { status: 500 }
    )
  }
}
