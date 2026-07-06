import { TeachersManager } from "./teachers-manager";

export default function TeachersPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900">
        Teachers
      </h1>
      <p className="mt-1 text-sm text-brand-500">
        Manage teacher accounts. Each teacher can log in and manage grades for
        their assigned subjects.
      </p>

      <div className="mt-6">
        <TeachersManager />
      </div>
    </div>
  );
}
