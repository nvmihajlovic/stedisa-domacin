import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/default-categories"

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Sva polja su obavezna" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email već postoji" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // Create default categories for new user
    await prisma.category.createMany({
      data: DEFAULT_EXPENSE_CATEGORIES.map(cat => ({
        ...cat,
        userId: user.id
      }))
    });

    await prisma.incomeCategory.createMany({
      data: DEFAULT_INCOME_CATEGORIES.map(cat => ({
        ...cat,
        userId: user.id
      }))
    });

    return NextResponse.json(
      { message: "Nalog uspešno kreiran", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Greška pri registraciji" },
      { status: 500 }
    )
  }
}
