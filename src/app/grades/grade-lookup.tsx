"use client";

import { Fragment, useEffect, useState } from "react";

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
  date: string;
  component: "QUIZ" | "ASSIGNMENT" | "OTHERS" | "EXAM";
  maxScore: number;
  score: number | null;
}

interface ReportCardSubject {
  subjectId: string;
  subjectName: string;
  items: BreakdownItem[];
  total: number;
}

interface ReportCard {
  student: { name: string; studentId: string };
  subjects: ReportCardSubject[];
  overallAverage: number;
}

const COMPONENT_LABELS: Record<BreakdownItem["component"], string> = {
  QUIZ: "Quizzes (20%)",
  ASSIGNMENT: "Assignments (10%)",
  OTHERS: "Others (10%)",
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

  const [reportCards, setReportCards] = useState<Record<string, ReportCard>>({});
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [expandLoadingId, setExpandLoadingId] = useState<string | null>(null);

  const [modalStudentId, setModalStudentId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

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
    setReportCards({});
    setExpandedStudentId(null);
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
    if (!sectionId) return;
    fetch(`/api/subjects?sectionId=${sectionId}`)
      .then((r) => r.json())
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, [sectionId]);

  // Load grades when section or subject changes
  useEffect(() => {
    setRows([]);
    setReportCards({});
    setExpandedStudentId(null);
    if (!sectionId) return;
    setLoading(true);
    const url = subjectId
      ? `/api/grades?sectionId=${sectionId}&subjectId=${subjectId}`
      : `/api/grades?sectionId=${sectionId}`;
    fetch(url)
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [sectionId, subjectId]);

  async function fetchReportCard(studentId: string): Promise<ReportCard | null> {
    if (reportCards[studentId]) return reportCards[studentId];
    const res = await fetch(
      `/api/grades/breakdown?sectionId=${sectionId}&studentId=${studentId}`
    );
    if (!res.ok) return null;
    const data: ReportCard = await res.json();
    setReportCards((prev) => ({ ...prev, [studentId]: data }));
    return data;
  }

  async function toggleExpand(studentId: string) {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null);
      return;
    }
    setExpandedStudentId(studentId);
    if (!reportCards[studentId]) {
      setExpandLoadingId(studentId);
      await fetchReportCard(studentId);
      setExpandLoadingId(null);
    }
  }

  async function openModal(studentId: string) {
    setModalStudentId(studentId);
    if (!reportCards[studentId]) {
      setModalLoading(true);
      await fetchReportCard(studentId);
      setModalLoading(false);
    }
  }

  const modalCard = modalStudentId ? reportCards[modalStudentId] : null;
  const currentSchoolYear = schoolYears.find((sy) => sy.id === schoolYearId);

  function groupBySubjectFilter(card: ReportCard): ReportCardSubject[] {
    if (!subjectId) return card.subjects;
    return card.subjects.filter((s) => s.subjectId === subjectId);
  }

  function SubjectBreakdownTable({ subject }: { subject: ReportCardSubject }) {
    const groups = (["QUIZ", "ASSIGNMENT", "OTHERS", "EXAM"] as const)
      .map((component) => ({
        component,
        items: subject.items.filter((i) => i.component === component),
      }))
      .filter((g) => g.items.length > 0);

    if (groups.length === 0) {
      return <p className="text-xs text-brand-400">No items recorded.</p>;
    }

    return (
      <table className="w-full overflow-hidden rounded-lg border border-brand-200 bg-white text-left text-xs">
        <thead className="bg-brand-900 text-white">
          <tr>
            {groups.map((g) => (
              <th
                key={g.component}
                colSpan={g.items.length}
                className="border-l border-brand-800 px-2 py-1.5 text-center font-medium first:border-l-0"
              >
                {COMPONENT_LABELS[g.component]}
              </th>
            ))}
            <th rowSpan={2} className="border-l border-brand-800 px-3 py-1.5 text-center font-medium">
              Total
            </th>
          </tr>
          <tr>
            {groups.map((g) =>
              g.items.map((item) => (
                <th
                  key={item.id}
                  className="whitespace-nowrap border-l border-t border-brand-800 px-2 py-1.5 text-center font-normal first:border-l-0"
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
                <td
                  key={item.id}
                  className="border-l border-t border-brand-100 px-2 py-1.5 text-center first:border-l-0"
                >
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
              <th className="w-10 px-3 py-3"></th>
              <th className="px-5 py-3 font-medium">Student Name</th>
              <th className="px-5 py-3 font-medium">Student ID</th>
              <th className="px-5 py-3 text-right font-medium">
                {subjectId ? "Grade" : "Overall Average"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {loading && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-brand-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && sectionId && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-brand-500">
                  No records found.
                </td>
              </tr>
            )}
            {!loading && !sectionId && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-brand-500">
                  Select school year and class to view grades.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const isExpanded = expandedStudentId === row.studentId;
              const card = reportCards[row.studentId];
              const isExpandLoading = expandLoadingId === row.studentId;

              return (
                <Fragment key={row.studentId}>
                  <tr className="hover:bg-brand-50">
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => toggleExpand(row.studentId)}
                        aria-label="Toggle details"
                        className="rounded p-1 text-brand-500 hover:bg-brand-100"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => openModal(row.studentId)}
                        className="font-medium text-brand-900 hover:underline"
                      >
                        {row.name}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-brand-600">{row.studentCode}</td>
                    <td className="px-5 py-3 text-right font-semibold text-brand-900">
                      {row.total.toFixed(2)}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-brand-50">
                      <td colSpan={4} className="px-5 py-4">
                        {isExpandLoading && (
                          <p className="text-sm text-brand-500">Loading...</p>
                        )}
                        {!isExpandLoading && card && (
                          <div className="space-y-4">
                            {groupBySubjectFilter(card).map((subject) => (
                              <div key={subject.subjectId} className="overflow-x-auto">
                                {!subjectId && (
                                  <h5 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-500">
                                    {subject.subjectName}
                                  </h5>
                                )}
                                <SubjectBreakdownTable subject={subject} />
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Full report card modal */}
      {modalStudentId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setModalStudentId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            {modalLoading && (
              <p className="py-10 text-center text-brand-500">Loading...</p>
            )}
            {modalCard && !modalLoading && (
              <>
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-brand-900">
                      {modalCard.student.name}
                    </h3>
                    <p className="text-xs text-brand-500">
                      {modalCard.student.studentId}
                      {currentSchoolYear ? ` · ${currentSchoolYear.label}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalStudentId(null)}
                    className="rounded-full p-1 text-brand-400 hover:bg-brand-100 hover:text-brand-700"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {groupBySubjectFilter(modalCard).map((subject) => {
                  const grouped = (["QUIZ", "ASSIGNMENT", "OTHERS", "EXAM"] as const).map(
                    (component) => ({
                      component,
                      items: subject.items.filter((i) => i.component === component),
                    })
                  );

                  return (
                    <div
                      key={subject.subjectId}
                      className="mb-6 rounded-lg border border-brand-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-display text-base font-semibold text-brand-900">
                          {subject.subjectName}
                        </h4>
                        <span className="text-sm font-bold text-brand-900">
                          {subject.total.toFixed(2)}
                        </span>
                      </div>

                      {grouped.map(({ component, items }) => (
                        <div key={component} className="mb-3 last:mb-0">
                          <h5 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-500">
                            {COMPONENT_LABELS[component]}
                          </h5>
                          {items.length === 0 ? (
                            <p className="text-xs text-brand-400">No items recorded.</p>
                          ) : (
                            <ul className="space-y-1">
                              {items.map((item) => (
                                <li
                                  key={item.id}
                                  className="flex justify-between rounded-md bg-brand-50 px-3 py-1.5 text-sm"
                                >
                                  <span className="text-brand-700">
                                    {new Date(item.date).toLocaleDateString()}
                                  </span>
                                  <span className="font-medium text-brand-900">
                                    {item.score ?? "—"} / {item.maxScore}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
