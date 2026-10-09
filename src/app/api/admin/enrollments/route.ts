import { canManageSection } from "@/lib/access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

export async function GET(req: NextRequest) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sectionId = req.nextUrl.searchParams.get("sectionId");
  if (!sectionId) return NextResponse.json([]);

  const enrollments = await prisma.enrollment.findMany({
    where: { sectionId },
    orderBy: { student: { name: "asc" } },
    include: { student: { select: { id: true, studentId: true, name: true } } },
  });
  return NextResponse.json(enrollments);
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId, sectionId } = await req.json();
  const section =
    typeof sectionId === "string"
      ? await prisma.section.findUnique({ where: { id: sectionId } })
      : null;
  const schoolYearId = section?.schoolYearId;
  if (!section || !(await canManageSection(session.user, section.id)))
    return NextResponse.json(
      { error: "Choose one of your classes." },
      { status: 403 },
    );
  if (
    typeof studentId !== "string" ||
    !(await prisma.student.findUnique({ where: { id: studentId } }))
  )
    return NextResponse.json(
      { error: "Choose an active student." },
      { status: 400 },
    );
  if (!studentId || !sectionId || !schoolYearId) {
    return NextResponse.json(
      { error: "Student, section, and school year are required" },
      { status: 400 },
    );
  }

  try {
    const enrollment = await prisma.enrollment.upsert({
      where: {
        studentId_sectionId_schoolYearId: {
          studentId,
          sectionId,
          schoolYearId,
        },
      },
      update: { archivedAt: null },
      create: { studentId, sectionId, schoolYearId },
      include: {
        student: { select: { id: true, studentId: true, name: true } },
      },
    });
    return NextResponse.json(enrollment, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "This student is already enrolled in this section." },
      { status: 409 },
    );
  }
}
