import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyGroupMembers } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token je obavezan" },
        { status: 400 }
      );
    }

    // Pronađi pozivnicu
    const invite = await prisma.inviteToken.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Nevažeća pozivnica" },
        { status: 404 }
      );
    }

    if (invite.used) {
      return NextResponse.json(
        { error: "Pozivnica je već iskorišćena" },
        { status: 400 }
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Pozivnica je istekla" },
        { status: 400 }
      );
    }

    // Proveri da li korisnik sa tim emailom postoji
    const existingUser = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    // Ako korisnik ne postoji, vrati info da treba registracija
    if (!existingUser) {
      return NextResponse.json(
        { 
          needsRegistration: true,
          email: invite.email,
          token: token
        },
        { status: 200 }
      );
    }

    // Ako korisnik postoji, proveri da li je ulogovan
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ 
        error: "Morate se ulogovati",
        needsLogin: true,
        email: invite.email
      }, { status: 401 });
    }

    // Proveri da li je email odgovara
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    console.log("📧 Email check:", {
      userEmail: dbUser?.email,
      inviteEmail: invite.email,
      match: dbUser?.email.toLowerCase() === invite.email.toLowerCase()
    });

    // Dozvoli prihvatanje pozivnice samo ako se emailovi poklapaju
    // ILI ako je korisnik upravo registrovan (provera će biti u register endpointu)
    if (dbUser?.email.toLowerCase() !== invite.email.toLowerCase()) {
      return NextResponse.json(
        { 
          error: "Pozivnica nije poslata na vaš email",
          details: `Pozivnica je poslata na ${invite.email}, a vi ste ulogovani kao ${dbUser?.email}`
        },
        { status: 403 }
      );
    }

    // Proveri da li je korisnik već član neke grupe
    const allMemberships = await prisma.groupMember.findMany({
      where: {
        userId: user.userId,
      },
    });

    const existingMembership = allMemberships.find((m: any) => !m.leftAt);

    if (existingMembership) {
      return NextResponse.json(
        { error: "Već ste član neke grupe" },
        { status: 400 }
      );
    }

    // Proveri da li je korisnik bio član ove grupe ranije (ima leftAt)
    const previousMembership = allMemberships.find((m: any) => m.groupId === invite.groupId && m.leftAt);

    if (previousMembership) {
      // Reaktiviraj prethodno članstvo umesto kreiranja novog
      await prisma.$transaction([
        prisma.groupMember.update({
          where: { id: previousMembership.id },
          data: { 
            leftAt: null,
            role: "member",
            permissions: "view,add",
          },
        }),
        prisma.inviteToken.update({
          where: { id: invite.id },
          data: { used: true },
        }),
      ]);
    } else {
      // Dodaj korisnika u grupu kao novog člana
      await prisma.$transaction([
        prisma.groupMember.create({
          data: {
            groupId: invite.groupId,
            userId: user.userId,
            role: "member",
            permissions: "view,add",
          },
        }),
        prisma.inviteToken.update({
          where: { id: invite.id },
          data: { used: true },
        }),
      ]);
    }

    const group = await prisma.group.findUnique({
      where: { id: invite.groupId },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (group) {
      // @ts-ignore
      group.members = group.members.filter((m: any) => !m.leftAt);
      
      // 🔔 Pošalji notifikaciju korisniku koji se pridružio
      await prisma.notification.create({
        data: {
          userId: user.userId,
          type: "GROUP_JOIN",
          title: "Pridružili ste se grupi",
          message: `Uspešno ste se pridružili grupi "${group.name}"`,
          read: false,
        },
      }).catch(err => {
        console.error("❌ Failed to send join notification to new member:", err);
      });
      
      // 🔔 Pošalji notifikaciju ostalim članovima grupe (bez novog člana)
      await notifyGroupMembers(
        invite.groupId,
        user.userId,  // exclude the person who just joined
        {
          type: "GROUP_JOIN",
          title: "Novi član u grupi",
          message: `${dbUser?.name || 'Neko'} se pridružio grupi "${group.name}"`,
        }
      ).catch(err => {
        console.error("❌ Failed to send group join notifications:", err)
        // Don't fail the request if notification fails
      })
    }

    return NextResponse.json({
      success: true,
      group,
    });
  } catch (error) {
    console.error("Error joining group:", error);
    return NextResponse.json(
      { error: "Greška pri pridruživanju grupi" },
      { status: 500 }
    );
  }
}
