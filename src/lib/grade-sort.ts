export function compareGradeRows(
  a: { name: string; studentCode: string; total: number | null },
  b: { name: string; studentCode: string; total: number | null },
  key: "name" | "studentCode" | "total",
  direction: "asc" | "desc",
) {
  // Missing grades always follow recorded grades, in either direction.
  if (key === "total" && (a.total === null || b.total === null))
    return a.total === b.total
      ? a.name.localeCompare(b.name)
      : a.total === null
        ? 1
        : -1;
  const comparison =
    key === "total"
      ? a.total! - b.total!
      : a[key].localeCompare(b[key], undefined, {
          numeric: true,
          sensitivity: "base",
        });
  return (
    (direction === "asc" ? comparison : -comparison) ||
    a.studentCode.localeCompare(b.studentCode, undefined, { numeric: true })
  );
}
