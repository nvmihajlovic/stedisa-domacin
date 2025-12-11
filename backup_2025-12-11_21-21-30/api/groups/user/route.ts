import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch groups where user is owner or member
    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { ownerId: user.userId },
          { members: { some: { userId: user.userId, leftAt: null } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      owner: group.owner,
      members: group.members,
      membersCount: group._count.members,
      createdAt: group.createdAt,
      isOwner: group.ownerId === user.userId
    }))

    console.log("📋 User's groups:", formattedGroups.map(g => ({ id: g.id, name: g.name })))

    return NextResponse.json({ groups: formattedGroups })
  } catch (error) {
    console.error("Error fetching user groups:", error)
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
  }
}
