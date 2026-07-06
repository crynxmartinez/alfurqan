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

interface StudentOption {
  id: string;
  studentId: string;
  name: string;
}

interface Enrollment {
  id: string;
  student: StudentOption;
}

export function EnrollmentsManager() {
  const [schoolYears, setSchoolYears] = useState<SchoolYearOption[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [schoolYearId, setSchoolYearId] = useState("");
  const [sectionId, setSectionId] = useState("");

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableStudents, setAvailableStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [addStudentId, setAddStudentId] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/school-years")
      .then((r) => r.json())
      .then(setSchoolYears);
  }, []);

  useEffect(() => {
    setSectionId("");
    setSections([]);
    setEnrollments([]);
    if (!schoolYearId) return;
    fetch(`/api/sections?schoolYearId=${schoolYearId}`)
      .then((r) => r.json())
      .then(setSections);
  }, [schoolYearId]);

  async function loadEnrollments() {
    if (!sectionId) {
      setEnrollments([]);
      setAvailableStudents([]);
      return;
    }
    setLoading(true);
    const [enrollRes, availRes] = await Promise.all([
      fetch(`/api/admin/enrollments?sectionId=${sectionId}`),
      fetch(`/api/admin/students/available?sectionId=${sectionId}`),
    ]);
    setEnrollments(await enrollRes.json());
    setAvailableStudents(await availRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addStudentId) return;
    setAdding(true);
    setError(null);

    const res = await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: addStudentId, sectionId, schoolYearId }),
    });

    setAdding(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setAddStudentId("");
    loadEnrollments();
  }

  async function handleRemove(enrollment: Enrollment) {
    if (!confirm(`Remove ${enrollment.student.name} from this section?`)) return;
    const res = await fetch(`/api/admin/enrollments/${enrollment.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Failed to remove.");
      return;
    }
    loadEnrollments();
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 rounded-xl border border-brand-200 bg-brand-50 p-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
            School Year
          </label>
          <select
            value={schoolYearId}
            onChange={(e) => setSchoolYearId(e.target.value)}
            className="w-full rounded-md border border-brand-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
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
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            disabled={!schoolYearId}
            className="w-full rounded-md border border-brand-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none disabled:bg-brand-100"
          >
            <option value="">Select section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sectionId && (
        <>
          <form
            onSubmit={handleAdd}
            className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-brand-200 bg-white p-4"
          >
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
                Add Student
              </label>
              <select
                value={addStudentId}
                onChange={(e) => setAddStudentId(e.target.value)}
                className="w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
              >
                <option value="">Select student</option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentId})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={!addStudentId || adding}
              className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </form>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-brand-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-900 text-white">
                <tr>
                  <th className="px-5 py-3 font-medium">Student ID</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
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
                {!loading && enrollments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-6 text-center text-brand-500">
                      No students enrolled yet.
                    </td>
                  </tr>
                )}
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td className="px-5 py-3 text-brand-600">{e.student.studentId}</td>
                    <td className="px-5 py-3 font-medium text-brand-900">
                      {e.student.name}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleRemove(e)}
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
        </>
      )}
    </div>
  );
}
