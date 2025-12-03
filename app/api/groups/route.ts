import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const prisma = new PrismaClient();

const createGroupSchema = z.object({
  name: z.string().min(3, "Naziv mora imati najmanje 3 karaktera").max(50, "Naziv može imati najviše 50 karaktera"),
  description: z.string().max(200, "Opis može imati najviše 200 karaktera").optional()
});

// Get all groups for current user
export async function GET(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get groups where user is owner or member
    const ownedGroups = await prisma.group.findMany({
      where: { ownerId: user.userId },
      include: {
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
          include: {
            category: true,
          },
          orderBy: { date: "desc" },
        },
      },
    });

    const memberGroups = await prisma.groupMember.findMany({
      where: { userId: user.userId },
      include: {
        group: {
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
              include: {
                category: true,
              },
              orderBy: { date: "desc" },
            },
          },
        },
      },
    });

    const allGroups = [
      ...ownedGroups,
      ...memberGroups.map((m) => m.group),
    ];

    return NextResponse.json(allGroups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// Create a new group
export async function POST(req: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    const validation = createGroupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description } = validation.data;

    // Check if group with same name exists for this user
    const existingGroup = await prisma.group.findFirst({
      where: {
        name,
        ownerId: user.userId
      }
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: "Grupa sa ovim nazivom već postoji" },
        { status: 400 }
      );
    }

    // Create group and add owner as member in a transaction
    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name,
          description: description || "",
          ownerId: user.userId,
        },
      });

      await tx.groupMember.create({
        data: {
          userId: user.userId,
          groupId: newGroup.id,
          role: "owner",
          permissions: "view,add,edit,delete"
        }
      });

      return newGroup;
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
