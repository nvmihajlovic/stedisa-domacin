import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureUserHasCategories } from "@/lib/default-categories";

/**
 * Manually ensure the current user has default categories
 * Useful for fixing users created before default categories were implemented
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
    }

    console.log(`🔧 [ensure-categories] Ensuring categories for user ${user.userId}`);

    await ensureUserHasCategories(user.userId, prisma);

    // Count categories after ensuring
    const expenseCount = await prisma.category.count({
      where: { userId: user.userId }
    });

    const incomeCount = await prisma.incomeCategory.count({
      where: { userId: user.userId }
    });

    console.log(`✅ [ensure-categories] User now has ${expenseCount} expense categories and ${incomeCount} income categories`);

    return NextResponse.json({
      success: true,
      expenseCategories: expenseCount,
      incomeCategories: incomeCount,
      message: "Kategorije su uspešno kreirane"
    });
  } catch (error) {
    console.error("Error ensuring categories:", error);
    return NextResponse.json(
      { error: "Greška pri kreiranju kategorija" },
      { status: 500 }
    );
  }
}
