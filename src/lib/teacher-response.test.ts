import { expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/require-staff", () => ({
  requireAdminOnly: async () => ({ user: { id: "admin", role: "ADMIN" } }),
}));
vi.mock("@/lib/sequence", () => ({ nextSequenceId: async () => "0002" }));
vi.mock("bcryptjs", () => ({
  default: { hash: async () => "private-test-hash" },
}));
import { POST } from "@/app/api/admin/teachers/route";
it("requests only safe fields when creating teacher accounts", async () => {
  db.user.findUnique.mockResolvedValue(null);
  db.user.create.mockResolvedValue({
    id: "u",
    name: "Teacher",
    email: "teacher@example.invalid",
    teacher: { id: "t" },
  });
  const response = await POST(
    new NextRequest("http://localhost/api/admin/teachers", {
      method: "POST",
      body: JSON.stringify({
        name: "Teacher",
        email: "teacher@example.invalid",
        password: "test-password",
      }),
    }),
  );
  expect(response.status).toBe(201);
  expect(await response.json()).not.toHaveProperty("passwordHash");
  expect(db.user.create.mock.calls[0][0].select).toEqual({
    id: true,
    name: true,
    email: true,
    teacher: true,
  });
});
