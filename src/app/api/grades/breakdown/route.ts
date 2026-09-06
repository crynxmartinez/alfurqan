import { NextRequest, NextResponse } from "next/server";
import { getStudentReportCard } from "@/lib/report-card-data";

// Full report card: every subject taught in the student's section, each
// with its Quiz/Assignment/Exam item breakdown and subject total, plus an
// overall average across all subjects.
export async function GET(req: NextRequest) {
  const sectionId = req.nextUrl.searchParams.get("sectionId");
  const studentId = req.nextUrl.searchParams.get("studentId");

  if (!sectionId || !studentId) {
    return NextResponse.json(
      { error: "sectionId and studentId are required" },
      { status: 400 }
    );
  }

  const card = await getStudentReportCard(sectionId, studentId);
  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(card);
}
