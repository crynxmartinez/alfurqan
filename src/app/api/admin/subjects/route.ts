import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const sectionId = req.nextUrl.searchParams.get("sectionId");
  const subjects = await prisma.subject.findMany({
    where: sectionId ? { sectionId } : undefined,
    orderBy: [{ section: { name: "asc" } }, { name: "asc" }],
    include: {
      section: {
        select: { id: true, name: true, schoolYear: { select: { id: true, label: true } } },
      },
      teacher: { include: { user: { select: { id: true, name: true } } } },
      _count: { select: { gradeItems: true } },
    },
  });
  return NextResponse.json(subjects);
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, sectionId, teacherId } = await req.json();
  if (!name || !sectionId || !teacherId) {
    return NextResponse.json(
      { error: "Name, section, and teacher are required" },
      { status: 400 }
    );
  }

  try {
    const subject = await prisma.subject.create({
      data: { name, sectionId, teacherId },
      include: {
        section: { select: { id: true, name: true } },
        teacher: { include: { user: { select: { id: true, name: true } } } },
      },
    });
    return NextResponse.json(subject, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "A subject with this name already exists for that section." },
      { status: 409 }
    );
  }
}
