"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Assignment {
  id: string;
  subject: { id: string; name: string };
  section: { id: string; name: string };
  schoolYear: { id: string; label: string };
  _count: { gradeItems: number };
}

export function MySubjectsList() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/assignments")
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-brand-500">Loading...</p>;
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-brand-500">
        You have no teaching assignments yet. Contact your admin to get
        assigned to a subject.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/dashboard/grade-entry?assignmentId=${item.id}`}
          className="rounded-xl border border-brand-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            {item.schoolYear.label}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-brand-900">
            {item.subject.name}
          </h3>
          <p className="mt-1 text-sm text-brand-600">{item.section.name}</p>
          <p className="mt-3 text-xs text-brand-400">
            {item._count.gradeItems} grade item
            {item._count.gradeItems === 1 ? "" : "s"}
          </p>
        </Link>
      ))}
    </div>
  );
}
