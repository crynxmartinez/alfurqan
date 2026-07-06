import { SectionsManager } from "./sections-manager";

export default function SectionsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900">
        Grades / Sections
      </h1>
      <p className="mt-1 text-sm text-brand-500">
        Manage rooms/grades (e.g. &quot;Grade 1 - A&quot;) for each school year.
      </p>

      <div className="mt-6">
        <SectionsManager />
      </div>
    </div>
  );
}
