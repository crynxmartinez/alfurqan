export function parseScore(value: unknown, maximum: number): number | null {
  if (value === null || value === "") return null;
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && !value.trim())
  )
    throw new Error("Enter a number or leave the score blank.");
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0 || score > maximum)
    throw new Error(`Score must be between 0 and ${maximum}.`);
  return score;
}
export function parseGradeItem(
  date: unknown,
  component: unknown,
  maximum: unknown,
) {
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    throw new Error("Choose a valid date.");
  if (!["QUIZ", "ASSIGNMENT", "OTHERS", "EXAM"].includes(String(component)))
    throw new Error("Choose a valid grade category.");
  if (typeof maximum !== "string" && typeof maximum !== "number")
    throw new Error("Maximum score is required.");
  const maxScore = Number(maximum);
  if (!Number.isFinite(maxScore) || maxScore <= 0 || maxScore > 1000000)
    throw new Error(
      "Maximum score must be greater than zero and at most 1,000,000.",
    );
  return {
    date: new Date(date),
    component: component as "QUIZ" | "ASSIGNMENT" | "OTHERS" | "EXAM",
    maxScore,
  };
}
