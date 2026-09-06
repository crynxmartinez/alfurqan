import { NextRequest, NextResponse } from "next/server";
import { getClassGradeSheet } from "@/lib/class-grade-sheet-data";

// Public whole-class gradebook: every enrolled student's scores across
// every grade item in a subject, for the public /grades page.
export async function GET(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get("subjectId");
  if (!subjectId) {
    return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
  }

  const data = await getClassGradeSheet(subjectId);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
