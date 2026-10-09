"use client";
import { useState } from "react";
import { readJson, useResource } from "@/lib/use-resource";
import { Button } from "@/components/ui";
type RecoveryData = {
  archived: { id: string; entity: string; label: string; archivedAt: string }[];
  history: {
    id: string;
    entity: string;
    entityId: string;
    action: string;
    actorId: string;
    createdAt: string;
    before: unknown;
    after: unknown;
  }[];
};
export function RecoveryManager() {
  const resource = useResource<RecoveryData>("/api/admin/recovery");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function restore(entity: string, id: string) {
    setBusy(true);
    setError("");
    try {
      await readJson("/api/admin/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity, id }),
      });
      resource.retry();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl">Recovery and change history</h1>
      <p>
        Archived records keep their grades and relationships. Restore parent
        years and classes first. Restored school years remain inactive.
      </p>
      {(error || resource.error) && (
        <p role="alert" className="text-red-700 dark:text-red-300">
          {error || resource.error}
        </p>
      )}
      {resource.loading && <p>Loading...</p>}
      <h2 className="text-lg font-semibold">Archived records</h2>
      <p className="text-sm">Showing the latest 100 records of each type.</p>
      {resource.data?.archived.map((row) => (
        <div
          key={`${row.entity}:${row.id}`}
          className="flex flex-wrap items-center justify-between gap-3 rounded border border-brand-300 p-4 dark:border-brand-700"
        >
          <div>
            {row.label}
            <p className="text-xs">
              {row.entity} · {new Date(row.archivedAt).toLocaleString()}
            </p>
          </div>
          <Button disabled={busy} onClick={() => restore(row.entity, row.id)}>
            Restore
          </Button>
        </div>
      ))}
      {resource.data?.archived.length === 0 && <p>No archived records.</p>}
      <h2 className="text-lg font-semibold">Latest 100 changes</h2>
      {resource.data?.history.map((row) => (
        <details
          key={row.id}
          className="rounded border border-brand-300 p-3 dark:border-brand-700"
        >
          <summary>
            {row.action} · {row.entity} ·{" "}
            {new Date(row.createdAt).toLocaleString()}
          </summary>
          <p className="my-2 text-xs">
            Actor: {row.actorId} · Record: {row.entityId}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3>Before</h3>
              <pre className="overflow-auto text-xs">
                {JSON.stringify(row.before, null, 2)}
              </pre>
            </div>
            <div>
              <h3>After</h3>
              <pre className="overflow-auto text-xs">
                {JSON.stringify(row.after, null, 2)}
              </pre>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
