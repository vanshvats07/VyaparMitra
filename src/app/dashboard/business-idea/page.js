"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUserId } from "@/lib/clientUser";
import { getBusinessIdeas } from "@/lib/businessRecommendations";

export default function BusinessIdea() {
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
          console.error("Failed to load business idea profile:", fetchError);
          setError("Unable to load your business profile right now.");
        });
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  if (!user) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><p className="text-slate-600">{error || "Loading..."}</p></main>;
  }

  const ideas = getBusinessIdeas(user);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div><p className="text-xl font-bold text-green-700">🚩 VyaparMitra</p><p className="text-xs text-slate-500">Aapka Business Digital Mitra</p></div>
          <button onClick={() => router.push("/dashboard/ai-guide")} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50">← Back</button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-3xl bg-green-700 p-8 text-white md:p-10">
          <p className="text-sm font-semibold text-green-100">BUSINESS IDEA</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Ideas for {user.businessIdea}</h1>
          <p className="mt-4 max-w-2xl text-green-100">Personalized guidance based on your {user.businessCategory || "business"} category, budget, experience, and location in {user.district}, {user.state}.</p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          {ideas.map((idea) => (
            <article key={idea.title} className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">{idea.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{idea.description}</p>
              <p className="mt-3 text-sm text-slate-600"><strong>Why it fits:</strong> {idea.reason}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Budget</p><p className="mt-1 text-sm font-semibold">{idea.budgetRange}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Difficulty</p><p className="mt-1 text-sm font-semibold">{idea.difficulty}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Customers</p><p className="mt-1 text-sm font-semibold">{idea.customerType}</p></div>
              </div>
              <p className="mt-5 text-sm font-semibold">Possible products/services: <span className="font-normal text-slate-600">{idea.products}</span></p>
              <h3 className="mt-5 font-bold">First steps</h3>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-slate-600">{idea.firstSteps.map((step) => <li key={step}>{step}</li>)}</ol>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
