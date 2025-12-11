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
  if (expense.groupId) {
    const group = await prisma.group.findUnique({
      where: { id: expense.groupId },
      include: {
        members: {
          where: { leftAt: null },
          select: { userId: true }
        }
      }
    })

    if (group) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { name: true }
      })

      const otherMembers = group.members
        .filter(m => m.userId !== user.userId)
        .map(m => m.userId)
      
      if (otherMembers.length > 0) {
        console.log(`📢 Sending delete notifications to ${otherMembers.length} group members`)
        
        const notificationPromises = otherMembers.map(memberId => {
          return prisma.notification.create({
            data: {
              userId: memberId,
              type: 'EXPENSE_DELETED',
              title: 'Trošak obrisan iz grupe',
              message: `${currentUser?.name || 'Član grupe'} je obrisao trošak "${expense.description}" (${expense.amount.toFixed(2)} ${expense.currency || 'RSD'}) iz grupe "${expense.group?.name || 'Grupa'}"`,
              isRead: false,
              groupId: expense.groupId,
              fromUserId: user.userId
            }
          })
        })

        await Promise.all(notificationPromises)
        console.log(`✅ Sent ${otherMembers.length} delete notifications`)
      }
    }
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
        group: { 
          select: { 
            id: true, 
            name: true,
            members: {
              where: { leftAt: null },
              select: { userId: true }
            }
          }
        }
      }
    })

    // Ako je expense u grupi, pošalji notifikacije drugim članovima
    if (updatedExpense?.groupId && updatedExpense.group) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { name: true }
      })

      const otherMembers = updatedExpense.group.members
        .filter(m => m.userId !== user.userId)
        .map(m => m.userId)
      
      if (otherMembers.length > 0) {
        console.log(`📢 Sending update notifications to ${otherMembers.length} group members`)
        
        const notificationPromises = otherMembers.map(memberId => {
          return prisma.notification.create({
            data: {
              userId: memberId,
              type: 'EXPENSE_UPDATED',
              title: 'Trošak ažuriran u grupi',
              message: `${currentUser?.name || 'Član grupe'} je ažurirao trošak "${updatedExpense.description}" (${updatedExpense.amount.toFixed(2)} ${updatedExpense.currency || 'RSD'}) u grupi "${updatedExpense.group?.name || 'Grupa'}"`,
              isRead: false,
              groupId: updatedExpense.groupId,
              expenseId: updatedExpense.id,
              fromUserId: user.userId
            }
          })
        })

        await Promise.all(notificationPromises)
        console.log(`✅ Sent ${otherMembers.length} update notifications`)
      }
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

