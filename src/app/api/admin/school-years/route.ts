import { saveSchoolYear } from "@/lib/school-year-write";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/require-staff";

export async function GET() {
  const session = await requireStaff();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schoolYears = await prisma.schoolYear.findMany({
    orderBy: { label: "desc" },
    include: {
      _count: { select: { sections: { where: { archivedAt: null } } } },
    },
  });
  return NextResponse.json(schoolYears);
}

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(
      await saveSchoolYear(session.user.id, {
        ...(await req.json()),
        ...(session.user.role !== "ADMIN" ? { isActive: false } : {}),
      }),
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not save year. Check its label and whether it already exists.",
      },
      { status: 409 },
    );
  }
}
