import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  subject: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  teacher: { findUnique: vi.fn() },
  student: { findUnique: vi.fn() },
  section: { findUnique: vi.fn() },
  gradeItem: { findUnique: vi.fn() },
  enrollment: { findFirst: vi.fn() },
  transaction: vi.fn(),
}));
vi.mock("@/lib/require-staff", () => ({ requireStaff: mocks.auth }));
vi.mock("@/lib/prisma", () => ({
  prisma: mocks,
  rawPrisma: { $transaction: mocks.transaction },
}));
import { POST } from "@/app/api/admin/subjects/route";
import { PATCH } from "@/app/api/admin/subjects/[id]/route";
import { PUT } from "@/app/api/teacher/grade-entries/route";
import { canManageStudent } from "./access";
const request = (url: string, body: object, method = "POST") =>
  new NextRequest(`http://localhost${url}`, {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.auth.mockResolvedValue({ user: { id: "teacher-a", role: "TEACHER" } });
});
describe("teacher boundaries", () => {
  it("forces teacher subject creation to the logged in teacher", async () => {
    mocks.teacher.findUnique.mockResolvedValue({ id: "own-teacher" });
    mocks.section.findUnique.mockResolvedValue({ id: "class" });
    mocks.subject.create.mockResolvedValue({ id: "new" });
    expect(
      (
        await POST(
          request("/api/admin/subjects", {
            name: "Math",
            sectionId: "class",
            teacherId: "someone-else",
          }),
        )
      ).status,
    ).toBe(201);
    expect(mocks.subject.create.mock.calls[0][0].data.teacherId).toBe(
      "own-teacher",
    );
  });
  it("rejects another teacher's subject before changing it", async () => {
    mocks.subject.findUnique.mockResolvedValue({
      teacher: { userId: "teacher-b" },
    });
    expect(
      (
        await PATCH(
          request(
            "/api/admin/subjects/x",
            { teacherId: "own-teacher" },
            "PATCH",
          ),
          { params: Promise.resolve({ id: "x" }) },
        )
      ).status,
    ).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
  it("does not grant access to an unrelated student", async () => {
    mocks.student.findUnique.mockResolvedValue({
      createdById: "someone-else",
      enrollments: [],
    });
    expect(
      await canManageStudent({ id: "teacher-a", role: "TEACHER" }, "s"),
    ).toBe(false);
  });
  it("requires login", async () => {
    mocks.auth.mockResolvedValue(null);
    expect((await POST(request("/api/admin/subjects", {}))).status).toBe(401);
  });
});
describe("grade API", () => {
  beforeEach(() => {
    mocks.gradeItem.findUnique.mockResolvedValue({
      id: "item",
      maxScore: 10,
      subject: { sectionId: "class", teacher: { userId: "teacher-a" } },
    });
    mocks.enrollment.findFirst.mockResolvedValue({ id: "enrolled" });
  });
  it.each([-1, 11, "bad"])(
    "rejects invalid score %s before writing",
    async (score) => {
      expect(
        (
          await PUT(
            request(
              "/api/teacher/grade-entries",
              {
                studentId: "s",
                gradeItemId: "item",
                score,
                expectedScore: null,
              },
              "PUT",
            ),
          )
        ).status,
      ).toBe(400);
      expect(mocks.transaction).not.toHaveBeenCalled();
    },
  );
  it("rejects an unenrolled student", async () => {
    mocks.enrollment.findFirst.mockResolvedValue(null);
    expect(
      (
        await PUT(
          request(
            "/api/teacher/grade-entries",
            {
              studentId: "s",
              gradeItemId: "item",
              score: 5,
              expectedScore: null,
            },
            "PUT",
          ),
        )
      ).status,
    ).toBe(400);
  });
  it("returns a conflict rather than overwriting another session", async () => {
    const update = vi.fn();
    mocks.transaction.mockImplementation((fn) =>
      fn({
        gradeEntry: { findUnique: async () => ({ score: 8 }), upsert: update },
      }),
    );
    const response = await PUT(
      request(
        "/api/teacher/grade-entries",
        { studentId: "s", gradeItemId: "item", score: 9, expectedScore: 5 },
        "PUT",
      ),
    );
    expect(response.status).toBe(409);
    expect((await response.json()).currentScore).toBe(8);
    expect(update).not.toHaveBeenCalled();
  });
});
