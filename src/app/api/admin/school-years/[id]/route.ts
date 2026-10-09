import { NextRequest, NextResponse } from "next/server";
import { requireAdminOnly } from "@/lib/require-staff";
import { saveSchoolYear } from "@/lib/school-year-write";
import { archiveRecord } from "@/lib/archive";
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminOnly();
  if (!session)
    return NextResponse.json(
      { error: "Only administrators can change shared school years." },
      { status: 403 },
    );
  try {
    return NextResponse.json(
      await saveSchoolYear(
        session.user.id,
        await req.json(),
        (await params).id,
      ),
    );
  } catch {
    return NextResponse.json(
      { error: "Year could not be saved. Check for a duplicate label." },
      { status: 409 },
    );
  }
}
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminOnly();
  if (!session)
    return NextResponse.json(
      { error: "Only administrators can archive school years." },
      { status: 403 },
    );
  return NextResponse.json(
    await archiveRecord("schoolYear", (await params).id, session.user.id),
  );
}
