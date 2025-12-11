import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// This endpoint should be called daily by a cron job (e.g., Vercel Cron, GitHub Actions, or external service)
// For security, you should add an API key check here
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Validate cron secret for security
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    let processedExpenses = 0;
    let processedIncomes = 0;

    // Process recurring expenses
    const dueExpenses = await prisma.recurringExpense.findMany({
      where: {
        isActive: true,
        nextExecutionAt: {
          lte: now,
        },
      },
    });

    for (const recurring of dueExpenses) {
      // Create the expense
      await prisma.expense.create({
        data: {
          amount: recurring.amount,
          description: recurring.description,
          date: now,
          categoryId: recurring.categoryId,
          userId: recurring.userId,
          isRecurring: true,
          recurringExpenseId: recurring.id,
        },
      });

      // Calculate next execution date
      let nextExecutionAt = new Date(recurring.nextExecutionAt);

      if (recurring.frequency === "monthly") {
        nextExecutionAt.setMonth(nextExecutionAt.getMonth() + 1);
      } else if (recurring.frequency === "weekly") {
        nextExecutionAt.setDate(nextExecutionAt.getDate() + 7);
      } else if (recurring.frequency === "yearly") {
        nextExecutionAt.setFullYear(nextExecutionAt.getFullYear() + 1);
      }

      // Update recurring expense with new next execution date
      await prisma.recurringExpense.update({
        where: { id: recurring.id },
        data: { nextExecutionAt },
      });

      processedExpenses++;
    }

    // Process recurring incomes
    const dueIncomes = await prisma.recurringIncome.findMany({
      where: {
        isActive: true,
        nextExecutionAt: {
          lte: now,
        },
      },
    });

    for (const recurring of dueIncomes) {
      // Create the income
      await prisma.income.create({
        data: {
          amount: recurring.amount,
          description: recurring.description,
          date: now,
          categoryId: recurring.categoryId,
          userId: recurring.userId,
          isRecurring: true,
          recurringIncomeId: recurring.id,
        },
      });

      // Calculate next execution date
      let nextExecutionAt = new Date(recurring.nextExecutionAt);

      if (recurring.frequency === "monthly") {
        nextExecutionAt.setMonth(nextExecutionAt.getMonth() + 1);
      } else if (recurring.frequency === "weekly") {
        nextExecutionAt.setDate(nextExecutionAt.getDate() + 7);
      } else if (recurring.frequency === "yearly") {
        nextExecutionAt.setFullYear(nextExecutionAt.getFullYear() + 1);
      }

      // Update recurring income with new next execution date
      await prisma.recurringIncome.update({
        where: { id: recurring.id },
        data: { nextExecutionAt },
      });

      processedIncomes++;
    }

    return NextResponse.json({
      success: true,
      processedExpenses,
      processedIncomes,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Error processing recurring transactions:", error);
    return NextResponse.json(
      { error: "Failed to process recurring transactions" },
      { status: 500 }
    );
  }
}

// Manual trigger endpoint (for testing)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Use POST to trigger recurring transaction processing",
    endpoint: "/api/cron/recurring",
  });
}
