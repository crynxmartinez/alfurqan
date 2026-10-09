import { MySubjectsList } from "./my-subjects-list";

export default function MySubjectsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900 dark:text-white">
        My Classes & Subjects
      </h1>
      <p className="mt-1 text-sm text-brand-500 dark:text-brand-400">
        Manage your students, subjects and grades.
      </p>

      <div className="mt-6">
        <MySubjectsList />
      </div>
    </div>
  );
}
