import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function canAccessSubject(subjectId: string) {
  const session = await auth();
  if (!session?.user) return false;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: { teacher: { select: { userId: true } } },
  });

  if (!subject) return false;
  const isOwner = subject.teacher.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  return isOwner || isAdmin;
}

export async function POST(req: NextRequest) {
  const { subjectId, title, component, maxScore } = await req.json();

  if (!subjectId || !title || !component) {
    return NextResponse.json(
      { error: "subjectId, title, and component are required" },
      { status: 400 }
    );
  }

  const allowed = await canAccessSubject(subjectId);
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gradeItem = await prisma.gradeItem.create({
    data: {
      subjectId,
      title,
      component,
      maxScore: maxScore ? Number(maxScore) : 100,
    },
  });

  return NextResponse.json(gradeItem, { status: 201 });
}
