import Link from "next/link";
import { Check } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";

async function getAdminOverview() {
  const activeYear = await prisma.schoolYear.findFirst({
    where: { isActive: true },
  });

  const [sectionCount, subjectCount, teacherCount, studentCount, enrollmentCount] =
    await Promise.all([
      prisma.section.count(
        activeYear ? { where: { schoolYearId: activeYear.id } } : undefined
      ),
      prisma.subject.count(
        activeYear ? { where: { section: { schoolYearId: activeYear.id } } } : undefined
      ),
      prisma.teacher.count(),
      prisma.student.count(),
      prisma.enrollment.count(
        activeYear ? { where: { schoolYearId: activeYear.id } } : undefined
      ),
    ]);

  return {
    activeYear,
    sectionCount,
    subjectCount,
    teacherCount,
    studentCount,
    enrollmentCount,
  };
}

export default async function DashboardHomePage() {
  const session = await auth();
  const role = session?.user.role;

  if (role !== "ADMIN") {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-900 dark:text-white">
          Welcome back{session?.user.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-brand-500 dark:text-brand-400">
          Manage your subjects and enter grades from the menu on the left.
        </p>
      </div>
    );
  }

  const overview = await getAdminOverview();
  const {
    activeYear,
    sectionCount,
    subjectCount,
    teacherCount,
    studentCount,
    enrollmentCount,
  } = overview;

  const stats = [
    { label: "Active School Year", value: activeYear?.label ?? "None set", href: "/dashboard/school-years" },
    { label: "Sections", value: sectionCount, href: "/dashboard/sections" },
    { label: "Subjects", value: subjectCount, href: "/dashboard/subjects" },
    { label: "Teachers", value: teacherCount, href: "/dashboard/teachers" },
    { label: "Students", value: studentCount, href: "/dashboard/students" },
    { label: "Enrollments", value: enrollmentCount, href: "/dashboard/enrollments" },
  ];

  const quickActions = [
    { label: "+ Add School Year", href: "/dashboard/school-years" },
    { label: "+ Add Section", href: "/dashboard/sections" },
    { label: "+ Add Teacher", href: "/dashboard/teachers" },
    { label: "+ Add Student", href: "/dashboard/students" },
    { label: "+ Add Subject", href: "/dashboard/subjects" },
  ];

  const checklist = [
    { label: "Create a School Year", done: !!activeYear, href: "/dashboard/school-years" },
    { label: "Add Sections", done: sectionCount > 0, href: "/dashboard/sections" },
    { label: "Add Teachers", done: teacherCount > 0, href: "/dashboard/teachers" },
    { label: "Add Students", done: studentCount > 0, href: "/dashboard/students" },
    { label: "Enroll Students into Sections", done: enrollmentCount > 0, href: "/dashboard/enrollments" },
    { label: "Add Subjects (with a Teacher assigned)", done: subjectCount > 0, href: "/dashboard/subjects" },
  ];
  const setupIncomplete = checklist.some((c) => !c.done);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900 dark:text-white">
        Welcome back{session?.user.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="mt-1 text-sm text-brand-500 dark:text-brand-400">
        Manage school years, sections, subjects, teachers, and students from the menu on the left.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-brand-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-brand-800 dark:bg-brand-900 dark:hover:bg-brand-800"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500 dark:text-brand-400">
              {s.label}
            </p>
            <p className="mt-2 text-xl font-bold text-brand-900 dark:text-white">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-semibold text-brand-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="rounded-md bg-accent-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-800 dark:bg-accent-600 dark:hover:bg-accent-500"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {setupIncomplete && (
        <Card className="mt-8 p-6">
          <h2 className="mb-3 font-display text-lg font-semibold text-brand-900 dark:text-white">
            Getting Started
          </h2>
          <ul className="space-y-2">
            {checklist.map((c, i) => (
              <li key={c.label} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    c.done
                      ? "bg-success-600 text-white"
                      : "border border-brand-300 bg-white text-brand-500 dark:border-brand-600 dark:bg-brand-800 dark:text-brand-300"
                  }`}
                >
                  {c.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                {c.done ? (
                  <span className="text-sm text-brand-400 line-through dark:text-brand-500">
                    {c.label}
                  </span>
                ) : (
                  <Link
                    href={c.href}
                    className="text-sm font-medium text-brand-800 hover:underline dark:text-brand-200"
                  >
                    {c.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
