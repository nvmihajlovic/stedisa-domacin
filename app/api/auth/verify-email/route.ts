import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { sendWelcomeEmail } from "@/lib/email"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: "Token je obavezan" },
        { status: 400 }
      )
    }

    // Pronađi korisnika sa ovim tokenom
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Nevažeći ili istekao token" },
        { status: 400 }
      )
    }

    // Proveri da li je token istekao
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Token je istekao. Koristite opciju 'Pošalji ponovo' na login stranici." },
        { status: 410 }
      )
    }

    // Verifikuj email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    })

    // Pošalji welcome email
    await sendWelcomeEmail(user.email, user.name)

    return NextResponse.json({
      message: "Email je uspešno verifikovan! Dobrodošli u Domaćin! 🎉",
    })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json(
      { error: "Došlo je do greške prilikom verifikacije" },
      { status: 500 }
    )
  }
}
