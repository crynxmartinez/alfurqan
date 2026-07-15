"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
}

const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/school-years", label: "School Years" },
  { href: "/dashboard/sections", label: "Sections" },
  { href: "/dashboard/subjects", label: "Subjects" },
  { href: "/dashboard/teachers", label: "Teachers" },
  { href: "/dashboard/students", label: "Students" },
  { href: "/dashboard/enrollments", label: "Enrollments" },
];

const TEACHER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/my-subjects", label: "My Subjects" },
  { href: "/dashboard/grade-entry", label: "Grade Entry" },
];

export function DashboardSidebar({
  role,
  name,
  onNavigate,
}: {
  role: string;
  name: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = role === "ADMIN" ? ADMIN_NAV : TEACHER_NAV;

  return (
    <aside className="flex h-full min-h-screen w-64 flex-col border-r border-brand-200 bg-brand-950 text-white">
      <div className="flex items-center gap-3 border-b border-brand-800 px-6 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-700 bg-brand-900">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2 L21 8 L21 22 L3 22 L3 8 Z" />
            <path d="M12 2 L12 22" />
            <path d="M3 8 L21 8" />
          </svg>
        </span>
        <div>
          <p className="font-display text-sm font-semibold leading-tight">
            Al-Furqan
          </p>
          <p className="text-[11px] text-brand-400">Madrasah Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`block rounded-md px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-white text-brand-950"
                  : "text-brand-200 hover:bg-brand-900 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brand-800 px-4 py-4">
        <p className="truncate text-sm font-medium text-white">{name}</p>
        <p className="mb-3 text-[11px] uppercase tracking-wide text-brand-400">
          {role}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-md border border-brand-700 px-3 py-2 text-xs font-medium text-brand-200 transition hover:bg-brand-900 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
