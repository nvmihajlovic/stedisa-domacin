import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getUser } from "@/lib/auth"
import { notifyGroupMembers } from "@/lib/notifications"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Neautorizovan pristup" }, { status: 401 })
    }

    const { memberIdToRemove } = await request.json()

    if (!memberIdToRemove) {
      return NextResponse.json(
        { error: "ID člana je obavezan" },
        { status: 400 }
      )
    }

    // Pronađi grupu u kojoj je trenutni korisnik
    const currentMembership = await prisma.groupMember.findFirst({
      where: { userId: user.id },
      include: {
        group: {
          include: {
            members: {
              include: { user: true }
            }
          }
        }
      }
    })

    if (!currentMembership) {
      return NextResponse.json(
        { error: "Niste član nijedne grupe" },
        { status: 404 }
      )
    }

    // Proveri da li je trenutni korisnik owner ili admin
    if (currentMembership.role !== "owner" && currentMembership.role !== "admin") {
      return NextResponse.json(
        { error: "Samo admin može da uklanja članove" },
        { status: 403 }
      )
    }

    // Pronađi člana kojeg želimo da uklonimo
    const memberToRemove = await prisma.groupMember.findUnique({
      where: { id: memberIdToRemove },
      include: { user: true }
    })

    if (!memberToRemove) {
      return NextResponse.json(
        { error: "Član nije pronađen" },
        { status: 404 }
      )
    }

    // Proveri da li je član u istoj grupi
    if (memberToRemove.groupId !== currentMembership.groupId) {
      return NextResponse.json(
        { error: "Član nije u vašoj grupi" },
        { status: 400 }
      )
    }

    // Ne dozvoli da owner ukloni samog sebe
    if (memberToRemove.role === "owner") {
      return NextResponse.json(
        { error: "Vlasnik grupe ne može biti uklonjen. Vlasnik može samo izbrisati grupu." },
        { status: 400 }
      )
    }

    // Ne dozvoli da admin (koji nije owner) uklanja drugog admina
    if (currentMembership.role === "admin" && memberToRemove.role === "admin") {
      return NextResponse.json(
        { error: "Admin ne može ukloniti drugog admina" },
        { status: 403 }
      )
    }

    // Ukloni člana iz grupe (umesto delete, postavimo leftAt)
    await prisma.groupMember.update({
      where: { id: memberIdToRemove },
      data: { leftAt: new Date() }
    })

    // Pošalji notifikaciju uklonjenom članu i ostalima
    await notifyGroupMembers(
      currentMembership.groupId,
      null, // notify everyone including removed member
      {
        type: "GROUP_REMOVE",
        title: "Član je uklonjen iz grupe",
        message: `${memberToRemove.user.name} je uklonjen iz grupe`,
      }
    ).catch(err => {
      console.error("Failed to send remove notification:", err);
    });

    return NextResponse.json({
      message: `Član ${memberToRemove.user.name} je uspešno uklonjen iz grupe`,
      removedMember: {
        id: memberToRemove.id,
        name: memberToRemove.user.name,
        email: memberToRemove.user.email
      }
    })
  } catch (error) {
    console.error("Error removing member:", error)
    return NextResponse.json(
      { error: "Došlo je do greške prilikom uklanjanja člana" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
