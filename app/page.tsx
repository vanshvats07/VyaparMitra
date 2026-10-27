import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VyaparMitra | Practical guidance for your business journey",
  description:
    "Find practical guidance to start and grow a business, shaped around your skills, budget, and local context.",
  applicationName: "VyaparMitra",
};

const benefits = [
  {
    number: "01",
    title: "Start with what you have",
    description:
      "Share your budget, experience, and interests to make your next steps more relevant to you.",
  },
  {
    number: "02",
    title: "Build around your community",
    description:
      "Keep your location and local context in view as you explore a business idea.",
  },
  {
    number: "03",
    title: "Move forward one step at a time",
    description:
      "Turn a broad idea into practical actions you can work through at your own pace.",
  },
];

const steps = [
  "Tell us a little about yourself and your location.",
  "Share your business idea, budget, and experience.",
  "Get a personal space to review your details and plan next steps.",
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg font-semibold tracking-tight"
          aria-label="VyaparMitra home"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-brand text-lg text-white">
            V
          </span>
          <span className="text-xl">VyaparMitra</span>
        </Link>
        <a
          href="#how-it-works"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
        >
          How it works
        </a>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand shadow-sm">
              <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
              A practical companion for local entrepreneurs
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your business idea deserves a{" "}
              <span className="text-brand">clear first step.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              VyaparMitra helps you think through a business journey that fits
              your experience, available budget, and local context.
            </p>
            <a
              href="#how-it-works"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              Explore how it works
              <span className="ml-2" aria-hidden="true">
                &rarr;
              </span>
            </a>
            <p className="mt-4 text-sm text-muted">
              Made for aspiring entrepreneurs and small business owners.
            </p>
          </div>

          <div
            className="relative overflow-hidden rounded-[2rem] bg-brand p-7 text-white shadow-xl sm:p-10"
            aria-label="A preview of the VyaparMitra planning approach"
          >
            <div
              className="absolute -right-14 -top-14 size-48 rounded-full border-[24px] border-white/10"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
              Your journey, your pace
            </p>
            <h2 className="mt-8 max-w-sm text-3xl font-semibold leading-snug">
              From a first thought to a practical plan.
            </h2>
            <div className="mt-10 space-y-4">
              {["Your experience", "Your resources", "Your next steps"].map(
                (item, index) => (
                  <div
                    className="flex items-center gap-4 rounded-2xl bg-white/10 p-4"
                    key={item}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent font-semibold text-foreground">
                      {index + 1}
                    </span>
                    <span className="font-medium">{item}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                A useful place to begin
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Guidance grounded in your reality.
              </h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {benefits.map((benefit) => (
                <article
                  className="rounded-2xl border border-border bg-background p-6"
                  key={benefit.number}
                >
                  <p className="text-sm font-semibold text-brand">
                    {benefit.number}
                  </p>
                  <h3 className="mt-6 text-xl font-semibold">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 leading-7 text-muted">
                    {benefit.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]"
          id="how-it-works"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              A simple start, built around you.
            </h2>
          </div>
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li
                className="flex gap-4 rounded-2xl bg-white p-5"
                key={step}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent font-semibold">
                  {index + 1}
                </span>
                <span className="pt-1 leading-7">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span className="font-semibold text-foreground">VyaparMitra</span>
          <span>Practical guidance for your business journey.</span>
        </div>
      </footer>
    </div>
  );
}
