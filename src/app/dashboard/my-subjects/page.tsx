import { MySubjectsList } from "./my-subjects-list";

export default function MySubjectsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900">
        My Subjects
      </h1>
      <p className="mt-1 text-sm text-brand-500">
        Subjects you are assigned to teach.
      </p>

      <div className="mt-6">
        <MySubjectsList />
      </div>
    </div>
  );
}
