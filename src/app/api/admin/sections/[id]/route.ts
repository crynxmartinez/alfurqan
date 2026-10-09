import { audit } from "@/lib/audit";
import { canManageSection } from "@/lib/access";
import { archiveRecord } from "@/lib/archive";
import { NextRequest, NextResponse } from "next/server";
import { prisma, rawPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await canManageSection(session.user, id)))
    return NextResponse.json(
      { error: "This record is outside your classes." },
      { status: 403 },
    );
  const { name } = await req.json();
  const sectionOwner = await prisma.section.findUnique({
    where: { id },
    select: { createdById: true },
  });
  if (
    session.user.role !== "ADMIN" &&
    sectionOwner?.createdById !== session.user.id
  )
    return NextResponse.json(
      {
        error:
          "Only the class creator or an administrator can rename this shared class.",
      },
      { status: 403 },
    );

  if (name !== undefined && (typeof name !== "string" || !name.trim()))
    return NextResponse.json(
      { error: "A non-empty name is required." },
      { status: 400 },
    );
  try {
    const section = await rawPrisma.$transaction(async (tx) => {
      const before = await tx.section.findUnique({ where: { id } });
      const result = await tx.section.update({
        where: { id },
        data: { name },
      });
      await audit(tx, session.user.id, "section", id, "update", before, result);
      return result;
    });
    return NextResponse.json(section);
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
  if (!(await canManageSection(session.user, id)))
    return NextResponse.json(
      { error: "This record is outside your classes." },
      { status: 403 },
    );

  try {
    if (session.user.role !== "ADMIN")
      return NextResponse.json(
        {
          error:
            "Only administrators can archive shared records. You can remove a student from your class instead.",
        },
        { status: 403 },
      );
    await archiveRecord("section", id, session.user.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Cannot delete: this section has related records." },
      { status: 409 },
    );
  }
}
