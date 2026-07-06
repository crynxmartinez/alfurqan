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

interface TeacherOption {
  id: string;
  user: { name: string };
}

interface Subject {
  id: string;
  name: string;
  section: { id: string; name: string };
  teacher: { id: string; user: { name: string } };
  _count: { gradeItems: number };
}

export function SubjectsManager() {
  const [schoolYears, setSchoolYears] = useState<SchoolYearOption[]>([]);
  const [filterYearId, setFilterYearId] = useState("");
  const [filterSections, setFilterSections] = useState<SectionOption[]>([]);
  const [filterSectionId, setFilterSectionId] = useState("");

  const [teachers, setTeachers] = useState<TeacherOption[]>([]);

  const [items, setItems] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
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
    if (!filterSectionId) {
      setItems([]);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/subjects?sectionId=${filterSectionId}`);
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadSchoolYears();
    loadTeachers();
  }, []);

  useEffect(() => {
    setFilterSectionId("");
    setFilterSections([]);
    if (!filterYearId) return;
    fetch(`/api/sections?schoolYearId=${filterYearId}`)
      .then((r) => r.json())
      .then(setFilterSections);
  }, [filterYearId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSectionId]);

  function openCreate() {
    setEditing(null);
    setName("");
    setTeacherId("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(item: Subject) {
    setEditing(item);
    setName(item.name);
    setTeacherId(item.teacher.id);
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = editing ? `/api/admin/subjects/${editing.id}` : "/api/admin/subjects";
    const method = editing ? "PATCH" : "POST";
    const body = editing
      ? { name, teacherId }
      : { name, teacherId, sectionId: filterSectionId };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

  async function handleDelete(item: Subject) {
    if (!confirm(`Delete subject "${item.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/subjects/${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete.");
      return;
    }
    load();
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 rounded-xl border border-brand-200 bg-brand-50 p-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
            School Year
          </label>
          <select
            value={filterYearId}
            onChange={(e) => setFilterYearId(e.target.value)}
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
            Grade / Section
          </label>
          <select
            value={filterSectionId}
            onChange={(e) => setFilterSectionId(e.target.value)}
            disabled={!filterYearId}
            className="w-full rounded-md border border-brand-300 bg-white px-3 py-2 text-sm text-brand-900 focus:border-brand-600 focus:outline-none disabled:bg-brand-100"
          >
            <option value="">Select section</option>
            {filterSections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filterSectionId && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={openCreate}
              className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
            >
              + Add Subject
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-brand-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-900 text-white">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Teacher</th>
                  <th className="px-5 py-3 font-medium">Grade Items</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
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
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-brand-500">
                      No subjects yet for this section.
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3 font-medium text-brand-900">{item.name}</td>
                    <td className="px-5 py-3 text-brand-600">{item.teacher.user.name}</td>
                    <td className="px-5 py-3 text-brand-600">{item._count.gradeItems}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openEdit(item)}
                        className="mr-3 text-sm font-medium text-brand-700 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

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
              {editing ? "Edit Subject" : "Add Subject"}
            </h3>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tawheed"
              required
              className="mb-4 w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            />

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
