"use client";

import { ScoreInput } from "@/components/score-input";
import { readJson } from "@/lib/use-resource";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { computeTotalGrade } from "@/lib/grade-math";
import { Button, FieldLabel, Input, Modal } from "@/components/ui";

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

const COMPONENT_ORDER: Component[] = ["QUIZ", "ASSIGNMENT", "OTHERS", "EXAM"];

const COMPONENT_LABELS: Record<Component, string> = {
  QUIZ: "Quiz (20%)",
  ASSIGNMENT: "Assignment (10%)",
  OTHERS: "Others (10%)",
  EXAM: "Exam (60%)",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function computeStudentTotal(
  gradeItems: GradeItem[],
  studentId: string,
): number | null {
  const hasAnyScore = gradeItems.some((item) => item.scores[studentId] != null);
  if (!hasAnyScore) return null;

  return computeTotalGrade(
    gradeItems.map((item) => ({
      id: item.id,
      date: item.date,
      component: item.component,
      maxScore: item.maxScore,
      score: item.scores[studentId] ?? null,
    })),
  );
}

export function GradeEntryEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId");

  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [data, setData] = useState<GradeEntryData | null>(null);
  const [loading, setLoading] = useState(true);

  const [addingComponent, setAddingComponent] = useState<Component | null>(
    null,
  );
  const [newDate, setNewDate] = useState("");
  const [newMaxScore, setNewMaxScore] = useState("100");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirtyCells, setDirtyCells] = useState<Record<string, boolean>>({});
  const dirty = Object.values(dirtyCells).some(Boolean);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const guard = (event: MouseEvent) => {
      if ((event.target as Element).closest("a")) {
        event.preventDefault();
        setError("Save or retry your unsaved scores before leaving this page.");
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", guard, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", guard, true);
    };
  }, [dirty]);
  const [activeStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectId) {
      fetch("/api/teacher/subjects")
        .then((r) => r.json())
        .then((value) => {
          if (Array.isArray(value)) setSubjects(value);
        })
        .catch(() => setError("Could not load subjects."))
        .finally(() => setLoading(false));
    }
  }, [subjectId]);

  async function loadData(signal?: AbortSignal) {
    if (!subjectId) return;
    setLoading(true);
    try {
      const result = await readJson<GradeEntryData>(
        `/api/teacher/grade-entry?subjectId=${subjectId}`,
        { signal },
      );
      if (!signal?.aborted) setData(result);
    } catch (e) {
      if (!signal?.aborted) {
        setData(null);
        setError((e as Error).message);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    void loadData(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!addingComponent || !subjectId || dirty) return;
    setSaving(true);

    try {
      await readJson("/api/teacher/grade-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          date: newDate,
          component: addingComponent,
          maxScore: newMaxScore,
        }),
      });
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
      return;
    }
    setSaving(false);
    setAddingComponent(null);
    setNewDate("");
    setNewMaxScore("100");
    loadData();
  }

  async function handleDeleteItem(itemId: string) {
    if (dirty) {
      setError("Save all pending scores first.");
      return;
    }
    if (
      !confirm(
        "Archive this grade item and its scores? An administrator can restore them.",
      )
    )
      return;
    try {
      await readJson(`/api/teacher/grade-items/${itemId}`, {
        method: "DELETE",
      });
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    loadData();
  }

  function handleScoreSaved(
    studentId: string,
    gradeItemId: string,
    score: number | null,
  ) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            gradeItems: prev.gradeItems.map((item) => {
              if (item.id !== gradeItemId) return item;
              const scores = { ...item.scores };
              if (score === null) delete scores[studentId];
              else scores[studentId] = score;
              return { ...item, scores };
            }),
          }
        : prev,
    );
  }

  if (loading) {
    return (
      <p className="text-sm text-brand-500 dark:text-brand-400">Loading...</p>
    );
  }

  if (!subjectId) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.length === 0 && (
          <p className="text-sm text-brand-500 dark:text-brand-400">
            You have no subjects assigned yet.
          </p>
        )}
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() =>
              router.push(`/dashboard/grade-entry?subjectId=${s.id}`)
            }
            className="rounded-xl border border-brand-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md dark:border-brand-800 dark:bg-brand-900 dark:hover:bg-brand-800"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500 dark:text-brand-400">
              {s.section.schoolYear.label}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-brand-900 dark:text-white">
              {s.name}
            </h3>
            <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">
              {s.section.name}
            </p>
          </button>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Subject not found or unauthorized.
      </p>
    );
  }

  const componentGroups = COMPONENT_ORDER.map((component) => ({
    component,
    items: data.gradeItems.filter((i) => i.component === component),
  }));

  return (
    <div>
      {error && (
        <p
          role="alert"
          className="mb-4 rounded bg-red-50 p-3 text-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </p>
      )}
      <p className="mb-4 text-sm">
        {dirty
          ? "Some scores are unsaved. Finish or retry them before leaving."
          : "All scores saved."}{" "}
        Averages include recorded scores only and remain provisional.
      </p>
      <a
        href="/dashboard/enrollments"
        className="mb-4 inline-block text-accent-700 underline dark:text-accent-300"
      >
        Add or manage students in this class
      </a>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-brand-900 dark:text-white">
            {data.subject.name} &middot; {data.subject.section.name}
          </h2>
          <p className="text-xs text-brand-500 dark:text-brand-400">
            {data.subject.schoolYear.label}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`/dashboard/grade-entry/${data.subject.id}/print`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            Export / Print
          </a>
          <button
            disabled={dirty}
            onClick={() => router.push("/dashboard/grade-entry")}
            className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            &larr; Choose another subject
          </button>
        </div>
      </div>

      {data.students.length === 0 ? (
        <p className="text-sm text-brand-400 dark:text-brand-500">
          No students enrolled in this section yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-200 bg-white dark:border-brand-800 dark:bg-brand-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent-800 text-white dark:bg-brand-950">
              <tr>
                <th
                  rowSpan={2}
                  className="sticky left-0 z-20 min-w-[160px] bg-accent-800 px-4 py-3 align-bottom font-medium dark:bg-brand-950"
                >
                  Student
                </th>
                {componentGroups.map(({ component, items }) => (
                  <th
                    key={component}
                    colSpan={items.length + 1}
                    className="border-l border-accent-700 px-3 py-2 text-center font-medium dark:border-brand-800"
                  >
                    {COMPONENT_LABELS[component]}
                  </th>
                ))}
                <th
                  rowSpan={2}
                  className="min-w-[90px] border-l border-accent-700 px-3 py-3 text-center align-bottom font-medium dark:border-brand-800"
                >
                  Total
                </th>
              </tr>
              <tr>
                {componentGroups.map(({ component, items }) => [
                  ...items.map((item) => (
                    <th
                      key={item.id}
                      className="border-l border-accent-700 px-2 py-2 text-center font-normal dark:border-brand-800"
                    >
                      <div className="flex items-center justify-center gap-1 whitespace-nowrap text-xs">
                        <span>
                          {formatDate(item.date)}{" "}
                          <span className="text-brand-300">
                            /{item.maxScore}
                          </span>
                        </span>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-brand-300 hover:text-white"
                          aria-label="Archive item"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </th>
                  )),
                  <th
                    key={`${component}-add`}
                    className="min-w-[48px] border-l border-accent-700 px-2 py-2 dark:border-brand-800"
                  >
                    <button
                      onClick={() => {
                        if (dirty) {
                          setError("Save all pending scores first.");
                          return;
                        }
                        setAddingComponent(component);
                        setNewDate("");
                        setNewMaxScore("100");
                      }}
                      className="rounded-md bg-accent-600 px-2 py-1 text-xs font-semibold text-white hover:bg-accent-500"
                      aria-label={`Add ${COMPONENT_LABELS[component]} item`}
                    >
                      +
                    </button>
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-800">
              {data.students.map((student) => {
                const total = computeStudentTotal(data.gradeItems, student.id);
                const isActive = activeStudentId === student.id;
                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${isActive ? "bg-amber-50 dark:bg-amber-900/20" : ""}`}
                  >
                    <td
                      className={`sticky left-0 z-10 px-4 py-2 font-medium text-brand-900 transition-colors dark:text-white ${
                        isActive
                          ? "bg-amber-50 dark:bg-amber-900/20"
                          : "bg-white dark:bg-brand-900"
                      }`}
                    >
                      {student.name}
                    </td>
                    {componentGroups.map(({ component, items }) => [
                      ...items.map((item) => (
                        <td
                          key={item.id}
                          className="border-l border-brand-100 px-2 py-2 text-center dark:border-brand-800"
                        >
                          <ScoreInput
                            studentId={student.id}
                            itemId={item.id}
                            initialScore={item.scores[student.id] ?? null}
                            maxScore={item.maxScore}
                            label={`${student.name}, ${item.component}, ${formatDate(item.date)}`}
                            onSaved={(score) =>
                              handleScoreSaved(student.id, item.id, score)
                            }
                            onDirty={(value) =>
                              setDirtyCells((prev) => ({
                                ...prev,
                                [`${student.id}:${item.id}`]: value,
                              }))
                            }
                          />
                        </td>
                      )),
                      <td
                        key={`${component}-add-cell`}
                        className="border-l border-brand-100 bg-brand-50/50 px-2 py-2 dark:border-brand-800 dark:bg-brand-800/30"
                      />,
                    ])}
                    <td className="border-l border-brand-200 px-3 py-2 text-center font-semibold text-brand-900 dark:border-brand-800 dark:text-white">
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
        <Modal
          onClose={() => setAddingComponent(null)}
          title={`Add ${COMPONENT_LABELS[addingComponent]} Item`}
        >
          <form onSubmit={handleAddItem}>
            {error && (
              <p role="alert" className="mb-3 text-red-700 dark:text-red-300">
                {error}
              </p>
            )}
            <FieldLabel>Date</FieldLabel>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
              className="mb-4"
            />

            <FieldLabel>Max Score</FieldLabel>
            <Input
              type="number"
              min={1}
              value={newMaxScore}
              onChange={(e) => setNewMaxScore(e.target.value)}
              required
              className="mb-4"
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAddingComponent(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Add"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
