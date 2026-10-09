import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

export async function GET(req: NextRequest) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sectionId = req.nextUrl.searchParams.get("sectionId");
  const subjects = await prisma.subject.findMany({
    where: {
      ...(sectionId ? { sectionId } : {}),
      ...(session.user.role === "TEACHER"
        ? { teacher: { userId: session.user.id } }
        : {}),
    },
    orderBy: [{ section: { name: "asc" } }, { name: "asc" }],
    include: {
      section: {
        select: {
          id: true,
          name: true,
          schoolYear: { select: { id: true, label: true } },
        },
      },
      teacher: { include: { user: { select: { id: true, name: true } } } },
      _count: { select: { gradeItems: { where: { archivedAt: null } } } },
    },
  });
  return NextResponse.json(subjects);
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, sectionId, teacherId: requestedTeacher } = await req.json();
  const ownTeacher =
    session.user.role === "TEACHER"
      ? await prisma.teacher.findUnique({ where: { userId: session.user.id } })
      : null;
  const teacherId =
    session.user.role === "TEACHER" ? ownTeacher?.id : requestedTeacher;
  if (
    typeof name !== "string" ||
    !name.trim() ||
    !(await prisma.section.findUnique({ where: { id: sectionId || "" } }))
  )
    return NextResponse.json(
      { error: "A name and active section are required." },
      { status: 400 },
    );
  if (!name || !sectionId || !teacherId) {
    return NextResponse.json(
      { error: "Name, section, and teacher are required" },
      { status: 400 },
    );
  }

  try {
    const subject = await prisma.subject.create({
      data: { name, sectionId, teacherId },
      include: {
        section: { select: { id: true, name: true } },
        teacher: { include: { user: { select: { id: true, name: true } } } },
      },
    });
    return NextResponse.json(subject, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "A subject with this name already exists for that section." },
      { status: 409 },
    );
  }
}
