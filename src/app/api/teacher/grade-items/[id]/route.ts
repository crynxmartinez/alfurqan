import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { canManageSubject } from "@/lib/access";
import { archiveRecord } from "@/lib/archive";
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const item = await prisma.gradeItem.findUnique({ where: { id } });
  if (!item || !(await canManageSubject(session.user, item.subjectId)))
    return NextResponse.json(
      { error: "This item is outside your classes." },
      { status: 403 },
    );
  return NextResponse.json(
    await archiveRecord("gradeItem", id, session.user.id),
  );
}
