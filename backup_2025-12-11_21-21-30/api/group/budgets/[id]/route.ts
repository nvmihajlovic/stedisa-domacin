import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: budgetId } = await params

    // Get budget
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: {
        group: {
          include: {
            members: {
              where: {
                userId: user.userId,
                leftAt: null,
              },
            },
          },
        },
      },
    })

    if (!budget || !budget.groupId) {
      return NextResponse.json({ error: 'Group budget not found' }, { status: 404 })
    }

    // Check if user is owner, admin, or budget creator
    const membership = budget.group?.members[0]
    const isOwnerOrAdmin = membership && ['owner', 'admin'].includes(membership.role)
    const isBudgetCreator = budget.userId === user.userId

    if (!isOwnerOrAdmin && !isBudgetCreator) {
      return NextResponse.json(
        { error: 'Only group owners, admins, or budget creator can delete this budget' },
        { status: 403 }
      )
    }

    // Delete budget
    await prisma.budget.delete({
      where: { id: budgetId },
    })

    console.log(`✅ Group budget deleted: ${budgetId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting group budget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/group/budgets/[id] - Update group budget
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: budgetId } = await params
    const body = await request.json()
    const { amount } = body

    if (!amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
    }

    // Get budget
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: {
        group: {
          include: {
            members: {
              where: {
                userId: user.userId,
                leftAt: null,
              },
            },
          },
        },
      },
    })

    if (!budget || !budget.groupId) {
      return NextResponse.json({ error: 'Group budget not found' }, { status: 404 })
    }

    // Check permissions
    const membership = budget.group?.members[0]
    const isOwnerOrAdmin = membership && ['owner', 'admin'].includes(membership.role)
    const isBudgetCreator = budget.userId === user.userId

    if (!isOwnerOrAdmin && !isBudgetCreator) {
      return NextResponse.json(
        { error: 'Only group owners, admins, or budget creator can update this budget' },
        { status: 403 }
      )
    }

    // Update budget
    const updatedBudget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        amount: parseFloat(amount),
        // Reset alerts if amount changed
        alert80Sent: false,
        alert100Sent: false,
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

    console.log(`✅ Group budget updated: ${budgetId}`)

    return NextResponse.json(updatedBudget)
  } catch (error) {
    console.error('Error updating group budget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
