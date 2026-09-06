type Tone = "success" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  success:
    "bg-success-50 text-success-700 dark:bg-success-600/20 dark:text-green-300",
  neutral: "bg-brand-100 text-brand-500 dark:bg-brand-800 dark:text-brand-400",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
