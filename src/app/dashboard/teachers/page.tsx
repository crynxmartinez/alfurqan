import { requireAdminPage } from "@/lib/require-admin-page";
import { TeachersManager } from "./teachers-manager";

export default async function TeachersPage() {
  await requireAdminPage();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900 dark:text-white">
        Teachers
      </h1>
      <p className="mt-1 text-sm text-brand-500 dark:text-brand-400">
        Manage teacher accounts. Each teacher can log in and manage grades for
        their assigned subjects.
      </p>

      <div className="mt-6">
        <TeachersManager />
      </div>
    </div>
  );
}
