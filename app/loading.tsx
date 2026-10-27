export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="mx-auto w-full max-w-5xl flex-1 px-5 py-16 sm:px-8"
    >
      <p className="sr-only">Loading your VyaparMitra page...</p>
      <div className="h-8 w-64 animate-pulse rounded-lg bg-border" />
      <div className="mt-8 h-48 animate-pulse rounded-3xl bg-white" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-2xl bg-white" />
        <div className="h-32 animate-pulse rounded-2xl bg-white" />
      </div>
    </main>
  );
}
