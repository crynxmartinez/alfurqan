import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

export async function GET(req: NextRequest) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const schoolYearId = req.nextUrl.searchParams.get("schoolYearId");
  const sections = await prisma.section.findMany({
    where: {
      ...(schoolYearId ? { schoolYearId } : {}),
      ...(session.user.role === "TEACHER"
        ? {
            OR: [
              { createdById: session.user.id },
              {
                subjects: {
                  some: {
                    archivedAt: null,
                    teacher: { userId: session.user.id },
                  },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ schoolYear: { label: "desc" } }, { name: "asc" }],
    include: {
      schoolYear: { select: { id: true, label: true } },
      _count: {
        select: {
          enrollments: { where: { archivedAt: null } },
          subjects: { where: { archivedAt: null } },
        },
      },
    },
  });
  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, schoolYearId } = await req.json();
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof schoolYearId !== "string" ||
    !(await prisma.schoolYear.findUnique({ where: { id: schoolYearId } }))
  ) {
    return NextResponse.json(
      { error: "Name and school year are required" },
      { status: 400 },
    );
  }

  try {
    const section = await prisma.section.create({
      data: { name, schoolYearId, createdById: session.user.id },
    });
    return NextResponse.json(section, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error: "A section with this name already exists for that school year.",
      },
      { status: 409 },
    );
  }
}
