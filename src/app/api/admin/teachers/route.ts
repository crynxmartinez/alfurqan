import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminOnly } from "@/lib/require-staff";
import { nextSequenceId } from "@/lib/sequence";

export async function GET() {
  const session = await requireAdminOnly();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teachers = await prisma.teacher.findMany({
    orderBy: { user: { name: "asc" } },
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { subjects: true } },
    },
  });
  return NextResponse.json(teachers);
}

export async function POST(req: NextRequest) {
  const session = await requireAdminOnly();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const employeeId = await nextSequenceId("employeeId");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "TEACHER",
      teacher: {
        create: { employeeId },
      },
    },
    include: { teacher: true },
  });

  return NextResponse.json(user, { status: 201 });
}
