import { canManageSection } from "@/lib/access";
import { audit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";
import { prisma, rawPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { nextSequenceId } from "@/lib/sequence";

export async function GET() {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const students = await prisma.student.findMany({
    where:
      session.user.role === "ADMIN"
        ? {}
        : {
            OR: [
              { createdById: session.user.id },
              {
                enrollments: {
                  some: {
                    archivedAt: null,
                    section: {
                      subjects: {
                        some: {
                          archivedAt: null,
                          teacher: { userId: session.user.id },
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { enrollments: { where: { archivedAt: null } } } },
    },
  });
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, sectionId } = await req.json();
  const section =
    typeof sectionId === "string"
      ? await prisma.section.findUnique({ where: { id: sectionId } })
      : null;
  if (
    sectionId &&
    (!section || !(await canManageSection(session.user, section.id)))
  )
    return NextResponse.json(
      { error: "Choose one of your classes." },
      { status: 403 },
    );
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const studentId = await nextSequenceId("studentId");

  try {
    const student = await rawPrisma.$transaction(async (tx) => {
      const result = await tx.student.create({
        data: { studentId, name: name.trim(), createdById: session.user.id },
      });
      if (section)
        await tx.enrollment.create({
          data: {
            studentId: result.id,
            sectionId: section.id,
            schoolYearId: section.schoolYearId,
          },
        });
      await audit(
        tx,
        session.user.id,
        "student",
        result.id,
        "create",
        null,
        result,
      );
      return result;
    });
    return NextResponse.json(student, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "A student with this Student ID already exists." },
      { status: 409 },
    );
  }
}
