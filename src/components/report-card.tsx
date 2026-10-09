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
  total: number | null;
}

export interface ReportCardData {
  student: { name: string; studentId: string };
  section: { name: string };
  schoolYear: { label: string };
  subjects: ReportCardSubject[];
  overallAverage: number | null;
}

const COMPONENT_LABELS: Record<GradeComponent, string> = {
  QUIZ: "Quizzes (20%)",
  ASSIGNMENT: "Assignments (10%)",
  OTHERS: "Others (10%)",
  EXAM: "Exam (60%)",
};

const COMPONENT_ORDER: GradeComponent[] = [
  "QUIZ",
  "ASSIGNMENT",
  "OTHERS",
  "EXAM",
];

export function SubjectBreakdownTable({
  subject,
}: {
  subject: ReportCardSubject;
}) {
  const groups = COMPONENT_ORDER.map((component) => ({
    component,
    items: subject.items.filter((item) => item.component === component),
  })).filter((group) => group.items.length);
  if (!groups.length)
    return <p className="text-xs text-brand-600">No items recorded.</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
      {groups.map((group) => (
        <table
          key={group.component}
          className="w-full border border-brand-200 bg-white text-left text-xs text-brand-900"
        >
          <caption className="bg-accent-800 p-2 text-left font-semibold text-white">
            {COMPONENT_LABELS[group.component]}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="p-2">
                Date
              </th>
              <th scope="col">Score</th>
              <th scope="col">Maximum</th>
            </tr>
          </thead>
          <tbody>
            {group.items.map((item) => (
              <tr key={item.id} className="border-t border-brand-200">
                <td className="p-2">{item.date.slice(0, 10)}</td>
                <td>{item.score ?? "Not graded"}</td>
                <td>{item.maxScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
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
    <div className="paper-report text-brand-900">
      <div className="mb-6 border-b border-brand-200 pb-4">
        <h2 className="font-display text-2xl font-bold text-brand-900">
          {card.student.name}
        </h2>
        <p className="text-sm text-brand-500">
          Student ID: {card.student.studentId} · {card.section.name} ·{" "}
          {card.schoolYear.label}
        </p>
      </div>

      <div className="space-y-5">
        {subjects.map((subject) => (
          <div
            key={subject.subjectId}
            className="print:overflow-visible overflow-x-auto rounded-lg border border-brand-200 p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-semibold text-brand-900">
                  {subject.subjectName}
                </h4>
                <p className="text-xs text-brand-500">{subject.teacherName}</p>
              </div>
              <span className="text-sm font-bold text-brand-900">
                {subject.total === null
                  ? "Not graded"
                  : subject.total.toFixed(2)}
              </span>
            </div>
            <SubjectBreakdownTable subject={subject} />
          </div>
        ))}
      </div>

      {!subjectFilter && subjects.length > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-lg bg-accent-50 px-4 py-3">
          <span className="font-display text-sm font-semibold text-brand-900">
            Provisional Overall Average
          </span>
          <span className="text-lg font-bold text-accent-700">
            {card.overallAverage === null
              ? "Not graded"
              : card.overallAverage.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
