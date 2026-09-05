"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUserId } from "@/lib/clientUser";
import { getGrowthActions, getGrowthTip } from "@/lib/businessRecommendations";

export default function Growth() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    const userId = getStoredUserId(true);

    if (!userId) {
      router.push("/onboarding");
      return;
    }

    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          const userMetricsId = getStoredUserId(true);
          fetch(`/api/metrics/${userMetricsId}`)
            .then((metricsResponse) => metricsResponse.json())
            .then((metricsData) => {
              if (metricsData.success) setMetrics(metricsData.metrics || []);
            })
            .catch((metricsError) => {
              console.warn("Business metrics unavailable:", metricsError);
              setMetrics([]);
            });
        } else {
          router.push("/onboarding");
        }
      })
      .catch((fetchError) => {
        console.error("Failed to load growth profile:", fetchError);
        setError("Unable to load your business profile right now.");
      });
  }, [router]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">{error || "Loading..."}</p>
      </main>
    );
  }

  const growthActions = getGrowthActions(user, metrics);
  const growthTip = getGrowthTip(user, metrics);

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

            {growthActions.map((action, index) => (
            <div key={action.title} className="rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                {index === 0 ? "👥" : index === 1 ? "📱" : "💰"}
              </div>

              <h3 className="mt-5 text-lg font-bold">
                {action.cardTitle}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {action.description}
              </p>

              <button
                onClick={() => setSelectedAction(action)}
                className="mt-5 font-semibold text-blue-700"
              >
                Learn More →
              </button>

            </div>
            ))}

          </div>

        </section>

        <section className="mt-10">

          <h2 className="text-2xl font-bold">
            Recommended Actions
          </h2>

          <div className="mt-6 space-y-4">

            {growthActions.map((action, index) => (
            <button
              type="button"
              key={`recommended-${action.title}`}
              onClick={() => setSelectedAction(action)}
              className="flex w-full items-center justify-between rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:bg-slate-50"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
                  {index + 1}
                </div>

                <div>
                  <p className="font-bold">
                    {action.title}
                  </p>
                  <p className="text-sm text-slate-500">
                    {action.description}
                  </p>
                </div>

              </div>

              <span className="hidden text-sm font-semibold text-green-700 md:block">
                {action.impact}
              </span>

            </button>
            ))}

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
                {growthTip.subtitle}
              </p>
            </div>
          </div>

          <p className="mt-5 rounded-xl bg-orange-50 p-5 text-sm leading-6 text-slate-700">
            {growthTip.tip}
          </p>

        </section>

        {selectedAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
            <section className="w-full max-w-xl rounded-2xl border bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="growth-action-title">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-green-700">
                    {selectedAction.category} · {selectedAction.effort}
                  </p>
                  <h2 id="growth-action-title" className="mt-2 text-xl font-bold">
                    {selectedAction.title}
                  </h2>
                </div>
                <button type="button" onClick={() => setSelectedAction(null)} className="text-2xl text-slate-500" aria-label="Close details">
                  ×
                </button>
              </div>
              <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">
                {selectedAction.detail}
              </p>
              <button type="button" onClick={() => setSelectedAction(null)} className="mt-6 w-full rounded-xl bg-green-700 py-3 text-sm font-semibold text-white hover:bg-green-800">
                Done
              </button>
            </section>
          </div>
        )}

      </div>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5 text-center text-sm text-slate-500">
          VyaparMitra — Aapka Business Digital Mitra
        </div>
      </footer>

    </main>
  );
}