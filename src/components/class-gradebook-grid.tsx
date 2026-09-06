import type { ClassGradeSheetData } from "@/lib/class-grade-sheet-data";

// Always renders in a fixed light "paper" palette (no dark: classes) —
// same convention as src/components/report-card.tsx — since this grid is
// meant to be printed/saved-as-PDF exactly as shown on screen.

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

export function ClassGradebookGrid({ data }: { data: ClassGradeSheetData }) {
  const componentGroups = COMPONENT_ORDER.map((component) => ({
    component,
    items: data.gradeItems.filter((i) => i.component === component),
  })).filter((g) => g.items.length > 0);

  if (data.students.length === 0) {
    return <p className="text-sm text-brand-400">No students enrolled in this section.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-200 bg-white">
      <table className="w-full text-left text-sm text-brand-900">
        <thead className="bg-accent-800 text-white">
          <tr>
            <th
              rowSpan={2}
              className="sticky left-0 z-20 min-w-[160px] bg-accent-800 px-4 py-3 align-bottom font-medium"
            >
              Student
            </th>
            {componentGroups.map((g) => (
              <th
                key={g.component}
                colSpan={g.items.length}
                className="border-l border-accent-700 px-3 py-2 text-center font-medium"
              >
                {COMPONENT_LABELS[g.component]}
              </th>
            ))}
            <th
              rowSpan={2}
              className="min-w-[90px] border-l border-accent-700 px-3 py-3 text-center align-bottom font-medium"
            >
              Total
            </th>
          </tr>
          <tr>
            {componentGroups.map((g) =>
              g.items.map((item) => (
                <th
                  key={item.id}
                  className="whitespace-nowrap border-l border-t border-accent-700 px-2 py-2 text-center font-normal"
                >
                  {formatDate(item.date)} <span className="text-brand-300">/{item.maxScore}</span>
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-100">
          {data.students.map((student) => (
            <tr key={student.id} style={{ breakInside: "avoid" }}>
              <td className="sticky left-0 z-10 bg-white px-4 py-2 font-medium text-brand-900">
                {student.name} <span className="text-brand-400">({student.studentId})</span>
              </td>
              {componentGroups.map((g) =>
                g.items.map((item) => (
                  <td key={item.id} className="border-l border-brand-100 px-2 py-2 text-center">
                    {item.scores[student.id] ?? "—"}
                  </td>
                ))
              )}
              <td className="border-l border-brand-200 px-3 py-2 text-center font-semibold text-brand-900">
                {student.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
