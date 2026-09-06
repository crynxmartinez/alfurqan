"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden flex items-center gap-2 rounded-md bg-accent-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-800"
    >
      <Printer className="h-4 w-4" />
      Print / Save as PDF
    </button>
  );
}
