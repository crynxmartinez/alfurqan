import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getAuthorizedSubject(subjectId: string) {
  const session = await auth();
  if (!session?.user) return { session: null, subject: null };

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      section: {
        select: { id: true, name: true, schoolYear: { select: { id: true, label: true } } },
      },
      teacher: { select: { userId: true } },
    },
  });

  if (!subject) return { session, subject: null };

  const isOwner = subject.teacher.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return { session, subject: null };

  return { session, subject };
}

export async function GET(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get("subjectId");
  if (!subjectId) {
    return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
  }

  const { subject } = await getAuthorizedSubject(subjectId);
  if (!subject) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [gradeItems, enrollments] = await Promise.all([
    prisma.gradeItem.findMany({
      where: { subjectId },
      orderBy: [{ component: "asc" }, { date: "asc" }],
      include: { entries: { select: { studentId: true, score: true } } },
    }),
    prisma.enrollment.findMany({
      where: { sectionId: subject.sectionId },
      orderBy: { student: { name: "asc" } },
      select: { student: { select: { id: true, studentId: true, name: true } } },
    }),
  ]);

  return NextResponse.json({
    subject: {
      id: subject.id,
      name: subject.name,
      section: subject.section,
      schoolYear: subject.section.schoolYear,
    },
    students: enrollments.map((e) => e.student),
    gradeItems: gradeItems.map((item) => ({
      id: item.id,
      date: item.date,
      component: item.component,
      maxScore: item.maxScore,
      scores: Object.fromEntries(item.entries.map((e) => [e.studentId, e.score])),
    })),
  });
}
