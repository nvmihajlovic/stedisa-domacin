import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");
  const memberId = searchParams.get("memberId");

  if (!groupId || !memberId) {
    return NextResponse.json({ error: "Nedostaju parametri" }, { status: 400 });
  }

  try {
    // Verify user is member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: user.userId,
        leftAt: null,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Niste član ove grupe" }, { status: 403 });
    }

    // Get target member's membership period
    const targetMembership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: memberId,
      },
      orderBy: { joinedAt: "asc" },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Član nije pronađen" }, { status: 404 });
    }

    // Fetch ALL expenses by this member (entire history, not limited by group membership period)
    const expenses = await prisma.expense.findMany({
      where: {
        userId: memberId,
      },
      include: {
        category: true,
      },
    });

    // Fetch ALL incomes by this member (entire history)
    const incomes = await prisma.income.findMany({
      where: {
        userId: memberId,
      },
      include: {
        category: true,
      },
    });

    // Calculate totals
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncomes = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const balance = totalIncomes - totalExpenses;

    // Prepare monthly data (last 12 months)
    const monthlyData = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const monthExpenses = expenses
        .filter((e) => {
          const expDate = new Date(e.date);
          return expDate >= monthStart && expDate <= monthEnd;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const monthIncomes = incomes
        .filter((i) => {
          const incDate = new Date(i.date);
          return incDate >= monthStart && incDate <= monthEnd;
        })
        .reduce((sum, i) => sum + i.amount, 0);

      monthlyData.push({
        month: monthDate.toLocaleString("sr-RS", { month: "short" }),
        expenses: monthExpenses,
        incomes: monthIncomes,
      });
    }

    // Group by categories
    const expenseCategoryMap = new Map<string, { name: string; total: number; color: string; icon: string }>();
    expenses.forEach((exp) => {
      const catName = exp.category?.name || "Ostalo";
      const existing = expenseCategoryMap.get(catName);
      if (existing) {
        existing.total += exp.amount;
      } else {
        expenseCategoryMap.set(catName, {
          name: catName,
          total: exp.amount,
          color: exp.category?.color || "#888888",
          icon: exp.category?.icon || "Question",
        });
      }
    });

    const incomeCategoryMap = new Map<string, { name: string; total: number; color: string; icon: string }>();
    incomes.forEach((inc) => {
      const catName = inc.category?.name || "Ostalo";
      const existing = incomeCategoryMap.get(catName);
      if (existing) {
        existing.total += inc.amount;
      } else {
        incomeCategoryMap.set(catName, {
          name: catName,
          total: inc.amount,
          color: inc.category?.color || "#888888",
          icon: inc.category?.icon || "Question",
        });
      }
    });

    const expenseCategories = Array.from(expenseCategoryMap.values()).sort((a, b) => b.total - a.total);
    const incomeCategories = Array.from(incomeCategoryMap.values()).sort((a, b) => b.total - a.total);

    // Get recent transactions
    const allTransactions = [
      ...expenses.map((e) => ({
        id: e.id,
        type: "expense" as const,
        amount: e.amount,
        description: e.description || "Trošak",
        date: e.date,
        currency: e.currency,
        category: {
          name: e.category?.name || "Ostalo",
          icon: e.category?.icon || "Question",
          color: e.category?.color || "#888888",
        },
      })),
      ...incomes.map((i) => ({
        id: i.id,
        type: "income" as const,
        amount: i.amount,
        description: i.description || "Prihod",
        date: i.date,
        currency: i.currency,
        category: {
          name: i.category?.name || "Ostalo",
          icon: i.category?.icon || "Question",
          color: i.category?.color || "#888888",
        },
      })),
    ];

    allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      stats: {
        totalExpenses,
        totalIncomes,
        balance,
        transactionCount: expenses.length + incomes.length,
      },
      monthlyData,
      expenseCategories,
      incomeCategories,
      transactions: allTransactions.slice(0, 10),
    });
  } catch (error) {
    console.error("Error fetching member stats:", error);
    return NextResponse.json({ error: "Greška pri učitavanju podataka" }, { status: 500 });
  }
}
