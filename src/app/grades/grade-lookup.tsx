"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Download, X } from "lucide-react";
import { Select, Table, TableBody, TableEmptyRow, TableHead, Td, Th } from "@/components/ui";
import {
  ReportCardView,
  SubjectBreakdownTable,
  type ReportCardData,
} from "@/components/report-card";

interface Option {
  id: string;
  name?: string;
  label?: string;
}

interface GradeRow {
  studentId: string;
  studentCode: string;
  name: string;
  total: number;
}

export function GradeLookup() {
  const [schoolYears, setSchoolYears] = useState<Option[]>([]);
  const [sections, setSections] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);

  const [schoolYearId, setSchoolYearId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [rows, setRows] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [reportCards, setReportCards] = useState<Record<string, ReportCardData>>({});
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [expandLoadingId, setExpandLoadingId] = useState<string | null>(null);

  const [modalStudentId, setModalStudentId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Load school years on mount
  useEffect(() => {
    fetch("/api/school-years")
      .then((r) => r.json())
      .then(setSchoolYears)
      .catch(() => setSchoolYears([]));
  }, []);

  // Load sections when school year changes
  useEffect(() => {
    setSectionId("");
    setSubjectId("");
    setSections([]);
    setSubjects([]);
    setRows([]);
    setReportCards({});
    setExpandedStudentId(null);
    if (!schoolYearId) return;
    fetch(`/api/sections?schoolYearId=${schoolYearId}`)
      .then((r) => r.json())
      .then(setSections)
      .catch(() => setSections([]));
  }, [schoolYearId]);

  // Load subjects when section changes
  useEffect(() => {
    setSubjectId("");
    setSubjects([]);
    if (!sectionId) return;
    fetch(`/api/subjects?sectionId=${sectionId}`)
      .then((r) => r.json())
      .then(setSubjects)
      .catch(() => setSubjects([]));
  }, [sectionId]);

  // Load grades when section or subject changes
  useEffect(() => {
    setRows([]);
    setReportCards({});
    setExpandedStudentId(null);
    if (!sectionId) return;
    setLoading(true);
    const url = subjectId
      ? `/api/grades?sectionId=${sectionId}&subjectId=${subjectId}`
      : `/api/grades?sectionId=${sectionId}`;
    fetch(url)
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [sectionId, subjectId]);

  async function fetchReportCard(studentId: string): Promise<ReportCardData | null> {
    if (reportCards[studentId]) return reportCards[studentId];
    const res = await fetch(
      `/api/grades/breakdown?sectionId=${sectionId}&studentId=${studentId}`
    );
    if (!res.ok) return null;
    const data: ReportCardData = await res.json();
    setReportCards((prev) => ({ ...prev, [studentId]: data }));
    return data;
  }

  async function toggleExpand(studentId: string) {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null);
      return;
    }
    setExpandedStudentId(studentId);
    if (!reportCards[studentId]) {
      setExpandLoadingId(studentId);
      await fetchReportCard(studentId);
      setExpandLoadingId(null);
    }
  }

  async function openModal(studentId: string) {
    setModalStudentId(studentId);
    if (!reportCards[studentId]) {
      setModalLoading(true);
      await fetchReportCard(studentId);
      setModalLoading(false);
    }
  }

  const modalCard = modalStudentId ? reportCards[modalStudentId] : null;

  function groupBySubjectFilter(card: ReportCardData) {
    if (!subjectId) return card.subjects;
    return card.subjects.filter((s) => s.subjectId === subjectId);
  }

  return (
    <div>
      {/* Filters */}
      <div className="grid gap-4 rounded-xl border border-brand-200 bg-brand-50 p-6 dark:border-brand-800 dark:bg-brand-900/60 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            School Year
          </label>
          <Select value={schoolYearId} onChange={(e) => setSchoolYearId(e.target.value)}>
            <option value="">Select year</option>
            {schoolYears.map((sy) => (
              <option key={sy.id} value={sy.id}>
                {sy.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Class / Section
          </label>
          <Select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            disabled={!schoolYearId}
          >
            <option value="">Select class</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Subject
          </label>
          <Select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={!sectionId}
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        <Table>
          <TableHead>
            <Th className="w-10"></Th>
            <Th>Student Name</Th>
            <Th>Student ID</Th>
            <Th className="text-right">{subjectId ? "Grade" : "Overall Average"}</Th>
          </TableHead>
          <TableBody>
            {loading && <TableEmptyRow colSpan={4}>Loading...</TableEmptyRow>}
            {!loading && sectionId && rows.length === 0 && (
              <TableEmptyRow colSpan={4}>No records found.</TableEmptyRow>
            )}
            {!loading && !sectionId && (
              <TableEmptyRow colSpan={4}>
                Select school year and class to view grades.
              </TableEmptyRow>
            )}
            {rows.map((row) => {
              const isExpanded = expandedStudentId === row.studentId;
              const card = reportCards[row.studentId];
              const isExpandLoading = expandLoadingId === row.studentId;

              return (
                <Fragment key={row.studentId}>
                  <tr className="hover:bg-brand-50 dark:hover:bg-brand-800/60">
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => toggleExpand(row.studentId)}
                        aria-label="Toggle details"
                        className="rounded p-1 text-brand-500 hover:bg-brand-100 dark:text-brand-400 dark:hover:bg-brand-800"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => openModal(row.studentId)}
                        className="font-medium text-brand-900 hover:underline dark:text-white"
                      >
                        {row.name}
                      </button>
                    </td>
                    <Td>{row.studentCode}</Td>
                    <td className="px-5 py-3 text-right font-semibold text-brand-900 dark:text-white">
                      {row.total.toFixed(2)}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-brand-50 dark:bg-brand-800/40">
                      <td colSpan={4} className="px-5 py-4">
                        {isExpandLoading && (
                          <p className="text-sm text-brand-500 dark:text-brand-400">Loading...</p>
                        )}
                        {!isExpandLoading && card && (
                          <div className="space-y-4">
                            {groupBySubjectFilter(card).map((subject) => (
                              <div key={subject.subjectId} className="overflow-x-auto">
                                {!subjectId && (
                                  <h5 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-500 dark:text-brand-400">
                                    {subject.subjectName}
                                  </h5>
                                )}
                                <SubjectBreakdownTable subject={subject} />
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Full report card modal */}
      {modalStudentId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setModalStudentId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            {modalLoading && <p className="py-10 text-center text-brand-500">Loading...</p>}
            {modalCard && !modalLoading && (
              <>
                <div className="mb-2 flex items-start justify-end gap-2">
                  <Link
                    href={`/grades/transcript/${modalStudentId}/print?sectionId=${sectionId}`}
                    target="_blank"
                    className="flex items-center gap-1.5 rounded-md border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download / Print
                  </Link>
                  <button
                    onClick={() => setModalStudentId(null)}
                    className="rounded-full p-1.5 text-brand-400 hover:bg-brand-100 hover:text-brand-700"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <ReportCardView card={modalCard} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
