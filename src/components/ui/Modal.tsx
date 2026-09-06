"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ onClose, title, children, maxWidth = "max-w-sm" }: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidth} rounded-xl bg-white p-6 shadow-xl outline-none dark:bg-brand-900 dark:text-brand-100`}
      >
        <h3
          id="modal-title"
          className="mb-4 font-display text-lg font-semibold text-brand-900 dark:text-white"
        >
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
