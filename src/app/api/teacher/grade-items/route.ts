import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function canAccessAssignment(assignmentId: string) {
  const session = await auth();
  if (!session?.user) return false;

  const assignment = await prisma.teachingAssignment.findUnique({
    where: { id: assignmentId },
    include: { teacher: { select: { userId: true } } },
  });

  if (!assignment) return false;
  const isOwner = assignment.teacher.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  return isOwner || isAdmin;
}

export async function POST(req: NextRequest) {
  const { teachingAssignmentId, title, component, maxScore } = await req.json();

  if (!teachingAssignmentId || !title || !component) {
    return NextResponse.json(
      { error: "teachingAssignmentId, title, and component are required" },
      { status: 400 }
    );
  }

  const allowed = await canAccessAssignment(teachingAssignmentId);
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gradeItem = await prisma.gradeItem.create({
    data: {
      teachingAssignmentId,
      title,
      component,
      maxScore: maxScore ? Number(maxScore) : 100,
    },
  });

  return NextResponse.json(gradeItem, { status: 201 });
}
