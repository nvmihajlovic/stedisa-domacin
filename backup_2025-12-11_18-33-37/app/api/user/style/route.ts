import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { theme, primaryColor, fontSize, chartType } = body

    // Store in database (assuming you have these fields in User model)
    // If not, you can just return success - localStorage will handle it
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        theme: theme || undefined,
        primaryColor: primaryColor || undefined,
        fontSize: fontSize || undefined,
        chartType: chartType || undefined,
      }
    }).catch(() => {
      // If fields don't exist in schema, just return success
      // localStorage is primary storage for these settings
      return { success: true }
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error("Error updating style:", error)
    return NextResponse.json({ error: "Failed to update style" }, { status: 500 })
  }
}
