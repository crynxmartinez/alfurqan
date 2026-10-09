import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStaff } from "@/lib/require-staff";
import { getAuthorizedClassGradeSheet } from "@/lib/class-grade-sheet-data";
import { ClassGradebookGrid } from "@/components/class-gradebook-grid";
import { PrintButton } from "@/components/print-button";
export default async function PrintClass({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const session = await requireStaff();
  if (!session) notFound();
  const { subjectId } = await params;
  const data = await getAuthorizedClassGradeSheet(
    subjectId,
    session.user.id,
    session.user.role === "ADMIN",
  );
  if (!data) notFound();
  return (
    <div className="paper-report bg-white p-6 text-brand-900 print:p-0">
      <div className="mb-4 flex justify-between print:hidden">
        <Link href={`/dashboard/grade-entry?subjectId=${subjectId}`}>
          Back to grade entry
        </Link>
        <PrintButton disabled={!data.students.length} />
      </div>
      <h1 className="font-display text-2xl font-semibold">
        Al-Furqan Madrasah
      </h1>
      <p className="mb-5">
        Class grade sheet · Provisional · Generated{" "}
        {new Date().toLocaleDateString("en-GB")}
      </p>
      <ClassGradebookGrid data={data} />
      <p className="mt-5 text-xs">
        Averages include recorded scores only. Not graded is excluded; a
        recorded zero is included.
      </p>
    </div>
  );
}
