// Always renders in a fixed light "paper" palette, regardless of the
// viewer's OS/browser color-scheme preference — this is shown both inside
// the (possibly dark-themed) grade-lookup modal and on the printable
// transcript page, which must stay readable on white paper either way.

export type GradeComponent = "QUIZ" | "ASSIGNMENT" | "OTHERS" | "EXAM";

export interface BreakdownItem {
  id: string;
  date: string;
  component: GradeComponent;
  maxScore: number;
  score: number | null;
}

export interface ReportCardSubject {
  subjectId: string;
  subjectName: string;
  teacherName: string;
  items: BreakdownItem[];
  total: number;
}

export interface ReportCardData {
  student: { name: string; studentId: string };
  section: { name: string };
  schoolYear: { label: string };
  subjects: ReportCardSubject[];
  overallAverage: number;
}

const COMPONENT_LABELS: Record<GradeComponent, string> = {
  QUIZ: "Quizzes (20%)",
  ASSIGNMENT: "Assignments (10%)",
  OTHERS: "Others (10%)",
  EXAM: "Exam (60%)",
};

const COMPONENT_ORDER: GradeComponent[] = ["QUIZ", "ASSIGNMENT", "OTHERS", "EXAM"];

export function SubjectBreakdownTable({ subject }: { subject: ReportCardSubject }) {
  const groups = COMPONENT_ORDER.map((component) => ({
    component,
    items: subject.items.filter((i) => i.component === component),
  })).filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return <p className="text-xs text-brand-400">No items recorded.</p>;
  }

  return (
    <table className="w-full overflow-hidden rounded-lg border border-brand-200 bg-white text-left text-xs text-brand-900">
      <thead className="bg-accent-800 text-white">
        <tr>
          {groups.map((g) => (
            <th
              key={g.component}
              colSpan={g.items.length}
              className="border-l border-accent-700 px-2 py-1.5 text-center font-medium first:border-l-0"
            >
              {COMPONENT_LABELS[g.component]}
            </th>
          ))}
          <th rowSpan={2} className="border-l border-accent-700 px-3 py-1.5 text-center font-medium">
            Total
          </th>
        </tr>
        <tr>
          {groups.map((g) =>
            g.items.map((item) => (
              <th
                key={item.id}
                className="whitespace-nowrap border-l border-t border-accent-700 px-2 py-1.5 text-center font-normal first:border-l-0"
              >
                {new Date(item.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}{" "}
                <span className="text-brand-300">/{item.maxScore}</span>
              </th>
            ))
          )}
        </tr>
      </thead>
      <tbody>
        <tr>
          {groups.map((g) =>
            g.items.map((item) => (
              <td key={item.id} className="border-l border-t border-brand-100 px-2 py-1.5 text-center first:border-l-0">
                {item.score ?? "—"}
              </td>
            ))
          )}
          <td className="border-l border-t border-brand-200 px-3 py-1.5 text-center font-semibold text-brand-900">
            {subject.total.toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function ReportCardView({
  card,
  subjectFilter,
}: {
  card: ReportCardData;
  subjectFilter?: string;
}) {
  const subjects = subjectFilter
    ? card.subjects.filter((s) => s.subjectId === subjectFilter)
    : card.subjects;

  return (
    <div className="text-brand-900">
      <div className="mb-6 border-b border-brand-200 pb-4">
        <h2 className="font-display text-2xl font-bold text-brand-900">{card.student.name}</h2>
        <p className="text-sm text-brand-500">
          Student ID: {card.student.studentId} · {card.section.name} · {card.schoolYear.label}
        </p>
      </div>

      <div className="space-y-5">
        {subjects.map((subject) => (
          <div
            key={subject.subjectId}
            className="overflow-x-auto rounded-lg border border-brand-200 p-4"
            style={{ breakInside: "avoid" }}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-semibold text-brand-900">
                  {subject.subjectName}
                </h4>
                <p className="text-xs text-brand-500">{subject.teacherName}</p>
              </div>
              <span className="text-sm font-bold text-brand-900">{subject.total.toFixed(2)}</span>
            </div>
            <SubjectBreakdownTable subject={subject} />
          </div>
        ))}
      </div>

      {!subjectFilter && subjects.length > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-lg bg-accent-50 px-4 py-3">
          <span className="font-display text-sm font-semibold text-brand-900">Overall Average</span>
          <span className="text-lg font-bold text-accent-700">{card.overallAverage.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
