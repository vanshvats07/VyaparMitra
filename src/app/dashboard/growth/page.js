"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Growth() {
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

        <section className="rounded-3xl bg-orange-500 p-8 text-white md:p-10">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl">
            📈
          </div>

          <p className="mt-6 text-sm font-semibold text-orange-100">
            BUSINESS GROWTH
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            Grow your business 🚀
          </h1>

          <p className="mt-4 max-w-2xl text-orange-50">
            {user.businessIdea} ko grow karne ke liye customers,
            sales aur marketing par focus karein.
          </p>

        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Current Business
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

        <section className="mt-10">

          <h2 className="text-2xl font-bold">
            Growth Opportunities
          </h2>

          <p className="mt-2 text-slate-600">
            Apne business ko improve karne ke liye important areas
            par focus karein.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                👥
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Find Customers
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Local customers tak pahunchne aur naye buyers
                find karne ke practical ways.
              </p>

              <button className="mt-5 font-semibold text-blue-700">
                Learn More →
              </button>

            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                💰
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Increase Sales
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Existing customers se repeat sales aur revenue
                increase karne ke ideas.
              </p>

              <button className="mt-5 font-semibold text-green-700">
                Learn More →
              </button>

            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                📱
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Digital Marketing
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                WhatsApp, social media aur online presence ka
                better use karke customers tak pahunchna.
              </p>

              <button className="mt-5 font-semibold text-purple-700">
                Learn More →
              </button>

            </div>

          </div>

        </section>

        <section className="mt-10">

          <h2 className="text-2xl font-bold">
            Recommended Actions
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                  1
                </div>

                <div>
                  <p className="font-bold">
                    Create a Google Business Profile
                  </p>
                  <p className="text-sm text-slate-500">
                    Local customers ko apna business discover karne dein.
                  </p>
                </div>

              </div>

              <span className="hidden text-sm font-semibold text-green-700 md:block">
                High Impact
              </span>

            </div>

            <div className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                  2
                </div>

                <div>
                  <p className="font-bold">
                    Build a customer list
                  </p>
                  <p className="text-sm text-slate-500">
                    Repeat customers ke liye contact information organize karein.
                  </p>
                </div>

              </div>

              <span className="hidden text-sm font-semibold text-blue-700 md:block">
                Medium Effort
              </span>

            </div>

            <div className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
                  3
                </div>

                <div>
                  <p className="font-bold">
                    Explore new sales channels
                  </p>
                  <p className="text-sm text-slate-500">
                    Online aur local channels ke through business expand karein.
                  </p>
                </div>

              </div>

              <span className="hidden text-sm font-semibold text-orange-600 md:block">
                Growth
              </span>

            </div>

          </div>

        </section>

        <section className="mt-10 mb-10 rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>

            <div>
              <h2 className="font-bold">
                Growth Tip
              </h2>

              <p className="text-sm text-slate-500">
                Small improvements can create long-term growth.
              </p>
            </div>
          </div>

          <p className="mt-5 rounded-xl bg-orange-50 p-5 text-sm leading-6 text-slate-700">
            Pehle existing customers ko retain karne par focus karein.
            Repeat customers ke liye better service, offers aur
            consistent communication business growth mein help kar sakte hain.
          </p>

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