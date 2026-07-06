import Link from "next/link";

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-800 bg-brand-900 text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2 L21 8 L21 22 L3 22 L3 8 Z" />
              <path d="M12 2 L12 22" />
              <path d="M3 8 L21 8" />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold tracking-wide text-brand-900">
            Al-Furqan Madrasah
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-brand-700 hover:text-brand-900">
            Home
          </Link>
          <Link href="/grades" className="text-sm font-medium text-brand-700 hover:text-brand-900">
            Check Grades
          </Link>
        </nav>

        <Link
          href="/login"
          className="rounded-md border border-brand-900 px-5 py-2 text-sm font-medium text-brand-900 transition hover:bg-brand-900 hover:text-white"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
