"use client";

import { useEffect, useState } from "react";
import {
  Button,
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

interface Section {
  id: string;
  name: string;
  schoolYear: { id: string; label: string };
  _count: { enrollments: number; subjects: number };
}

export function SectionsManager() {
  const [schoolYears, setSchoolYears] = useState<SchoolYearOption[]>([]);
  const [filterYearId, setFilterYearId] = useState("");

  const [items, setItems] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Section | null>(null);
  const [name, setName] = useState("");
  const [formYearId, setFormYearId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadSchoolYears() {
    const res = await fetch("/api/school-years");
    setSchoolYears(await res.json());
  }

  async function load() {
    setLoading(true);
    const url = filterYearId
      ? `/api/admin/sections?schoolYearId=${filterYearId}`
      : "/api/admin/sections";
    const res = await fetch(url);
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadSchoolYears();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYearId]);

  function openCreate() {
    setEditing(null);
    setName("");
    setFormYearId(filterYearId || schoolYears[0]?.id || "");
    setError(null);
    setShowForm(true);
  }

  function openEdit(item: Section) {
    setEditing(item);
    setName(item.name);
    setFormYearId(item.schoolYear.id);
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = editing ? `/api/admin/sections/${editing.id}` : "/api/admin/sections";
    const method = editing ? "PATCH" : "POST";
    const body = editing ? { name } : { name, schoolYearId: formYearId };

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

  async function handleDelete(item: Section) {
    if (!confirm(`Delete section "${item.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/sections/${item.id}`, { method: "DELETE" });
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
        <Select
          value={filterYearId}
          onChange={(e) => setFilterYearId(e.target.value)}
          className="w-auto"
        >
          <option value="">All school years</option>
          {schoolYears.map((sy) => (
            <option key={sy.id} value={sy.id}>
              {sy.label}
            </option>
          ))}
        </Select>

        <Button onClick={openCreate}>+ Add Section</Button>
      </div>

      <Table>
        <TableHead>
          <Th>Name</Th>
          <Th>School Year</Th>
          <Th>Students</Th>
          <Th>Subjects Taught</Th>
          <Th className="text-right">Actions</Th>
        </TableHead>
        <TableBody>
          {loading && <TableEmptyRow colSpan={5}>Loading...</TableEmptyRow>}
          {!loading && items.length === 0 && (
            <TableEmptyRow colSpan={5}>No sections yet.</TableEmptyRow>
          )}
          {items.map((item) => (
            <tr key={item.id}>
              <Td className="font-medium text-brand-900 dark:text-white">{item.name}</Td>
              <Td>{item.schoolYear.label}</Td>
              <Td>{item._count.enrollments}</Td>
              <Td>{item._count.subjects}</Td>
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
        <Modal onClose={() => setShowForm(false)} title={editing ? "Edit Section" : "Add Section"}>
          <form onSubmit={handleSubmit}>
            {error && <ErrorBanner>{error}</ErrorBanner>}

            {!editing && (
              <>
                <FieldLabel>School Year</FieldLabel>
                <Select
                  value={formYearId}
                  onChange={(e) => setFormYearId(e.target.value)}
                  required
                  className="mb-4"
                >
                  <option value="">Select year</option>
                  {schoolYears.map((sy) => (
                    <option key={sy.id} value={sy.id}>
                      {sy.label}
                    </option>
                  ))}
                </Select>
              </>
            )}

            <FieldLabel>Name</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grade 1 - A"
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
