"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Subject {
  id: string;
  name: string;
  section: { id: string; name: string; schoolYear: { id: string; label: string } };
  _count: { gradeItems: number };
}

export function MySubjectsList() {
  const [items, setItems] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/subjects")
      .then((r) => r.json())
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-brand-500 dark:text-brand-400">Loading...</p>;
  }

  if (items.length === 0) {
    return (
      <div>
        <p className="mb-3 text-sm text-brand-500 dark:text-brand-400">
          You have no subjects assigned yet.
        </p>
        <Link
          href="/dashboard/subjects"
          className="rounded-md bg-accent-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-800 dark:bg-accent-600 dark:hover:bg-accent-500"
        >
          Go to Subjects
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/dashboard/grade-entry?subjectId=${item.id}`}
          className="rounded-xl border border-brand-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-brand-800 dark:bg-brand-900 dark:hover:bg-brand-800"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500 dark:text-brand-400">
            {item.section.schoolYear.label}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-brand-900 dark:text-white">
            {item.name}
          </h3>
          <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">{item.section.name}</p>
          <p className="mt-3 text-xs text-brand-400 dark:text-brand-500">
            {item._count.gradeItems} grade item
            {item._count.gradeItems === 1 ? "" : "s"}
          </p>
        </Link>
      ))}
    </div>
  );
}
