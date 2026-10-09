import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ delegate: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() }, log: vi.fn(), transaction: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ rawPrisma: { $transaction: mocks.transaction }, activeWhere: { User: { archivedAt: null }, Subject: { archivedAt: null, section: { archivedAt: null } } } }));
import { archiveRecord } from "./archive";
beforeEach(() => {
  vi.resetAllMocks();
  mocks.transaction.mockImplementation(fn => fn({ user: mocks.delegate, subject: mocks.delegate, auditLog: { create: mocks.log } }));
});
it("does not put a password hash in archive history", async () => {
  mocks.delegate.findUnique.mockResolvedValue({ id: "u", passwordHash: "secret", archivedAt: null });
  mocks.delegate.update.mockResolvedValue({ id: "u", passwordHash: "secret", archivedAt: new Date("2026-10-10") });
  await archiveRecord("user", "u", "admin");
  expect(JSON.stringify(mocks.log.mock.calls)).not.toContain("secret");
  expect(mocks.delegate.update.mock.calls[0][0].data.archivedAt).toBeInstanceOf(Date);
});
it("requires restoration of parent records before a child", async () => {
  mocks.delegate.findUnique.mockResolvedValue({ id: "s", archivedAt: new Date() }); mocks.delegate.findFirst.mockResolvedValue(null);
  await expect(archiveRecord("subject", "s", "admin", true)).rejects.toThrow("Restore parent");
  expect(mocks.delegate.update).not.toHaveBeenCalled();
});
