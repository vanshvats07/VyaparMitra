"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUserId } from "@/lib/clientUser";
import { getBusinessStrategy } from "@/lib/businessRecommendations";

export default function BusinessStrategy() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = getStoredUserId(true);
    if (!userId) {
      router.push("/onboarding");
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/users/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          if (!data.success || !data.user) throw new Error(data.message);
          setUser(data.user);
        })
        .catch((fetchError) => {
          console.error("Failed to load business strategy profile:", fetchError);
          setError("Unable to load your business profile right now.");
        });
    }, 0);
    return () => clearTimeout(timer);
  }, [router]);

  if (!user) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><p className="text-slate-600">{error || "Loading..."}</p></main>;
  }

  const strategy = getBusinessStrategy(user);
  const currency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><div><p className="text-xl font-bold text-green-700">🚩 VyaparMitra</p><p className="text-xs text-slate-500">Aapka Business Digital Mitra</p></div><button onClick={() => router.push("/dashboard/ai-guide")} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50">← Back</button></div></header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-3xl bg-blue-700 p-8 text-white md:p-10"><p className="text-sm font-semibold text-blue-100">BUSINESS STRATEGY</p><h1 className="mt-2 text-3xl font-bold md:text-4xl">Plan {user.businessIdea}</h1><p className="mt-4 max-w-2xl text-blue-100">A practical plan based on your budget of {currency(Number(user.budget) || 0)}, experience, and location.</p></section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {[['Target customers', strategy.targetCustomer], ['Pricing approach', strategy.pricing], ['Positioning', strategy.positioning], ['Expense control', strategy.expenseControl], ['Revenue growth', strategy.revenueAction], ['Monthly planning', strategy.monthlyPlan]].map(([title, description]) => <article key={title} className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>)}
        </section>

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Budget planner</h2><p className="mt-2 text-sm text-slate-500">Suggested percentages are planning guidance, not financial guarantees.</p><div className="mt-5 space-y-3">{strategy.budgetAllocation.map((item) => <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="text-sm font-semibold">{item.name} ({item.percentage}%)</span><span className="text-sm font-bold text-green-700">{currency(item.amount)}</span></div>)}</div></section>

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">First 30-day priorities</h2><ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-600">{strategy.firstThirtyDays.map((item) => <li key={item}>{item}</li>)}</ol></section>
      </div>
    </main>
  );
}
