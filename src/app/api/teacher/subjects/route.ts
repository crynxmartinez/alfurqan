import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

// Subjects taught by the currently logged-in teacher.
export async function GET() {
  const session = await requireStaff();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });

  if (!teacher && session.user.role !== "ADMIN") {
    return NextResponse.json([]);
  }

  const subjects = await prisma.subject.findMany({
    where: session.user.role === "ADMIN" ? {} : { teacherId: teacher!.id },
    orderBy: [
      { section: { schoolYear: { label: "desc" } } },
      { section: { name: "asc" } },
    ],
    include: {
      section: {
        select: {
          id: true,
          name: true,
          schoolYear: { select: { id: true, label: true } },
        },
      },
      _count: { select: { gradeItems: { where: { archivedAt: null } } } },
    },
  });

  return NextResponse.json(subjects);
}
