import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { enrollments: true } } },
  });
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { studentId, name } = await req.json();
  if (!studentId || !name) {
    return NextResponse.json(
      { error: "Student ID and name are required" },
      { status: 400 }
    );
  }

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
