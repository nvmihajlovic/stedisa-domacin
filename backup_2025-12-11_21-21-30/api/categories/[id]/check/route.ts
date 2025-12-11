import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.userId !== user.userId) {
      return NextResponse.json(
        { error: "Kategorija nije pronađena" },
        { status: 404 }
      );
    }

    const expenseCount = await prisma.expense.count({
      where: { categoryId: id },
    });

    return NextResponse.json({
      hasTransactions: expenseCount > 0,
      count: expenseCount,
    });
  } catch (error) {
    console.error("Error checking category:", error);
    return NextResponse.json(
      { error: "Greška pri provjeri kategorije" },
      { status: 500 }
    );
  }
}
