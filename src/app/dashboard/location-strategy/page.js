"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUserId } from "@/lib/clientUser";
import { getLocationStrategy } from "@/lib/businessRecommendations";

export default function LocationStrategy() {
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
          console.error("Failed to load location strategy profile:", fetchError);
          setError("Unable to load your business profile right now.");
        });
    }, 0);
    return () => clearTimeout(timer);
  }, [router]);

  if (!user) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><p className="text-slate-600">{error || "Loading..."}</p></main>;
  }

  const strategy = getLocationStrategy(user);
  const location = [user.village, user.district, user.state].filter(Boolean).join(", ");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><div><p className="text-xl font-bold text-green-700">🚩 VyaparMitra</p><p className="text-xs text-slate-500">Aapka Business Digital Mitra</p></div><button onClick={() => router.push("/dashboard/ai-guide")} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50">← Back</button></div></header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-3xl bg-green-700 p-8 text-white md:p-10"><p className="text-sm font-semibold text-green-100">LOCATION STRATEGY</p><h1 className="mt-2 text-3xl font-bold md:text-4xl">Plan around {location || "your area"}</h1><p className="mt-4 max-w-2xl text-green-100">Guidance for {user.businessIdea} based on customer access, suppliers, transport, and operating costs. No exact local demand or rental data is assumed.</p></section>
        <section className="mt-8 grid gap-5 md:grid-cols-2">{[['Customer accessibility', strategy.customers], ['Recommended area', strategy.area], ['Supplier accessibility', strategy.suppliers], ['Transportation', 'Check delivery routes, travel time, and transport costs before choosing the final location.'], ['Competition', strategy.competition], ['Rent and cost', strategy.cost], ['Storage', strategy.storage], ['Visibility and foot traffic', strategy.visibility]].map(([title, description]) => <article key={title} className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></article>)}</section>
      </div>
    </main>
  );
}
