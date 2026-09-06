export function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-md bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-red-950/40 dark:text-red-300">
      {children}
    </div>
  );
}
