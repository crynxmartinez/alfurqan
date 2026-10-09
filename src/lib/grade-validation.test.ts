import { describe, it, expect } from "vitest";
import { parseScore, parseGradeItem } from "./grade-validation";
import { compareGradeRows } from "./grade-sort";
describe("score validation", () => {
  it.each([-1, 101, "NaN", Infinity, true, {}, "  ", undefined])(
    "rejects invalid score %j",
    (value) => expect(() => parseScore(value, 100)).toThrow(),
  );
  it("preserves zero, decimals and clearing", () => {
    expect(parseScore(0, 100)).toBe(0);
    expect(parseScore("9.5", 10)).toBe(9.5);
    expect(parseScore("", 10)).toBeNull();
  });
  it.each([
    ["2026-02-30", "QUIZ", 100],
    ["bad", "QUIZ", 100],
    ["2026-02-01", "BAD", 100],
    ["2026-02-01", "QUIZ", 0],
    ["2026-02-01", "QUIZ", -2],
  ])("rejects invalid grade items", (date, component, max) =>
    expect(() => parseGradeItem(date, component, max)).toThrow(),
  );
});
it("sorts numeric student IDs and puts missing grades last in both directions", () => {
  const rows = [
    { name: "B", studentCode: "10", total: null },
    { name: "A", studentCode: "2", total: 0 },
    { name: "C", studentCode: "3", total: 90 },
  ];
  expect(
    [...rows]
      .sort((a, b) => compareGradeRows(a, b, "studentCode", "asc"))
      .map((r) => r.studentCode),
  ).toEqual(["2", "3", "10"]);
  expect(
    [...rows]
      .sort((a, b) => compareGradeRows(a, b, "total", "desc"))
      .map((r) => r.total),
  ).toEqual([90, 0, null]);
  expect(
    [...rows]
      .sort((a, b) => compareGradeRows(a, b, "total", "asc"))
      .map((r) => r.total),
  ).toEqual([0, 90, null]);
});
