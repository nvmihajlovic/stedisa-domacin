import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUser } from "@/lib/auth";

const prisma = new PrismaClient();

// Get group details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      expenses: {
        where: { groupId: id },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { date: "desc" },
      },
      incomes: {
        where: { groupId: id },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  // Check if user has access to this group
  const isMember = group.members.some((m) => m.userId === user.userId);
  const isOwner = group.ownerId === user.userId;

  if (!isMember && !isOwner) {
    return NextResponse.json(
      { error: "You don't have access to this group" },
      { status: 403 }
    );
  }

  // Incomes are now part of the group query
  const incomes = group.incomes;    const totalExpenses = group.expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const totalIncome = incomes.reduce((acc, i) => acc + Number(i.amount), 0);

    const groupData = {
      id: group.id,
      name: group.name,
      description: group.description,
      admin: group.ownerId,
      owner: group.owner,
      members: group.members,
      expenses: group.expenses,
      incomes: incomes,
      totals: {
        expenses: totalExpenses,
        income: totalIncome,
        balance: totalIncome - totalExpenses
      },
      counts: {
        members: group.members.length,
        expenses: group.expenses.length,
        incomes: incomes.length
      },
      totalExpenses,
      totalIncome,
      userRole: {
        isOwner,
        isMember
      }
    };

    return NextResponse.json(groupData);
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Failed to fetch group" },
      { status: 500 }
    );
  }
}

// Update group
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Only owner can update group
    if (group.ownerId !== user.userId) {
      return NextResponse.json(
        { error: "Only group owner can update the group" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description } = body;

    const updated = await prisma.group.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}

// Delete group
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Only owner can delete group
    if (group.ownerId !== user.userId) {
      return NextResponse.json(
        { error: "Only group owner can delete the group" },
        { status: 403 }
      );
    }

    // Before deleting, reset activeGroupId for all users who have this group active
    await prisma.user.updateMany({
      where: {
        activeGroupId: id
      },
      data: {
        activeGroupId: null
      }
    })
    console.log(`✅ Reset activeGroupId for users with group ${id}`)

    await prisma.group.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}
