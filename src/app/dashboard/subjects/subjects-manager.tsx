"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button, Input, Modal, Select } from "@/components/ui";
import { readJson, useResource } from "@/lib/use-resource";
interface Subject {
  id: string;
  name: string;
  teacher: { id: string; user: { name: string } };
  _count: { gradeItems: number };
}
export function SubjectsManager() {
  const { data: session } = useSession();
  const admin = session?.user.role === "ADMIN";
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [editing, setEditing] = useState<Subject | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const years =
    useResource<{ id: string; label: string }[]>("/api/school-years");
  const sections = useResource<{ id: string; name: string }[]>(
    year ? `/api/sections?schoolYearId=${year}` : null,
  );
  const teachers = useResource<{ id: string; user: { name: string } }[]>(
    admin ? "/api/admin/teachers" : null,
  );
  const subjects = useResource<Subject[]>(
    section ? `/api/admin/subjects?sectionId=${section}` : null,
  );
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await readJson(
        editing ? `/api/admin/subjects/${editing.id}` : "/api/admin/subjects",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            sectionId: section,
            ...(admin ? { teacherId: teacher } : {}),
          }),
        },
      );
      setOpen(false);
      subjects.retry();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function archive(item: Subject) {
    if (
      !confirm(
        `Archive ${item.name} and its ${item._count.gradeItems} grade items? Scores are preserved and an administrator can restore them.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await readJson(`/api/admin/subjects/${item.id}`, { method: "DELETE" });
      subjects.retry();
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
            onChange={(e) => {
              setYear(e.target.value);
              setSection("");
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
          Class / Section
          <Select
            value={section}
            disabled={!year}
            onChange={(e) => setSection(e.target.value)}
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
      {[years, sections, teachers, subjects].map(
        (r, i) =>
          r.error && (
            <p key={i} role="alert">
              {r.error} <button onClick={r.retry}>Retry</button>
            </p>
          ),
      )}
      {error && !open && (
        <p role="alert" className="text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      {section && (
        <>
          <Button
            onClick={() => {
              setEditing(null);
              setName("");
              setTeacher("");
              setError("");
              setOpen(true);
            }}
          >
            Add Subject
          </Button>
          {subjects.loading && <p>Loading subjects...</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="p-3">Subject</th>
                  <th>Teacher</th>
                  <th>Grade items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.data?.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-brand-200 dark:border-brand-700"
                  >
                    <td className="p-3">
                      <Link
                        className="underline"
                        href={`/dashboard/grade-entry?subjectId=${item.id}`}
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td>{item.teacher.user.name}</td>
                    <td>{item._count.gradeItems}</td>
                    <td>
                      <Button
                        variant="link"
                        disabled={busy}
                        onClick={() => {
                          setEditing(item);
                          setName(item.name);
                          setTeacher(item.teacher.id);
                          setError("");
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="link-danger"
                        disabled={busy}
                        onClick={() => archive(item)}
                      >
                        Archive
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {subjects.data?.length === 0 && (
            <p>No subjects yet. Add your subject to start entering grades.</p>
          )}
        </>
      )}
      {open && (
        <Modal
          title={editing ? "Edit Subject" : "Add Subject"}
          onClose={() => {
            if (!busy) setOpen(false);
          }}
        >
          <form onSubmit={save} className="space-y-4">
            {error && (
              <p role="alert" className="text-red-700 dark:text-red-300">
                {error}
              </p>
            )}
            <label>
              Subject name
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            {admin ? (
              <label>
                Teacher
                <Select
                  required
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                >
                  <option value="">Choose teacher</option>
                  {teachers.data?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user.name}
                    </option>
                  ))}
                </Select>
              </label>
            ) : (
              <p>You will teach this subject. No admin approval is needed.</p>
            )}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
