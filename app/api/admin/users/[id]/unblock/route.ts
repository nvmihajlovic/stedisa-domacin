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

  try {
    await prisma.$transaction([
      // Odblokiraj korisnika
      prisma.user.update({
        where: { id },
        data: { status: 'active' }
      }),
      // Loguj akciju
      prisma.adminLog.create({
        data: {
          adminId: admin.userId,
          action: 'user.unblock',
          targetId: id,
          details: {}
        }
      })
    ])

    return NextResponse.json({ 
      success: true,
      message: "Korisnik je uspešno odblokiran"
    })
  } catch (error) {
    console.error("Error unblocking user:", error)
    return NextResponse.json(
      { error: "Greška pri odblokiranju korisnika" },
      { status: 500 }
    )
  }
}
