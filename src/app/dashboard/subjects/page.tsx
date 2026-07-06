import { SubjectsManager } from "./subjects-manager";

export default function SubjectsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900">
        Subjects
      </h1>
      <p className="mt-1 text-sm text-brand-500">
        Manage subjects (e.g. &quot;Tawheed&quot;, &quot;Fiqh&quot;) defined once per school
        year and reused across sections.
      </p>

      <div className="mt-6">
        <SubjectsManager />
      </div>
    </div>
  );
}
