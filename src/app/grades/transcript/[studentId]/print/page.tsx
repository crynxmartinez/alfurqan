import { notFound } from "next/navigation";
import Link from "next/link";
import { getStudentReportCard } from "@/lib/report-card-data";
import { ReportCardView } from "@/components/report-card";
import { PrintButton } from "@/components/print-button";

export default async function StudentTranscriptPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ sectionId?: string }>;
}) {
  const { studentId } = await params;
  const { sectionId } = await searchParams;

  if (!sectionId) notFound();

  const card = await getStudentReportCard(sectionId, studentId);
  if (!card) notFound();

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-white px-6 py-10 text-brand-900 print:px-0 print:py-0">
      <div className="mb-8 flex items-start justify-between border-b border-brand-200 pb-6 print:hidden">
        <div>
          <p className="font-display text-lg font-semibold">Al-Furqan Madrasah</p>
          <p className="text-sm text-brand-500">Official Grade Transcript</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/grades"
            className="rounded-md border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            &larr; Back
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="mb-8 hidden border-b border-black pb-4 print:block">
        <p className="font-display text-xl font-semibold">Al-Furqan Madrasah</p>
        <p className="text-sm">Official Grade Transcript</p>
      </div>

      <ReportCardView card={card} />

      <p className="mt-10 text-center text-xs text-brand-400 print:text-black">
        Generated {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  );
}
