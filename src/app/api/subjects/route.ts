import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Subjects actually taught in a given section, derived from TeachingAssignment.
export async function GET(req: NextRequest) {
  const sectionId = req.nextUrl.searchParams.get("sectionId");
  if (!sectionId) {
    return NextResponse.json([]);
  }

  const assignments = await prisma.teachingAssignment.findMany({
    where: { sectionId },
    select: { subject: { select: { id: true, name: true } } },
    distinct: ["subjectId"],
    orderBy: { subject: { name: "asc" } },
  });

  const subjects = assignments.map((a) => a.subject);
  return NextResponse.json(subjects);
}
