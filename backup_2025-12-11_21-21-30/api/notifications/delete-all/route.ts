import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * DELETE /api/notifications/delete-all
 * Delete all user's notifications
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Neautorizovano" },
        { status: 401 }
      )
    }

    // Delete all user's notifications
    await prisma.notification.deleteMany({
      where: {
        userId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: "Sve notifikacije su obrisane"
    })
  } catch (error) {
    console.error("Error deleting all notifications:", error)
    return NextResponse.json(
      { error: "Greška pri brisanju notifikacija" },
      { status: 500 }
    )
  }
}
