import { requireStaffPage } from "@/lib/require-admin-page";
import { SubjectsManager } from "./subjects-manager";

export default async function SubjectsPage() {
  await requireStaffPage();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900 dark:text-white">
        Subjects
      </h1>
      <p className="mt-1 text-sm text-brand-500 dark:text-brand-400">
        Manage subjects (e.g. &quot;Tawheed&quot;, &quot;Fiqh&quot;) defined once per school
        year and reused across sections.
      </p>

      <div className="mt-6">
        <SubjectsManager />
      </div>
    </div>
  );
}
