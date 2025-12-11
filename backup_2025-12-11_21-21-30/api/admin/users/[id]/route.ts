import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getUser()
  
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 403 })
  }

  const { id } = await params

  try {
    // Proveri da admin ne briše sam sebe
    if (id === admin.userId) {
      return NextResponse.json(
        { error: "Ne možete obrisati sami sebe" },
        { status: 400 }
      )
    }

    await prisma.$transaction([
      // Loguj akciju PRE brisanja
      prisma.adminLog.create({
        data: {
          adminId: admin.userId,
          action: 'user.delete',
          targetId: id,
          details: { timestamp: new Date().toISOString() }
        }
      }),
      // Obriši korisnika (cascade će obrisati sve povezano)
      prisma.user.delete({
        where: { id }
      })
    ])

    return NextResponse.json({ 
      success: true,
      message: "Korisnik je uspešno obrisan"
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Greška pri brisanju korisnika" },
      { status: 500 }
    )
  }
}
