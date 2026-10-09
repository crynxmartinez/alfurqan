import type { GradeComponent } from "@prisma/client";

// Client-safe: only a type-only import from @prisma/client, so this module
// can be imported from client components without bundling Prisma Client.

export const COMPONENT_WEIGHTS: Record<GradeComponent, number> = {
  QUIZ: 0.2,
  ASSIGNMENT: 0.1,
  OTHERS: 0.1,
  EXAM: 0.6,
};

export interface GradeItemWithEntry {
  id: string;
  date: string | Date;
  component: GradeComponent;
  maxScore: number;
  score: number | null;
}

/**
 * Computes the weighted total (0-100) for a student in a subject given
 * their grade items and entries. Each component's average percentage is
 * multiplied by its fixed weight (Quiz 20%, Assignment 10%, Others 10%,
 * Exam 60%). Components with no items are excluded and weights are
 * re-normalized across the components that do have items.
 */
export function computeTotalGrade(items: GradeItemWithEntry[]): number | null {
  const byComponent: Record<GradeComponent, { earned: number; max: number }> = {
    QUIZ: { earned: 0, max: 0 },
    ASSIGNMENT: { earned: 0, max: 0 },
    OTHERS: { earned: 0, max: 0 },
    EXAM: { earned: 0, max: 0 },
  };

  for (const item of items) {
    if (item.score == null) continue;
    byComponent[item.component].earned += item.score;
    byComponent[item.component].max += item.maxScore;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  (Object.keys(byComponent) as GradeComponent[]).forEach((component) => {
    const { earned, max } = byComponent[component];
    if (max <= 0) return;
    const percentage = (earned / max) * 100;
    const weight = COMPONENT_WEIGHTS[component];
    weightedSum += percentage * weight;
    totalWeight += weight;
  });

  if (totalWeight === 0) return null;
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Computes a simple average of per-subject totals for a student's report
 * card. Subjects with no recorded items/scores are excluded.
 */
export function computeOverallAverage(
  subjectTotals: (number | null)[],
): number | null {
  const graded = subjectTotals.filter(
    (value): value is number => value !== null && Number.isFinite(value),
  );
  if (!graded.length) return null;
  return (
    Math.round(
      (graded.reduce((sum, value) => sum + value, 0) / graded.length) * 100,
    ) / 100
  );
}

export function formatGrade(value: number | null): string {
  return value === null ? "Not graded" : value.toFixed(2);
}
