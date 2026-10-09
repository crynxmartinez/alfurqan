import { NextRequest, NextResponse } from "next/server";
import { prisma, rawPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { parseScore } from "@/lib/grade-validation";
import { audit } from "@/lib/audit";
export async function PUT(req: NextRequest) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (
    !body ||
    typeof body.studentId !== "string" ||
    typeof body.gradeItemId !== "string" ||
    !("expectedScore" in body)
  )
    return NextResponse.json(
      { error: "Student, grade item and previous score are required." },
      { status: 400 },
    );
  const { studentId, gradeItemId } = body;
  const item = await prisma.gradeItem.findUnique({
    where: { id: gradeItemId },
    include: { subject: { include: { teacher: true } } },
  });
  if (!item)
    return NextResponse.json(
      { error: "Grade item not found." },
      { status: 404 },
    );
  if (
    session.user.role !== "ADMIN" &&
    item.subject.teacher.userId !== session.user.id
  )
    return NextResponse.json(
      { error: "This subject belongs to another teacher." },
      { status: 403 },
    );
  if (
    !(await prisma.enrollment.findFirst({
      where: { studentId, sectionId: item.subject.sectionId },
    }))
  )
    return NextResponse.json(
      { error: "Student is not enrolled in this class." },
      { status: 400 },
    );
  let score: number | null;
  let expected: number | null;
  try {
    score = parseScore(body.score, item.maxScore);
    expected = parseScore(body.expectedScore, item.maxScore);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
  try {
    const result = await rawPrisma.$transaction(
      async (tx) => {
        const where = { studentId_gradeItemId: { studentId, gradeItemId } };
        const before = await tx.gradeEntry.findUnique({ where });
        if ((before?.score ?? null) !== expected)
          return { conflict: true, score: before?.score ?? null };
        const after =
          score === null
            ? (await tx.gradeEntry.deleteMany({
                where: { studentId, gradeItemId },
              }),
              null)
            : await tx.gradeEntry.upsert({
                where,
                update: { score },
                create: { studentId, gradeItemId, score },
              });
        await audit(
          tx,
          session.user.id,
          "gradeEntry",
          `${studentId}:${gradeItemId}`,
          "score",
          before,
          after,
        );
        return { conflict: false, score };
      },
      { isolationLevel: "Serializable" },
    );
    return NextResponse.json(
      result.conflict
        ? {
            error:
              "This score changed in another session. Review the current score before retrying.",
            currentScore: result.score,
          }
        : { score: result.score },
      { status: result.conflict ? 409 : 200 },
    );
  } catch (error) {
    const conflict = (error as { code?: string }).code === "P2034";
    return NextResponse.json(
      {
        error: conflict
          ? "Another save happened at the same time. Retry this score."
          : "Score was not saved. Please retry.",
      },
      { status: conflict ? 409 : 500 },
    );
  }
}
