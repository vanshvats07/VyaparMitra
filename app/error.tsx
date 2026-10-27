"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-5 py-20 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
        VyaparMitra
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        We could not load this page.
      </h1>
      <p className="mt-3 max-w-xl leading-7 text-muted">
        Please try again or return home. If the problem continues, share the
        reference below with support.
      </p>
      {error.digest ? (
        <p className="mt-3 text-sm text-muted">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          className="min-h-12 rounded-full bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-strong"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
        <Link
          className="inline-flex min-h-12 items-center rounded-full border border-border bg-white px-6 py-3 font-semibold"
          href="/"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
