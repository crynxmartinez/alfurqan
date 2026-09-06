import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

// Students not yet enrolled in the given section.
export async function GET(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sectionId = req.nextUrl.searchParams.get("sectionId");
  if (!sectionId) return NextResponse.json([]);

  const students = await prisma.student.findMany({
    where: { enrollments: { none: { sectionId } } },
    orderBy: { name: "asc" },
    select: { id: true, studentId: true, name: true },
  });
  return NextResponse.json(students);
}
