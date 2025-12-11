import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendPasswordChangedEmail } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Token i lozinka su obavezni' },
        { status: 400 }
      )
    }

    // Validacija nove lozinke
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: 'Lozinka mora imati najmanje 8 karaktera',
        },
        { status: 400 }
      )
    }

    // Hash primljeni token da bi uporedili sa bazom
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Pronađi korisnika sa ovim tokenom
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(), // Token mora biti validan (nije istekao)
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Link za resetovanje je nevažeći ili je istekao. Molimo zatražite novi.',
        },
        { status: 400 }
      )
    }

    // Hash nova lozinka
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update lozinku i obriši reset token (jednokratna upotreba)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    // Pošalji email notifikaciju
    await sendPasswordChangedEmail(user.email, user.name)

    // TODO: Invalidate sve postojeće JWT sessione (ako imaš session tracking)

    return NextResponse.json({
      success: true,
      message: 'Lozinka je uspešno promenjena. Sada se možete prijaviti.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, message: 'Serverska greška' },
      { status: 500 }
    )
  }
}
