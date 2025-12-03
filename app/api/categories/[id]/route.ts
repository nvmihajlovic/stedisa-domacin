import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if category belongs to user
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category || category.userId !== user.userId) {
      return NextResponse.json(
        { error: "Kategorija nije pronađena" },
        { status: 404 }
      );
    }

    // Check if category is used in any expenses
    const expenseCount = await prisma.expense.count({
      where: { categoryId: id },
    });

    if (expenseCount > 0) {
      return NextResponse.json(
        { error: `Kategorija se koristi u ${expenseCount} troškova` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Kategorija uspešno obrisana" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Greška pri brisanju kategorije" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, icon, color, isActive } = body;

    console.log('PATCH /api/categories/[id] - id:', id, 'body:', body);

    // Check if category belongs to user
    const category = await prisma.category.findUnique({
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

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Greška pri ažuriranju kategorije" },
      { status: 500 }
    );
  }
}

