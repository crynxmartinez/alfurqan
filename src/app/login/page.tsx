import Link from "next/link";
import { School } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-950 px-6">
      <div className="absolute inset-0 bg-geo-pattern opacity-10" />

      <div className="relative w-full max-w-md rounded-2xl border border-brand-800 bg-white p-8 shadow-2xl dark:border-brand-700 dark:bg-brand-900">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent-600 bg-accent-700 text-white"
          >
            <School className="h-6 w-6" strokeWidth={1.5} />
          </Link>
          <h1 className="font-display text-2xl font-bold text-brand-900 dark:text-white">
            Staff Login
          </h1>
          <p className="mt-1 text-sm text-brand-500 dark:text-brand-400">
            Al-Furqan Madrasah — Admin &amp; Teacher access
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-brand-500 dark:text-brand-400">
          <Link href="/" className="hover:text-brand-900 dark:hover:text-white">
            &larr; Back to home
          </Link>
          {" · "}
          <Link href="/grades" className="hover:text-brand-900 dark:hover:text-white">
            Check grades
          </Link>
        </p>
      </div>
    </div>
  );
}
