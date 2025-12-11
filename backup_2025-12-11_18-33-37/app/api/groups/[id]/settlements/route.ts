import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import {
  calculateMemberBalances,
  calculateSettlements,
  getSettlementsForUser,
  type GroupExpense
} from '@/lib/settlement-algorithm'

/**
 * GET /api/groups/[id]/settlements
 * Calculate current settlements for a group
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

    const { id: groupId } = await params

    // Verify user is member of this group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        leftAt: null
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      )
    }

    // Get all group members
    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        leftAt: null
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

    // Get all unpaid splits for this group
    const unpaidSplits = await prisma.split.findMany({
      where: {
        groupId,
        isPaid: false
      },
      include: {
        expense: {
          include: {
            category: true
          }
        }
      }
    })

    // Calculate who owes whom
    const debts: { [key: string]: { [key: string]: { amount: number, splits: any[] } } } = {}
    
    unpaidSplits.forEach(split => {
      if (!debts[split.paidById]) {
        debts[split.paidById] = {}
      }
      if (!debts[split.paidById][split.owedById]) {
        debts[split.paidById][split.owedById] = { amount: 0, splits: [] }
      }
      debts[split.paidById][split.owedById].amount += split.amount
      debts[split.paidById][split.owedById].splits.push(split)
    })

    // Get pending settlements (awaiting confirmation)
    const pendingSettlements = await prisma.settlement.findMany({
      where: {
        groupId,
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get all previous settlements (confirmed/rejected for history)
    const previousSettlements = await prisma.settlement.findMany({
      where: {
        groupId,
        status: {
          in: ['CONFIRMED', 'REJECTED']
        }
      },
      orderBy: {
        settledAt: 'desc'
      },
      take: 20 // Last 20 settlements
    })

    // Format settlements for current user
    const userOwes: any[] = []
    const userIsOwed: any[] = []
    let netBalance = 0

    // What user owes to others
    Object.entries(debts).forEach(([paidById, owedToThem]) => {
      Object.entries(owedToThem).forEach(([owedById, data]: [string, any]) => {
        if (owedById === user.id) {
          const payer = members.find(m => m.userId === paidById)
          userOwes.push({
            userId: paidById,
            name: payer?.user.name || 'Unknown',
            amount: data.amount,
            splits: data.splits
          })
          netBalance -= data.amount
        }
      })
    })

    // What others owe to user
    if (debts[user.id]) {
      Object.entries(debts[user.id]).forEach(([owedById, data]: [string, any]) => {
        const debtor = members.find(m => m.userId === owedById)
        userIsOwed.push({
          userId: owedById,
          name: debtor?.user.name || 'Unknown',
          amount: data.amount,
          splits: data.splits
        })
        netBalance += data.amount
      })
    }

    console.log('💰 Settlements calculation:')
    console.log('   User ID:', user.id)
    console.log('   User owes:', userOwes.length, userOwes)
    console.log('   User is owed:', userIsOwed.length, userIsOwed)
    console.log('   Net balance:', netBalance)

    // Calculate balances for all members
    const memberBalances = members.map(member => {
      const userId = member.userId
      let balance = 0
      
      // What others owe to this member
      if (debts[userId]) {
        Object.values(debts[userId]).forEach((data: any) => {
          balance += data.amount
        })
      }
      
      // What this member owes to others
      Object.entries(debts).forEach(([paidById, owedToThem]) => {
        Object.entries(owedToThem).forEach(([owedById, data]: [string, any]) => {
          if (owedById === userId) {
            balance -= data.amount
          }
        })
      })
      
      return {
        userId,
        name: member.user.name,
        balance
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        userSettlements: {
          youOwe: userOwes,
          owesYou: userIsOwed
        },
        netBalance,
        balances: memberBalances,
        pendingSettlements: pendingSettlements.map((s: any) => {
          const fromMember = members.find(m => m.userId === s.fromUserId)
          const toMember = members.find(m => m.userId === s.toUserId)
          return {
            id: s.id,
            from: s.fromUserId,
            fromName: fromMember?.user.name || 'Unknown',
            to: s.toUserId,
            toName: toMember?.user.name || 'Unknown',
            amount: s.amount,
            status: s.status,
            createdAt: s.createdAt,
            note: s.note
          }
        }),
        previousSettlements: previousSettlements.map((s: any) => {
          const fromMember = members.find(m => m.userId === s.fromUserId)
          const toMember = members.find(m => m.userId === s.toUserId)
          return {
            id: s.id,
            from: s.fromUserId,
            fromName: fromMember?.user.name || 'Unknown',
            to: s.toUserId,
            toName: toMember?.user.name || 'Unknown',
            amount: s.amount,
            status: s.status,
            settledAt: s.settledAt,
            confirmedAt: s.confirmedAt,
            rejectedAt: s.rejectedAt,
            note: s.note
          }
        })
      }
    })
  } catch (error) {
    console.error('Error calculating settlements:', error)
    return NextResponse.json(
      { error: 'Failed to calculate settlements' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/groups/[id]/settlements
 * Record a settlement payment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId } = await params
    const body = await req.json()
    const { toUserId, fromUserId, amount, note } = body

    console.log('📨 Received settlement request:')
    console.log('   Body:', body)
    console.log('   Current user:', user.id)
    console.log('   Amount:', amount)

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid settlement data' },
        { status: 400 }
      )
    }

    // Determine who is paying and who is receiving
    let payerId: string
    let receiverId: string

    if (fromUserId && (toUserId === 'CURRENT_USER' || !toUserId)) {
      // Confirmation: fromUserId pays to current user (used when confirming payment)
      payerId = fromUserId
      receiverId = user.id
    } else if (fromUserId && toUserId) {
      // Explicit: fromUserId pays to toUserId
      payerId = fromUserId
      receiverId = toUserId
    } else if (toUserId) {
      // Legacy: current user pays to toUserId
      payerId = user.id
      receiverId = toUserId
    } else {
      return NextResponse.json(
        { error: 'Missing fromUserId or toUserId' },
        { status: 400 }
      )
    }

    // Verify user is member of this group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.id,
        leftAt: null
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 403 }
      )
    }

    // Verify payer is member of this group
    const payerMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: payerId,
        leftAt: null
      }
    })

    if (!payerMembership) {
      return NextResponse.json(
        { error: 'Payer is not a member of this group' },
        { status: 400 }
      )
    }

    // Verify receiver is member of this group
    const receiverMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: receiverId,
        leftAt: null
      }
    })

    if (!receiverMembership) {
      return NextResponse.json(
        { error: 'Receiver is not a member of this group' },
        { status: 400 }
      )
    }

    // Check if there's already a pending settlement for this payer-receiver pair
    console.log('🔍 Checking for existing pending settlement:')
    console.log('   From (payer):', payerId)
    console.log('   To (receiver):', receiverId)
    
    const existingPendingSettlement = await prisma.settlement.findFirst({
      where: {
        groupId,
        fromUserId: payerId,
        toUserId: receiverId,
        status: 'PENDING'
      }
    })

    console.log('   Existing pending:', existingPendingSettlement ? 'YES - ID: ' + existingPendingSettlement.id : 'NO')

    if (existingPendingSettlement) {
      return NextResponse.json(
        { error: 'Već postoji zahtev za poravnanje na čekanju. Sačekajte da poverilac potvrdi ili odbije trenutni zahtev.' },
        { status: 400 }
      )
    }

    // Find all unpaid splits where payer owes to receiver
    console.log('💳 Looking for splits to settle:')
    console.log('   GroupId:', groupId)
    console.log('   PaidBy (receiver):', receiverId)
    console.log('   OwedBy (payer):', payerId)
    
    const splitsToSettle = await prisma.split.findMany({
      where: {
        groupId,
        paidById: receiverId,
        owedById: payerId,
        isPaid: false
      }
    })

    console.log('   Found splits:', splitsToSettle.length)

    if (splitsToSettle.length === 0) {
      return NextResponse.json(
        { 
          error: 'No debts found to settle',
          debug: {
            groupId,
            paidById: receiverId,
            owedById: payerId
          }
        },
        { status: 400 }
      )
    }

    // Calculate total owed
    const totalOwed = splitsToSettle.reduce((sum, split) => sum + split.amount, 0)

    if (amount > totalOwed) {
      return NextResponse.json(
        { error: `Amount exceeds total debt of ${totalOwed.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Create Settlement record with PENDING status (splits not marked as paid yet)
    const settlement = await prisma.settlement.create({
      data: {
        groupId,
        fromUserId: payerId,
        toUserId: receiverId,
        amount,
        status: 'PENDING',
        note: note || null
      }
    })

    // Get payer and receiver names
    const payer = await prisma.user.findUnique({
      where: { id: payerId },
      select: { name: true }
    })
    
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { name: true }
    })

    // Determine who initiated the settlement to send correct notification
    const initiatorIsReceiver = receiverId === user.id
    
    if (initiatorIsReceiver) {
      // Poverilac kreira settlement - notifikacija ide dužniku
      await prisma.notification.create({
        data: {
          userId: payerId, // dužnik prima notifikaciju
          type: 'SETTLEMENT_REQUEST',
          title: 'Zahtev za poravnanje',
          message: `${receiver?.name || 'Nepoznat korisnik'} traži da poravnate dug od ${amount.toFixed(2)} RSD`,
          isRead: false,
          groupId: groupId,
          fromUserId: receiverId // poverilac je inicirao
        }
      })
    } else {
      // Dužnik kreira settlement - notifikacija ide poverilocu
      await prisma.notification.create({
        data: {
          userId: receiverId, // poverilac prima notifikaciju
          type: 'SETTLEMENT_REQUEST',
          title: 'Zahtev za poravnanje',
          message: `${payer?.name || 'Nepoznat korisnik'} želi da poravna dug od ${amount.toFixed(2)} RSD`,
          isRead: false,
          groupId: groupId,
          fromUserId: payerId // dužnik je inicirao
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Zahtev za poravnanje je poslat. Čeka se potvrda poverioca.',
      data: {
        id: settlement.id,
        from: settlement.fromUserId,
        fromName: payer?.name || 'Unknown',
        to: settlement.toUserId,
        toName: receiver?.name || 'Unknown',
        amount: settlement.amount,
        status: settlement.status,
        settledAt: settlement.settledAt,
        note: settlement.note
      }
    })
  } catch (error) {
    console.error('Error recording settlement:', error)
    return NextResponse.json(
      { error: 'Failed to record settlement' },
      { status: 500 }
    )
  }
}
