import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Subjects taught in a given section.
export async function GET(req: NextRequest) {
  const sectionId = req.nextUrl.searchParams.get("sectionId");
  if (!sectionId) {
    return NextResponse.json([]);
  }

  const subjects = await prisma.subject.findMany({
    where: { sectionId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(subjects);
}
