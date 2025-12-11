import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

/**
 * PATCH /api/groups/[id]/settlements/[settlementId]
 * Confirm or reject a settlement
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; settlementId: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: groupId, settlementId } = await params
    const body = await req.json()
    const { action } = body // 'confirm' or 'reject'

    if (!action || (action !== 'confirm' && action !== 'reject')) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "confirm" or "reject"' },
        { status: 400 }
      )
    }

    // Get the settlement
    const settlement = await prisma.settlement.findUnique({
      where: { id: settlementId }
    })

    if (!settlement) {
      return NextResponse.json(
        { error: 'Settlement not found' },
        { status: 404 }
      )
    }

    // Verify this is for the correct group
    if (settlement.groupId !== groupId) {
      return NextResponse.json(
        { error: 'Settlement does not belong to this group' },
        { status: 400 }
      )
    }

    // Verify user is the creditor (toUserId)
    if (settlement.toUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only the creditor can confirm or reject this settlement' },
        { status: 403 }
      )
    }

    // Verify settlement is still pending
    if (settlement.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Settlement is already ${settlement.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    if (action === 'confirm') {
      // Update settlement status to CONFIRMED
      const updatedSettlement = await prisma.settlement.update({
        where: { id: settlementId },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date()
        }
      })

      // Now mark the splits as paid
      // Find all unpaid splits where debtor (fromUserId) owes to creditor (toUserId)
      const splitsToSettle = await prisma.split.findMany({
        where: {
          groupId,
          paidById: settlement.toUserId,
          owedById: settlement.fromUserId,
          isPaid: false
        }
      })

      // Mark splits as paid (proportionally if needed)
      let remainingAmount = settlement.amount
      const updatedSplits = []

      for (const split of splitsToSettle) {
        if (remainingAmount <= 0) break

        if (remainingAmount >= split.amount) {
          // Fully pay this split
          await prisma.split.update({
            where: { id: split.id },
            data: {
              isPaid: true,
              paidAt: new Date()
            }
          })
          updatedSplits.push(split)
          remainingAmount -= split.amount
        } else {
          // Partial payment - split the Split record
          // Update existing with remaining amount
          await prisma.split.update({
            where: { id: split.id },
            data: {
              amount: split.amount - remainingAmount
            }
          })
          // Create new paid split with paid amount
          await prisma.split.create({
            data: {
              groupId: split.groupId,
              expenseId: split.expenseId,
              paidById: split.paidById,
              owedById: split.owedById,
              amount: remainingAmount,
              currency: split.currency,
              isPaid: true,
              paidAt: new Date()
            }
          })
          remainingAmount = 0
        }
      }

      // Create expense record for debtor (to track their payment)
      // Get the first split to use as template for expense details
      if (splitsToSettle.length > 0) {
        const templateSplit = splitsToSettle[0]
        const originalExpense = await prisma.expense.findUnique({
          where: { id: templateSplit.expenseId },
          include: { category: true }
        })

        if (originalExpense) {
          // Reduce creditor's original expense by the settled amount
          const newAmount = originalExpense.amount - settlement.amount
          const newAmountInRSD = originalExpense.amountInRSD - settlement.amount

          // Only update if there's remaining amount, otherwise delete
          if (newAmount > 0) {
            await prisma.expense.update({
              where: { id: originalExpense.id },
              data: {
                amount: newAmount,
                amountInRSD: newAmountInRSD,
                // Dodaj note da bi znali da je ovo automatska izmena (za kasnije filtriranje notifikacija)
                note: (originalExpense.note || '') + ' [AUTO_SETTLEMENT_UPDATE]'
              }
            })
          } else {
            // If fully paid, delete the expense
            await prisma.expense.delete({
              where: { id: originalExpense.id }
            })
          }

          // Create new expense for debtor
          await prisma.expense.create({
            data: {
              amount: settlement.amount,
              amountInRSD: settlement.amount, // Assuming RSD
              description: `Poravnanje duga - ${originalExpense.description}`,
              date: new Date(),
              categoryId: originalExpense.categoryId,
              userId: settlement.fromUserId, // Debtor is now the expense owner
              groupId: groupId,
              currency: 'RSD',
              note: `[AUTO_SETTLEMENT] Automatski kreiran trošak nakon poravnanja duga sa ${(await prisma.user.findUnique({ where: { id: settlement.toUserId }, select: { name: true } }))?.name}`
            }
          })
        }
      }

      // Create notification for debtor (fromUserId)
      const creditor = await prisma.user.findUnique({
        where: { id: settlement.toUserId },
        select: { name: true }
      })

      await prisma.notification.create({
        data: {
          userId: settlement.fromUserId,
          type: 'settlement_confirmed',
          title: 'Poravnanje potvrđeno',
          message: `${creditor?.name || 'Poverilac'} je potvrdio izmirenje duga od ${settlement.amount.toFixed(2)} RSD`,
          isRead: false,
          groupId: groupId,
          fromUserId: settlement.toUserId
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Poravnanje je potvrđeno',
        data: {
          id: updatedSettlement.id,
          status: updatedSettlement.status,
          confirmedAt: updatedSettlement.confirmedAt,
          splitsSettled: updatedSplits.length
        }
      })
    } else {
      // Reject settlement
      const updatedSettlement = await prisma.settlement.update({
        where: { id: settlementId },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date()
        }
      })

      // Create notification for debtor (fromUserId)
      const creditor = await prisma.user.findUnique({
        where: { id: settlement.toUserId },
        select: { name: true }
      })

      await prisma.notification.create({
        data: {
          userId: settlement.fromUserId,
          type: 'settlement_rejected',
          title: 'Poravnanje odbijeno',
          message: `${creditor?.name || 'Poverilac'} je odbio zahtev za poravnanje od ${settlement.amount.toFixed(2)} RSD`,
          isRead: false,
          groupId: groupId,
          fromUserId: settlement.toUserId
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Poravnanje je odbijeno',
        data: {
          id: updatedSettlement.id,
          status: updatedSettlement.status,
          rejectedAt: updatedSettlement.rejectedAt
        }
      })
    }
  } catch (error) {
    console.error('Error updating settlement:', error)
    return NextResponse.json(
      { error: 'Failed to update settlement' },
      { status: 500 }
    )
  }
}
