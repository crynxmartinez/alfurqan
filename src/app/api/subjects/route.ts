import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const sectionId = req.nextUrl.searchParams.get("sectionId");
  if (!sectionId) {
    return NextResponse.json([]);
  }

  const subjects = await prisma.subject.findMany({
    where: { sectionId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json(subjects);
}
