"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const REMEMBER_KEY = "alfurqan_remembered_login";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      try {
        const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
        setEmail(savedEmail ?? "");
        setPassword(savedPassword ?? "");
        setRememberMe(true);
      } catch {
        localStorage.removeItem(REMEMBER_KEY);
      }
    }
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-brand-300 px-3 py-2 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
          placeholder="you@alfurqan.edu"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-600">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-brand-300 px-3 py-2 pr-10 text-sm text-brand-900 focus:border-brand-600 focus:outline-none"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-brand-400 hover:text-brand-700"
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                <path d="M9.88 4.24A9.77 9.77 0 0 1 12 4c5 0 9 4 10 8-.32 1.15-.86 2.24-1.58 3.2M6.61 6.61C4.4 8 2.9 10 2 12c1 4 5 8 10 8 1.35 0 2.62-.28 3.75-.79" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 12c1-4 5-8 10-8s9 4 10 8c-1 4-5 8-10 8s-9-4-10-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <label className="flex select-none items-center gap-2 text-sm text-brand-700">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-brand-300 text-brand-900 focus:ring-brand-600"
        />
        Remember my password on this device
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
