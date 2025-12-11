import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET /api/profile/style - Get user style preferences
export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const style = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        theme: true,
        primaryColor: true,
        fontSize: true,
        chartType: true,
      }
    })

    if (!style) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(style)
  } catch (error) {
    console.error("Error fetching style:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/profile/style - Update user style preferences
const updateStyleSchema = z.object({
  theme: z.enum(["dark", "light"]).optional(),
  primaryColor: z.enum(["purple", "pink", "green", "blue"]).optional(),
  fontSize: z.enum(["small", "normal", "large"]).optional(),
  chartType: z.enum(["line", "bar", "combined"]).optional(),
})

export async function PUT(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = updateStyleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { theme, primaryColor, fontSize, chartType } = validation.data

    const updatedStyle = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(theme && { theme }),
        ...(primaryColor && { primaryColor }),
        ...(fontSize && { fontSize }),
        ...(chartType && { chartType }),
      },
      select: {
        theme: true,
        primaryColor: true,
        fontSize: true,
        chartType: true,
      }
    })

    return NextResponse.json(updatedStyle)
  } catch (error) {
    console.error("Error updating style:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
