import { Suspense } from "react";
import { GradeEntryEditor } from "./grade-entry-editor";

export default function GradeEntryPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-900">
        Grade Entry
      </h1>
      <p className="mt-1 text-sm text-brand-500">
        Add quizzes, assignments, and exams, then enter scores for each
        student.
      </p>

      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-brand-500">Loading...</p>}>
          <GradeEntryEditor />
        </Suspense>
      </div>
    </div>
  );
}
