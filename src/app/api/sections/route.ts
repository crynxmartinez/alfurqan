import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const schoolYearId = req.nextUrl.searchParams.get("schoolYearId");
  if (!schoolYearId) {
    return NextResponse.json([]);
  }

  const sections = await prisma.section.findMany({
    where: { schoolYearId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json(sections);
}
