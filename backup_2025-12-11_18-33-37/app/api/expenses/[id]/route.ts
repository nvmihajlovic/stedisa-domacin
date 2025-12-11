import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { convertCurrency, getExchangeRates } from "@/lib/currency"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Prvo učitaj expense sa detaljima za notifikaciju
  const expense = await prisma.expense.findUnique({
    where: { id, userId: user.userId },
    include: {
      group: { select: { id: true, name: true } },
      splits: { select: { owedById: true } }
    }
  })

  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 })
  }

  // Obriši expense
  await prisma.expense.delete({
    where: { id, userId: user.userId }
  })

  // Ako je bio u grupi, pošalji notifikacije drugim članovima
  // ALI: Ne šalji notifikaciju ako je ovo automatsko brisanje zbog settlement-a
  const isAutoSettlementAction = expense.note?.includes('[AUTO_SETTLEMENT')
  
  if (expense.groupId && expense.splits && expense.splits.length > 0 && !isAutoSettlementAction) {
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true }
    })

    const uniqueParticipants = [...new Set(expense.splits.map(s => s.owedById))]
    
    const notificationPromises = uniqueParticipants.map(participantId => {
      return prisma.notification.create({
        data: {
          userId: participantId,
          type: 'EXPENSE_DELETED',
          title: 'Trošak obrisan',
          message: `${currentUser?.name || 'Član'} je obrisao trošak "${expense.description}" (${expense.amount.toFixed(2)} ${expense.currency || 'RSD'}) - vaš dug je otkazan`,
          isRead: false,
          groupId: expense.groupId,
          fromUserId: user.userId
        }
      })
    })

    await Promise.all(notificationPromises)
  }

  return NextResponse.json({ message: "Deleted" })
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    console.log('Update request body:', body)
    
    const { amount, description, date, categoryId, currency, note, isRecurring, recurringType, nextRecurringDate } = body

    // Validacija recurring polja
    if (isRecurring && !recurringType) {
      return NextResponse.json({ error: "Recurring type je obavezan za recurring troškove" }, { status: 400 })
    }

    if (isRecurring && !nextRecurringDate) {
      return NextResponse.json({ error: "Sledeći datum ponavljanja je obavezan za recurring troškove" }, { status: 400 })
    }

    // Konvertuj u RSD za statistike
    const expenseCurrency = currency || "RSD"
    let amountInRSD = parseFloat(amount)
    
    if (expenseCurrency !== "RSD") {
      try {
        const rates = await getExchangeRates()
        amountInRSD = await convertCurrency(parseFloat(amount), expenseCurrency, "RSD")
        console.log(`💱 Converted ${amount} ${expenseCurrency} to ${amountInRSD} RSD`)
      } catch (error) {
        console.error('Error converting currency:', error)
        // Ako konverzija ne uspe, koristi originalni iznos
      }
    }

    const updateData: any = {
      amount: parseFloat(amount),
      amountInRSD: amountInRSD,
      description,
      date: new Date(date),
    }

    if (categoryId !== undefined) {
      updateData.category = {
        connect: { id: categoryId }
      }
    }
    if (currency !== undefined) updateData.currency = currency
    if (note !== undefined) updateData.note = note

    console.log('Update data:', updateData)

    // Prvo ažuriraj osnovne expense podatke
    const expense = await prisma.expense.update({
      where: {
        id: id,
        userId: user.userId,
      },
      data: updateData,
      include: {
        category: true,
        recurringExpense: true,
      },
    })

    // Ako je isRecurring true, kreiraj ili ažuriraj RecurringExpense
    if (isRecurring && recurringType && nextRecurringDate) {
      if (expense.recurringExpense) {
        // Ažuriraj postojeći recurring expense
        await prisma.recurringExpense.update({
          where: { id: expense.recurringExpense.id },
          data: {
            frequency: recurringType,
            nextExecutionAt: new Date(nextRecurringDate),
            amount: parseFloat(amount),
            description,
          }
        })
      } else {
        // Kreiraj novi recurring expense
        await prisma.recurringExpense.create({
          data: {
            userId: user.userId,
            amount: parseFloat(amount),
            description,
            frequency: recurringType,
            nextExecutionAt: new Date(nextRecurringDate),
            categoryId: categoryId,
            expenses: {
              connect: { id: expense.id }
            }
          }
        })
      }
    } else if (!isRecurring && expense.recurringExpense) {
      // Ako je isRecurring false, obriši RecurringExpense vezu
      await prisma.expense.update({
        where: { id: expense.id },
        data: {
          recurringExpense: {
            disconnect: true
          }
        }
      })
    }

    // Vrati ažurirani expense sa relacijom
    const updatedExpense = await prisma.expense.findUnique({
      where: { id: expense.id },
      include: {
        category: true,
        recurringExpense: true,
        group: { select: { id: true, name: true } },
        splits: { select: { owedById: true } }
      }
    })

    // Ako je expense u grupi, pošalji notifikacije drugim članovima
    // ALI: Ne šalji notifikaciju ako je ovo automatska izmena zbog settlement-a
    const isAutoSettlementAction = updatedExpense?.note?.includes('[AUTO_SETTLEMENT')
    
    if (updatedExpense?.groupId && updatedExpense.splits && updatedExpense.splits.length > 0 && !isAutoSettlementAction) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { name: true }
      })

      const uniqueParticipants = [...new Set(updatedExpense.splits.map(s => s.owedById))]
      const amountPerPerson = updatedExpense.amount / (uniqueParticipants.length + 1) // +1 jer je payer takođe učestvuje
      
      const notificationPromises = uniqueParticipants.map(participantId => {
        return prisma.notification.create({
          data: {
            userId: participantId,
            type: 'EXPENSE_UPDATED',
            title: 'Trošak ažuriran',
            message: `${currentUser?.name || 'Član'} je ažurirao trošak "${updatedExpense.description}" - novo dugovanje: ${amountPerPerson.toFixed(2)} ${updatedExpense.currency || 'RSD'}`,
            isRead: false,
            groupId: updatedExpense.groupId,
            expenseId: updatedExpense.id,
            fromUserId: user.userId
          }
        })
      })

      await Promise.all(notificationPromises)
    }

    return NextResponse.json(updatedExpense)
  } catch (error: any) {
    console.error('Update expense error:', error)
    console.error('Error details:', error.message, error.code)
    return NextResponse.json({ 
      error: "Greška pri ažuriranju troška", 
      details: error.message,
      code: error.code 
    }, { status: 500 })
  }
}

