import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/lib/email"
import { generateVerificationToken, generateTokenExpiry } from "@/lib/tokens"
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/default-categories"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, inviteToken } = await request.json()

    // Validacija
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Sva polja su obavezna" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Lozinka mora imati najmanje 6 karaktera" },
        { status: 400 }
      )
    }

    // Proveri da li korisnik već postoji
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email adresa već postoji" },
        { status: 400 }
      )
    }

    // Ako je poslat inviteToken, proveri njegovu validnost
    let pendingInvite = null
    if (inviteToken) {
      pendingInvite = await prisma.inviteToken.findUnique({
        where: { token: inviteToken },
      })

      if (!pendingInvite) {
        return NextResponse.json(
          { error: "Nevažeća pozivnica" },
          { status: 400 }
        )
      }

      if (pendingInvite.used) {
        return NextResponse.json(
          { error: "Pozivnica je već iskorišćena" },
          { status: 400 }
        )
      }

      if (pendingInvite.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "Pozivnica je istekla" },
          { status: 400 }
        )
      }

      if (pendingInvite.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: "Email ne odgovara pozivu" },
          { status: 400 }
        )
      }
    }

    // Hashuj lozinku
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generiši verification token
    const verificationToken = generateVerificationToken()
    const verificationTokenExpiry = generateTokenExpiry()

    // Kreiraj korisnika
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
      },
    })

    // Dodaj default kategorije novom korisniku
    console.log(`✓ Dodavanje ${DEFAULT_EXPENSE_CATEGORIES.length} default kategorija troškova i ${DEFAULT_INCOME_CATEGORIES.length} kategorija prihoda...`)

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

    console.log(`✓ Sve default kategorije uspešno dodane za korisnika: ${email}`)

    // Ako je pozivnica poslata direktno ili postoji pending pozivnica
    if (!pendingInvite) {
      pendingInvite = await prisma.inviteToken.findFirst({
        where: {
          email: email.toLowerCase(),
          used: false,
          expiresAt: {
            gt: new Date()
          }
        }
      })
    }

    if (pendingInvite) {
      console.log(`✓ Found pending invite for ${email}, auto-joining group...`)
      
      try {
        // Automatski pridruži korisnika grupi
        await prisma.$transaction([
          prisma.groupMember.create({
            data: {
              groupId: pendingInvite.groupId,
              userId: user.id,
              role: "member",
              permissions: "view,add",
            },
          }),
          prisma.inviteToken.update({
            where: { id: pendingInvite.id },
            data: { used: true },
          }),
        ])
        
        console.log(`✓ User automatically joined group after registration`)
      } catch (inviteError) {
        console.error("Error auto-joining group:", inviteError)
        // Ne vraćaj grešku - registracija je uspešna, korisnik može ručno prihvatiti pozivnicu
      }
    }

    // Pošalji verification email
    await sendVerificationEmail(email, name, verificationToken)

    return NextResponse.json({
      message: pendingInvite 
        ? "Registracija uspešna! Automatski ste pridruženi grupi. Proverite vaš email za link za verifikaciju."
        : "Registracija uspešna! Proverite vaš email za link za verifikaciju.",
      userId: user.id,
      autoJoinedGroup: !!pendingInvite
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Došlo je do greške prilikom registracije" },
      { status: 500 }
    )
  }
}
