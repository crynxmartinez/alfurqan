import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-950 px-6">
      <div className="absolute inset-0 bg-geo-pattern opacity-10" />

      <div className="relative w-full max-w-md rounded-2xl border border-brand-800 bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <Link href="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-800 bg-brand-900 text-white">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2 L21 8 L21 22 L3 22 L3 8 Z" />
              <path d="M12 2 L12 22" />
              <path d="M3 8 L21 8" />
            </svg>
          </Link>
          <h1 className="font-display text-2xl font-bold text-brand-900">
            Staff Login
          </h1>
          <p className="mt-1 text-sm text-brand-500">
            Al-Furqan Madrasah — Admin &amp; Teacher access
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-brand-500">
          <Link href="/" className="hover:text-brand-900">
            &larr; Back to home
          </Link>
          {" · "}
          <Link href="/grades" className="hover:text-brand-900">
            Check grades
          </Link>
        </p>
      </div>
    </div>
  );
}
