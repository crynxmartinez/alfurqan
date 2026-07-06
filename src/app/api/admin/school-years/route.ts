import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const schoolYears = await prisma.schoolYear.findMany({
    orderBy: { label: "desc" },
    include: { _count: { select: { sections: true } } },
  });
  return NextResponse.json(schoolYears);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { label, isActive } = body;

  if (!label || typeof label !== "string") {
    return NextResponse.json({ error: "Label is required" }, { status: 400 });
  }

  if (isActive) {
    await prisma.schoolYear.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  const schoolYear = await prisma.schoolYear.create({
    data: { label, isActive: !!isActive },
  });

  return NextResponse.json(schoolYear, { status: 201 });
}
