import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getUser()
  
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 403 })
  }

  const { id } = await params
  const { reason } = await req.json()

  try {
    // Proveri da admin ne blokira sam sebe
    if (id === admin.userId) {
      return NextResponse.json(
        { error: "Ne možete blokirati sami sebe" },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      // Blokiraj korisnika
      prisma.user.update({
        where: { id },
        data: { status: 'blocked' }
      }),
      // Loguj akciju
      prisma.adminLog.create({
        data: {
          adminId: admin.userId,
          action: 'user.block',
          targetId: id,
          details: { reason: reason || 'Nije naveden razlog' }
        }
      })
    ])

    return NextResponse.json({ 
      success: true,
      message: "Korisnik je uspešno blokiran"
    })
  } catch (error) {
    console.error("Error blocking user:", error)
    return NextResponse.json(
      { error: "Greška pri blokiranju korisnika" },
      { status: 500 }
    )
  }
}
