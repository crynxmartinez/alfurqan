"use client";
import Link from "next/link";
import { useResource } from "@/lib/use-resource";
interface Subject {
  id: string;
  name: string;
  section: {
    id: string;
    name: string;
    schoolYear: { id: string; label: string };
  };
  _count: { gradeItems: number };
}
export function MySubjectsList() {
  const resource = useResource<Subject[]>("/api/teacher/subjects");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4">
        <Link
          className="text-accent-700 underline dark:text-accent-300"
          href="/dashboard/subjects"
        >
          Add subject
        </Link>
        <Link
          className="text-accent-700 underline dark:text-accent-300"
          href="/dashboard/sections"
        >
          Create class
        </Link>
      </div>
      {resource.loading && <p>Loading your classes...</p>}
      {resource.error && (
        <p role="alert">
          {resource.error} <button onClick={resource.retry}>Retry</button>
        </p>
      )}
      {resource.data?.length === 0 && (
        <p>
          Add your first subject to an existing class, or create a class first.
          No admin approval is required.
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resource.data?.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-brand-200 bg-white p-5 dark:border-brand-700 dark:bg-brand-900"
          >
            <p className="text-xs text-brand-600 dark:text-brand-300">
              {item.section.schoolYear.label} · {item.section.name}
            </p>
            <h2 className="mt-2 font-display text-lg font-semibold">
              {item.name}
            </h2>
            <p className="my-3 text-sm">{item._count.gradeItems} grade items</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                className="text-accent-700 underline dark:text-accent-300"
                href={`/dashboard/grade-entry?subjectId=${item.id}`}
              >
                Enter grades
              </Link>
              <Link
                className="text-accent-700 underline dark:text-accent-300"
                href={`/dashboard/enrollments?sectionId=${item.section.id}&schoolYearId=${item.section.schoolYear.id}`}
              >
                Manage students
              </Link>
              <Link
                className="text-accent-700 underline dark:text-accent-300"
                href={`/dashboard/grade-entry/${item.id}/print`}
              >
                Print class
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
