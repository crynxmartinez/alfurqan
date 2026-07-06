import { GradeComponent } from "@prisma/client";

export const COMPONENT_WEIGHTS: Record<GradeComponent, number> = {
  QUIZ: 0.2,
  ASSIGNMENT: 0.2,
  EXAM: 0.6,
};

export interface GradeItemWithEntry {
  id: string;
  title: string;
  component: GradeComponent;
  maxScore: number;
  score: number | null;
}

/**
 * Computes the weighted total (0-100) for a student in a subject given
 * their grade items and entries. Each component's average percentage is
 * multiplied by its fixed weight (Quiz 20%, Assignment 20%, Exam 60%).
 * Components with no items are excluded and weights are re-normalized
 * across the components that do have items.
 */
export function computeTotalGrade(items: GradeItemWithEntry[]): number {
  const byComponent: Record<GradeComponent, { earned: number; max: number }> = {
    QUIZ: { earned: 0, max: 0 },
    ASSIGNMENT: { earned: 0, max: 0 },
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

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}
