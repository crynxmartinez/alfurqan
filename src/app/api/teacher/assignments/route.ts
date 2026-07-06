import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Teaching assignments for the currently logged-in teacher.
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });

  if (!teacher) {
    return NextResponse.json([]);
  }

  const assignments = await prisma.teachingAssignment.findMany({
    where: { teacherId: teacher.id },
    orderBy: [{ schoolYear: { label: "desc" } }, { section: { name: "asc" } }],
    include: {
      subject: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      schoolYear: { select: { id: true, label: true } },
      _count: { select: { gradeItems: true } },
    },
  });

  return NextResponse.json(assignments);
}
