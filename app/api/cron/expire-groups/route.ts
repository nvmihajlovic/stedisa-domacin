import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Cron endpoint za proveru i zatvaranje isteklih privremenih grupa
 * Poziva se automatski (Vercel Cron) ili rucno
 */
export async function GET(req: NextRequest) {
  try {
    // Security check - only allow calls from cron or with secret key
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "default-secret-change-this";
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find all expired temporary groups that are still active
    const expiredGroups = await prisma.group.findMany({
      where: {
        type: "TEMPORARY",
        isActive: true,
        endDate: {
          lte: now // Less than or equal to current time
        }
      },
      include: {
        activeUsers: true // Users who have this as their active group
      }
    });

    if (expiredGroups.length === 0) {
      return NextResponse.json({
        message: "Nema isteklih grupa",
        expiredCount: 0
      });
    }

    // Process each expired group
    const results = await Promise.all(
      expiredGroups.map(async (group) => {
        return prisma.$transaction(async (tx) => {
          // Mark group as inactive
          await tx.group.update({
            where: { id: group.id },
            data: { isActive: false }
          });

          // For each user in this group, revert to their last permanent group
          const revertedUsers = await Promise.all(
            group.activeUsers.map(async (user) => {
              // Find last active permanent group for this user
              const permanentGroup = await tx.group.findFirst({
                where: {
                  type: "PERMANENT",
                  isActive: true,
                  OR: [
                    { ownerId: user.id },
                    {
                      members: {
                        some: { userId: user.id }
                      }
                    }
                  ]
                },
                orderBy: { createdAt: "desc" }
              });

              if (permanentGroup) {
                // Update user's active group to the permanent one
                await tx.user.update({
                  where: { id: user.id },
                  data: { activeGroupId: permanentGroup.id }
                });

                return {
                  userId: user.id,
                  newActiveGroup: permanentGroup.id
                };
              } else {
                // No permanent group found, set activeGroupId to null
                await tx.user.update({
                  where: { id: user.id },
                  data: { activeGroupId: null }
                });

                return {
                  userId: user.id,
                  newActiveGroup: null
                };
              }
            })
          );

          return {
            groupId: group.id,
            groupName: group.name,
            revertedUsers
          };
        });
      })
    );

    return NextResponse.json({
      message: `Zatvoreno ${expiredGroups.length} isteklih grupa`,
      expiredCount: expiredGroups.length,
      results
    });
  } catch (error) {
    console.error("Error expiring groups:", error);
    return NextResponse.json(
      { error: "Failed to expire groups" },
      { status: 500 }
    );
  }
}
