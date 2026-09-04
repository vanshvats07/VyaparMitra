"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AIGuide() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId =
      localStorage.getItem("vyaparMitraUserId") ||
      localStorage.getItem("userId");

    if (!userId) {
      router.push("/onboarding");
      return;
    }

    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          router.push("/onboarding");
        }
      })
      .catch(() => router.push("/onboarding"));
  }, [router]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <p className="text-xl font-bold text-green-700">
              🚩 VyaparMitra
            </p>
            <p className="text-xs text-slate-500">
              Aapka Business Digital Mitra
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">

        <section className="rounded-3xl bg-green-700 p-8 text-white md:p-10">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl">
            🤖
          </div>

          <p className="mt-6 text-sm font-semibold text-green-100">
            AI BUSINESS GUIDE
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Hello {user.name} 👋
          </h1>

          <p className="mt-4 max-w-2xl text-green-100">
            Aapke business idea, budget aur location ko samajhkar
            better business decisions lene mein VyaparMitra aapki
            help karega.
          </p>

        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Business Idea
            </p>
            <p className="mt-2 text-lg font-bold">
              {user.businessIdea}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Available Budget
            </p>
            <p className="mt-2 text-lg font-bold text-green-700">
              ₹{Number(user.budget).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Location
            </p>
            <p className="mt-2 text-lg font-bold">
              {user.district}, {user.state}
            </p>
          </div>

        </section>

        <section className="mt-8">

          <h2 className="text-2xl font-bold">
            What do you want help with?
          </h2>

          <p className="mt-2 text-slate-600">
            Choose a topic to explore business guidance.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <div className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-3xl">💡</div>

              <h3 className="mt-4 text-lg font-bold">
                Business Idea
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Check whether your business idea is practical
                and what you should consider before starting.
              </p>

              <p className="mt-5 font-semibold text-green-700">
                Explore →
              </p>
            </div>

            <div className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-3xl">💰</div>

              <h3 className="mt-4 text-lg font-bold">
                Budget Planning
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Understand how you can divide your available
                budget for starting and running the business.
              </p>

              <p className="mt-5 font-semibold text-green-700">
                Plan Budget →
              </p>
            </div>

            <div className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-3xl">📍</div>

              <h3 className="mt-4 text-lg font-bold">
                Location Strategy
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Understand what factors you should consider
                when choosing your business location.
              </p>

              <p className="mt-5 font-semibold text-green-700">
                View Strategy →
              </p>
            </div>

            <div className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-3xl">📈</div>

              <h3 className="mt-4 text-lg font-bold">
                Growth Strategy
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Explore practical ways to find customers,
                increase sales and grow your business.
              </p>

              <p className="mt-5 font-semibold text-green-700">
                Explore Growth →
              </p>
            </div>

          </div>

        </section>

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>

            <div>
              <h2 className="font-bold">
                Personalized AI Guidance
              </h2>

              <p className="text-sm text-slate-500">
                AI recommendations will appear here.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
            Your personalized recommendations will be generated
            based on your business profile.
          </div>

        </section>

      </div>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5 text-center text-sm text-slate-500">
          VyaparMitra — Aapka Business Digital Mitra
        </div>
      </footer>

    </main>
  );
}