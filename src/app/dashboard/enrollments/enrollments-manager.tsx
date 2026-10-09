"use client";
import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { useResource, readJson } from "@/lib/use-resource";
interface Student {
  id: string;
  studentId: string;
  name: string;
}
export function EnrollmentsManager({
  initialYear = "",
  initialSection = "",
}: {
  initialYear?: string;
  initialSection?: string;
}) {
  const [year, setYear] = useState(initialYear);
  const [section, setSection] = useState(initialSection);
  const [student, setStudent] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const years =
    useResource<{ id: string; label: string }[]>("/api/school-years");
  const sections = useResource<{ id: string; name: string }[]>(
    year ? `/api/admin/sections?schoolYearId=${year}` : null,
  );
  const enrolled = useResource<{ id: string; student: Student }[]>(
    section ? `/api/admin/enrollments?sectionId=${section}` : null,
  );
  const available = useResource<Student[]>(
    section ? `/api/admin/students/available?sectionId=${section}` : null,
  );
  async function mutate(url: string, method: string, body?: object) {
    setBusy(true);
    setError("");
    try {
      await readJson(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      setName("");
      setStudent("");
      enrolled.retry();
      available.retry();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          School year
          <Select
            value={year}
            disabled={busy}
            onChange={(e) => {
              setYear(e.target.value);
              setSection("");
              setStudent("");
            }}
          >
            <option value="">Choose year</option>
            {years.data?.map((y) => (
              <option key={y.id} value={y.id}>
                {y.label}
              </option>
            ))}
          </Select>
        </label>
        <label>
          Your class
          <Select
            value={section}
            disabled={!year || busy}
            onChange={(e) => {
              setSection(e.target.value);
              setStudent("");
            }}
          >
            <option value="">Choose class</option>
            {sections.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </label>
      </div>
      {[years, sections, enrolled, available].map(
        (r, i) =>
          r.error && (
            <p key={i} role="alert">
              {r.error} <button onClick={r.retry}>Retry</button>
            </p>
          ),
      )}
      {error && (
        <p role="alert" className="text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      {section && (
        <>
          <div className="grid gap-5 md:grid-cols-2">
            <form
              className="rounded border border-brand-300 p-4 dark:border-brand-700"
              onSubmit={(e) => {
                e.preventDefault();
                void mutate("/api/admin/students", "POST", {
                  name,
                  sectionId: section,
                });
              }}
            >
              <label>
                New student name
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <Button className="mt-3" disabled={busy || !name.trim()}>
                Create and enroll student
              </Button>
            </form>
            <form
              className="rounded border border-brand-300 p-4 dark:border-brand-700"
              onSubmit={(e) => {
                e.preventDefault();
                void mutate("/api/admin/enrollments", "POST", {
                  studentId: student,
                  sectionId: section,
                });
              }}
            >
              <label>
                Existing student
                <Select
                  required
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                >
                  <option value="">Choose student</option>
                  {available.data?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentId})
                    </option>
                  ))}
                </Select>
              </label>
              <Button className="mt-3" disabled={busy || !student}>
                Enroll student
              </Button>
            </form>
          </div>
          {enrolled.loading && <p>Loading students...</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="p-3">Student</th>
                  <th>ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrolled.data?.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-brand-200 dark:border-brand-700"
                  >
                    <td className="p-3">{row.student.name}</td>
                    <td>{row.student.studentId}</td>
                    <td>
                      <Button
                        variant="link-danger"
                        disabled={busy}
                        onClick={() => {
                          if (
                            confirm(
                              `Remove ${row.student.name} from this class? Their scores will be preserved.`,
                            )
                          )
                            void mutate(
                              `/api/admin/enrollments/${row.id}`,
                              "DELETE",
                            );
                        }}
                      >
                        Remove from class
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {year && sections.data?.length === 0 && (
        <p>
          Create a class in Sections or add your subject to an existing class in
          Subjects first.
        </p>
      )}
    </div>
  );
}
