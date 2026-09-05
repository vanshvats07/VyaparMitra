"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <p className="text-2xl font-bold text-green-700">
              🚩 VyaparMitra
            </p>
            <p className="text-xs text-slate-500">
              Aapka Business Digital Mitra
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/onboarding")}
              className="hidden text-sm font-semibold text-slate-600 hover:text-green-700 md:block"
            >
              Get Started
            </button>

            <button
              onClick={() => router.push("/onboarding")}
              className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
            >
              Shuru Karein
            </button>
          </div>

        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">

        <div>

          <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
            🚩 AI-Powered Business Advisory
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
            Aapka business idea,
            <span className="text-green-700"> hamari guidance.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            VyaparMitra aapko business planning, financial planning aur
            government opportunities ko simple language mein samajhne
            aur better decisions lene mein help karta hai.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              onClick={() => router.push("/onboarding")}
              className="rounded-xl bg-green-700 px-6 py-3.5 font-semibold text-white shadow-sm hover:bg-green-800"
            >
              Apna Business Shuru Karein →
            </button>

            <button
              onClick={() => router.push("/onboarding")}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Explore VyaparMitra
            </button>

          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500">
            <span>✓ Simple Guidance</span>
            <span>✓ Local Language</span>
            <span>✓ Government Support</span>
          </div>

        </div>

        <div className="relative">

          <div className="rounded-3xl border bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between border-b pb-5">

              <div>
                <p className="text-sm text-slate-500">
                  Dashboard Preview
                </p>
                <p className="mt-1 text-xl font-bold">
                  Business Overview
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">
                ✓
              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">

              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-sm text-slate-500">
                  Business Health
                </p>
                <p className="mt-2 text-3xl font-bold text-green-700">
                  Personalized
                </p>
                <p className="mt-1 text-xs text-green-700">
                  Based on your profile
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-sm text-slate-500">
                  Opportunities
                </p>
                <p className="mt-2 text-3xl font-bold text-blue-700">
                  Available
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  View on dashboard
                </p>
              </div>

            </div>

            <div className="mt-5 rounded-2xl border p-5">

              <div className="flex items-center justify-between">
                <p className="font-semibold">
                  Business Performance
                </p>

                <span className="text-sm font-semibold text-green-700">
                  Live data
                </span>
              </div>

              <div className="mt-6 flex h-32 items-end gap-3">

                <div className="h-[35%] flex-1 rounded-t-lg bg-green-100"></div>
                <div className="h-[50%] flex-1 rounded-t-lg bg-green-200"></div>
                <div className="h-[45%] flex-1 rounded-t-lg bg-green-300"></div>
                <div className="h-[65%] flex-1 rounded-t-lg bg-green-400"></div>
                <div className="h-[75%] flex-1 rounded-t-lg bg-green-500"></div>
                <div className="h-[90%] flex-1 rounded-t-lg bg-green-600"></div>

              </div>

            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-5">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                  🤖
                </div>

                <div>
                  <p className="font-semibold">
                    AI Business Guide
                  </p>
                  <p className="text-xs text-slate-500">
                    Personalized business suggestions
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      <section className="border-y bg-white">

        <div className="mx-auto max-w-7xl px-6 py-16">

          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-green-700">
              WHY VYAPARMITRA
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Business shuru karna ab simple hai.
            </h2>

            <p className="mt-3 text-slate-600">
              Ek hi platform par planning, guidance aur opportunities
              ko samajhne ki koshish karein.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-4">

            <div className="rounded-2xl border bg-slate-50 p-6">
              <div className="text-3xl">💼</div>
              <h3 className="mt-5 text-lg font-bold">
                Business Advisory
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Budget, location aur interest ke hisaab se
                business guidance.
              </p>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-6">
              <div className="text-3xl">💰</div>
              <h3 className="mt-5 text-lg font-bold">
                Financial Planning
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Investment, cost aur funding ko simple way mein
                samajhne mein help.
              </p>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-6">
              <div className="text-3xl">🏛️</div>
              <h3 className="mt-5 text-lg font-bold">
                Government Schemes
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Business ke liye useful government schemes aur
                opportunities.
              </p>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-6">
              <div className="text-3xl">🎙️</div>
              <h3 className="mt-5 text-lg font-bold">
                Local Language
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Hindi aur regional languages mein easy
                business guidance.
              </p>
            </div>

          </div>

        </div>

      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="rounded-3xl bg-green-700 px-6 py-12 text-center text-white md:px-16">

          <p className="text-sm font-semibold text-green-100">
            READY TO START?
          </p>

          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Apne business idea ko next step dein.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-green-100">
            Apni basic business information share karein aur
            VyaparMitra ke saath apni journey shuru karein.
          </p>

          <button
            onClick={() => router.push("/onboarding")}
            className="mt-7 rounded-xl bg-white px-7 py-3.5 font-bold text-green-700 hover:bg-green-50"
          >
            Get Started →
          </button>

        </div>

      </section>

      <footer className="border-t bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-center text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:text-left">

          <p>
            🚩 VyaparMitra — Aapka Business Digital Mitra
          </p>

          <p>
            छोटे व्यवसायों के लिए डिजिटल मार्गदर्शन
          </p>

        </div>

      </footer>

    </main>
  );
}