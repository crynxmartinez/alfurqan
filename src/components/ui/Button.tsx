import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "link" | "link-danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "rounded-md bg-accent-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-800 disabled:opacity-60 dark:bg-accent-600 dark:hover:bg-accent-500",
  secondary:
    "rounded-md border border-brand-300 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:opacity-60 dark:border-brand-700 dark:text-brand-200 dark:hover:bg-brand-800",
  danger:
    "rounded-md bg-danger-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-danger-700 disabled:opacity-60",
  link: "text-sm font-medium text-brand-700 hover:underline dark:text-brand-300",
  "link-danger": "text-sm font-medium text-danger-600 hover:underline dark:text-red-400",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`${VARIANT_CLASSES[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
