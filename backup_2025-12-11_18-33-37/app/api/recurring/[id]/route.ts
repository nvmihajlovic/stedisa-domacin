import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

/**
 * GET /api/recurring/[id]
 * Get single recurring transaction
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Try to find in expenses first
    let recurring: any = await prisma.recurringExpense.findFirst({
      where: { id, userId: user.id }
    })

    let type = 'expense'

    // If not found, try incomes
    if (!recurring) {
      recurring = await prisma.recurringIncome.findFirst({
        where: { id, userId: user.id }
      })
      type = 'income'
    }

    if (!recurring) {
      return NextResponse.json(
        { error: 'Recurring transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { ...recurring, type }
    })
  } catch (error) {
    console.error('Error fetching recurring transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recurring transaction' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/recurring/[id]
 * Update recurring transaction
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { type, isActive, amount, description, categoryId, frequency } = body

    // Verify ownership
    let existing: any
    if (type === 'expense') {
      existing = await prisma.recurringExpense.findFirst({
        where: { id, userId: user.id }
      })
    } else {
      existing = await prisma.recurringIncome.findFirst({
        where: { id, userId: user.id }
      })
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Recurring transaction not found' },
        { status: 404 }
      )
    }

    // Update
    let updated: any
    if (type === 'expense') {
      updated = await prisma.recurringExpense.update({
        where: { id },
        data: {
          ...(isActive !== undefined && { isActive }),
          ...(amount && { amount: parseFloat(amount) }),
          ...(description && { description }),
          ...(categoryId && { categoryId }),
          ...(frequency && { frequency })
        }
      })
    } else {
      updated = await prisma.recurringIncome.update({
        where: { id },
        data: {
          ...(isActive !== undefined && { isActive }),
          ...(amount && { amount: parseFloat(amount) }),
          ...(description && { description }),
          ...(categoryId && { categoryId }),
          ...(frequency && { frequency })
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Recurring transaction updated',
      data: { ...updated, type }
    })
  } catch (error) {
    console.error('Error updating recurring transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update recurring transaction' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/recurring/[id]
 * Delete recurring transaction
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'expense' or 'income'

    if (!type) {
      return NextResponse.json(
        { error: 'Type parameter required' },
        { status: 400 }
      )
    }

    // Verify ownership before deleting
    let existing: any
    if (type === 'expense') {
      existing = await prisma.recurringExpense.findFirst({
        where: { id, userId: user.id }
      })
    } else {
      existing = await prisma.recurringIncome.findFirst({
        where: { id, userId: user.id }
      })
    }

    if (!existing) {
      return NextResponse.json(
        { error: 'Recurring transaction not found' },
        { status: 404 }
      )
    }

    // Delete
    if (type === 'expense') {
      await prisma.recurringExpense.delete({ where: { id } })
    } else {
      await prisma.recurringIncome.delete({ where: { id } })
    }

    return NextResponse.json({
      success: true,
      message: 'Recurring transaction deleted'
    })
  } catch (error) {
    console.error('Error deleting recurring transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete recurring transaction' },
      { status: 500 }
    )
  }
}
