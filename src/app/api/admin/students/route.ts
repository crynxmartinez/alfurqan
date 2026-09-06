import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";
import { nextSequenceId } from "@/lib/sequence";

export async function GET() {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { enrollments: true } } },
  });
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const studentId = await nextSequenceId("studentId");

  try {
    const student = await prisma.student.create({ data: { studentId, name } });
    return NextResponse.json(student, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "A student with this Student ID already exists." },
      { status: 409 }
    );
  }
}
