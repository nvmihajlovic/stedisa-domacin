import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const user = await getUser()
  
  console.log('Admin check - User:', user)
  console.log('Admin check - Has role?', user?.role)
  console.log('Admin check - Is admin?', user?.role === 'admin')

  if (!user || user.role !== 'admin') {
    console.log('Admin check - BLOCKED: Not admin')
    return NextResponse.json({ error: "Neautorizovano" }, { status: 403 })
  }  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            expenses: true,
            incomes: true,
            groupMemberships: true,
            ownedGroups: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Greška pri učitavanju korisnika" },
      { status: 500 }
    )
  }
}
