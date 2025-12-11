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
    const category = await prisma.incomeCategory.findUnique({
      where: { id },
    });

    if (!category || category.userId !== user.userId) {
      return NextResponse.json(
        { error: "Kategorija nije pronađena" },
        { status: 404 }
      );
    }

    const incomeCount = await prisma.income.count({
      where: { categoryId: id },
    });

    return NextResponse.json({
      hasTransactions: incomeCount > 0,
      count: incomeCount,
    });
  } catch (error) {
    console.error("Error checking income category:", error);
    return NextResponse.json(
      { error: "Greška pri provjeri kategorije" },
      { status: 500 }
    );
  }
}
