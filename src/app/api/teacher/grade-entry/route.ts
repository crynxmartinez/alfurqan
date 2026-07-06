import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getAuthorizedAssignment(assignmentId: string) {
  const session = await auth();
  if (!session?.user) return { session: null, assignment: null };

  const assignment = await prisma.teachingAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      subject: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      schoolYear: { select: { id: true, label: true } },
      teacher: { select: { userId: true } },
    },
  });

  if (!assignment) return { session, assignment: null };

  const isOwner = assignment.teacher.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return { session, assignment: null };

  return { session, assignment };
}

export async function GET(req: NextRequest) {
  const assignmentId = req.nextUrl.searchParams.get("assignmentId");
  if (!assignmentId) {
    return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
  }

  const { assignment } = await getAuthorizedAssignment(assignmentId);
  if (!assignment) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [gradeItems, enrollments] = await Promise.all([
    prisma.gradeItem.findMany({
      where: { teachingAssignmentId: assignmentId },
      orderBy: [{ component: "asc" }, { createdAt: "asc" }],
      include: { entries: { select: { studentId: true, score: true } } },
    }),
    prisma.enrollment.findMany({
      where: { sectionId: assignment.sectionId },
      orderBy: { student: { name: "asc" } },
      select: { student: { select: { id: true, studentId: true, name: true } } },
    }),
  ]);

  return NextResponse.json({
    assignment: {
      id: assignment.id,
      subject: assignment.subject,
      section: assignment.section,
      schoolYear: assignment.schoolYear,
    },
    students: enrollments.map((e) => e.student),
    gradeItems: gradeItems.map((item) => ({
      id: item.id,
      title: item.title,
      component: item.component,
      maxScore: item.maxScore,
      scores: Object.fromEntries(item.entries.map((e) => [e.studentId, e.score])),
    })),
  });
}
