"use client";

import { useEffect, useState } from "react";
import {
  Button,
  ErrorBanner,
  FieldLabel,
  Input,
  Modal,
  PasswordInput,
  Table,
  TableBody,
  TableEmptyRow,
  TableHead,
  Td,
  Th,
} from "@/components/ui";

interface Teacher {
  id: string;
  employeeId: string | null;
  user: { id: string; name: string; email: string };
  _count: { subjects: number };
}

export function TeachersManager() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setLoadError(null);
    const res = await fetch("/api/admin/teachers");
    if (!res.ok) {
      setLoadError("Failed to load teachers.");
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
    setEmail("");
    setPassword("");
    setError(null);
    setShowForm(true);
  }

  function openEdit(item: Teacher) {
    setEditing(item);
    setName(item.user.name);
    setEmail(item.user.email);
    setPassword("");
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = editing ? `/api/admin/teachers/${editing.id}` : "/api/admin/teachers";
    const method = editing ? "PATCH" : "POST";
    const body: Record<string, unknown> = { name, email };
    if (!editing || password) body.password = password;

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

  async function handleDelete(item: Teacher) {
    if (!confirm(`Delete teacher "${item.user.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/teachers/${item.id}`, { method: "DELETE" });
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
        <Button onClick={openCreate}>+ Add Teacher</Button>
      </div>

      {loadError && <ErrorBanner>{loadError}</ErrorBanner>}

      <Table>
        <TableHead>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Employee ID</Th>
          <Th>Subjects</Th>
          <Th className="text-right">Actions</Th>
        </TableHead>
        <TableBody>
          {loading && <TableEmptyRow colSpan={5}>Loading...</TableEmptyRow>}
          {!loading && items.length === 0 && (
            <TableEmptyRow colSpan={5}>No teachers yet.</TableEmptyRow>
          )}
          {items.map((item) => (
            <tr key={item.id}>
              <Td className="font-medium text-brand-900 dark:text-white">{item.user.name}</Td>
              <Td>{item.user.email}</Td>
              <Td>{item.employeeId ?? "—"}</Td>
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
        <Modal onClose={() => setShowForm(false)} title={editing ? "Edit Teacher" : "Add Teacher"}>
          <form onSubmit={handleSubmit}>
            {error && <ErrorBanner>{error}</ErrorBanner>}

            <FieldLabel>Full Name</FieldLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} required className="mb-4" />

            <FieldLabel>Email</FieldLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mb-4"
            />

            <FieldLabel>
              {editing ? "New Password (leave blank to keep current)" : "Password"}
            </FieldLabel>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editing}
              className="mb-4"
            />

            {editing && (
              <>
                <FieldLabel>Employee ID</FieldLabel>
                <Input value={editing.employeeId ?? ""} disabled className="mb-4" />
              </>
            )}

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
