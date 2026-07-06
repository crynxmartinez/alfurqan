import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function canAccessItem(itemId: string) {
  const session = await auth();
  if (!session?.user) return false;

  const item = await prisma.gradeItem.findUnique({
    where: { id: itemId },
    include: {
      teachingAssignment: { include: { teacher: { select: { userId: true } } } },
    },
  });

  if (!item) return false;
  const isOwner = item.teachingAssignment.teacher.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  return isOwner || isAdmin;
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const allowed = await canAccessItem(id);
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.gradeItem.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
