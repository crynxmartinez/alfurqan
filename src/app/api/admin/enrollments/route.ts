import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
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
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId, sectionId, schoolYearId } = await req.json();
  if (!studentId || !sectionId || !schoolYearId) {
    return NextResponse.json(
      { error: "Student, section, and school year are required" },
      { status: 400 }
    );
  }

  try {
    const enrollment = await prisma.enrollment.create({
      data: { studentId, sectionId, schoolYearId },
      include: { student: { select: { id: true, studentId: true, name: true } } },
    });
    return NextResponse.json(enrollment, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "This student is already enrolled in this section." },
      { status: 409 }
    );
  }
}
