import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

// id here is the Teacher.id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, email, password, employeeId } = await req.json();

  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const userData: Record<string, unknown> = {};
  if (name !== undefined) userData.name = name;
  if (email !== undefined) userData.email = email;
  if (password) userData.passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.update({ where: { id: teacher.userId }, data: userData });
    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: { employeeId: employeeId ?? null },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(updatedTeacher);
  } catch {
    return NextResponse.json({ error: "Update failed." }, { status: 409 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  try {
    // Deleting the User cascades to delete the Teacher record.
    await prisma.user.delete({ where: { id: teacher.userId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Cannot delete: this teacher has related records." },
      { status: 409 }
    );
  }
}
