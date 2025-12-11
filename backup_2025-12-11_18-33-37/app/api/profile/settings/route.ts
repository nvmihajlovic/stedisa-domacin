import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET /api/profile/settings - Get user settings
export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        currency: true,
        dateFormat: true,
        notifications: true,
        recurringNotifications: true,
        aiAssistantEnabled: true,
      }
    })

    if (!settings) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/profile/settings - Update user settings
const updateSettingsSchema = z.object({
  currency: z.enum(["RSD", "EUR", "USD", "GBP"]).optional(),
  dateFormat: z.enum(["dd.MM.yyyy", "yyyy-MM-dd", "MMM dd, yyyy"]).optional(),
  notifications: z.boolean().optional(),
  recurringNotifications: z.boolean().optional(),
  aiAssistantEnabled: z.boolean().optional(),
})

export async function PUT(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = updateSettingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { currency, dateFormat, notifications, recurringNotifications, aiAssistantEnabled } = validation.data

    const updatedSettings = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(currency && { currency }),
        ...(dateFormat && { dateFormat }),
        ...(notifications !== undefined && { notifications }),
        ...(recurringNotifications !== undefined && { recurringNotifications }),
        ...(aiAssistantEnabled !== undefined && { aiAssistantEnabled }),
      },
      select: {
        currency: true,
        dateFormat: true,
        notifications: true,
        recurringNotifications: true,
        aiAssistantEnabled: true,
      }
    })

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
