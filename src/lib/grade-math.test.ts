import { describe, expect, it } from "vitest";
import { computeOverallAverage, computeTotalGrade } from "./grade-math";

describe("computeTotalGrade", () => {
  it("weights components as Quiz 20% / Assignment 10% / Others 10% / Exam 60%", () => {
    const items = [
      { id: "1", date: "2026-01-01", component: "QUIZ" as const, maxScore: 10, score: 10 },
      { id: "2", date: "2026-01-02", component: "ASSIGNMENT" as const, maxScore: 10, score: 10 },
      { id: "3", date: "2026-01-03", component: "OTHERS" as const, maxScore: 10, score: 10 },
      { id: "4", date: "2026-01-04", component: "EXAM" as const, maxScore: 10, score: 5 },
    ];
    // 100% quiz*0.2 + 100% assignment*0.1 + 100% others*0.1 + 50% exam*0.6 = 70
    expect(computeTotalGrade(items)).toBe(70);
  });

  it("re-normalizes weights when some components have no items", () => {
    const items = [
      { id: "1", date: "2026-01-01", component: "QUIZ" as const, maxScore: 10, score: 8 },
    ];
    // Only QUIZ has items, so its weight is normalized to 100% of the total.
    expect(computeTotalGrade(items)).toBe(80);
  });

  it("ignores items with a null score", () => {
    const items = [
      { id: "1", date: "2026-01-01", component: "QUIZ" as const, maxScore: 10, score: null },
      { id: "2", date: "2026-01-02", component: "EXAM" as const, maxScore: 10, score: 9 },
    ];
    expect(computeTotalGrade(items)).toBe(90);
  });

  it("returns 0 when there are no scored items", () => {
    expect(computeTotalGrade([])).toBe(0);
  });
});

describe("computeOverallAverage", () => {
  it("averages per-subject totals", () => {
    expect(computeOverallAverage([80, 90, 100])).toBe(90);
  });

  it("returns 0 for an empty list", () => {
    expect(computeOverallAverage([])).toBe(0);
  });
});
