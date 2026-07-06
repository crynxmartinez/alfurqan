import { AssignmentsManager } from "./assignments-manager";

export default function AssignmentsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900">
        Teaching Assignments
      </h1>
      <p className="mt-1 text-sm text-brand-500">
        Assign a teacher to teach a subject in a specific grade/section for a
        school year.
      </p>

      <div className="mt-6">
        <AssignmentsManager />
      </div>
    </div>
  );
}
