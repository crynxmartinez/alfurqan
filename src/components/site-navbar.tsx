import Link from "next/link";
import { School } from "lucide-react";

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-200 bg-white/90 backdrop-blur dark:border-brand-800 dark:bg-brand-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent-700 bg-accent-700 text-white">
            <School className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <span className="font-display text-lg font-semibold tracking-wide text-brand-900 dark:text-white">
            Al-Furqan Madrasah
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-brand-700 hover:text-brand-900 dark:text-brand-300 dark:hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/grades"
            className="text-sm font-medium text-brand-700 hover:text-brand-900 dark:text-brand-300 dark:hover:text-white"
          >
            Check Grades
          </Link>
        </nav>

        <Link
          href="/login"
          className="rounded-md border border-accent-700 px-5 py-2 text-sm font-medium text-accent-700 transition hover:bg-accent-700 hover:text-white dark:border-accent-500 dark:text-accent-400 dark:hover:bg-accent-600 dark:hover:text-white"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
