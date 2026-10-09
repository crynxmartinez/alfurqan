"use client";
import { useEffect, useState } from "react";
export async function readJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(body?.error || "Could not load records. Please retry.");
  return body as T;
}
export function useResource<T>(url: string | null) {
  const [result, setResult] = useState<{
    url: string;
    data?: T;
    error?: string;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    readJson<T>(url, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setResult({ url, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setResult({ url, error: error.message });
      });
    return () => controller.abort();
  }, [url, attempt]);
  const current = result?.url === url ? result : null;
  return {
    data: current?.data,
    error: current?.error,
    loading: !!url && !current,
    retry: () => {
      setResult(null);
      setAttempt((x) => x + 1);
    },
  };
}

// Existing forms already inspect response.ok; normalize transport failures too.
export async function safeFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    return Response.json(
      {
        error: "Connection failed. Your changes were not saved. Please retry.",
      },
      { status: 503 },
    );
  }
}
