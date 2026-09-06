import { prisma } from "@/lib/prisma";
import { computeTotalGrade, computeOverallAverage } from "@/lib/grades";
import type { ReportCardData } from "@/components/report-card";

// Shared by the public grade-lookup API route and the printable transcript
// page, so both render from exactly the same data shape and aggregation.
export async function getStudentReportCard(
  sectionId: string,
  studentId: string
): Promise<ReportCardData | null> {
  const [section, subjectsData, student] = await Promise.all([
    prisma.section.findUnique({
      where: { id: sectionId },
      select: { name: true, schoolYear: { select: { label: true } } },
    }),
    prisma.subject.findMany({
      where: { sectionId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        teacher: { select: { user: { select: { name: true } } } },
        gradeItems: {
          orderBy: [{ component: "asc" }, { date: "asc" }],
          select: {
            id: true,
            date: true,
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

  if (!student || !section) return null;

  const subjects = subjectsData.map((subject) => {
    const items = subject.gradeItems.map((item) => ({
      id: item.id,
      date: item.date.toISOString(),
      component: item.component,
      maxScore: item.maxScore,
      score: item.entries[0]?.score ?? null,
    }));

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      teacherName: subject.teacher.user.name,
      items,
      total: computeTotalGrade(items),
    };
  });

  const overallAverage = computeOverallAverage(subjects.map((s) => s.total));

  return {
    student,
    section: { name: section.name },
    schoolYear: { label: section.schoolYear.label },
    subjects,
    overallAverage,
  };
}
