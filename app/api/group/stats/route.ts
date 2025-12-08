import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  try {
    // Pronađi korisnika sa aktivnom grupom
    const userWithActiveGroup = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { activeGroupId: true }
    });

    console.log(`🔍 User ${user.userId} has activeGroupId: ${userWithActiveGroup?.activeGroupId}`);

    let group;

    if (userWithActiveGroup?.activeGroupId) {
      // Ako postoji activeGroupId, učitaj tu grupu
      group = await prisma.group.findUnique({
        where: { id: userWithActiveGroup.activeGroupId },
        include: {
          owner: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log(`📦 Found group by activeGroupId: ${group?.name || 'null'}`);

      // Proveri da li je korisnik još uvek član te grupe
      if (group) {
        const membership = group.members.find(m => m.userId === user.userId && !m.leftAt);
        const isOwner = group.ownerId === user.userId;
        
        console.log(`👤 User is owner: ${isOwner}, is member: ${!!membership}`);
        
        if (!membership && !isOwner) {
          // Korisnik više nije član te grupe, pronađi drugu
          console.log(`⚠️ User not valid member/owner of activeGroup, searching for another`);
          group = null;
        }
      }
    }

    // Ako nema activeGroupId ili grupa nije validna, pronađi bilo koju aktivnu grupu
    if (!group) {
      console.log(`🔎 Searching for any group where user is owner or member`);
      
      // Prvo proveri da li je vlasnik neke grupe
      const ownedGroup = await prisma.group.findFirst({
        where: { 
          ownerId: user.userId,
          isActive: true 
        },
        include: {
          owner: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      console.log(`🏠 Found owned group: ${ownedGroup?.name || 'null'}`);

      if (ownedGroup) {
        group = ownedGroup;
      } else {
        // Ako nije vlasnik, traži članstva
        const allMemberships = await prisma.groupMember.findMany({
          where: {
            userId: user.userId,
          },
          include: {
            group: {
              include: {
                owner: true,
                members: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        });

        console.log(`📊 Group Stats - Found ${allMemberships.length} memberships for user ${user.userId}`);
        allMemberships.forEach((m: any, i: number) => {
          console.log(`  Membership ${i + 1}:`, {
            groupId: m.groupId,
            groupName: m.group?.name,
            role: m.role,
            leftAt: m.leftAt,
            isActive: !m.leftAt
          });
        });

        const membership = allMemberships.find((m: any) => !m.leftAt);

        if (!membership) {
          console.log(`❌ No active membership found for user ${user.userId}`);
          return NextResponse.json(
            { error: "Niste član nijedne grupe" },
            { status: 404 }
          );
        }

        group = membership.group;
      }
    }

    if (!group) {
      return NextResponse.json(
        { error: "Niste član nijedne grupe" },
        { status: 404 }
      );
    }

    console.log(`✓ Active group: ${group.name}`);
    // Filtriraj samo aktivne članove
    const activeMembers = group.members.filter((m: any) => !m.leftAt);
    const memberUserIds = activeMembers.map((m: any) => m.userId);

    // VAŽNO: Datum kreiranja grupe - koristi se kao fallback za neke kalkulacije
    const groupCreatedDate = new Date(group.createdAt);

    // VAŽNO: Kreirati mapu članova sa njihovim joinedAt datumima
    const memberJoinDates = new Map();
    activeMembers.forEach((m: any) => {
      memberJoinDates.set(m.userId, new Date(m.joinedAt));
    });

    // Dobavi query params za filter
    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let endDate: Date | undefined;

    if (month && year) {
      endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    }

    // Dobavi troškove svih članova - svaki član od svog joinedAt datuma
    const expensePromises = activeMembers.map((member: any) => {
      const memberJoinDate = new Date(member.joinedAt);
      // Set to start of day (00:00:00) for proper comparison
      memberJoinDate.setHours(0, 0, 0, 0);
      let startDate = memberJoinDate;

      // Ako ima specifičan mesec/godina filter
      if (month && year) {
        const filterStartDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        // Koristi kasniji datum između filtera i joinedAt
        startDate = filterStartDate > memberJoinDate ? filterStartDate : memberJoinDate;
      }

      return prisma.expense.findMany({
        where: {
          userId: member.userId,
          date: {
            gte: startDate,
            ...(endDate ? { lte: endDate } : {}),
          },
        },
        include: {
          category: true,
          user: true,
        },
      });
    });

    // Dobavi prihode svih članova - svaki član od svog joinedAt datuma
    const incomePromises = activeMembers.map((member: any) => {
      const memberJoinDate = new Date(member.joinedAt);
      // Set to start of day (00:00:00) for proper comparison
      memberJoinDate.setHours(0, 0, 0, 0);
      let startDate = memberJoinDate;

      // Ako ima specifičan mesec/godina filter
      if (month && year) {
        const filterStartDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        // Koristi kasniji datum između filtera i joinedAt
        startDate = filterStartDate > memberJoinDate ? filterStartDate : memberJoinDate;
      }

      return prisma.income.findMany({
        where: {
          userId: member.userId,
          date: {
            gte: startDate,
            ...(endDate ? { lte: endDate } : {}),
          },
        },
        include: {
          category: true,
          user: true,
        },
      });
    });

    const expensesArrays = await Promise.all(expensePromises);
    const incomesArrays = await Promise.all(incomePromises);

    const expenses = expensesArrays.flat().sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const incomes = incomesArrays.flat().sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Izračunaj ukupne troškove
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Izračunaj ukupne prihode
    const totalIncomes = incomes.reduce((sum, inc) => sum + inc.amount, 0);

    // Bilans
    const balance = totalIncomes - totalExpenses;

    // Troškovi po kategorijama
    const categoryExpenses = expenses.reduce(
      (acc, exp) => {
        const categoryName = exp.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = {
            total: 0,
            color: exp.category.color || "#6366f1",
            icon: exp.category.icon || "ShoppingCart",
          };
        }
        acc[categoryName].total += exp.amount;
        return acc;
      },
      {} as Record<
        string,
        { total: number; color: string; icon: string }
      >
    );

    // Prihodi po kategorijama
    const categoryIncomes = incomes.reduce(
      (acc, inc) => {
        const categoryName = inc.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = {
            total: 0,
            color: inc.category.color || "#10b981",
            icon: inc.category.icon || "CurrencyCircleDollar",
          };
        }
        acc[categoryName].total += inc.amount;
        return acc;
      },
      {} as Record<
        string,
        { total: number; color: string; icon: string }
      >
    );

    // Poređenje članova
    const memberComparison = activeMembers.map((member: any) => {
      const memberExpenses = expenses
        .filter((exp) => exp.userId === member.userId)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const memberIncomes = incomes
        .filter((inc) => inc.userId === member.userId)
        .reduce((sum, inc) => sum + inc.amount, 0);

      return {
        userId: member.userId,
        name: member.user.name,
        email: member.user.email,
        expenses: memberExpenses,
        incomes: memberIncomes,
        balance: memberIncomes - memberExpenses,
      };
    });

    // Mesečni trend (poslednjih 12 meseci OD DATUMA KREIRANJA GRUPE)
    const monthlyTrend = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      // Preskoči mesece pre kreiranja grupe
      if (monthEnd < groupCreatedDate) {
        continue;
      }

      // Ako je mesec počeo pre kreiranja grupe, koristi datum kreiranja kao start
      const effectiveStart = monthStart < groupCreatedDate ? groupCreatedDate : monthStart;

      const monthExpenses = await prisma.expense.aggregate({
        where: {
          userId: { in: memberUserIds },
          date: {
            gte: effectiveStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const monthIncomes = await prisma.income.aggregate({
        where: {
          userId: { in: memberUserIds },
          date: {
            gte: effectiveStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      monthlyTrend.push({
        month: date.toLocaleDateString("sr-RS", {
          month: "short",
          year: "numeric",
        }),
        expenses: monthExpenses._sum.amount || 0,
        incomes: monthIncomes._sum.amount || 0,
      });
    }

    // Kombinuj transakcije
    const transactions = [
      ...expenses.map((exp) => ({
        id: exp.id,
        type: "expense" as const,
        amount: exp.amount,
        description: exp.description,
        date: exp.date,
        category: exp.category,
        user: exp.user,
        currency: exp.currency,
        canEdit: exp.userId === user.userId,
      })),
      ...incomes.map((inc) => ({
        id: inc.id,
        type: "income" as const,
        amount: inc.amount,
        description: inc.description,
        date: inc.date,
        category: inc.category,
        user: inc.user,
        currency: inc.currency,
        canEdit: inc.userId === user.userId,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    // Proveri da li je korisnik vlasnik ili član i dobavi permisije
    const isGroupOwner = group.ownerId === user.userId;
    const membership = group.members.find((m: any) => m.userId === user.userId && !m.leftAt);
    
    const canInvite = isGroupOwner || (membership && (membership.role === "owner" || membership.permissions.includes("invite")));
    const userRole = isGroupOwner ? "owner" : (membership?.role || "member");
    const userPermissions = isGroupOwner ? "view,add,edit,delete,invite" : (membership?.permissions || "view");
    
    console.log("📊 Group Stats - User permissions:", {
      isGroupOwner,
      role: userRole,
      permissions: userPermissions,
      canInvite
    });

    // ===== DODATNE STATISTIKE =====

    // YoY Comparison - Trenutni mesec vs isti mesec prošle godine
    const currentDate = new Date();
    const currentYearStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const currentYearEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    const previousYearStart = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
    const previousYearEnd = new Date(currentDate.getFullYear() - 1, currentDate.getMonth() + 1, 0, 23, 59, 59);

    const currentYearExpenses = await prisma.expense.aggregate({
      where: {
        userId: { in: memberUserIds },
        date: { gte: currentYearStart < groupCreatedDate ? groupCreatedDate : currentYearStart, lte: currentYearEnd },
      },
      _sum: { amount: true },
    });

    const previousYearExpenses = await prisma.expense.aggregate({
      where: {
        userId: { in: memberUserIds },
        date: { gte: previousYearStart < groupCreatedDate ? groupCreatedDate : previousYearStart, lte: previousYearEnd },
      },
      _sum: { amount: true },
    });

    const currentYearTotal = currentYearExpenses._sum.amount || 0;
    const previousYearTotal = previousYearExpenses._sum.amount || 0;
    const yoyPercentageChange = previousYearTotal > 0 
      ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100 
      : 0;

    // MoM Comparison - Trenutni mesec vs prethodni mesec
    const prevMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const prevMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0, 23, 59, 59);

    const currentMonthExpenses = await prisma.expense.aggregate({
      where: {
        userId: { in: memberUserIds },
        date: { gte: currentYearStart < groupCreatedDate ? groupCreatedDate : currentYearStart, lte: currentYearEnd },
      },
      _sum: { amount: true },
    });

    const previousMonthExpenses = await prisma.expense.aggregate({
      where: {
        userId: { in: memberUserIds },
        date: { gte: prevMonthStart < groupCreatedDate ? groupCreatedDate : prevMonthStart, lte: prevMonthEnd },
      },
      _sum: { amount: true },
    });

    const currentMonthIncomes = await prisma.income.aggregate({
      where: {
        userId: { in: memberUserIds },
        date: { gte: currentYearStart < groupCreatedDate ? groupCreatedDate : currentYearStart, lte: currentYearEnd },
      },
      _sum: { amount: true },
    });

    const previousMonthIncomes = await prisma.income.aggregate({
      where: {
        userId: { in: memberUserIds },
        date: { gte: prevMonthStart < groupCreatedDate ? groupCreatedDate : prevMonthStart, lte: prevMonthEnd },
      },
      _sum: { amount: true },
    });

    const momExpenses = currentMonthExpenses._sum.amount || 0;
    const momPrevExpenses = previousMonthExpenses._sum.amount || 0;
    const momIncomes = currentMonthIncomes._sum.amount || 0;
    const momPrevIncomes = previousMonthIncomes._sum.amount || 0;
    const momExpensesChange = momPrevExpenses > 0 ? ((momExpenses - momPrevExpenses) / momPrevExpenses) * 100 : 0;
    const momIncomesChange = momPrevIncomes > 0 ? ((momIncomes - momPrevIncomes) / momPrevIncomes) * 100 : 0;
    const momBalance = momIncomes - momExpenses;
    const momPrevBalance = momPrevIncomes - momPrevExpenses;
    const momBalanceChange = momPrevBalance !== 0 ? ((momBalance - momPrevBalance) / Math.abs(momPrevBalance)) * 100 : 0;

    // Hourly Expenses - Po satima u danu
    const hourlyExpenses = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}h`,
      amount: 0,
    }));

    expenses.forEach((exp) => {
      const hour = new Date(exp.date).getHours();
      hourlyExpenses[hour].amount += exp.amount;
    });

    // Last 30 Days - Poslednja 30 dana
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      const dayExpenses = expenses
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return expDate >= dayStart && expDate <= dayEnd;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      const dayIncomes = incomes
        .filter((inc) => {
          const incDate = new Date(inc.date);
          return incDate >= dayStart && incDate <= dayEnd;
        })
        .reduce((sum, inc) => sum + inc.amount, 0);

      last30Days.push({
        date: `${date.getDate()}.${date.getMonth() + 1}`,
        expenses: dayExpenses,
        incomes: dayIncomes,
      });
    }

    // Consistent Categories - Najkonzistentnije kategorije (u koliko meseci se pojavljuju)
    const categoryMonths: Record<string, Set<string>> = {};
    expenses.forEach((exp) => {
      const categoryName = exp.category.name;
      const monthKey = `${new Date(exp.date).getFullYear()}-${new Date(exp.date).getMonth()}`;
      if (!categoryMonths[categoryName]) {
        categoryMonths[categoryName] = new Set();
      }
      categoryMonths[categoryName].add(monthKey);
    });

    const consistentCategories = Object.entries(categoryMonths)
      .map(([name, months]) => ({
        name,
        months: months.size,
      }))
      .sort((a, b) => b.months - a.months)
      .slice(0, 5);

    // Category Growth - Rast kategorija (poslednjih 6 meseci)
    const categoryGrowth: any[] = [];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    Object.keys(categoryExpenses).forEach((catName) => {
      const recentExpenses = expenses.filter(
        (exp) =>
          exp.category.name === catName &&
          new Date(exp.date) >= sixMonthsAgo
      );

      if (recentExpenses.length > 0) {
        // Podeli na prvu i drugu polovinu
        const midPoint = Math.floor(recentExpenses.length / 2);
        const firstHalf = recentExpenses.slice(midPoint);
        const secondHalf = recentExpenses.slice(0, midPoint);

        const firstHalfTotal = firstHalf.reduce((sum, exp) => sum + exp.amount, 0);
        const secondHalfTotal = secondHalf.reduce((sum, exp) => sum + exp.amount, 0);

        const growth = firstHalfTotal > 0
          ? ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100
          : 0;

        categoryGrowth.push({
          name: catName,
          growth: Math.round(growth),
        });
      }
    });

    categoryGrowth.sort((a, b) => Math.abs(b.growth) - Math.abs(a.growth));
    const topCategoryGrowth = categoryGrowth.slice(0, 5);

    // Months in Profit - Koliko meseci je grupa bila u plusu
    let monthsInProfit = 0;
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      if (monthEnd < groupCreatedDate) continue;

      const effectiveStart = monthStart < groupCreatedDate ? groupCreatedDate : monthStart;

      const monthExp = expenses
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return expDate >= effectiveStart && expDate <= monthEnd;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      const monthInc = incomes
        .filter((inc) => {
          const incDate = new Date(inc.date);
          return incDate >= effectiveStart && incDate <= monthEnd;
        })
        .reduce((sum, inc) => sum + inc.amount, 0);

      if (monthInc > monthExp) {
        monthsInProfit++;
      }
    }

    // Weekday Expenses - Troškovi po danima u nedelji
    const weekdayExpenses = [
      { day: "Pon", amount: 0 },
      { day: "Uto", amount: 0 },
      { day: "Sre", amount: 0 },
      { day: "Čet", amount: 0 },
      { day: "Pet", amount: 0 },
      { day: "Sub", amount: 0 },
      { day: "Ned", amount: 0 },
    ];

    expenses.forEach((exp) => {
      const dayOfWeek = new Date(exp.date).getDay();
      // JavaScript: 0 = Sunday, 1 = Monday
      const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weekdayExpenses[index].amount += exp.amount;
    });

    // Daily Expenses - Troškovi po danima u trenutnom mesecu
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const dailyExpenses = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 23, 59, 59);

      const dayAmount = expenses
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return expDate >= dayStart && expDate <= dayEnd;
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      dailyExpenses.push({
        day: day.toString(),
        amount: dayAmount,
      });
    }

    // Top 5 Expenses - Najvećih 5 troškova
    const topExpenses = expenses
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map((exp) => ({
        id: exp.id,
        description: exp.description,
        amount: exp.amount,
        category: exp.category.name,
        icon: exp.category.icon,
        date: new Date(exp.date).toLocaleDateString("sr-RS"),
      }));

    // Averages - Proseci za poslednjih 12 meseci
    const totalMonthsWithData = monthlyTrend.length;
    const averageExpenses = totalMonthsWithData > 0
      ? monthlyTrend.reduce((sum, m) => sum + m.expenses, 0) / totalMonthsWithData
      : 0;
    const averageIncomes = totalMonthsWithData > 0
      ? monthlyTrend.reduce((sum, m) => sum + m.incomes, 0) / totalMonthsWithData
      : 0;

    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        owner: group.owner,
        members: group.members,
        isOwner: isGroupOwner,
        canInvite,
        currentUserRole: userRole,
        type: group.type,
        endDate: group.endDate,
        isActive: group.isActive,
      },
      stats: {
        totalExpenses,
        totalIncomes,
        balance,
        transactionCount: expenses.length + incomes.length,
      },
      categoryExpenses,
      categoryIncomes,
      memberComparison,
      monthlyTrend,
      transactions: transactions.slice(0, 50), // Prvih 50 transakcija
      // Dodatne statistike
      yoyData: {
        currentYearTotal,
        previousYearTotal,
        percentageChange: yoyPercentageChange,
        monthlyTrend: monthlyTrend.map(m => m.expenses),
      },
      momData: {
        currentMonthExpenses: momExpenses,
        previousMonthExpenses: momPrevExpenses,
        expensesChange: momExpensesChange,
        currentMonthIncomes: momIncomes,
        previousMonthIncomes: momPrevIncomes,
        incomesChange: momIncomesChange,
        currentMonthBalance: momBalance,
        previousMonthBalance: momPrevBalance,
        balanceChange: momBalanceChange,
        monthlyTrend: monthlyTrend.map(m => ({
          expenses: m.expenses,
          incomes: m.incomes,
          balance: m.incomes - m.expenses,
        })),
      },
      hourlyExpenses,
      last30Days,
      consistentCategories,
      categoryGrowth: topCategoryGrowth,
      monthsInProfit,
      weekdayExpenses,
      dailyExpenses,
      topExpenses,
      averages: {
        expenses: averageExpenses,
        incomes: averageIncomes,
      },
    });
  } catch (error) {
    console.error("Error fetching group stats:", error);
    return NextResponse.json(
      { error: "Greška pri učitavanju statistike grupe" },
      { status: 500 }
    );
  }
}
