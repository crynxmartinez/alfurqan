"use client";
import { useState } from "react";
import Link from "next/link";
import { Modal, Select } from "@/components/ui";
import { ReportCardView, type ReportCardData } from "@/components/report-card";
import { ClassGradebookGrid } from "@/components/class-gradebook-grid";
import { PrintButton } from "@/components/print-button";
import { useResource } from "@/lib/use-resource";
import { compareGradeRows } from "@/lib/grade-sort";
import { formatGrade } from "@/lib/grade-math";
import type { ClassGradeSheetData } from "@/lib/class-grade-sheet-data";
interface Option {
  id: string;
  name?: string;
  label?: string;
}
interface GradeRow {
  studentId: string;
  studentCode: string;
  name: string;
  total: number | null;
}
type SortKey = "name" | "studentCode" | "total";
export function GradeLookup() {
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [student, setStudent] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("name");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const years = useResource<Option[]>("/api/school-years");
  const sections = useResource<Option[]>(
    year ? `/api/sections?schoolYearId=${encodeURIComponent(year)}` : null,
  );
  const subjects = useResource<Option[]>(
    section ? `/api/subjects?sectionId=${encodeURIComponent(section)}` : null,
  );
  const overview = useResource<GradeRow[]>(
    section && !subject
      ? `/api/grades?sectionId=${encodeURIComponent(section)}`
      : null,
  );
  const sheet = useResource<ClassGradeSheetData>(
    subject
      ? `/api/grades/class-sheet?subjectId=${encodeURIComponent(subject)}`
      : null,
  );
  const report = useResource<ReportCardData>(
    student && section
      ? `/api/grades/breakdown?sectionId=${encodeURIComponent(section)}&studentId=${encodeURIComponent(student)}`
      : null,
  );
  const current = subject ? sheet : overview;
  const count = subject ? sheet.data?.students.length : overview.data?.length;
  const ready = !!section && !current.loading && !current.error && !!count;
  const rows = [...(overview.data ?? [])].sort((a, b) =>
    compareGradeRows(a, b, sort, direction),
  );
  function toggle(key: SortKey) {
    if (key === sort) setDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(key);
      setDirection("asc");
    }
  }
  const yearLabel = years.data?.find((y) => y.id === year)?.label;
  const sectionLabel = sections.data?.find((s) => s.id === section)?.name;
  return (
    <div>
      <div className="grid gap-4 rounded-xl border border-brand-200 bg-brand-50 p-6 dark:border-brand-700 dark:bg-brand-900 md:grid-cols-3 print:hidden">
        <label className="text-sm font-medium">
          School year
          <Select
            aria-label="School year"
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setSection("");
              setSubject("");
              setStudent(null);
            }}
          >
            <option value="">Select year</option>
            {years.data?.map((y) => (
              <option key={y.id} value={y.id}>
                {y.label}
              </option>
            ))}
          </Select>
        </label>
        <label className="text-sm font-medium">
          Class / Section
          <Select
            aria-label="Class / Section"
            disabled={!year || sections.loading}
            value={section}
            onChange={(e) => {
              setSection(e.target.value);
              setSubject("");
              setStudent(null);
            }}
          >
            <option value="">Select class</option>
            {sections.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="text-sm font-medium">
          Subject
          <Select
            aria-label="Subject"
            disabled={!section || subjects.loading}
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setStudent(null);
            }}
          >
            <option value="">All subjects - overall average</option>
            {subjects.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </label>
      </div>
      {[years, sections, subjects].map(
        (resource, i) =>
          resource.error && (
            <p
              key={i}
              role="alert"
              className="my-3 text-red-700 dark:text-red-300"
            >
              {resource.error}{" "}
              <button onClick={resource.retry} className="underline">
                Retry
              </button>
            </p>
          ),
      )}
      <div className="my-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm">
          {ready
            ? `${count} students - click a column heading to sort`
            : "Choose a class to load a printable report."}
        </p>
        <PrintButton disabled={!ready} />
      </div>
      <section
        className="paper-report rounded-xl border border-brand-200 bg-white p-5 text-brand-900 print:rounded-none print:border-0 print:p-0"
        aria-busy={current.loading}
      >
        <header className="mb-5 border-b border-brand-300 pb-4">
          <p className="font-display text-xl font-semibold">
            Al-Furqan Madrasah
          </p>
          <h2 className="mt-1 text-lg font-semibold">
            {subject
              ? (sheet.data?.subject.name ?? "Class Grade Sheet")
              : "Class Grade Overview"}
          </h2>
          <p className="text-sm text-brand-700">
            {sectionLabel || "No class selected"}
            {yearLabel && ` - School year ${yearLabel}`}
          </p>
          {sheet.data && subject && (
            <p className="text-sm text-brand-700">
              Teacher: {sheet.data.subject.teacherName}
            </p>
          )}
          <p className="mt-2 text-xs text-brand-600">
            Provisional grades - recorded scores only - generated{" "}
            {new Date().toLocaleDateString("en-GB")}
          </p>
        </header>
        {current.loading && <p role="status">Loading grades...</p>}
        {current.error && (
          <p role="alert">
            {current.error}{" "}
            <button onClick={current.retry} className="underline print:hidden">
              Retry
            </button>
          </p>
        )}
        {!section && <p>Select a school year and class above.</p>}
        {section && !current.loading && !current.error && count === 0 && (
          <p>No enrolled students found.</p>
        )}
        {ready && subject && sheet.data && (
          <ClassGradebookGrid data={sheet.data} />
        )}
        {ready && !subject && (
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left text-sm">
              <thead className="bg-accent-800 text-white">
                <tr>
                  {(
                    [
                      ["name", "Student Name"],
                      ["studentCode", "Student ID"],
                      ["total", "Overall Average"],
                    ] as const
                  ).map(([key, label]) => (
                    <th
                      key={key}
                      scope="col"
                      aria-sort={
                        sort === key
                          ? direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      className="px-4 py-3"
                    >
                      <button
                        className="flex items-center gap-2 text-left focus-visible:outline-2"
                        onClick={() => toggle(key)}
                      >
                        {label}
                        <span aria-hidden="true">
                          {sort === key
                            ? direction === "asc"
                              ? "↑"
                              : "↓"
                            : "↕"}
                        </span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-200">
                {rows.map((row) => (
                  <tr key={row.studentId} className="break-inside-avoid">
                    <td className="px-4 py-3">
                      <button
                        className="text-left font-medium underline decoration-brand-300 underline-offset-4"
                        onClick={() => setStudent(row.studentId)}
                        aria-label={`View report card for ${row.name}`}
                      >
                        {row.name}
                      </button>
                    </td>
                    <td className="px-4 py-3">{row.studentCode}</td>
                    <td className="px-4 py-3 font-semibold">
                      {formatGrade(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {ready && (
          <footer className="mt-5 border-t border-brand-200 pt-3 text-xs text-brand-700">
            Scores are shown out of 100. Not graded is excluded from averages; a
            recorded zero is included. This report is not a certified
            transcript.
          </footer>
        )}
      </section>
      {student && (
        <Modal
          title="Student report card"
          maxWidth="max-w-4xl"
          onClose={() => setStudent(null)}
        >
          <div className="mb-4 flex justify-end gap-4">
            <Link
              className="text-accent-700 underline dark:text-accent-300"
              href={`/grades/transcript/${student}/print?sectionId=${section}`}
              target="_blank"
            >
              Print / Save as PDF
            </Link>
            <button onClick={() => setStudent(null)}>Close</button>
          </div>
          {report.loading && <p role="status">Loading report...</p>}
          {report.error && (
            <p role="alert">
              {report.error} <button onClick={report.retry}>Retry</button>
            </p>
          )}
          {report.data && (
            <div className="paper-report rounded bg-white p-4 text-brand-900">
              <ReportCardView card={report.data} />
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
