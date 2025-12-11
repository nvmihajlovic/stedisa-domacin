import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const admin = await getUser()
  
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 403 })
  }

  try {
    const [
      totalUsers,
      activeUsers,
      blockedUsers,
      totalExpenses,
      totalIncomes,
      totalGroups
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.user.count({ where: { status: 'blocked' } }),
      prisma.expense.count(),
      prisma.income.count(),
      prisma.group.count()
    ])

    return NextResponse.json({
      totalUsers,
      activeUsers,
      blockedUsers,
      totalExpenses,
      totalIncomes,
      totalGroups
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Greška pri učitavanju statistike" },
      { status: 500 }
    )
  }
}
