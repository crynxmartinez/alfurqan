import { auth } from "@/lib/auth";

export default async function DashboardHomePage() {
  const session = await auth();
  const role = session?.user.role;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900">
        Welcome back{session?.user.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="mt-1 text-sm text-brand-500">
        {role === "ADMIN"
          ? "Manage school years, sections, subjects, teachers, and students from the menu on the left."
          : "Manage your subjects and enter grades from the menu on the left."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-brand-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
            Role
          </p>
          <p className="mt-2 text-xl font-bold text-brand-900">{role}</p>
        </div>
      </div>
    </div>
  );
}
