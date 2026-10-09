import { rawPrisma, activeWhere } from "@/lib/prisma";
import { audit } from "@/lib/audit";
export const archiveEntities = [
  "student",
  "subject",
  "section",
  "schoolYear",
  "enrollment",
  "gradeItem",
  "user",
] as const;
export type ArchiveEntity = (typeof archiveEntities)[number];
export async function archiveRecord(
  entity: ArchiveEntity,
  id: string,
  actorId: string,
  restore = false,
) {
  return rawPrisma.$transaction(async (tx) => {
    const delegate = tx[entity] as unknown as {
      findUnique(args: {
        where: { id: string };
      }): Promise<{ id: string; archivedAt: Date | null } | null>;
      findFirst(args: { where: object }): Promise<unknown>;
      update(args: {
        where: { id: string };
        data: { archivedAt: Date | null; isActive?: boolean };
      }): Promise<unknown>;
    };
    const before = await delegate.findUnique({ where: { id } });
    if (!before) throw new Error("Record not found");
    if (restore) {
      const model = (entity[0].toUpperCase() +
        entity.slice(1)) as keyof typeof activeWhere;
      const ancestors: Record<string, unknown> = { ...activeWhere[model] };
      delete ancestors.archivedAt;
      if (!(await delegate.findFirst({ where: { id, ...ancestors } })))
        throw new Error("Restore parent records first.");
    }
    const after = await delegate.update({
      where: { id },
      data: {
        archivedAt: restore ? null : new Date(),
        ...(entity === "schoolYear" ? { isActive: false } : {}),
      },
    });
    const redact = (v: unknown) =>
      entity === "user"
        ? { id, archivedAt: (v as { archivedAt: Date | null }).archivedAt }
        : v;
    await audit(
      tx,
      actorId,
      entity,
      id,
      restore ? "restore" : "archive",
      redact(before),
      redact(after),
    );
    return { success: true };
  });
}
