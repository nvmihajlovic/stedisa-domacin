import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { convertCurrency, getExchangeRates } from "@/lib/currency";
import { invalidateInsightsCache } from "@/app/api/financial-insights/route";

// Enable caching for better performance
export const dynamic = 'force-dynamic'
export const revalidate = 10 // Cache for 10 seconds

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");
  const groupFilter = searchParams.get("groupFilter"); // 'all' | 'personal' | groupId

  // Get user's active group
  const userWithGroup = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { activeGroupId: true }
  })

  let whereClause: any = {
    userId: user.userId,
  }

  // Filter by group context
  if (groupFilter === 'all') {
    // Show all incomes (no group filter)
  } else if (groupFilter === 'personal') {
    // Show only personal incomes (no group)
    whereClause.groupId = null
  } else if (groupFilter && groupFilter !== 'null') {
    // Show incomes for specific group
    whereClause.groupId = groupFilter
  } else {
    // Default behavior: if user has active group, show ONLY that group's incomes
    // Otherwise show personal incomes (groupId: null)
    if (userWithGroup?.activeGroupId) {
      whereClause.groupId = userWithGroup.activeGroupId
    } else {
      whereClause.groupId = null
    }
  }

  // If month and year are provided, filter by date range
  if (monthParam && yearParam) {
    const month = parseInt(monthParam);
    const year = parseInt(yearParam);

    // First day of month
    const startDate = new Date(year, month - 1, 1);
    // First day of next month
    const endDate = new Date(year, month, 1);

    whereClause.date = {
      gte: startDate,
      lt: endDate,
    }
  }

  const incomes = await prisma.income.findMany({
    where: whereClause,
    select: {
      id: true,
      amount: true,
      amountInRSD: true,
      description: true,
      date: true,
      currency: true,
      note: true,
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true
        }
      },
      recurringIncome: {
        select: {
          id: true,
          frequency: true,
          nextExecutionAt: true
        }
      }
    },
    orderBy: {
      date: "desc",
    },
  });  return NextResponse.json(incomes);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const body = await request.json();
  const { amount, description, date, categoryId, isRecurring, loanRepaymentAmount, recurringType, nextRecurringDate, groupId, note, currency } = body;

  if (!amount || !description || !date || !categoryId) {
    return NextResponse.json(
      { error: "Sva polja su obavezna" },
      { status: 400 }
    );
  }

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

  console.log('📅 Income transaction date:', transactionDate.toISOString())

  // Konvertuj u RSD za statistike
  const incomeCurrency = currency || "RSD"
  let amountInRSD = parseFloat(amount)
  
  if (incomeCurrency !== "RSD") {
    try {
      amountInRSD = await convertCurrency(parseFloat(amount), incomeCurrency, "RSD")
      console.log(`💱 Converted income ${amount} ${incomeCurrency} to ${amountInRSD.toFixed(2)} RSD`)
    } catch (error) {
      console.error('Error converting currency:', error)
      // Ako konverzija ne uspe, koristi originalni iznos
    }
  }

  // Koristi User.activeGroupId umesto manuelnog pronalaženja grupe
  let finalGroupId = groupId
  if (!finalGroupId) {
    // Učitaj korisnika sa activeGroupId
    const userWithActiveGroup = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { activeGroupId: true }
    })
    
    if (userWithActiveGroup?.activeGroupId) {
      finalGroupId = userWithActiveGroup.activeGroupId
      console.log(`📍 Using user's active group for income: ${finalGroupId}`)
    }
  }

  const income = await prisma.income.create({
    data: {
      amount: parseFloat(amount),
      amountInRSD: amountInRSD,
      description,
      date: transactionDate,
      categoryId,
      userId: user.userId,
      loanRepaymentAmount: loanRepaymentAmount ? parseFloat(loanRepaymentAmount) : null,
      groupId: finalGroupId,
      note: note || null,
      currency: incomeCurrency,
    },
    include: {
      category: true,
      recurringIncome: true,
    },
  });

  // Invalidate AI insights cache after creating income
  invalidateInsightsCache(user.userId)

  // Ako je isRecurring true, kreiraj RecurringIncome
  if (isRecurring && recurringType && nextRecurringDate) {
    await prisma.recurringIncome.create({
      data: {
        userId: user.userId,
        amount: parseFloat(amount),
        description,
        frequency: recurringType,
        nextExecutionAt: new Date(nextRecurringDate),
        categoryId: categoryId,
        incomes: {
          connect: { id: income.id }
        }
      }
    })
  }

  // Vrati income sa relacijom
  const createdIncome = await prisma.income.findUnique({
    where: { id: income.id },
    include: {
      category: true,
      recurringIncome: true,
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

  // Ako je prihod u grupi, pošalji notifikacije svim članovima osim trenutnog korisnika
  if (createdIncome?.groupId && createdIncome.group) {
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true }
    })

    const otherMembers = createdIncome.group.members
      .filter(m => m.userId !== user.userId)
      .map(m => m.userId)
    
    const notificationPromises = otherMembers.map(memberId => {
      return prisma.notification.create({
        data: {
          userId: memberId,
          type: 'INCOME_ADDED',
          title: 'Novi prihod u grupi',
          message: `${currentUser?.name || 'Član grupe'} je dodao prihod "${createdIncome.description}" (${createdIncome.amount.toFixed(2)} ${createdIncome.currency || 'RSD'}) u grupu "${createdIncome.group?.name || 'Grupa'}"`,
          isRead: false,
          groupId: createdIncome.groupId,
          fromUserId: user.userId
        }
      })
    })

    await Promise.all(notificationPromises)
  }

  return NextResponse.json(createdIncome);
}
