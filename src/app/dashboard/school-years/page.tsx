import { SchoolYearsManager } from "./school-years-manager";

export default function SchoolYearsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900">
        School Years
      </h1>
      <p className="mt-1 text-sm text-brand-500">
        Manage school years. Only one school year can be active at a time.
      </p>

      <div className="mt-6">
        <SchoolYearsManager />
      </div>
    </div>
  );
}
