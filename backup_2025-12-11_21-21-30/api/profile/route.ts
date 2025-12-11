import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET /api/profile - Get complete user profile
export async function GET() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user with groups
    const profile = await prisma.user.findUnique({
      where: { id: user.userId },
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
        theme: true,
        primaryColor: true,
        fontSize: true,
        chartType: true,
        createdAt: true,
        ownedGroups: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          }
        },
        groupMemberships: {
          select: {
            group: {
              select: {
                id: true,
                name: true,
                ownerId: true,
              }
            }
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Combine owned and member groups
    const allGroups = [
      ...profile.ownedGroups,
      ...profile.groupMemberships.map(m => m.group)
    ]

    // Remove duplicates and add ownership info
    const uniqueGroups = Array.from(
      new Map(allGroups.map(g => [g.id, { ...g, isOwner: g.ownerId === user.userId }])).values()
    )

    return NextResponse.json({
      ...profile,
      groups: uniqueGroups,
      lastLoginAt: new Date().toISOString(), // TODO: Implement actual tracking
      lastLoginIp: "N/A" // TODO: Implement actual IP tracking
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/profile - Update user profile
const updateProfileSchema = z.object({
  name: z.string().min(3, "Ime mora imati najmanje 3 karaktera").optional().or(z.literal("")),
  username: z.string().min(3, "Korisničko ime mora imati najmanje 3 karaktera").optional().or(z.literal("")),
  phone: z.string().regex(/^\+?[\d\s-]{7,15}$/, "Nevažeći broj telefona").optional().nullable().or(z.literal("")),
})

export async function PUT(req: Request) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    console.log("📦 Received profile update:", body)
    const validation = updateProfileSchema.safeParse(body)

    if (!validation.success) {
      console.error("❌ Validation error:", validation.error)
      return NextResponse.json(
        { error: validation.error.errors?.[0]?.message || "Invalid data" },
        { status: 400 }
      )
    }

    const { name, username, phone } = validation.data

    // Check if username is already taken (only if username is being updated and is not empty)
    if (username && username.length >= 3) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: user.userId }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Korisničko ime je već zauzeto" },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(name && name.length >= 3 && { name }),
        ...(username && username.length >= 3 && { username }),
        ...(phone !== undefined && { phone: phone || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
      }
    })

    console.log("✅ Profile updated successfully")
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
