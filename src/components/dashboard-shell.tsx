"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export function DashboardShell({
  role,
  name,
  children,
}: {
  role: string;
  name: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-50">
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-brand-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-800 bg-brand-900 text-white">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2 L21 8 L21 22 L3 22 L3 8 Z" />
              <path d="M12 2 L12 22" />
              <path d="M3 8 L21 8" />
            </svg>
          </span>
          <span className="font-display text-sm font-semibold text-brand-900">
            Al-Furqan Portal
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-brand-700 hover:bg-brand-100"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar: static on desktop, sliding drawer on mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <DashboardSidebar role={role} name={name} onNavigate={() => setOpen(false)} />
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:py-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
