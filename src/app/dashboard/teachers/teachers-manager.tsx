"use client";

import { useEffect, useState } from "react";

interface Teacher {
  id: string;
  employeeId: string | null;
  user: { id: string; name: string; email: string };
  _count: { subjects: number };
}

export function TeachersManager() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/teachers");
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
        <button
          onClick={openCreate}
          className="rounded-md bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          + Add Teacher
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-brand-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-900 text-white">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Employee ID</th>
              <th className="px-5 py-3 font-medium">Subjects</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-brand-500">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-brand-500">
                  No teachers yet.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3 font-medium text-brand-900">
                  {item.user.name}
                </td>
                <td className="px-5 py-3 text-brand-600">{item.user.email}</td>
                <td className="px-5 py-3 text-brand-600">
                  {item.employeeId ?? "—"}
                </td>
                <td className="px-5 py-3 text-brand-600">
                  {item._count.subjects}
                </td>
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
              {editing ? "Edit Teacher" : "Add Teacher"}
            </h3>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mb-4 w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            />

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mb-4 w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            />

            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
              {editing ? "New Password (leave blank to keep current)" : "Password"}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editing}
              className="mb-4 w-full rounded-md border border-brand-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
            />

            {editing && (
              <>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Employee ID
                </label>
                <input
                  value={editing.employeeId ?? ""}
                  disabled
                  className="mb-4 w-full rounded-md border border-brand-200 bg-brand-100 px-3 py-2 text-sm text-brand-500"
                />
              </>
            )}

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
