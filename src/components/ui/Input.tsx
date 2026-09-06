import { type InputHTMLAttributes, type SelectHTMLAttributes, forwardRef } from "react";

const FIELD_CLASSES =
  "w-full rounded-md border border-brand-300 bg-white px-3 py-2 text-sm text-brand-900 " +
  "focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/30 " +
  "disabled:bg-brand-100 disabled:text-brand-500 " +
  "dark:border-brand-700 dark:bg-brand-900 dark:text-brand-100 dark:disabled:bg-brand-800";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`${FIELD_CLASSES} ${className}`.trim()} {...props} />;
  }
);

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = "", ...props }, ref) {
  return <select ref={ref} className={`${FIELD_CLASSES} ${className}`.trim()} {...props} />;
});

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
      {children}
    </label>
  );
}
