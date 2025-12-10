import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch single savings goal
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const savingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      },
      include: {
        category: true,
        group: true,
        contributions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!savingsGoal) {
      return NextResponse.json({ error: 'Savings goal not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: savingsGoal })
  } catch (error: any) {
    console.error('Error fetching savings goal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch savings goal', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update savings goal
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      color,
      icon,
      isActive
    } = body

    const existingGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      }
    })

    if (!existingGoal) {
      return NextResponse.json({ error: 'Savings goal not found' }, { status: 404 })
    }

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (targetAmount !== undefined) updateData.targetAmount = parseFloat(targetAmount)
    if (currency !== undefined) updateData.currency = currency
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (period !== undefined) updateData.period = period
    if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null
    if (isRecurring !== undefined) {
      updateData.isRecurring = isRecurring
      if (isRecurring) {
        updateData.recurringFrequency = recurringFrequency
        updateData.recurringDayOfMonth = parseInt(recurringDayOfMonth)
        updateData.recurringAmount = parseFloat(recurringAmount)
      } else {
        updateData.recurringFrequency = null
        updateData.recurringDayOfMonth = null
        updateData.recurringAmount = null
      }
    }
    if (color !== undefined) updateData.color = color
    if (icon !== undefined) updateData.icon = icon
    if (isActive !== undefined) updateData.isActive = isActive

    console.log('🔄 Updating savings goal:', params.id)
    console.log('📝 Update data:', updateData)

    const updatedGoal = await prisma.savingsGoal.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
        group: true,
        contributions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    console.log('✅ Savings goal updated successfully:', updatedGoal.id)

    return NextResponse.json({ success: true, data: updatedGoal })
  } catch (error: any) {
    console.error('❌ Error updating savings goal:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        success: false,
        error: 'Greška pri ažuriranju cilja štednje', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete savings goal
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🗑️ Attempting to delete savings goal:', params.id)

    const existingGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      },
      include: {
        contributions: true
      }
    })

    if (!existingGoal) {
      console.log('❌ Savings goal not found:', params.id)
      return NextResponse.json({ 
        success: false,
        error: 'Cilj štednje nije pronađen' 
      }, { status: 404 })
    }

    console.log(`📊 Goal has ${existingGoal.contributions.length} contributions`)

    await prisma.savingsGoal.delete({
      where: { id: params.id }
    })

    console.log('✅ Savings goal deleted successfully:', params.id)

    return NextResponse.json({ success: true, message: 'Cilj štednje uspešno obrisan' })
  } catch (error: any) {
    console.error('❌ Error deleting savings goal:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        success: false,
        error: 'Greška pri brisanju cilja štednje', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
