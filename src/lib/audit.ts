import { Prisma } from "@prisma/client";
export function snapshot(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value));
}
export async function audit(
  tx: Prisma.TransactionClient,
  actorId: string,
  entity: string,
  entityId: string,
  action: string,
  before: unknown,
  after: unknown,
) {
  await tx.auditLog.create({
    data: {
      actorId,
      entity,
      entityId,
      action,
      before: before == null ? Prisma.JsonNull : snapshot(before),
      after: after == null ? Prisma.JsonNull : snapshot(after),
    },
  });
}
