import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { convertCurrency, getExchangeRates } from "@/lib/currency";
import { invalidateInsightsCache } from "@/app/api/financial-insights/route";

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");

  let whereClause: any = {
    userId: user.userId,
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
    include: {
      category: true,
      recurringIncome: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  console.log(`Found ${incomes.length} incomes`);
  console.log('First income amountInRSD:', incomes[0]?.amountInRSD);

  return NextResponse.json(incomes);
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

  // Automatski postavi groupId ako korisnik nije eksplicitno prosledio i ako je član grupe sa više članova
  let finalGroupId = groupId
  if (!finalGroupId) {
    // Pronađi aktivno članstvo (bez leftAt)
    const activeMembership = await prisma.groupMember.findFirst({
      where: { 
        userId: user.userId,
        leftAt: null,
      },
      include: {
        group: {
          include: {
            members: true,
          }
        }
      }
    })

    if (activeMembership) {
      // Broji samo aktivne članove (bez leftAt)
      const activeMembersCount = activeMembership.group.members.filter(m => !m.leftAt).length
      if (activeMembersCount > 1) {
        finalGroupId = activeMembership.groupId
      }
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
