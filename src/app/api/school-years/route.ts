import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const schoolYears = await prisma.schoolYear.findMany({
    orderBy: { label: "desc" },
    select: { id: true, label: true, isActive: true },
  });
  return NextResponse.json(schoolYears);
}
