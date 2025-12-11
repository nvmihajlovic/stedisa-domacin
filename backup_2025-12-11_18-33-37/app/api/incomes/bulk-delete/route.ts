import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUser } from "@/lib/auth";

const prisma = new PrismaClient();

/**
 * POST /api/incomes/bulk-delete
 * Bulk delete multiple incomes
 * Body: { incomeIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { incomeIds } = await request.json();

    if (!incomeIds || !Array.isArray(incomeIds) || incomeIds.length === 0) {
      return NextResponse.json(
        { error: "incomeIds array is required" },
        { status: 400 }
      );
    }

    // Verify all incomes belong to the user before deleting
    const incomes = await prisma.income.findMany({
      where: {
        id: { in: incomeIds },
        userId: user.userId,
      },
    });

    if (incomes.length !== incomeIds.length) {
      return NextResponse.json(
        { error: "Some incomes not found or do not belong to you" },
        { status: 403 }
      );
    }

    // Delete in transaction for safety
    const result = await prisma.$transaction(async (tx) => {
      // Delete all selected incomes
      const deleted = await tx.income.deleteMany({
        where: {
          id: { in: incomeIds },
          userId: user.userId,
        },
      });

      return deleted;
    });

    console.log(`✅ Bulk deleted ${result.count} incomes for user ${user.userId}`);

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Uspešno obrisano ${result.count} prihoda`,
    });
  } catch (error) {
    console.error("Bulk delete incomes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
