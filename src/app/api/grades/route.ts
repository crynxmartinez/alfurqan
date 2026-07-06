import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeTotalGrade } from "@/lib/grades";

export async function GET(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get("subjectId");
  if (!subjectId) {
    return NextResponse.json([]);
  }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: {
      sectionId: true,
      section: { select: { schoolYearId: true } },
      gradeItems: {
        select: {
          id: true,
          title: true,
          component: true,
          maxScore: true,
          entries: { select: { studentId: true, score: true } },
        },
      },
    },
  });

  if (!subject) {
    return NextResponse.json([]);
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      sectionId: subject.sectionId,
      schoolYearId: subject.section.schoolYearId,
    },
    select: { student: { select: { id: true, name: true, studentId: true } } },
    orderBy: { student: { name: "asc" } },
  });

  const results = enrollments.map(({ student }) => {
    const items = subject.gradeItems.map((item) => {
      const entry = item.entries.find((e) => e.studentId === student.id);
      return {
        id: item.id,
        title: item.title,
        component: item.component,
        maxScore: item.maxScore,
        score: entry ? entry.score : null,
      };
    });

    return {
      studentId: student.id,
      studentCode: student.studentId,
      name: student.name,
      total: computeTotalGrade(items),
    };
  });

  return NextResponse.json(results);
}
