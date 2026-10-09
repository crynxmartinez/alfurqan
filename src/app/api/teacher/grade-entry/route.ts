import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/require-staff";
import { getAuthorizedClassGradeSheet } from "@/lib/class-grade-sheet-data";

export async function GET(req: NextRequest) {
  const subjectId = req.nextUrl.searchParams.get("subjectId");
  if (!subjectId) {
    return NextResponse.json(
      { error: "subjectId is required" },
      { status: 400 },
    );
  }

  const session = await requireStaff();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getAuthorizedClassGradeSheet(
    subjectId,
    session.user.id,
    session.user.role === "ADMIN",
  );
  if (!data) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(data);
}
