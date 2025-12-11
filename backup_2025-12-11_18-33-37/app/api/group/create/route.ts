import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  try {
    const { groupName } = await req.json();

    if (!groupName || groupName.trim().length === 0) {
      return NextResponse.json(
        { error: "Naziv grupe je obavezan" },
        { status: 400 }
      );
    }

    // Proveri da li korisnik već ima grupu
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

    // Kreiraj grupu
    const group = await prisma.group.create({
      data: {
        name: groupName.trim(),
        ownerId: user.userId,
        members: {
          create: {
            userId: user.userId,
            role: "owner",
            permissions: "view,add,edit,delete,invite,remove",
          },
        },
      },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Greška pri kreiranju grupe" },
      { status: 500 }
    );
  }
}
