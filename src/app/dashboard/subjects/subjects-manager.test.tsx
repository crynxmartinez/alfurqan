// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "teacher-a", role: "TEACHER" } } }),
}));
import { SubjectsManager } from "./subjects-manager";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("lets teachers create a subject without fetching the admin teacher directory", async () => {
  const requests: { url: string; body?: string }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      requests.push({ url, body: init?.body as string | undefined });
      let body: unknown = [];
      if (url === "/api/school-years") body = [{ id: "y", label: "Test Year" }];
      if (url.startsWith("/api/sections?"))
        body = [{ id: "c", name: "Test Class" }];
      if (init?.method === "POST") body = { id: "new" };
      return { ok: true, json: async () => body };
    }),
  );
  const user = userEvent.setup();
  render(<SubjectsManager />);
  await screen.findByRole("option", { name: "Test Year" });
  await user.selectOptions(screen.getByLabelText("School year"), "y");
  await screen.findByRole("option", { name: "Test Class" });
  await user.selectOptions(screen.getByLabelText("Class / Section"), "c");
  await user.click(screen.getByRole("button", { name: "Add Subject" }));
  await user.type(screen.getByLabelText("Subject name"), "Mathematics");
  await user.click(screen.getByRole("button", { name: "Save" }));
  await waitFor(() => expect(requests.some((r) => r.body)).toBe(true));
  expect(requests.some((r) => r.url === "/api/admin/teachers")).toBe(false);
  expect(JSON.parse(requests.find((r) => r.body)!.body!)).toEqual({
    name: "Mathematics",
    sectionId: "c",
  });
});
