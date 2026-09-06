export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/60 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
