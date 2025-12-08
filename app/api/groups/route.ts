import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, GroupType, DurationType } from "@prisma/client";
import { getUser } from "@/lib/auth";
import { z } from "zod";

const prisma = new PrismaClient();

const createGroupSchema = z.object({
  name: z.string().min(3, "Naziv mora imati najmanje 3 karaktera").max(50, "Naziv može imati najviše 50 karaktera"),
  description: z.string().max(200, "Opis može imati najviše 200 karaktera").optional(),
  type: z.enum(["PERMANENT", "TEMPORARY"]).default("PERMANENT"),
  durationType: z.enum(["DAYS_7", "DAYS_10", "DAYS_15", "DAYS_30", "YEAR_1", "CUSTOM"]).optional(),
  customEndDate: z.string().optional() // ISO date string
}).refine(
  (data) => {
    // If TEMPORARY, durationType is required
    if (data.type === "TEMPORARY" && !data.durationType) {
      return false;
    }
    // If CUSTOM durationType, customEndDate is required
    if (data.durationType === "CUSTOM" && !data.customEndDate) {
      return false;
    }
    return true;
  },
  {
    message: "Za privremenu grupu je potreban tip trajanja. Za custom trajanje je potreban datum."
  }
);

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

    // Remove duplicates based on group ID
    const uniqueGroups = allGroups.filter((group, index, self) =>
      index === self.findIndex((g) => g.id === group.id)
    );

    return NextResponse.json(uniqueGroups);
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

    const { name, description, type, durationType, customEndDate } = validation.data;

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

    // Calculate dates for temporary groups
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (type === "TEMPORARY") {
      startDate = new Date();
      
      if (durationType === "CUSTOM" && customEndDate) {
        endDate = new Date(customEndDate);
        if (endDate <= startDate) {
          return NextResponse.json(
            { error: "Datum isteka mora biti u budućnosti" },
            { status: 400 }
          );
        }
      } else if (durationType) {
        // Calculate endDate based on durationType
        const durationMap: Record<string, number> = {
          DAYS_7: 7,
          DAYS_10: 10,
          DAYS_15: 15,
          DAYS_30: 30,
          YEAR_1: 365
        };
        const days = durationMap[durationType];
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days);
      }
    }

    // Create group and add owner as member in a transaction
    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name,
          description: description || "",
          ownerId: user.userId,
          type: type as GroupType,
          durationType: durationType as DurationType | undefined,
          startDate,
          endDate,
          isActive: true
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

      // If this is the user's first group or if it's temporary, set as active
      const userRecord = await tx.user.findUnique({
        where: { id: user.userId }
      });

      if (!userRecord?.activeGroupId || type === "TEMPORARY") {
        await tx.user.update({
          where: { id: user.userId },
          data: { activeGroupId: newGroup.id }
        });
      }

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
