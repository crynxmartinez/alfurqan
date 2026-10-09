"use client";
import { useEffect, useRef, useState } from "react";
import { parseScore } from "@/lib/grade-validation";
export function ScoreInput({
  studentId,
  itemId,
  initialScore,
  maxScore,
  label,
  onSaved,
  onDirty,
}: {
  studentId: string;
  itemId: string;
  initialScore: number | null;
  maxScore: number;
  label: string;
  onSaved: (score: number | null) => void;
  onDirty: (dirty: boolean) => void;
}) {
  const [draft, setDraft] = useState(
    initialScore === null ? "" : String(initialScore),
  );
  const [status, setStatus] = useState("Saved");
  const [error, setError] = useState("");
  const saved = useRef(initialScore);
  const latest = useRef(draft);
  const running = useRef(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  async function save() {
    if (running.current) return;
    running.current = true;
    try {
      while (alive.current) {
        const value = parseScore(latest.current, maxScore);
        if (value === saved.current) {
          setStatus("Saved");
          setError("");
          onDirty(false);
          break;
        }
        setStatus("Saving…");
        setError("");
        const response = await fetch("/api/teacher/grade-entries", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            gradeItemId: itemId,
            score: value,
            expectedScore: saved.current,
          }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          if ("currentScore" in body) {
            saved.current = body.currentScore;
            throw new Error(
              `Current stored score: ${body.currentScore ?? "Not graded"}. Your value is still here. Retry my value will replace the stored score.`,
            );
          }
          throw new Error(
            body.error || "Save failed. Your typed value is still here.",
          );
        }
        saved.current = value;
        if (alive.current) onSaved(value);
      }
    } catch (e) {
      if (alive.current) {
        setStatus("Not saved");
        setError((e as Error).message);
        onDirty(true);
      }
    } finally {
      running.current = false;
    }
  }
  return (
    <div className="min-w-24">
      <input
        type="number"
        step="any"
        min={0}
        max={maxScore}
        aria-label={label}
        aria-invalid={!!error}
        title={error || label}
        value={draft}
        onChange={(e) => {
          latest.current = e.target.value;
          setDraft(e.target.value);
          setStatus("Unsaved");
          onDirty(true);
        }}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void save();
          }
        }}
        className="w-20 rounded border border-brand-300 bg-white p-1 text-center text-brand-900 focus:ring-2 focus:ring-accent-600 dark:border-brand-600 dark:bg-brand-800 dark:text-white"
      />
      <div
        aria-live="polite"
        className={`mt-1 text-xs ${error ? "text-red-700 dark:text-red-300" : "text-brand-600 dark:text-brand-300"}`}
      >
        {status}
        {error && (
          <>
            <p className="max-w-48">{error}</p>
            <button type="button" className="underline" onClick={save}>
              Retry my value
            </button>
          </>
        )}
      </div>
    </div>
  );
}
