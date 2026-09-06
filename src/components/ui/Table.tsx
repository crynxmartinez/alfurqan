import { type TdHTMLAttributes, type ThHTMLAttributes } from "react";

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-brand-200 bg-white dark:border-brand-800 dark:bg-brand-900">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-accent-800 text-white dark:bg-brand-950">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-brand-100 dark:divide-brand-800">{children}</tbody>;
}

export function Th({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`px-5 py-3 font-medium ${className}`.trim()} {...props} />;
}

export function Td({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-5 py-3 text-brand-600 dark:text-brand-400 ${className}`.trim()}
      {...props}
    />
  );
}

export function TableEmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-6 text-center text-brand-500 dark:text-brand-400">
        {children}
      </td>
    </tr>
  );
}
