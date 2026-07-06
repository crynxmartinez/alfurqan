import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const schoolYearId = req.nextUrl.searchParams.get("schoolYearId");
  const sections = await prisma.section.findMany({
    where: schoolYearId ? { schoolYearId } : undefined,
    orderBy: [{ schoolYear: { label: "desc" } }, { name: "asc" }],
    include: {
      schoolYear: { select: { id: true, label: true } },
      _count: { select: { enrollments: true, subjects: true } },
    },
  });
  return NextResponse.json(sections);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, schoolYearId } = await req.json();
  if (!name || !schoolYearId) {
    return NextResponse.json(
      { error: "Name and school year are required" },
      { status: 400 }
    );
  }

  try {
    const section = await prisma.section.create({
      data: { name, schoolYearId },
    });
    return NextResponse.json(section, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "A section with this name already exists for that school year." },
      { status: 409 }
    );
  }
}
