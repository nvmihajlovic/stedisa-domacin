import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        currency: true,
        dateFormat: true,
        notifications: true,
        recurringNotifications: true,
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, username, phone } = body

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || undefined,
        username: username || undefined,
        phone: phone || undefined,
      }
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
