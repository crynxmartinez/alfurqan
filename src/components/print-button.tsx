"use client";

import { Printer } from "lucide-react";

export function PrintButton({ disabled = false }: { disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={() => window.print()}
      className="disabled:cursor-not-allowed disabled:opacity-50 print:hidden flex items-center gap-2 rounded-md bg-accent-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-800"
    >
      <Printer className="h-4 w-4" />
      Print / Save as PDF
    </button>
  );
}
