"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Component = "QUIZ" | "ASSIGNMENT" | "OTHERS" | "EXAM";

interface SubjectOption {
  id: string;
  name: string;
  section: { name: string; schoolYear: { label: string } };
}

interface Student {
  id: string;
  studentId: string;
  name: string;
}

interface GradeItem {
  id: string;
  date: string;
  component: Component;
  maxScore: number;
  scores: Record<string, number>;
}

interface GradeEntryData {
  subject: {
    id: string;
    name: string;
    section: { name: string };
    schoolYear: { label: string };
  };
  students: Student[];
  gradeItems: GradeItem[];
}

// Kept in sync with src/lib/grades.ts (not imported directly since that
// module pulls in @prisma/client, which shouldn't be bundled client-side).
const COMPONENT_ORDER: Component[] = ["QUIZ", "ASSIGNMENT", "OTHERS", "EXAM"];

const COMPONENT_WEIGHTS: Record<Component, number> = {
  QUIZ: 0.2,
  ASSIGNMENT: 0.1,
  OTHERS: 0.1,
  EXAM: 0.6,
};

const COMPONENT_LABELS: Record<Component, string> = {
  QUIZ: "Quiz (20%)",
  ASSIGNMENT: "Assignment (10%)",
  OTHERS: "Others (10%)",
  EXAM: "Exam (60%)",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function computeStudentTotal(gradeItems: GradeItem[], studentId: string): number | null {
  const byComponent: Record<Component, { earned: number; max: number }> = {
    QUIZ: { earned: 0, max: 0 },
    ASSIGNMENT: { earned: 0, max: 0 },
    OTHERS: { earned: 0, max: 0 },
    EXAM: { earned: 0, max: 0 },
  };

  for (const item of gradeItems) {
    const score = item.scores[studentId];
    if (score == null) continue;
    byComponent[item.component].earned += score;
    byComponent[item.component].max += item.maxScore;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const component of COMPONENT_ORDER) {
    const { earned, max } = byComponent[component];
    if (max <= 0) continue;
    const percentage = (earned / max) * 100;
    weightedSum += percentage * COMPONENT_WEIGHTS[component];
    totalWeight += COMPONENT_WEIGHTS[component];
  }

  if (totalWeight === 0) return null;
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

export function GradeEntryEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId");

  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [data, setData] = useState<GradeEntryData | null>(null);
  const [loading, setLoading] = useState(true);

  const [addingComponent, setAddingComponent] = useState<Component | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newMaxScore, setNewMaxScore] = useState("100");
  const [saving, setSaving] = useState(false);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectId) {
      fetch("/api/teacher/subjects")
        .then((r) => r.json())
        .then(setSubjects)
        .finally(() => setLoading(false));
    }
  }, [subjectId]);

  async function loadData() {
    if (!subjectId) return;
    setLoading(true);
    const res = await fetch(`/api/teacher/grade-entry?subjectId=${subjectId}`);
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!addingComponent || !subjectId) return;
    setSaving(true);

    await fetch("/api/teacher/grade-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId,
        date: newDate,
        component: addingComponent,
        maxScore: newMaxScore,
      }),
    });

    setSaving(false);
    setAddingComponent(null);
    setNewDate("");
    setNewMaxScore("100");
    loadData();
  }

  async function handleDeleteItem(itemId: string) {
    if (!confirm("Delete this grade item? All scores for it will be removed.")) return;
    await fetch(`/api/teacher/grade-items/${itemId}`, { method: "DELETE" });
    loadData();
  }

  async function handleScoreChange(studentId: string, gradeItemId: string, value: string) {
    if (!data) return;

    // Optimistic local update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        gradeItems: prev.gradeItems.map((item) =>
          item.id === gradeItemId
            ? {
                ...item,
                scores: {
                  ...item.scores,
                  [studentId]: value === "" ? (undefined as unknown as number) : Number(value),
                },
              }
            : item
        ),
      };
    });

    await fetch("/api/teacher/grade-entries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        gradeItemId,
        score: value === "" ? null : value,
      }),
    });
  }

  if (loading) {
    return <p className="text-sm text-brand-500">Loading...</p>;
  }

  if (!subjectId) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.length === 0 && (
          <p className="text-sm text-brand-500">
            You have no subjects assigned yet.
          </p>
        )}
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => router.push(`/dashboard/grade-entry?subjectId=${s.id}`)}
            className="rounded-xl border border-brand-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              {s.section.schoolYear.label}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-brand-900">
              {s.name}
            </h3>
            <p className="mt-1 text-sm text-brand-600">{s.section.name}</p>
          </button>
        ))}
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-red-600">Subject not found or unauthorized.</p>;
  }

  const componentGroups = COMPONENT_ORDER.map((component) => ({
    component,
    items: data.gradeItems.filter((i) => i.component === component),
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-brand-900">
            {data.subject.name} &middot; {data.subject.section.name}
          </h2>
          <p className="text-xs text-brand-500">{data.subject.schoolYear.label}</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/grade-entry")}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          &larr; Choose another subject
        </button>
      </div>

      {data.students.length === 0 ? (
        <p className="text-sm text-brand-400">
          No students enrolled in this section yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-900 text-white">
              <tr>
                <th
                  rowSpan={2}
                  className="sticky left-0 z-20 min-w-[160px] bg-brand-900 px-4 py-3 align-bottom font-medium"
                >
                  Student
                </th>
                {componentGroups.map(({ component, items }) => (
                  <th
                    key={component}
                    colSpan={items.length + 1}
                    className="border-l border-brand-700 px-3 py-2 text-center font-medium"
                  >
                    {COMPONENT_LABELS[component]}
                  </th>
                ))}
                <th
                  rowSpan={2}
                  className="min-w-[90px] border-l border-brand-700 px-3 py-3 text-center align-bottom font-medium"
                >
                  Total
                </th>
              </tr>
              <tr>
                {componentGroups.map(({ component, items }) =>
                  [
                    ...items.map((item) => (
                      <th
                        key={item.id}
                        className="border-l border-brand-800 px-2 py-2 text-center font-normal"
                      >
                        <div className="flex items-center justify-center gap-1 whitespace-nowrap text-xs">
                          <span>
                            {formatDate(item.date)}{" "}
                            <span className="text-brand-300">/{item.maxScore}</span>
                          </span>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-brand-300 hover:text-white"
                            aria-label="Delete item"
                          >
                            ✕
                          </button>
                        </div>
                      </th>
                    )),
                    <th
                      key={`${component}-add`}
                      className="min-w-[48px] border-l border-brand-800 px-2 py-2"
                    >
                      <button
                        onClick={() => {
                          setAddingComponent(component);
                          setNewDate("");
                          setNewMaxScore("100");
                        }}
                        className="rounded-md bg-brand-700 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-600"
                        aria-label={`Add ${COMPONENT_LABELS[component]} item`}
                      >
                        +
                      </button>
                    </th>,
                  ]
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {data.students.map((student) => {
                const total = computeStudentTotal(data.gradeItems, student.id);
                const isActive = activeStudentId === student.id;
                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${isActive ? "bg-amber-50" : ""}`}
                  >
                    <td
                      className={`sticky left-0 z-10 px-4 py-2 font-medium text-brand-900 transition-colors ${
                        isActive ? "bg-amber-50" : "bg-white"
                      }`}
                    >
                      {student.name}
                    </td>
                    {componentGroups.map(({ component, items }) =>
                      [
                        ...items.map((item) => (
                          <td
                            key={item.id}
                            className="border-l border-brand-100 px-2 py-2 text-center"
                          >
                            <input
                              type="number"
                              min={0}
                              max={item.maxScore}
                              defaultValue={item.scores[student.id] ?? ""}
                              onFocus={() => setActiveStudentId(student.id)}
                              onBlur={(e) => {
                                setActiveStudentId(null);
                                handleScoreChange(student.id, item.id, e.target.value);
                              }}
                              className="mx-auto w-14 rounded-md border border-brand-300 px-2 py-1 text-center text-sm focus:border-brand-600 focus:outline-none"
                            />
                          </td>
                        )),
                        <td
                          key={`${component}-add-cell`}
                          className="border-l border-brand-100 bg-brand-50/50 px-2 py-2"
                        />,
                      ]
                    )}
                    <td className="border-l border-brand-200 px-3 py-2 text-center font-semibold text-brand-900">
                      {total ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {addingComponent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setAddingComponent(null)}
        >
          <form
            onSubmit={handleAddItem}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 className="mb-4 font-display text-lg font-semibold text-brand-900">
              Add {COMPONENT_LABELS[addingComponent]} Item
            </h3>

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
              Date
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="mb-4 w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            />

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
              Max Score
            </label>
            <input
              type="number"
              min={1}
              value={newMaxScore}
              onChange={(e) => setNewMaxScore(e.target.value)}
              required
              className="mb-4 w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddingComponent(null)}
                className="rounded-md border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
