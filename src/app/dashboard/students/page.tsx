import { StudentsManager } from "./students-manager";

export default function StudentsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900">
        Students
      </h1>
      <p className="mt-1 text-sm text-brand-500">
        Manage the master student list. Enroll students into a section from
        the Enrollments page.
      </p>

      <div className="mt-6">
        <StudentsManager />
      </div>
    </div>
  );
}
