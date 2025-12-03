import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyGroupMembers } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Neautorizovano" }, { status: 401 });
  }

  try {
    // Pronađi članstvo korisnika
    const allMemberships = await prisma.groupMember.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        group: {
          include: {
            members: true,
          },
        },
      },
    });

    const membership = allMemberships.find((m: any) => !m.leftAt);

    if (!membership) {
      return NextResponse.json(
        { error: "Niste član nijedne grupe" },
        { status: 404 }
      );
    }

    const groupId = membership.groupId;
    const activeMembersCount = membership.group.members.filter((m: any) => !m.leftAt).length;

    // Označi da je korisnik napustio grupu
    await prisma.groupMember.update({
      where: { id: membership.id },
      data: { leftAt: new Date() },
    });

    // Dobavi ime korisnika za notifikaciju
    const leavingUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true }
    });

    // Pošalji notifikaciju ostalim članovima
    await notifyGroupMembers(
      groupId,
      user.userId, // exclude the person who left
      {
        type: "GROUP_LEAVE",
        title: "Član je napustio grupu",
        message: `${leavingUser?.name || 'Član'} je napustio grupu`,
      }
    ).catch(err => {
      console.error("Failed to send leave notification:", err);
    });

    // Ako je ovo bio poslednji član, obriši grupu
    if (activeMembersCount === 1) {
      await prisma.$transaction([
        // Obriši sve invite tokene
        prisma.inviteToken.deleteMany({
          where: { groupId },
        }),
        // Obriši sve članove (uključujući istorijske)
        prisma.groupMember.deleteMany({
          where: { groupId },
        }),
        // Obriši grupu
        prisma.group.delete({
          where: { id: groupId },
        }),
      ]);

      return NextResponse.json({
        success: true,
        groupDeleted: true,
        message: "Napustili ste grupu. Grupa je obrisana jer nema više članova.",
      });
    }

    // Ako je owner napustio grupu, dodeli ownership drugom članu
    if (membership.role === "owner") {
      const newOwner = membership.group.members.find(
        (m) => m.userId !== user.userId
      );

      if (newOwner) {
        await prisma.$transaction([
          prisma.groupMember.update({
            where: { id: newOwner.id },
            data: {
              role: "owner",
              permissions: "view,add,edit,delete,invite,remove",
            },
          }),
          prisma.group.update({
            where: { id: groupId },
            data: { ownerId: newOwner.userId },
          }),
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      groupDeleted: false,
      message: "Uspešno ste napustili grupu",
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    return NextResponse.json(
      { error: "Greška pri napuštanju grupe" },
      { status: 500 }
    );
  }
}
