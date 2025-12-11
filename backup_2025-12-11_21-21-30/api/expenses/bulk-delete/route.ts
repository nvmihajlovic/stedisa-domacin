import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUser } from "@/lib/auth";

const prisma = new PrismaClient();

/**
 * POST /api/expenses/bulk-delete
 * Bulk delete multiple expenses
 * Body: { expenseIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { expenseIds } = await request.json();

    if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
      return NextResponse.json(
        { error: "expenseIds array is required" },
        { status: 400 }
      );
    }

    // Verify all expenses belong to the user before deleting
    const expenses = await prisma.expense.findMany({
      where: {
        id: { in: expenseIds },
        userId: user.userId,
      },
    });

    if (expenses.length !== expenseIds.length) {
      return NextResponse.json(
        { error: "Some expenses not found or do not belong to you" },
        { status: 403 }
      );
    }

    // Delete in transaction for safety
    const result = await prisma.$transaction(async (tx) => {
      // Delete all selected expenses
      const deleted = await tx.expense.deleteMany({
        where: {
          id: { in: expenseIds },
          userId: user.userId,
        },
      });

      return deleted;
    });

    console.log(`✅ Bulk deleted ${result.count} expenses for user ${user.userId}`);

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Uspešno obrisano ${result.count} troškova`,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete expenses" },
      { status: 500 }
    );
  }
}
