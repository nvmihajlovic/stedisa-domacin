import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { sendVerificationEmail } from "@/lib/email"
import { generateVerificationToken, generateTokenExpiry } from "@/lib/tokens"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email je obavezan" },
        { status: 400 }
      )
    }

    // Pronađi korisnika
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Ne otkrivaj da korisnik ne postoji (security best practice)
      return NextResponse.json({
        message: "Ako nalog postoji, verification email je poslat.",
      })
    }

    // Ako je već verifikovan
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email je već verifikovan. Možete se prijaviti." },
        { status: 400 }
      )
    }

    // Generiši novi token
    const verificationToken = generateVerificationToken()
    const verificationTokenExpiry = generateTokenExpiry()

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    })

    // Pošalji novi verification email
    await sendVerificationEmail(user.email, user.name, verificationToken)

    return NextResponse.json({
      message: "Verification email je poslat! Proverite inbox.",
    })
  } catch (error) {
    console.error("Error resending verification email:", error)
    return NextResponse.json(
      { error: "Došlo je do greške" },
      { status: 500 }
    )
  }
}
