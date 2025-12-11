import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUser } from "@/lib/auth"

const prisma = new PrismaClient()

/**
 * Get current user's active group
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userWithActiveGroup = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        activeGroupId: true,
        activeGroup: {
          select: {
            id: true,
            name: true,
            type: true,
            endDate: true,
            isActive: true
          }
        }
      }
    })

    return NextResponse.json({
      activeGroup: userWithActiveGroup?.activeGroup || null
    })
  } catch (error) {
    console.error("Error fetching active group:", error)
    return NextResponse.json(
      { error: "Failed to fetch active group" },
      { status: 500 }
    )
  }
}
