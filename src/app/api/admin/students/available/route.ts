import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Students not yet enrolled in the given section.
export async function GET(req: NextRequest) {
  const sectionId = req.nextUrl.searchParams.get("sectionId");
  if (!sectionId) return NextResponse.json([]);

  const students = await prisma.student.findMany({
    where: { enrollments: { none: { sectionId } } },
    orderBy: { name: "asc" },
    select: { id: true, studentId: true, name: true },
  });
  return NextResponse.json(students);
}
