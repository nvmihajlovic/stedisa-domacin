import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currency, dateFormat, notifications, recurringNotifications } = body

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        currency: currency || undefined,
        dateFormat: dateFormat || undefined,
        notifications: notifications !== undefined ? notifications : undefined,
        recurringNotifications: recurringNotifications !== undefined ? recurringNotifications : undefined,
      }
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
