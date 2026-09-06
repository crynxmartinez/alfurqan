"use client";

import { useEffect, useState } from "react";
import {
  Button,
  ErrorBanner,
  FieldLabel,
  Input,
  Modal,
  Table,
  TableBody,
  TableEmptyRow,
  TableHead,
  Td,
  Th,
} from "@/components/ui";

interface Student {
  id: string;
  studentId: string;
  name: string;
  _count: { enrollments: number };
}

export function StudentsManager() {
  const [items, setItems] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError(null);
    const res = await fetch("/api/admin/students");
    if (!res.ok) {
      setLoadError("Failed to load students.");
      setLoading(false);
      return;
    }
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(item: Student) {
    setEditing(item);
    setName(item.name);
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = editing ? `/api/admin/students/${editing.id}` : "/api/admin/students";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
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

  async function handleDelete(item: Student) {
    if (!confirm(`Delete student "${item.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/students/${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete.");
      return;
    }
    load();
  }

  const filtered = items.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or student ID..."
          className="w-64"
        />

        <Button onClick={openCreate}>+ Add Student</Button>
      </div>

      {loadError && <ErrorBanner>{loadError}</ErrorBanner>}

      <Table>
        <TableHead>
          <Th>Student ID</Th>
          <Th>Name</Th>
          <Th>Enrollments</Th>
          <Th className="text-right">Actions</Th>
        </TableHead>
        <TableBody>
          {loading && <TableEmptyRow colSpan={4}>Loading...</TableEmptyRow>}
          {!loading && filtered.length === 0 && (
            <TableEmptyRow colSpan={4}>No students found.</TableEmptyRow>
          )}
          {filtered.map((item) => (
            <tr key={item.id}>
              <Td>{item.studentId}</Td>
              <Td className="font-medium text-brand-900 dark:text-white">{item.name}</Td>
              <Td>{item._count.enrollments}</Td>
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

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={editing ? "Edit Student" : "Add Student"}>
          <form onSubmit={handleSubmit}>
            {error && <ErrorBanner>{error}</ErrorBanner>}

            {editing && (
              <>
                <FieldLabel>Student ID</FieldLabel>
                <Input value={editing.studentId} disabled className="mb-4" />
              </>
            )}

            <FieldLabel>Full Name</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ali Hassan"
              required
              className="mb-4"
            />

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
