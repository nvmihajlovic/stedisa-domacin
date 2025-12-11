import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FinancialChatAssistant, UserFinancialContext } from "@/lib/financial-chat";

/**
 * POST /api/financial-chat
 * Process user question and return AI assistant response
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { question, questionId } = await request.json();

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Get current month dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch current month data
    const [currentExpenses, currentIncomes, lastExpenses, lastIncomes] = await Promise.all([
      prisma.expense.findMany({
        where: { userId: user.userId, date: { gte: currentMonthStart } },
        include: { category: true },
      }),
      prisma.income.findMany({
        where: { userId: user.userId, date: { gte: currentMonthStart } },
      }),
      prisma.expense.findMany({
        where: {
          userId: user.userId,
          date: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
      prisma.income.findMany({
        where: {
          userId: user.userId,
          date: { gte: lastMonthStart, lte: lastMonthEnd },
        },
      }),
    ]);

    // Calculate totals
    const currentMonthExpenses = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currentMonthIncome = currentIncomes.reduce((sum, i) => sum + i.amount, 0);
    const lastMonthExpenses = lastExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthIncome = lastIncomes.reduce((sum, i) => sum + i.amount, 0);
    const savingsRate = currentMonthIncome > 0
      ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100
      : 0;

    // Calculate top category
    const categoryMap = new Map<string, number>();
    currentExpenses.forEach((exp) => {
      const categoryName = exp.category?.name || "Ostalo";
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + exp.amount);
    });

    let topCategory = null;
    if (categoryMap.size > 0) {
      const topEntry = Array.from(categoryMap.entries())
        .sort((a, b) => b[1] - a[1])[0];
      topCategory = {
        name: topEntry[0],
        amount: topEntry[1],
        percentage: (topEntry[1] / currentMonthExpenses) * 100,
      };
    }

    // Fetch budgets
    const budgets = await prisma.budget.findMany({
      where: { userId: user.userId },
      include: { category: true },
    });

    const budgetData = budgets.map(budget => {
      const categoryExpenses = currentExpenses
        .filter(exp => exp.categoryId === budget.categoryId)
        .reduce((sum, exp) => sum + exp.amount, 0);
      return {
        utilization: (categoryExpenses / budget.amount) * 100,
      };
    });

    const overBudgetCount = budgetData.filter(b => b.utilization > 100).length;

    // Fetch savings goals
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId: user.userId, isActive: true },
    });

    const savingsProgress = savingsGoals.length > 0
      ? savingsGoals.reduce((sum, g) => sum + ((g.currentAmount / g.targetAmount) * 100), 0) / savingsGoals.length
      : 0;

    // Fetch settlements
    const settlements = await prisma.settlement.findMany({
      where: {
        OR: [{ fromUserId: user.userId }, { toUserId: user.userId }],
        status: 'pending',
      },
    });

    // Fetch groups
    const userGroups = await prisma.groupMember.findMany({
      where: { userId: user.userId },
    });

    // Build context
    const context: UserFinancialContext = {
      currentMonthExpenses,
      currentMonthIncome,
      lastMonthExpenses,
      lastMonthIncome,
      savingsRate,
      topCategory,
      budgetsCount: budgets.length,
      overBudgetCount,
      savingsGoalsCount: savingsGoals.length,
      savingsProgress,
      pendingSettlements: settlements.length,
      groupsCount: userGroups.length,
    };

    // Process question
    const assistant = new FinancialChatAssistant(context);
    const answer = assistant.processQuestion(question, questionId);

    return NextResponse.json({
      success: true,
      answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Financial chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
