import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getAuthorizedClassGradeSheet } from "@/lib/class-grade-sheet-data";
import { computeTotalGrade } from "@/lib/grade-math";
import { PrintButton } from "@/components/print-button";

const COMPONENT_ORDER = ["QUIZ", "ASSIGNMENT", "OTHERS", "EXAM"] as const;
const COMPONENT_LABELS: Record<(typeof COMPONENT_ORDER)[number], string> = {
  QUIZ: "Quiz (20%)",
  ASSIGNMENT: "Assignment (10%)",
  OTHERS: "Others (10%)",
  EXAM: "Exam (60%)",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function ClassGradeSheetPrintPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;

  const session = await auth();
  if (!session?.user) notFound();

  const data = await getAuthorizedClassGradeSheet(
    subjectId,
    session.user.id,
    session.user.role === "ADMIN"
  );
  if (!data) notFound();

  const componentGroups = COMPONENT_ORDER.map((component) => ({
    component,
    items: data.gradeItems.filter((i) => i.component === component),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-white px-6 py-10 text-brand-900 print:px-0 print:py-0">
      <div className="mb-8 flex items-start justify-between border-b border-brand-200 pb-6 print:hidden">
        <div>
          <p className="font-display text-lg font-semibold">Al-Furqan Madrasah</p>
          <p className="text-sm text-brand-500">Class Grade Sheet</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/grade-entry?subjectId=${subjectId}`}
            className="rounded-md border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            &larr; Back
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="mb-6 hidden border-b border-black pb-4 print:block">
        <p className="font-display text-xl font-semibold">Al-Furqan Madrasah</p>
        <p className="text-sm">Class Grade Sheet</p>
      </div>

      <div className="mb-6">
        <h2 className="font-display text-xl font-bold">
          {data.subject.name} &middot; {data.subject.section.name}
        </h2>
        <p className="text-sm text-brand-500">
          {data.subject.schoolYear.label} &middot; {data.subject.teacherName}
        </p>
      </div>

      {data.students.length === 0 ? (
        <p className="text-sm text-brand-400">No students enrolled in this section.</p>
      ) : (
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr>
              <th rowSpan={2} className="border border-brand-300 px-3 py-2 align-bottom font-medium">
                Student
              </th>
              {componentGroups.map((g) => (
                <th
                  key={g.component}
                  colSpan={g.items.length}
                  className="border border-brand-300 px-2 py-1.5 text-center font-medium"
                >
                  {COMPONENT_LABELS[g.component]}
                </th>
              ))}
              <th rowSpan={2} className="border border-brand-300 px-3 py-2 align-bottom text-center font-medium">
                Total
              </th>
            </tr>
            <tr>
              {componentGroups.map((g) =>
                g.items.map((item) => (
                  <th
                    key={item.id}
                    className="whitespace-nowrap border border-brand-300 px-2 py-1.5 text-center font-normal"
                  >
                    {formatDate(item.date)} <span className="text-brand-400">/{item.maxScore}</span>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {data.students.map((student) => {
              const total = computeTotalGrade(
                data.gradeItems.map((item) => ({
                  id: item.id,
                  date: item.date,
                  component: item.component,
                  maxScore: item.maxScore,
                  score: item.scores[student.id] ?? null,
                }))
              );
              return (
                <tr key={student.id} style={{ breakInside: "avoid" }}>
                  <td className="border border-brand-200 px-3 py-2 font-medium">
                    {student.name} <span className="text-brand-400">({student.studentId})</span>
                  </td>
                  {componentGroups.map((g) =>
                    g.items.map((item) => (
                      <td key={item.id} className="border border-brand-200 px-2 py-1.5 text-center">
                        {item.scores[student.id] ?? "—"}
                      </td>
                    ))
                  )}
                  <td className="border border-brand-200 px-3 py-1.5 text-center font-semibold">
                    {total.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <p className="mt-10 text-center text-xs text-brand-400 print:text-black">
        Generated {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  );
}
