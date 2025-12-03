import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

// Create JWT secret as a constant Uint8Array
const getJWTSecret = () => {
  return new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret-key")
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    console.log("🔐 Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email i lozinka su obavezni" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log("❌ User not found:", email)
      return NextResponse.json(
        { error: "Pogrešan email ili lozinka" },
        { status: 401 }
      )
    }

    console.log("✓ User found:", { email: user.email, emailVerified: user.emailVerified })

    // Proveri da li je email verifikovan
    if (!user.emailVerified) {
      console.log("❌ Email not verified")
      return NextResponse.json(
        { error: "Molimo verifikujte vaš email pre prijave. Proverite inbox." },
        { status: 403 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log("🔑 Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Pogrešan email ili lozinka" },
        { status: 401 }
      )
    }

    console.log("✅ Login successful for:", email)

    // Create JWT token
    const secret = getJWTSecret()
    const token = await new SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret)

    console.log("🎫 Token created successfully")

    // Set cookie using Next.js 15+ API
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("🍪 Cookie set successfully")

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Greška pri prijavi" },
      { status: 500 }
    )
  }
}
