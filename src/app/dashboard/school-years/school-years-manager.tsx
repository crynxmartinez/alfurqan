"use client";

import { useEffect, useState } from "react";
import {
  Badge,
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

interface SchoolYear {
  id: string;
  label: string;
  isActive: boolean;
  _count: { sections: number };
}

export function SchoolYearsManager() {
  const [items, setItems] = useState<SchoolYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SchoolYear | null>(null);
  const [label, setLabel] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/school-years");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setLabel("");
    setIsActive(false);
    setError(null);
    setShowForm(true);
  }

  function openEdit(item: SchoolYear) {
    setEditing(item);
    setLabel(item.label);
    setIsActive(item.isActive);
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = editing
      ? `/api/admin/school-years/${editing.id}`
      : "/api/admin/school-years";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, isActive }),
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

  async function handleDelete(item: SchoolYear) {
    if (!confirm(`Delete school year "${item.label}"? This cannot be undone.`)) {
      return;
    }
    const res = await fetch(`/api/admin/school-years/${item.id}`, {
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
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>+ Add School Year</Button>
      </div>

      <Table>
        <TableHead>
          <Th>Label</Th>
          <Th>Status</Th>
          <Th>Sections</Th>
          <Th className="text-right">Actions</Th>
        </TableHead>
        <TableBody>
          {loading && <TableEmptyRow colSpan={4}>Loading...</TableEmptyRow>}
          {!loading && items.length === 0 && (
            <TableEmptyRow colSpan={4}>No school years yet.</TableEmptyRow>
          )}
          {items.map((item) => (
            <tr key={item.id}>
              <Td className="font-medium text-brand-900 dark:text-white">{item.label}</Td>
              <Td>
                {item.isActive ? (
                  <Badge tone="success">Active</Badge>
                ) : (
                  <Badge>Inactive</Badge>
                )}
              </Td>
              <Td>{item._count.sections}</Td>
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
        <Modal
          onClose={() => setShowForm(false)}
          title={editing ? "Edit School Year" : "Add School Year"}
        >
          <form onSubmit={handleSubmit}>
            {error && <ErrorBanner>{error}</ErrorBanner>}

            <FieldLabel>Label</FieldLabel>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. 2025-2026"
              required
              className="mb-4"
            />

            <label className="mb-4 flex items-center gap-2 text-sm text-brand-700 dark:text-brand-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-brand-300"
              />
              Set as active school year
            </label>

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
