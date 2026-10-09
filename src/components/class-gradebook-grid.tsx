"use client";
import { useState } from "react";
import type { ClassGradeSheetData } from "@/lib/class-grade-sheet-data";
import { compareGradeRows } from "@/lib/grade-sort";
import { formatGrade } from "@/lib/grade-math";
const order = ["QUIZ", "ASSIGNMENT", "OTHERS", "EXAM"] as const;
const labels = {
  QUIZ: "Quiz (20%)",
  ASSIGNMENT: "Assignment (10%)",
  OTHERS: "Others (10%)",
  EXAM: "Exam (60%)",
};
export function ClassGradebookGrid({ data }: { data: ClassGradeSheetData }) {
  const [sort, setSort] = useState<"name" | "studentCode" | "total">("name");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const students = data.students
    .map((s) => ({ ...s, studentCode: s.studentId }))
    .sort((a, b) => compareGradeRows(a, b, sort, direction));
  const items = order.flatMap((c) =>
    data.gradeItems.filter((i) => i.component === c),
  );
  const chunks = Array.from(
    { length: Math.max(1, Math.ceil(items.length / 8)) },
    (_, i) => items.slice(i * 8, (i + 1) * 8),
  );
  function toggle(key: typeof sort) {
    if (key === sort) setDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setDirection("asc");
    }
  }
  const heading = (key: typeof sort, text: string) => (
    <th
      rowSpan={2}
      scope="col"
      aria-sort={
        sort === key
          ? direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
      className="p-2 align-bottom"
    >
      <button
        onClick={() => toggle(key)}
        className="text-left focus-visible:outline-2"
      >
        {text}{" "}
        <span aria-hidden="true">
          {sort === key ? (direction === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
  if (!students.length) return <p>No students enrolled.</p>;
  return (
    <div className="space-y-6">
      {chunks.map((chunk, index) => (
        <div
          key={index}
          className="grade-sheet-part overflow-x-auto rounded border border-brand-300 bg-white text-brand-900 print:overflow-visible"
        >
          <table className="w-full text-left text-xs">
            <caption className="p-3 text-left font-semibold text-brand-900">
              {data.subject.name} - {data.subject.section.name} -{" "}
              {data.subject.schoolYear.label}
              {chunks.length > 1 && ` - Part ${index + 1} of ${chunks.length}`}
              <span className="block font-normal">
                Teacher: {data.subject.teacherName} · Total covers all recorded
                items.
              </span>
            </caption>
            <thead className="bg-accent-800 text-white">
              <tr>
                {heading("name", "Student Name")}
                {heading("studentCode", "Student ID")}
                {order.map((c) => {
                  const count = chunk.filter((i) => i.component === c).length;
                  return count ? (
                    <th
                      scope="colgroup"
                      className="border-l border-accent-600 p-2 text-center"
                      key={c}
                      colSpan={count}
                    >
                      {labels[c]}
                    </th>
                  ) : null;
                })}
                {heading("total", "Overall Grade")}
              </tr>
              <tr>
                {chunk.map((item) => (
                  <th
                    scope="col"
                    className="border border-accent-600 p-2 text-center font-normal"
                    key={item.id}
                  >
                    {item.date.slice(0, 10)}
                    <span className="block">Max {item.maxScore}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-200">
              {students.map((student) => (
                <tr key={student.id} className="break-inside-avoid">
                  <th scope="row" className="p-2 font-medium">
                    {student.name}
                  </th>
                  <td className="p-2">{student.studentId}</td>
                  {chunk.map((item) => (
                    <td
                      key={item.id}
                      className="border-l border-brand-200 p-2 text-center"
                    >
                      {item.scores[student.id] ?? "—"}
                    </td>
                  ))}
                  <td className="p-2 font-semibold">
                    {formatGrade(student.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
