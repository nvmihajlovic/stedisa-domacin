import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { newEmail } = body

    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    })

    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "Email već postoji" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail }
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error("Error changing email:", error)
    return NextResponse.json({ error: "Failed to change email" }, { status: 500 })
  }
}
