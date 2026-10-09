import { rawPrisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
export async function saveSchoolYear(
  actorId: string,
  body: { label?: unknown; isActive?: unknown },
  id?: string,
) {
  if (
    body.label !== undefined &&
    (typeof body.label !== "string" || !body.label.trim())
  )
    throw new Error("A non-empty year label is required.");
  if (!id && typeof body.label !== "string")
    throw new Error("Year label is required.");
  if (body.isActive !== undefined && typeof body.isActive !== "boolean")
    throw new Error("Active must be true or false.");
  return rawPrisma.$transaction(async (tx) => {
    // Serialize activation even when there is currently no active year.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(726341)`;
    const before = id
      ? await tx.schoolYear.findUnique({ where: { id, archivedAt: null } })
      : null;
    if (id && !before) throw new Error("Year not found.");
    if (body.isActive)
      await tx.schoolYear.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    const data = {
      ...(typeof body.label === "string" ? { label: body.label.trim() } : {}),
      ...(typeof body.isActive === "boolean"
        ? { isActive: body.isActive }
        : {}),
    };
    const result = id
      ? await tx.schoolYear.update({ where: { id }, data })
      : await tx.schoolYear.create({
          data: {
            ...data,
            label: (body.label as string).trim(),
            createdById: actorId,
          },
        });
    await audit(
      tx,
      actorId,
      "schoolYear",
      result.id,
      id ? "update" : "create",
      before,
      result,
    );
    return result;
  });
}
