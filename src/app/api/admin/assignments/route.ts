import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const schoolYearId = req.nextUrl.searchParams.get("schoolYearId");

  const assignments = await prisma.teachingAssignment.findMany({
    where: schoolYearId ? { schoolYearId } : undefined,
    orderBy: [{ section: { name: "asc" } }, { subject: { name: "asc" } }],
    include: {
      teacher: { include: { user: { select: { name: true } } } },
      subject: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      schoolYear: { select: { id: true, label: true } },
      _count: { select: { gradeItems: true } },
    },
  });
  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teacherId, subjectId, sectionId, schoolYearId } = await req.json();
  if (!teacherId || !subjectId || !sectionId || !schoolYearId) {
    return NextResponse.json(
      { error: "Teacher, subject, section, and school year are required" },
      { status: 400 }
    );
  }

  try {
    const assignment = await prisma.teachingAssignment.create({
      data: { teacherId, subjectId, sectionId, schoolYearId },
      include: {
        teacher: { include: { user: { select: { name: true } } } },
        subject: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        schoolYear: { select: { id: true, label: true } },
      },
    });
    return NextResponse.json(assignment, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "This subject is already assigned for this section." },
      { status: 409 }
    );
  }
}
