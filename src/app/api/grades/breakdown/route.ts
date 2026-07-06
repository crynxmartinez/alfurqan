import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeTotalGrade, computeOverallAverage } from "@/lib/grades";

// Full report card: every subject taught in the student's section, each
// with its Quiz/Assignment/Exam item breakdown and subject total, plus an
// overall average across all subjects.
export async function GET(req: NextRequest) {
  const sectionId = req.nextUrl.searchParams.get("sectionId");
  const studentId = req.nextUrl.searchParams.get("studentId");

  if (!sectionId || !studentId) {
    return NextResponse.json(
      { error: "sectionId and studentId are required" },
      { status: 400 }
    );
  }

  const [assignments, student] = await Promise.all([
    prisma.teachingAssignment.findMany({
      where: { sectionId },
      orderBy: { subject: { name: "asc" } },
      select: {
        id: true,
        subject: { select: { id: true, name: true } },
        gradeItems: {
          orderBy: [{ component: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            title: true,
            component: true,
            maxScore: true,
            entries: {
              where: { studentId },
              select: { score: true },
            },
          },
        },
      },
    }),
    prisma.student.findUnique({
      where: { id: studentId },
      select: { name: true, studentId: true },
    }),
  ]);

  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const subjects = assignments.map((assignment) => {
    const items = assignment.gradeItems.map((item) => ({
      id: item.id,
      title: item.title,
      component: item.component,
      maxScore: item.maxScore,
      score: item.entries[0]?.score ?? null,
    }));

    return {
      subjectId: assignment.subject.id,
      subjectName: assignment.subject.name,
      items,
      total: computeTotalGrade(items),
    };
  });

  const overallAverage = computeOverallAverage(subjects.map((s) => s.total));

  return NextResponse.json({
    student,
    subjects,
    overallAverage,
  });
}
