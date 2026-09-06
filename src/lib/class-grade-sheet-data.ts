import { prisma } from "@/lib/prisma";
import type { GradeComponent } from "@prisma/client";
import { computeTotalGrade } from "@/lib/grade-math";

export interface ClassGradeSheetData {
  subject: {
    id: string;
    name: string;
    section: { name: string };
    schoolYear: { label: string };
    teacherName: string;
  };
  students: { id: string; studentId: string; name: string; total: number }[];
  gradeItems: {
    id: string;
    date: string;
    component: GradeComponent;
    maxScore: number;
    scores: Record<string, number>;
  }[];
}

// Core query, no authorization — every enrolled student's scores across
// every grade item in a subject, plus each student's precomputed total.
// Shared by the public whole-class gradebook and (via the authorized
// wrapper below) the teacher grade-entry API route and its printable page.
export async function getClassGradeSheet(subjectId: string): Promise<ClassGradeSheetData | null> {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      section: { select: { id: true, name: true, schoolYear: { select: { label: true } } } },
      teacher: { select: { userId: true, user: { select: { name: true } } } },
    },
  });

  if (!subject) return null;

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

  const items = gradeItems.map((item) => ({
    id: item.id,
    date: item.date.toISOString(),
    component: item.component,
    maxScore: item.maxScore,
    scores: Object.fromEntries(item.entries.map((e) => [e.studentId, e.score])),
  }));

  const students = enrollments.map(({ student }) => ({
    ...student,
    total: computeTotalGrade(
      items.map((item) => ({
        id: item.id,
        date: item.date,
        component: item.component,
        maxScore: item.maxScore,
        score: item.scores[student.id] ?? null,
      }))
    ),
  }));

  return {
    subject: {
      id: subject.id,
      name: subject.name,
      section: { name: subject.section.name },
      schoolYear: subject.section.schoolYear,
      teacherName: subject.teacher.user.name,
    },
    students,
    gradeItems: items,
  };
}

// Authorized wrapper used by the teacher-facing grade-entry API route and
// its printable class-sheet page. Returns null if the subject doesn't
// exist or the given user isn't its teacher (unless isAdmin is true).
export async function getAuthorizedClassGradeSheet(
  subjectId: string,
  userId: string,
  isAdmin: boolean
): Promise<ClassGradeSheetData | null> {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { teacher: { select: { userId: true } } },
  });

  if (!subject) return null;

  const isOwner = subject.teacher.userId === userId;
  if (!isOwner && !isAdmin) return null;

  return getClassGradeSheet(subjectId);
}
