"use client";

import { useEffect, useRef, useId } from "react";

interface ModalProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  onClose,
  title,
  children,
  maxWidth = "max-w-sm",
}: ModalProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  // Runs once on mount only — must not depend on onClose (a new function
  // identity every parent render), or refocusing the panel on every
  // keystroke would steal focus away from whatever field is being typed in.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    containerRef.current?.focus();
    return () => {
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = Array.from(
          containerRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
          ) ?? [],
        ).filter((node) => node.getClientRects().length);
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (!first) {
          e.preventDefault();
          return;
        }
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === containerRef.current)
        ) {
          e.preventDefault();
          last.focus();
        }
        if (
          !e.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === containerRef.current)
        ) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="print:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[90vh] overflow-y-auto w-full ${maxWidth} rounded-xl bg-white p-6 shadow-xl outline-none dark:bg-brand-900 dark:text-brand-100`}
      >
        <h3
          id={titleId}
          className="mb-4 font-display text-lg font-semibold text-brand-900 dark:text-white"
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
