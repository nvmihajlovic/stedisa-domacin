import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

const prisma = new PrismaClient()

// Rate limiting map (u produkciji koristiti Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(email)

  if (!limit || now > limit.resetTime) {
    // Reset ili novi unos
    rateLimitMap.set(email, {
      count: 1,
      resetTime: now + 60 * 60 * 1000, // 1 sat
    })
    return true
  }

  if (limit.count >= 3) {
    return false // Dostignut limit
  }

  limit.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email je obavezan' },
        { status: 400 }
      )
    }

    // Rate limiting: max 3 zahteva po email-u na sat
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Previše zahteva. Pokušajte ponovo za 1 sat.',
        },
        { status: 429 }
      )
    }

    // Pronađi korisnika
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Security: Ne otkrivaj da li email postoji
    // Uvek vraćaj isti odgovor
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          'Ako nalog sa ovim emailom postoji, poslali smo vam link za resetovanje lozinke.',
      })
    }

    // Generiši random token (256-bit)
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Hash token pre čuvanja u bazi
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // Postavi expiration na 30 minuta
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000)

    // Sačuvaj u bazi
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry,
      },
    })

    // Pošalji email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken // Šaljemo original token, ne hash
    )

    if (!emailResult.success) {
      console.error('Failed to send password reset email')
      return NextResponse.json(
        {
          success: false,
          message: 'Greška pri slanju email-a. Pokušajte ponovo.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message:
        'Ako nalog sa ovim emailom postoji, poslali smo vam link za resetovanje lozinke.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'Serverska greška' },
      { status: 500 }
    )
  }
}
