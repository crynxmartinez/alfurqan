import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeTotalGrade, computeOverallAverage } from "@/lib/grades";

// Lists students enrolled in a section, with either a specific subject's
// grade (if subjectId is provided) or their overall average across all
// subjects taught in that section for that school year.
export async function GET(req: NextRequest) {
  const sectionId = req.nextUrl.searchParams.get("sectionId");
  const subjectId = req.nextUrl.searchParams.get("subjectId");

  if (!sectionId) {
    return NextResponse.json([]);
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { sectionId },
    select: { student: { select: { id: true, name: true, studentId: true } } },
    orderBy: { student: { name: "asc" } },
  });

  const assignments = await prisma.teachingAssignment.findMany({
    where: { sectionId, ...(subjectId ? { subjectId } : {}) },
    select: {
      subjectId: true,
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

  const results = enrollments.map(({ student }) => {
    const subjectTotals = assignments.map((assignment) => {
      const items = assignment.gradeItems.map((item) => {
        const entry = item.entries.find((e) => e.studentId === student.id);
        return {
          id: item.id,
          title: item.title,
          component: item.component,
          maxScore: item.maxScore,
          score: entry ? entry.score : null,
        };
      });
      return computeTotalGrade(items);
    });

    const grade = subjectId
      ? (subjectTotals[0] ?? 0)
      : computeOverallAverage(subjectTotals);

    return {
      studentId: student.id,
      studentCode: student.studentId,
      name: student.name,
      total: grade,
    };
  });

  return NextResponse.json(results);
}
