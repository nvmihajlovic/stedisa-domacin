import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUser } from "@/lib/auth";
import { FinancialAdvisor, FinancialData } from "@/lib/financial-advisor";

const prisma = new PrismaClient();

// Simple in-memory cache
const insightsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Export function to invalidate cache (called when expenses/incomes are added)
export function invalidateInsightsCache(userId: string) {
  insightsCache.delete(`insights_${userId}`);
}

/**
 * GET /api/financial-insights
 * Generate intelligent financial insights based on user's spending habits
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cacheKey = `insights_${user.userId}`;
    const cached = insightsCache.get(cacheKey);
    const currentTime = Date.now();

    // Return cached data if it exists and is not expired
    if (cached && (currentTime - cached.timestamp) < CACHE_DURATION) {
      return NextResponse.json({ ...cached.data, fromCache: true });
    }

    // Get current month and last month dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch current month expenses
    const currentExpenses = await prisma.expense.findMany({
      where: {
        userId: user.userId,
        date: { gte: currentMonthStart },
      },
      include: {
        category: true,
        recurringExpense: true,
      },
    });

    // Fetch last month expenses
    const lastExpenses = await prisma.expense.findMany({
      where: {
        userId: user.userId,
        date: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    });

    // Fetch current month income
    const currentIncomes = await prisma.income.findMany({
      where: {
        userId: user.userId,
        date: { gte: currentMonthStart },
      },
      include: {
        category: true,
      },
    });

    // Fetch last month income
    const lastIncomes = await prisma.income.findMany({
      where: {
        userId: user.userId,
        date: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    });

    // Fetch budgets
    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        category: true,
      },
    });

    // Fetch user groups
    const userGroups = await prisma.groupMember.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        group: {
          include: {
            expenses: {
              where: {
                date: { gte: currentMonthStart },
              },
            },
          },
        },
      },
    });

    // Fetch settlements
    const settlements = await prisma.settlement.findMany({
      where: {
        OR: [
          { fromUserId: user.userId },
          { toUserId: user.userId },
        ],
        status: 'pending',
      },
    });

    // Fetch savings goals
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: {
        userId: user.userId,
        isActive: true,
      },
      include: {
        contributions: {
          where: {
            createdAt: { gte: currentMonthStart },
          },
        },
      },
    });

    // Calculate totals
    const currentMonthExpenses = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lastMonthExpenses = lastExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const currentMonthIncome = currentIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    const lastMonthIncome = lastIncomes.reduce((sum, inc) => sum + inc.amount, 0);

    // Group expenses by category
    const categoryMap = new Map<string, { amount: number; count: number }>();
    currentExpenses.forEach((exp) => {
      const categoryName = exp.category?.name || "Ostalo";
      const existing = categoryMap.get(categoryName) || { amount: 0, count: 0 };
      categoryMap.set(categoryName, {
        amount: existing.amount + exp.amount,
        count: existing.count + 1,
      });
    });

    const expensesByCategory = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount);

    // Group income by category
    const incomeCategoryMap = new Map<string, { amount: number; count: number }>();
    currentIncomes.forEach((inc) => {
      const categoryName = inc.category?.name || "Ostalo";
      const existing = incomeCategoryMap.get(categoryName) || { amount: 0, count: 0 };
      incomeCategoryMap.set(categoryName, {
        amount: existing.amount + inc.amount,
        count: existing.count + 1,
      });
    });

    const incomesByCategory = Array.from(incomeCategoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount);

    // Find recurring expenses
    const recurringExpenses = currentExpenses
      .filter((exp) => exp.recurringExpense)
      .map((exp) => ({
        description: exp.description || "Recurring expense",
        amount: exp.amount,
        frequency: exp.recurringExpense?.frequency || "monthly",
      }));

    // Find unusual expenses (outliers - more than 3x average)
    const avgExpense = currentMonthExpenses / (currentExpenses.length || 1);
    const unusualExpenses = currentExpenses
      .filter((exp) => exp.amount > avgExpense * 3)
      .map((exp) => ({
        description: exp.description || "Unusual expense",
        amount: exp.amount,
        date: exp.date.toISOString(),
      }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate savings rate
    const savingsRate =
      currentMonthIncome > 0
        ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100
        : 0;

    // Find top spending day
    const dailySpending = new Map<string, number>();
    currentExpenses.forEach((exp) => {
      const dateKey = exp.date.toISOString().split("T")[0];
      dailySpending.set(dateKey, (dailySpending.get(dateKey) || 0) + exp.amount);
    });
    
    let topSpendingDay: { date: string; amount: number } | undefined;
    let maxAmount = 0;
    dailySpending.forEach((amount, date) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        topSpendingDay = { date, amount };
      }
    });

    // Calculate budget utilization
    const budgetData = budgets.map(budget => {
      const categoryExpenses = currentExpenses
        .filter(exp => exp.categoryId === budget.categoryId)
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      const utilization = (categoryExpenses / budget.amount) * 100;
      
      return {
        categoryName: budget.category?.name || 'Unknown',
        budgetAmount: budget.amount,
        spent: categoryExpenses,
        remaining: budget.amount - categoryExpenses,
        utilization,
        period: budget.period,
      };
    });

    // Calculate group expenses
    const groupExpensesData = userGroups.map(member => ({
      groupId: member.group.id,
      groupName: member.group.name,
      monthlyExpenses: member.group.expenses.reduce((sum, exp) => sum + exp.amount, 0),
      expenseCount: member.group.expenses.length,
    }));

    // Calculate settlement data
    const settlementData = {
      pendingSettlements: settlements.length,
      toReceive: settlements
        .filter(s => s.toUserId === user.userId)
        .reduce((sum, s) => sum + s.amount, 0),
      toPay: settlements
        .filter(s => s.fromUserId === user.userId)
        .reduce((sum, s) => sum + s.amount, 0),
    };

    // Calculate savings goals progress
    const savingsGoalsData = savingsGoals.map(goal => {
      const monthlyContributions = goal.contributions.reduce((sum, c) => sum + c.amount, 0);
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const remaining = goal.targetAmount - goal.currentAmount;
      
      return {
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        progress,
        remaining,
        monthlyContributions,
        isRecurring: goal.isRecurring,
        recurringAmount: goal.recurringAmount,
      };
    });

    // Prepare data for AI advisor
    const financialData: FinancialData = {
      currentMonthExpenses,
      currentMonthIncome,
      lastMonthExpenses,
      lastMonthIncome,
      expensesByCategory,
      incomesByCategory,
      recurringExpenses,
      unusualExpenses,
      savingsRate,
      topSpendingDay,
      budgets: budgetData,
      groups: groupExpensesData,
      settlements: settlementData,
      savingsGoals: savingsGoalsData,
    };

    // Generate insights using AI advisor
    const advisor = new FinancialAdvisor(financialData);
    const insights = advisor.generateInsights();

    const responseData = {
      insights,
      metadata: {
        currentMonthExpenses,
        currentMonthIncome,
        savingsRate: savingsRate.toFixed(1),
        expenseCount: currentExpenses.length,
        incomeCount: currentIncomes.length,
        budgetsCount: budgets.length,
        groupsCount: userGroups.length,
        settlementsCount: settlements.length,
        savingsGoalsCount: savingsGoals.length,
      },
      fromCache: false,
    };

    // Cache the results
    insightsCache.set(cacheKey, { data: responseData, timestamp: currentTime });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Financial insights error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
