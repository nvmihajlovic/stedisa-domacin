import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/notifications
 * Fetch user's notifications (unread first)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Neautorizovano" },
        { status: 401 }
      )
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id
      },
      orderBy: [
        { isRead: 'asc' },  // unread first
        { createdAt: 'desc' }
      ],
      take: 50  // last 50 notifications
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false
      }
    })

    return NextResponse.json({
      notifications,
      unreadCount
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Greška pri učitavanju notifikacija" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/notifications
 * Mark notification(s) as read
 * Body: { notificationId: string } or { markAllAsRead: true }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Neautorizovano" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all user's notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({
        success: true,
        message: "Sve notifikacije su označene kao pročitane"
      })
    }

    if (notificationId) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: user.id  // ensure user owns this notification
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({
        success: true,
        message: "Notifikacija je označena kao pročitana"
      })
    }

    return NextResponse.json(
      { error: "notificationId ili markAllAsRead je obavezan" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: "Greška pri ažuriranju notifikacije" },
      { status: 500 }
    )
  }
}
