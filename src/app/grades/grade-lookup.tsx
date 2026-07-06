"use client";

import { useEffect, useState } from "react";

interface Option {
  id: string;
  name?: string;
  label?: string;
}

interface GradeRow {
  studentId: string;
  studentCode: string;
  name: string;
  total: number;
}

interface BreakdownItem {
  id: string;
  title: string;
  component: "QUIZ" | "ASSIGNMENT" | "EXAM";
  maxScore: number;
  score: number | null;
}

interface Breakdown {
  subjectName: string;
  student: { name: string; studentId: string };
  items: BreakdownItem[];
  total: number;
}

const COMPONENT_LABELS: Record<BreakdownItem["component"], string> = {
  QUIZ: "Quizzes (20%)",
  ASSIGNMENT: "Assignments (20%)",
  EXAM: "Exam (60%)",
};

export function GradeLookup() {
  const [schoolYears, setSchoolYears] = useState<Option[]>([]);
  const [sections, setSections] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);

  const [schoolYearId, setSchoolYearId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [rows, setRows] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  // Load school years on mount
  useEffect(() => {
    fetch("/api/school-years")
      .then((r) => r.json())
      .then(setSchoolYears)
      .catch(() => setSchoolYears([]));
  }, []);

  // Load sections when school year changes
  useEffect(() => {
    setSectionId("");
    setSubjectId("");
    setSections([]);
    setSubjects([]);
    setRows([]);
    if (!schoolYearId) return;
    fetch(`/api/sections?schoolYearId=${schoolYearId}`)
      .then((r) => r.json())
      .then(setSections)
      .catch(() => setSections([]));
  }, [schoolYearId]);

  // Load subjects when section changes
  useEffect(() => {
    setSubjectId("");
    setSubjects([]);
    setRows([]);
    if (!sectionId) return;
    fetch(`/api/subjects?sectionId=${sectionId}`)
      .then((r) => r.json())
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, [sectionId]);

  // Load grades when subject changes
  useEffect(() => {
    setRows([]);
    if (!subjectId) return;
    setLoading(true);
    fetch(`/api/grades?subjectId=${subjectId}`)
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [subjectId]);

  async function openBreakdown(studentId: string) {
    setBreakdownLoading(true);
    setBreakdown(null);
    try {
      const res = await fetch(
        `/api/grades/breakdown?subjectId=${subjectId}&studentId=${studentId}`
      );
      const data = await res.json();
      setBreakdown(data);
    } finally {
      setBreakdownLoading(false);
    }
  }

  const grouped = breakdown
    ? (["QUIZ", "ASSIGNMENT", "EXAM"] as const).map((component) => ({
        component,
        items: breakdown.items.filter((i) => i.component === component),
      }))
    : [];

  return (
    <div>
      {/* Filters */}
      <div className="grid gap-4 rounded-xl border border-brand-200 bg-brand-50 p-6 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
            School Year
          </label>
          <select
            value={schoolYearId}
            onChange={(e) => setSchoolYearId(e.target.value)}
            className="w-full rounded-md border border-brand-300 bg-white px-3 py-2 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
          >
            <option value="">Select year</option>
            {schoolYears.map((sy) => (
              <option key={sy.id} value={sy.id}>
                {sy.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
            Class / Section
          </label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            disabled={!schoolYearId}
            className="w-full rounded-md border border-brand-300 bg-white px-3 py-2 text-sm text-brand-900 focus:border-brand-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-brand-100"
          >
            <option value="">Select class</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
            Subject
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={!sectionId}
            className="w-full rounded-md border border-brand-300 bg-white px-3 py-2 text-sm text-brand-900 focus:border-brand-600 focus:outline-none disabled:cursor-not-allowed disabled:bg-brand-100"
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 overflow-hidden rounded-xl border border-brand-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-900 text-white">
            <tr>
              <th className="px-5 py-3 font-medium">Student Name</th>
              <th className="px-5 py-3 font-medium">Student ID</th>
              <th className="px-5 py-3 text-right font-medium">Total Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {loading && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-brand-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && subjectId && rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-brand-500">
                  No records found.
                </td>
              </tr>
            )}
            {!loading && !subjectId && (
              <tr>
                <td colSpan={3} className="px-5 py-6 text-center text-brand-500">
                  Select school year, class, and subject to view grades.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.studentId}
                onClick={() => openBreakdown(row.studentId)}
                className="cursor-pointer hover:bg-brand-50"
              >
                <td className="px-5 py-3 font-medium text-brand-900">
                  {row.name}
                </td>
                <td className="px-5 py-3 text-brand-600">{row.studentCode}</td>
                <td className="px-5 py-3 text-right font-semibold text-brand-900">
                  {row.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {(breakdown || breakdownLoading) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setBreakdown(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            {breakdownLoading && (
              <p className="py-10 text-center text-brand-500">Loading...</p>
            )}
            {breakdown && !breakdownLoading && (
              <>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-brand-900">
                      {breakdown.student.name}
                    </h3>
                    <p className="text-xs text-brand-500">
                      {breakdown.student.studentId} &middot;{" "}
                      {breakdown.subjectName}
                    </p>
                  </div>
                  <button
                    onClick={() => setBreakdown(null)}
                    className="rounded-full p-1 text-brand-400 hover:bg-brand-100 hover:text-brand-700"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {grouped.map(({ component, items }) => (
                  <div key={component} className="mb-5">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-500">
                      {COMPONENT_LABELS[component]}
                    </h4>
                    {items.length === 0 ? (
                      <p className="text-sm text-brand-400">No items recorded.</p>
                    ) : (
                      <ul className="space-y-1">
                        {items.map((item) => (
                          <li
                            key={item.id}
                            className="flex justify-between rounded-md bg-brand-50 px-3 py-2 text-sm"
                          >
                            <span className="text-brand-700">{item.title}</span>
                            <span className="font-medium text-brand-900">
                              {item.score ?? "—"} / {item.maxScore}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                <div className="mt-6 flex items-center justify-between rounded-md bg-brand-900 px-4 py-3 text-white">
                  <span className="text-sm font-medium">Total Grade</span>
                  <span className="text-lg font-bold">
                    {breakdown.total.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
