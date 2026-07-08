"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Component = "QUIZ" | "ASSIGNMENT" | "EXAM";

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
  title: string;
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

const COMPONENT_LABELS: Record<Component, string> = {
  QUIZ: "Quizzes (20%)",
  ASSIGNMENT: "Assignments (20%)",
  EXAM: "Exam (60%)",
};

export function GradeEntryEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId");

  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [data, setData] = useState<GradeEntryData | null>(null);
  const [loading, setLoading] = useState(true);

  const [addingComponent, setAddingComponent] = useState<Component | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newMaxScore, setNewMaxScore] = useState("100");
  const [saving, setSaving] = useState(false);

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
        title: newTitle,
        component: addingComponent,
        maxScore: newMaxScore,
      }),
    });

    setSaving(false);
    setAddingComponent(null);
    setNewTitle("");
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

  const componentGroups = (["QUIZ", "ASSIGNMENT", "EXAM"] as const).map((component) => ({
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

      {componentGroups.map(({ component, items }) => (
        <div key={component} className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-brand-900">
              {COMPONENT_LABELS[component]}
            </h3>
            <button
              onClick={() => {
                setAddingComponent(component);
                setNewTitle("");
                setNewMaxScore("100");
              }}
              className="rounded-md bg-brand-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-800"
            >
              + Add Item
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
                    <th className="sticky left-0 z-10 min-w-[160px] bg-brand-900 px-4 py-3 font-medium">
                      Student
                    </th>
                    {items.length === 0 ? (
                      <th className="px-3 py-3 font-medium text-brand-300">
                        No items yet — click &quot;+ Add Item&quot;
                      </th>
                    ) : (
                      items.map((item) => (
                        <th key={item.id} className="min-w-[120px] px-3 py-3 font-medium">
                          <div className="flex items-center justify-between gap-2">
                            <span>
                              {item.title}{" "}
                              <span className="text-brand-300">/ {item.maxScore}</span>
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
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {data.students.map((student) => (
                    <tr key={student.id}>
                      <td className="sticky left-0 z-10 bg-white px-4 py-2 font-medium text-brand-900">
                        {student.name}
                      </td>
                      {items.length === 0 ? (
                        <td className="px-3 py-2 text-brand-300">—</td>
                      ) : (
                        items.map((item) => (
                          <td key={item.id} className="px-3 py-2">
                            <input
                              type="number"
                              min={0}
                              max={item.maxScore}
                              defaultValue={item.scores[student.id] ?? ""}
                              onBlur={(e) =>
                                handleScoreChange(student.id, item.id, e.target.value)
                              }
                              className="w-20 rounded-md border border-brand-300 px-2 py-1 text-sm focus:border-brand-600 focus:outline-none"
                            />
                          </td>
                        ))
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

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
              Add {COMPONENT_LABELS[addingComponent]}
            </h3>

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
              Title
            </label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Quiz 1"
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
