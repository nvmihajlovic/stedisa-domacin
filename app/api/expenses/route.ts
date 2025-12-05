import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"
import { convertCurrency, getExchangeRates } from "@/lib/currency"
import { invalidateInsightsCache } from "@/app/api/financial-insights/route"

// Enable caching for better performance
export const dynamic = 'force-dynamic'
export const revalidate = 10 // Cache for 10 seconds

export async function GET(req: Request) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  let whereClause: any = {
    userId: user.userId,
  }

  // If month and year are provided, filter by date range
  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1)
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59)
    
    whereClause.date = {
      gte: startDate,
      lte: endDate,
    }
  }

  const expenses = await prisma.expense.findMany({
    where: whereClause,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true
        }
      },
      group: {
        select: {
          id: true,
          name: true
        }
      },
      recurringExpense: {
        select: {
          id: true,
          frequency: true,
          nextExecutionAt: true
        }
      },
      splits: {
        include: {
          owedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          isPaid: 'asc'
        }
      }
    },
    orderBy: {
      date: "desc",
    },
  })

  console.log(`Found ${expenses.length} expenses`);
  if (expenses.length > 0) {
    console.log('First 3 expenses:');
    expenses.slice(0, 3).forEach((exp: any) => {
      console.log(`  - ${exp.description}: amount=${exp.amount}, currency=${exp.currency}, amountInRSD=${exp.amountInRSD}, splits=${exp.splits?.length || 0}`);
    });
  }

  return NextResponse.json(expenses)
}

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, description, date, categoryId, receiptUrl, groupId, splitAmount, note, currency, isRecurring, recurringType, nextRecurringDate, splitWithGroup, participants } = await req.json()

    console.log('📝 Creating expense with currency:', currency)
    console.log('👥 Split with group:', splitWithGroup, 'Participants:', participants)

    // Parse date with proper timezone handling
    // If date is provided as string (YYYY-MM-DD), convert to Date with current time
    // to preserve timezone information
    let transactionDate: Date
    if (date) {
      const dateObj = new Date(date)
      // If time is midnight (00:00:00), it means only date was provided
      // Use current time to preserve timezone
      if (dateObj.getUTCHours() === 0 && dateObj.getUTCMinutes() === 0 && dateObj.getUTCSeconds() === 0) {
        const now = new Date()
        dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
      }
      transactionDate = dateObj
    } else {
      transactionDate = new Date()
    }

    console.log('📅 Transaction date:', transactionDate.toISOString())

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

    // Koristi User.activeGroupId umesto manuelnog pronalaženja grupe
    // Ako nije eksplicitno prosleđen groupId, koristi activeGroupId korisnika
    let finalGroupId = groupId && groupId.trim() !== "" ? groupId : null
    
    if (!finalGroupId) {
      // Učitaj korisnika sa activeGroupId
      const userWithActiveGroup = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { activeGroupId: true }
      })
      
      if (userWithActiveGroup?.activeGroupId) {
        finalGroupId = userWithActiveGroup.activeGroupId
        console.log(`📍 Using user's active group: ${finalGroupId}`)
      }
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        amountInRSD: amountInRSD,
        description,
        date: transactionDate,
        categoryId,
        userId: user.userId,
        receiptUrl,
        groupId: splitWithGroup ? groupId : finalGroupId,
        splitAmount: splitAmount ? parseFloat(splitAmount) : null,
        note: note || null,
        currency: expenseCurrency,
      },
      include: {
        category: true,
        recurringExpense: true,
      },
    })

    // Invalidate AI insights cache after creating expense
    invalidateInsightsCache(user.userId)

    // Ako je trošak podeljen sa grupom, kreiraj Split zapise za svaku osobu
    if (splitWithGroup && groupId && participants && Array.isArray(participants) && participants.length > 0) {
      console.log('💰 Creating splits:', {
        groupId,
        expenseId: expense.id,
        participants,
        userId: user.userId,
        amount: parseFloat(amount)
      })
      
      const amountPerPerson = parseFloat(amount) / participants.length
      
      // Kreiraj Split zapis za svakog učesnika osim trenutnog korisnika (jer on ne duguje sebi)
      const splitPromises = participants
        .filter(participantId => participantId !== user.userId)
        .map(participantId => {
          console.log(`  → Creating split: ${user.userId} paid, ${participantId} owes ${amountPerPerson}`)
          return prisma.split.create({
            data: {
              groupId: groupId,
              expenseId: expense.id,
              paidById: user.userId, // Ko je platio
              owedById: participantId, // Ko duguje
              amount: amountPerPerson,
              currency: expenseCurrency,
              isPaid: false,
            }
          })
        })
      
      await Promise.all(splitPromises)
      console.log(`✅ Created ${splitPromises.length} split records for expense ${expense.id}`)
      
      // Kreiraj notifikacije za sve učesnike osim trenutnog korisnika
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        select: { name: true }
      })
      
      const currentUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { name: true }
      })
      
      const notificationPromises = participants
        .filter(participantId => participantId !== user.userId)
        .map(participantId => {
          return prisma.notification.create({
            data: {
              userId: participantId,
              type: 'EXPENSE_ADDED',
              title: 'Novi dug u grupi',
              message: `Dugujete ${amountPerPerson.toFixed(2)} ${expenseCurrency} za "${description}" - ${currentUser?.name || 'Član'} je platio u grupi "${group?.name || 'Grupa'}"`,
              isRead: false,
              groupId: groupId,
              expenseId: expense.id,
              fromUserId: user.userId
            }
          })
        })
      
      await Promise.all(notificationPromises)
      console.log(`✅ Sent ${notificationPromises.length} notifications for expense ${expense.id}`)
    }

    // Check budget alerts after creating expense
    try {
      const { checkUserBudgetAlerts } = await import('@/lib/budget-alerts')
      const alerts = await checkUserBudgetAlerts(user.userId, categoryId)
      
      if (alerts.length > 0) {
        console.log(`💰 Budget alerts triggered for user ${user.userId}:`, alerts)
        // Alerts are automatically saved to database by checkUserBudgetAlerts
      }
    } catch (error) {
      console.error('Error checking budget alerts:', error)
      // Don't fail expense creation if budget check fails
    }

    // Ako je isRecurring true, kreiraj RecurringExpense
    if (isRecurring && recurringType && nextRecurringDate) {
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

    // Vrati expense sa relacijom
    const createdExpense = await prisma.expense.findUnique({
      where: { id: expense.id },
      include: {
        category: true,
        recurringExpense: true,
      }
    })

    return NextResponse.json(createdExpense, { status: 201 })
  } catch (error: any) {
    console.error('Create expense error:', error)
    return NextResponse.json({ 
      error: "Greška pri kreiranju troška",
      details: error.message 
    }, { status: 500 })
  }
}
