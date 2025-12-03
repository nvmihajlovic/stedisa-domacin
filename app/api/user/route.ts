import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function DELETE() {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete all user data (cascading deletes should handle related records)
    // Or you can manually delete related records first
    await db.user.delete({
      where: { id: user.id }
    })

    // Clear auth cookie
    cookies().delete("auth-token")

    return NextResponse.json({ success: true, message: "Account deleted" })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
