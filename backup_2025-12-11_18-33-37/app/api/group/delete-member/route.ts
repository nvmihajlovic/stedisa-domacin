import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Niste prijavljeni" }, { status: 401 });
    }

    let user: any;
    try {
      const { payload } = await jose.jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      user = payload;
    } catch {
      return NextResponse.json({ error: "Nevažeća sesija" }, { status: 401 });
    }

    const { memberIdToDelete } = await req.json();

    if (!memberIdToDelete) {
      return NextResponse.json(
        { error: "ID člana je obavezan" },
        { status: 400 }
      );
    }

    // Pronađi membership trenutnog korisnika
    const currentUserMembership = await prisma.groupMember.findFirst({
      where: { userId: user.userId, leftAt: null },
      include: { group: true },
    });

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: "Niste član grupe" },
        { status: 403 }
      );
    }

    const groupId = currentUserMembership.group.id;

    // Proveri dozvole - samo owner i admin mogu da brišu
    if (
      currentUserMembership.role !== "owner" &&
      currentUserMembership.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Nemate dozvolu za brisanje članova" },
        { status: 403 }
      );
    }

    // Pronađi člana za brisanje
    const memberToDelete = await prisma.groupMember.findUnique({
      where: { id: memberIdToDelete },
      include: { user: true },
    });

    if (!memberToDelete || memberToDelete.groupId !== groupId) {
      return NextResponse.json({ error: "Član nije pronađen" }, { status: 404 });
    }

    // Ne može se obrisati owner
    if (memberToDelete.role === "owner") {
      return NextResponse.json(
        { error: "Vlasnik grupe ne može biti obrisan" },
        { status: 403 }
      );
    }

    // Admin ne može da obriše drugog admina (samo owner može)
    if (
      memberToDelete.role === "admin" &&
      currentUserMembership.role !== "owner"
    ) {
      return NextResponse.json(
        { error: "Samo vlasnik može obrisati administratora" },
        { status: 403 }
      );
    }

    // Član MORA biti neaktivan (leftAt !== null) da bi se mogao obrisati
    if (!memberToDelete.leftAt) {
      return NextResponse.json(
        { error: "Samo neaktivni članovi mogu biti obrisani. Prvo uklonite člana iz grupe." },
        { status: 400 }
      );
    }

    // Obrisi sve transakcije (troškove i prihode) člana u ovoj grupi
    await prisma.$transaction([
      prisma.expense.deleteMany({
        where: {
          userId: memberToDelete.userId,
          groupId: groupId,
        },
      }),
      prisma.income.deleteMany({
        where: {
          userId: memberToDelete.userId,
          groupId: groupId,
        },
      }),
      // Obrisi membership
      prisma.groupMember.delete({
        where: { id: memberIdToDelete },
      }),
    ]);

    return NextResponse.json({
      message: `Član ${memberToDelete.user.name} je trajno obrisan iz grupe`,
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json(
      { error: "Greška pri brisanju člana" },
      { status: 500 }
    );
  }
}
