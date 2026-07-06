import { EnrollmentsManager } from "./enrollments-manager";

export default function EnrollmentsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900">
        Enrollments
      </h1>
      <p className="mt-1 text-sm text-brand-500">
        Assign students to a Grade/Room for a school year.
      </p>

      <div className="mt-6">
        <EnrollmentsManager />
      </div>
    </div>
  );
}
