import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId, gradeItemId, score } = await req.json();
  if (!studentId || !gradeItemId) {
    return NextResponse.json(
      { error: "studentId and gradeItemId are required" },
      { status: 400 }
    );
  }

  const item = await prisma.gradeItem.findUnique({
    where: { id: gradeItemId },
    include: {
      subject: { include: { teacher: { select: { userId: true } } } },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Grade item not found" }, { status: 404 });
  }

  const isOwner = item.subject.teacher.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (score === null || score === "") {
    await prisma.gradeEntry.deleteMany({ where: { studentId, gradeItemId } });
    return NextResponse.json({ success: true, score: null });
  }

  const entry = await prisma.gradeEntry.upsert({
    where: { studentId_gradeItemId: { studentId, gradeItemId } },
    update: { score: Number(score) },
    create: { studentId, gradeItemId, score: Number(score) },
  });

  return NextResponse.json(entry);
}
