import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUser } from "@/lib/auth"

const prisma = new PrismaClient()

/**
 * Switch user's active group
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { groupId } = await req.json()

    // Verify user has access to this group
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { ownerId: user.userId },
          {
            members: {
              some: { userId: user.userId }
            }
          }
        ]
      }
    })

    if (!group) {
      return NextResponse.json(
        { error: "Nemate pristup ovoj grupi" },
        { status: 403 }
      )
    }

    // Update user's active group
    await prisma.user.update({
      where: { id: user.userId },
      data: { activeGroupId: groupId }
    })

    return NextResponse.json({ success: true, activeGroupId: groupId })
  } catch (error) {
    console.error("Error switching active group:", error)
    return NextResponse.json(
      { error: "Failed to switch active group" },
      { status: 500 }
    )
  }
}
