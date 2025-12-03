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
