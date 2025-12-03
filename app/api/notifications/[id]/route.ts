import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * DELETE /api/notifications/[id]
 * Delete a specific notification
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Neautorizovano" },
        { status: 401 }
      )
    }

    const { id: notificationId } = await params

    // Delete notification only if it belongs to the user
    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: "Notifikacija obrisana"
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: "Greška pri brisanju notifikacije" },
      { status: 500 }
    )
  }
}
