import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { canManageSection } from "@/lib/access";
import { archiveRecord } from "@/lib/archive";
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const enrollment = await prisma.enrollment.findUnique({ where: { id } });
  if (
    !enrollment ||
    !(await canManageSection(session.user, enrollment.sectionId))
  )
    return NextResponse.json(
      { error: "Choose one of your classes." },
      { status: 403 },
    );
  return NextResponse.json(
    await archiveRecord("enrollment", id, session.user.id),
  );
}
