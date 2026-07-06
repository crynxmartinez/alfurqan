import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeTotalGrade } from "@/lib/grades";

export async function GET(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get("subjectId");
  const studentId = req.nextUrl.searchParams.get("studentId");

  if (!subjectId || !studentId) {
    return NextResponse.json(
      { error: "subjectId and studentId are required" },
      { status: 400 }
    );
  }

  const [subject, student] = await Promise.all([
    prisma.subject.findUnique({
      where: { id: subjectId },
      select: {
        name: true,
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

  if (!subject || !student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items = subject.gradeItems.map((item) => ({
    id: item.id,
    title: item.title,
    component: item.component,
    maxScore: item.maxScore,
    score: item.entries[0]?.score ?? null,
  }));

  return NextResponse.json({
    subjectName: subject.name,
    student,
    items,
    total: computeTotalGrade(items),
  });
}
