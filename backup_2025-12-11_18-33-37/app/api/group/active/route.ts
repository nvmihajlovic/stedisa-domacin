import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's active group membership (not left)
    const membership = await prisma.groupMember.findFirst({
      where: {
        userId: user.userId,
        leftAt: null,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    })

    if (!membership) {
      return NextResponse.json({ group: null })
    }

    return NextResponse.json({
      group: membership.group,
      membership: {
        role: membership.role,
        permissions: membership.permissions,
      },
    })
  } catch (error) {
    console.error('Error fetching active group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
