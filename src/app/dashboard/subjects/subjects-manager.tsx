"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Card,
  ErrorBanner,
  FieldLabel,
  Input,
  Modal,
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
      <Card className="mb-6 grid gap-4 p-6 md:grid-cols-2">
        <div>
          <FieldLabel>School Year</FieldLabel>
          <Select value={filterYearId} onChange={(e) => setFilterYearId(e.target.value)}>
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
            value={filterSectionId}
            onChange={(e) => setFilterSectionId(e.target.value)}
            disabled={!filterYearId}
          >
            <option value="">Select section</option>
            {filterSections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {filterSectionId && (
        <>
          <div className="mb-4 flex justify-end">
            <Button onClick={openCreate}>+ Add Subject</Button>
          </div>

          <Table>
            <TableHead>
              <Th>Name</Th>
              <Th>Teacher</Th>
              <Th>Grade Items</Th>
              <Th className="text-right">Actions</Th>
            </TableHead>
            <TableBody>
              {loading && <TableEmptyRow colSpan={4}>Loading...</TableEmptyRow>}
              {!loading && items.length === 0 && (
                <TableEmptyRow colSpan={4}>No subjects yet for this section.</TableEmptyRow>
              )}
              {items.map((item) => (
                <tr key={item.id}>
                  <Td className="font-medium text-brand-900 dark:text-white">{item.name}</Td>
                  <Td>{item.teacher.user.name}</Td>
                  <Td>{item._count.gradeItems}</Td>
                  <Td className="text-right">
                    <Button variant="link" className="mr-3" onClick={() => openEdit(item)}>
                      Edit
                    </Button>
                    <Button variant="link-danger" onClick={() => handleDelete(item)}>
                      Delete
                    </Button>
                  </Td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </>
      )}

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={editing ? "Edit Subject" : "Add Subject"}>
          <form onSubmit={handleSubmit}>
            {error && <ErrorBanner>{error}</ErrorBanner>}

            <FieldLabel>Name</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tawheed"
              required
              className="mb-4"
            />

            <FieldLabel>Teacher</FieldLabel>
            <Select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
              className="mb-4"
            >
              <option value="">Select teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user.name}
                </option>
              ))}
            </Select>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
