import { audit } from "@/lib/audit";
import { canManageSubject } from "@/lib/access";
import { archiveRecord } from "@/lib/archive";
import { NextRequest, NextResponse } from "next/server";
import { rawPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await canManageSubject(session.user, id)))
    return NextResponse.json(
      { error: "This record is outside your classes." },
      { status: 403 },
    );
  const { name, teacherId } = await req.json();

  if (name !== undefined && (typeof name !== "string" || !name.trim()))
    return NextResponse.json(
      { error: "A non-empty name is required." },
      { status: 400 },
    );
  try {
    const subject = await rawPrisma.$transaction(async (tx) => {
      const before = await tx.subject.findUnique({ where: { id } });
      const result = await tx.subject.update({
        where: { id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(session.user.role === "ADMIN" && teacherId !== undefined
            ? { teacherId }
            : {}),
        },
        include: {
          section: { select: { id: true, name: true } },
          teacher: { include: { user: { select: { id: true, name: true } } } },
        },
      });
      await audit(tx, session.user.id, "subject", id, "update", before, result);
      return result;
    });
    return NextResponse.json(subject);
  } catch {
    return NextResponse.json({ error: "Update failed." }, { status: 409 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await canManageSubject(session.user, id)))
    return NextResponse.json(
      { error: "This record is outside your classes." },
      { status: 403 },
    );

  try {
    await archiveRecord("subject", id, session.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Cannot delete: this subject has related records." },
      { status: 409 },
    );
  }
}
