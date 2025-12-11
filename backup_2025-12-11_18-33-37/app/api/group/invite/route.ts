import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendGroupInviteEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  try {
    const { emailToInvite } = await req.json();

    if (!emailToInvite || !emailToInvite.includes("@")) {
      return NextResponse.json(
        { error: "Unesite validnu email adresu" },
        { status: 400 }
      );
    }

    // Pronađi grupu gde je korisnik owner ili ima invite dozvolu
    const membership = await prisma.groupMember.findFirst({
      where: {
        userId: user.userId,
      },
      include: {
        group: true,
      },
    });

    if (!membership || membership.leftAt) {
      return NextResponse.json(
        { error: "Niste član nijedne grupe" },
        { status: 404 }
      );
    }

    // Proveri da li korisnik ima dozvolu za pozivanje
    const hasInvitePermission =
      membership.role === "owner" ||
      membership.permissions.includes("invite");

    if (!hasInvitePermission) {
      return NextResponse.json(
        { error: "Nemate dozvolu za pozivanje članova" },
        { status: 403 }
      );
    }

    // Proveri da li je email već pozvan
    const existingInvite = await prisma.inviteToken.findFirst({
      where: {
        groupId: membership.groupId,
        email: emailToInvite.toLowerCase(),
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "Ovaj korisnik je već pozvan u grupu" },
        { status: 400 }
      );
    }

    // Proveri da li je korisnik već član grupe
    const allMembers = await prisma.groupMember.findMany({
      where: {
        groupId: membership.groupId,
      },
      include: {
        user: true,
      },
    });

    const existingMember = allMembers.find(
      (m: any) => m.user.email.toLowerCase() === emailToInvite.toLowerCase() && !m.leftAt
    );

    if (existingMember) {
      return NextResponse.json(
        { error: "Ovaj korisnik je već član grupe" },
        { status: 400 }
      );
    }

    // Generiši token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Token važi 7 dana

    // Kreiraj pozivnicu
    const invite = await prisma.inviteToken.create({
      data: {
        token,
        groupId: membership.groupId,
        email: emailToInvite.toLowerCase(),
        expiresAt,
      },
    });

    // Proveri da li korisnik postoji
    const existingUser = await prisma.user.findUnique({
      where: { email: emailToInvite.toLowerCase() },
    });

    // Dohvati informacije o pozivaocu
    const inviter = await prisma.user.findUnique({
      where: { id: user.userId },
    });

    if (!inviter) {
      return NextResponse.json(
        { error: "Greška pri pronalaženju korisničkih podataka" },
        { status: 500 }
      );
    }

    // Pošalji email pozivnicu
    const emailResult = await sendGroupInviteEmail(
      emailToInvite.toLowerCase(),
      inviter.name,
      membership.group.name,
      token,
      !!existingUser
    );

    if (!emailResult.success) {
      console.error("Failed to send invite email:", emailResult.error);
      // Ne vraćaj grešku korisniku, ali loguj problem
    }

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/group/join?token=${token}`;

    return NextResponse.json({
      success: true,
      userExists: !!existingUser,
      inviteLink,
      emailSent: emailResult.success,
      message: existingUser
        ? "Pozivnica je poslata postojećem korisniku"
        : "Poziv za registraciju je poslat na email",
    });
  } catch (error) {
    console.error("Error sending invite:", error);
    return NextResponse.json(
      { error: "Greška pri slanju pozivnice" },
      { status: 500 }
    );
  }
}
