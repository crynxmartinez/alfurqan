import { requireStaffPage } from "@/lib/require-admin-page";
import { SectionsManager } from "./sections-manager";

export default async function SectionsPage() {
  await requireStaffPage();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900 dark:text-white">
        Grades / Sections
      </h1>
      <p className="mt-1 text-sm text-brand-500 dark:text-brand-400">
        Manage rooms/grades (e.g. &quot;Grade 1 - A&quot;) for each school year.
      </p>

      <div className="mt-6">
        <SectionsManager />
      </div>
    </div>
  );
}
