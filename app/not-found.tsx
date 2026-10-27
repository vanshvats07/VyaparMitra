import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center px-5 py-20 sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
        VyaparMitra
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        We could not find that page.
      </h1>
      <p className="mt-3 leading-7 text-muted">
        Check the address or return to your business starting point.
      </p>
      <Link
        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-strong"
        href="/"
      >
        Back to home
      </Link>
    </main>
  );
}
