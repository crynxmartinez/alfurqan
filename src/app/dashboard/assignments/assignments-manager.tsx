"use client";

import { useEffect, useState } from "react";

interface SchoolYearOption {
  id: string;
  label: string;
}

interface SectionOption {
  id: string;
  name: string;
}

interface SubjectOption {
  id: string;
  name: string;
}

interface TeacherOption {
  id: string;
  user: { name: string };
}

interface Assignment {
  id: string;
  teacher: { id: string; user: { name: string } };
  subject: { id: string; name: string };
  section: { id: string; name: string };
  schoolYear: { id: string; label: string };
  _count: { gradeItems: number };
}

export function AssignmentsManager() {
  const [schoolYears, setSchoolYears] = useState<SchoolYearOption[]>([]);
  const [filterYearId, setFilterYearId] = useState("");

  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectOption[]>([]);
  const [allSections, setAllSections] = useState<SectionOption[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [formYearId, setFormYearId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadSchoolYears() {
    const res = await fetch("/api/school-years");
    setSchoolYears(await res.json());
  }

  async function loadTeachers() {
    const res = await fetch("/api/admin/teachers");
    setTeachers(await res.json());
  }

  async function load() {
    setLoading(true);
    const url = filterYearId
      ? `/api/admin/assignments?schoolYearId=${filterYearId}`
      : "/api/admin/assignments";
    const res = await fetch(url);
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadSchoolYears();
    loadTeachers();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYearId]);

  useEffect(() => {
    setSubjectId("");
    setSectionId("");
    setAllSubjects([]);
    setAllSections([]);
    if (!formYearId) return;
    fetch(`/api/admin/subjects?schoolYearId=${formYearId}`)
      .then((r) => r.json())
      .then(setAllSubjects);
    fetch(`/api/sections?schoolYearId=${formYearId}`)
      .then((r) => r.json())
      .then(setAllSections);
  }, [formYearId]);

  function openCreate() {
    setFormYearId(filterYearId || schoolYears[0]?.id || "");
    setTeacherId("");
    setSubjectId("");
    setSectionId("");
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/admin/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacherId,
        subjectId,
        sectionId,
        schoolYearId: formYearId,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setShowForm(false);
    load();
  }

  async function handleDelete(item: Assignment) {
    if (
      !confirm(
        `Remove ${item.teacher.user.name} from teaching ${item.subject.name} in ${item.section.name}?`
      )
    )
      return;
    const res = await fetch(`/api/admin/assignments/${item.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete.");
      return;
    }
    load();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <select
          value={filterYearId}
          onChange={(e) => setFilterYearId(e.target.value)}
          className="rounded-md border border-brand-300 bg-white px-3 py-2 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
        >
          <option value="">All school years</option>
          {schoolYears.map((sy) => (
            <option key={sy.id} value={sy.id}>
              {sy.label}
            </option>
          ))}
        </select>

        <button
          onClick={openCreate}
          className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          + Add Assignment
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-brand-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-900 text-white">
            <tr>
              <th className="px-5 py-3 font-medium">Teacher</th>
              <th className="px-5 py-3 font-medium">Subject</th>
              <th className="px-5 py-3 font-medium">Section</th>
              <th className="px-5 py-3 font-medium">School Year</th>
              <th className="px-5 py-3 font-medium">Grade Items</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-brand-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-brand-500">
                  No teaching assignments yet.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3 font-medium text-brand-900">
                  {item.teacher.user.name}
                </td>
                <td className="px-5 py-3 text-brand-600">{item.subject.name}</td>
                <td className="px-5 py-3 text-brand-600">{item.section.name}</td>
                <td className="px-5 py-3 text-brand-600">{item.schoolYear.label}</td>
                <td className="px-5 py-3 text-brand-600">{item._count.gradeItems}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => handleDelete(item)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowForm(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
          >
            <h3 className="mb-4 font-display text-lg font-semibold text-brand-900">
              Add Teaching Assignment
            </h3>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
              School Year
            </label>
            <select
              value={formYearId}
              onChange={(e) => setFormYearId(e.target.value)}
              required
              className="mb-4 w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            >
              <option value="">Select year</option>
              {schoolYears.map((sy) => (
                <option key={sy.id} value={sy.id}>
                  {sy.label}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
              Section
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              required
              disabled={!formYearId}
              className="mb-4 w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none disabled:bg-brand-100"
            >
              <option value="">Select section</option>
              {allSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              required
              disabled={!formYearId}
              className="mb-4 w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none disabled:bg-brand-100"
            >
              <option value="">Select subject</option>
              {allSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
              Teacher
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
              className="mb-4 w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            >
              <option value="">Select teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
