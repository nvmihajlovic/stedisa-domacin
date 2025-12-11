import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { convertCurrency } from '@/lib/currency'

// POST - Add contribution to savings goal
export async function POST(
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
    const { amount, currency, description, isAutomatic } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    const savingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!savingsGoal) {
      return NextResponse.json({ error: 'Savings goal not found' }, { status: 404 })
    }

    // Convert amount to goal's currency if needed
    const contributionCurrency = currency || 'RSD'
    let amountInGoalCurrency = parseFloat(amount)
    
    if (contributionCurrency !== savingsGoal.currency) {
      console.log(`💱 Converting ${amount} ${contributionCurrency} to ${savingsGoal.currency}`)
      amountInGoalCurrency = await convertCurrency(
        parseFloat(amount),
        contributionCurrency,
        savingsGoal.currency
      )
      console.log(`✅ Converted amount: ${amountInGoalCurrency} ${savingsGoal.currency}`)
    }

    // Create contribution (store original amount and currency)
    const contribution = await prisma.savingsContribution.create({
      data: {
        savingsGoalId: id,
        userId: user.userId,
        amount: parseFloat(amount),
        currency: currency || 'RSD',
        description: description || null,
        isAutomatic: isAutomatic || false
      }
    })

    // Update savings goal current amount (use converted amount)
    const updatedGoal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        currentAmount: {
          increment: amountInGoalCurrency  // Use converted amount!
        }
      },
      include: {
        category: true,
        group: true,
        contributions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: {
        contribution,
        savingsGoal: updatedGoal
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error adding contribution:', error)
    return NextResponse.json(
      { error: 'Failed to add contribution', details: error.message },
      { status: 500 }
    )
  }
}
