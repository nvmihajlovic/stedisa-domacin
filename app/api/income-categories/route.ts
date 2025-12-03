import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const categories = await prisma.incomeCategory.findMany({
    where: {
      userId: user.userId,
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const body = await request.json();
  const { name, icon, color, isLoanRepayment } = body;

  if (!name) {
    return NextResponse.json(
      { error: "Ime je obavezno" },
      { status: 400 }
    );
  }

  const category = await prisma.incomeCategory.create({
    data: {
      name,
      icon: icon || "💰",
      color: color || "#45D38A",
      userId: user.userId,
      isLoanRepayment: isLoanRepayment || false,
    },
  });

  return NextResponse.json(category);
}
