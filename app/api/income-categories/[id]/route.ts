import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if category belongs to user
    const category = await prisma.incomeCategory.findUnique({
      where: { id },
    });

    if (!category || category.userId !== user.userId) {
      return NextResponse.json(
        { error: "Kategorija nije pronađena" },
        { status: 404 }
      );
    }

    // Check if category is used in any incomes
    const incomeCount = await prisma.income.count({
      where: { categoryId: id },
    });

    if (incomeCount > 0) {
      return NextResponse.json(
        { error: `Kategorija se koristi u ${incomeCount} prihoda` },
        { status: 400 }
      );
    }

    await prisma.incomeCategory.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Kategorija uspešno obrisana" });
  } catch (error) {
    console.error("Error deleting income category:", error);
    return NextResponse.json(
      { error: "Greška pri brisanju kategorije" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, icon, color, isActive } = body;

    console.log('PATCH /api/income-categories/[id] - id:', id, 'body:', body);

    // Check if category belongs to user
    const category = await prisma.incomeCategory.findUnique({
      where: { id },
    });

    if (!category || category.userId !== user.userId) {
      return NextResponse.json(
        { error: "Kategorija nije pronađena" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCategory = await prisma.incomeCategory.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating income category:", error);
    return NextResponse.json(
      { error: "Greška pri ažuriranju kategorije" },
      { status: 500 }
    );
  }
}
