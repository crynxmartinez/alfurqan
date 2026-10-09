import { NextRequest, NextResponse } from "next/server";
import { rawPrisma } from "@/lib/prisma";
import { requireAdminOnly } from "@/lib/require-staff";
import {
  archiveEntities,
  archiveRecord,
  type ArchiveEntity,
} from "@/lib/archive";
export async function GET() {
  if (!(await requireAdminOnly()))
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 },
    );
  const archived = (
    await Promise.all(
      archiveEntities.map(async (entity) => {
        const delegate = rawPrisma[entity] as unknown as {
          findMany(
            args: object,
          ): Promise<
            { id: string; archivedAt: Date; name?: string; label?: string }[]
          >;
        };
        // Select only safe metadata; never expose account hashes.
        const rows = await delegate.findMany({
          where: { archivedAt: { not: null } },
          orderBy: { archivedAt: "desc" },
          take: 100,
          select: {
            id: true,
            archivedAt: true,
            ...(["student", "subject", "section", "user"].includes(entity)
              ? { name: true }
              : entity === "schoolYear"
                ? { label: true }
                : {}),
          },
        });
        return rows.map((row) => ({
          ...row,
          entity,
          label: row.name || row.label || row.id,
        }));
      }),
    )
  ).flat();
  const history = await rawPrisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ archived, history });
}
export async function POST(req: NextRequest) {
  const session = await requireAdminOnly();
  if (!session)
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 },
    );
  const body = await req.json().catch(() => null);
  if (
    !body ||
    !archiveEntities.includes(body.entity) ||
    typeof body.id !== "string"
  )
    return NextResponse.json(
      { error: "Choose an archived record." },
      { status: 400 },
    );
  try {
    return NextResponse.json(
      await archiveRecord(
        body.entity as ArchiveEntity,
        body.id,
        session.user.id,
        true,
      ),
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not restore this record. Restore its parent records first and retry.",
      },
      { status: 409 },
    );
  }
}
