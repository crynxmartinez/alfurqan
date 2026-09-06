"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  ErrorBanner,
  FieldLabel,
  Select,
  Table,
  TableBody,
  TableEmptyRow,
  TableHead,
  Td,
  Th,
} from "@/components/ui";

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
      <Card className="mb-6 grid gap-4 p-6 md:grid-cols-2">
        <div>
          <FieldLabel>School Year</FieldLabel>
          <Select value={schoolYearId} onChange={(e) => setSchoolYearId(e.target.value)}>
            <option value="">Select year</option>
            {schoolYears.map((sy) => (
              <option key={sy.id} value={sy.id}>
                {sy.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <FieldLabel>Grade / Section</FieldLabel>
          <Select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            disabled={!schoolYearId}
          >
            <option value="">Select section</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {sectionId && (
        <>
          <Card className="mb-4 bg-white p-4 dark:bg-brand-900">
            <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
              <div className="min-w-[200px] flex-1">
                <FieldLabel>Add Student</FieldLabel>
                <Select value={addStudentId} onChange={(e) => setAddStudentId(e.target.value)}>
                  <option value="">Select student</option>
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentId})
                    </option>
                  ))}
                </Select>
              </div>
              <Button type="submit" disabled={!addStudentId || adding}>
                {adding ? "Adding..." : "Add"}
              </Button>
            </form>
          </Card>

          {error && <ErrorBanner>{error}</ErrorBanner>}

          <Table>
            <TableHead>
              <Th>Student ID</Th>
              <Th>Name</Th>
              <Th className="text-right">Actions</Th>
            </TableHead>
            <TableBody>
              {loading && <TableEmptyRow colSpan={3}>Loading...</TableEmptyRow>}
              {!loading && enrollments.length === 0 && (
                <TableEmptyRow colSpan={3}>No students enrolled yet.</TableEmptyRow>
              )}
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <Td>{e.student.studentId}</Td>
                  <Td className="font-medium text-brand-900 dark:text-white">{e.student.name}</Td>
                  <Td className="text-right">
                    <Button variant="link-danger" onClick={() => handleRemove(e)}>
                      Remove
                    </Button>
                  </Td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
