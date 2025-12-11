import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth"

export async function GET() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const categories = await prisma.category.findMany({
    where: {
      userId: user.userId,
    },
    orderBy: {
      name: "asc",
    },
  })

  return NextResponse.json(categories)
}

export async function POST(req: Request) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, icon, color, parentId } = await req.json()

  const category = await prisma.category.create({
    data: {
      name,
      icon,
      color,
      parentId,
      userId: user.userId,
    },
  })

  return NextResponse.json(category, { status: 201 })
}
