import { NextRequest, NextResponse } from "next/server";
import { rawPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { canManageSubject } from "@/lib/access";
import { parseGradeItem } from "@/lib/grade-validation";
import { audit } from "@/lib/audit";
export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body.subjectId !== "string")
    return NextResponse.json(
      { error: "Subject is required." },
      { status: 400 },
    );
  if (!(await canManageSubject(session.user, body.subjectId)))
    return NextResponse.json(
      { error: "This subject is outside your classes." },
      { status: 403 },
    );
  let data;
  try {
    data = parseGradeItem(body.date, body.component, body.maxScore);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
  const item = await rawPrisma.$transaction(async (tx) => {
    const item = await tx.gradeItem.create({
      data: { subjectId: body.subjectId, ...data },
    });
    await audit(
      tx,
      session.user.id,
      "gradeItem",
      item.id,
      "create",
      null,
      item,
    );
    return item;
  });
  return NextResponse.json(item, { status: 201 });
}
