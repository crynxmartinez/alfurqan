import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-200 bg-brand-950 text-brand-200">
      <div className="geo-divider opacity-30" />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              Al-Furqan Madrasah
            </h3>
            <p className="mt-3 text-sm text-brand-300">
              Nurturing knowledge, character, and faith through balanced
              Islamic and academic education.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
              Quick Links
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-brand-300">
              <li>
                <Link href="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/grades" className="hover:text-white">
                  Check Grades
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
              Contact
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-brand-300">
              <li>info@alfurqan.edu</li>
              <li>+63 000 000 0000</li>
              <li>Madrasah Campus Address</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-brand-800 pt-6 text-center text-xs text-brand-400">
          © {new Date().getFullYear()} Al-Furqan Madrasah. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
