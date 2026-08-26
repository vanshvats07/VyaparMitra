"use client";

import BusinessChart from "./components/BusinessChart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [salesDrop, setSalesDrop] = useState(false);
  const [bulkBuyers, setBulkBuyers] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("vyaparMitraUser");

    if (!savedUser) {
      router.push("/onboarding");
      return;
    }

    setUser(JSON.parse(savedUser));
  }, [router]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </main>
    );
  }

  let projectedBalance = 80000;

  if (salesDrop) {
    projectedBalance -= 16000;
  }

  if (bulkBuyers) {
    projectedBalance += 25000;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 text-slate-900">

      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <p className="text-xl font-bold text-green-700">
              🚩 VyaparMitra
            </p>

            <p className="text-xs text-slate-500">
              व्यवसाय मार्गदर्शन एवं सहायता
            </p>
          </div>

          <div className="flex items-center gap-4">

            <span className="hidden text-sm text-slate-600 md:block">
              हिंदी | English
            </span>

            <button
              onClick={() => router.push("/onboarding")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-50"
            >
              Edit Profile
            </button>

          </div>

        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">

        <aside className="hidden w-60 shrink-0 lg:block">

          <div className="sticky top-[89px] flex h-[calc(100vh-113px)] flex-col rounded-2xl border border-green-100 bg-white p-3 shadow-sm">

            <div className="mb-4 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Main Menu
              </p>
            </div>

            <button
              className="flex w-full items-center gap-3 rounded-xl bg-green-700 px-4 py-3 text-left text-sm font-semibold text-white shadow-sm"
            >
              <span>🏠</span>
              Dashboard
            </button>

            <button
              onClick={() => router.push("/dashboard/ai-guide")}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-green-50 hover:text-green-700"
            >
              <span>🤖</span>
              AI Business Guide
            </button>

            <button
              onClick={() => router.push("/dashboard/schemes")}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              <span>🏦</span>
              Government Schemes
            </button>

            <button
              onClick={() => router.push("/dashboard/growth")}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-700"
            >
              <span>📈</span>
              Business Growth
            </button>

            <div className="my-4 border-t" />

            <button
              onClick={() => router.push("/onboarding")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <span>⚙️</span>
              Edit Profile
            </button>

            <div className="mt-auto rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 p-4">
              <p className="text-sm font-bold text-green-700">
                🚩 VyaparMitra
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                आपका digital business साथी
              </p>
            </div>

          </div>

        </aside>

        <div className="min-w-0 flex-1">

          <section className="mb-8">

            <p className="text-sm font-semibold text-green-700">
              आपका व्यवसाय डैशबोर्ड
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              नमस्ते, {user.name} जी 👋
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              आपके business को शुरू करने और आगे बढ़ाने के लिए
              जरूरी जानकारी और tools यहाँ उपलब्ध हैं।
            </p>

          </section>

          <section className="grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm md:col-span-2">

              <div className="flex items-start justify-between">

                <div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    {user.businessCategory || "Business"}
                  </span>

                  <h2 className="mt-5 text-2xl font-bold">
                    {user.businessIdea}
                  </h2>

                  <p className="mt-2 text-slate-600">
                    📍 {user.district}, {user.state}
                  </p>

                </div>

                <span className="text-2xl text-slate-400">
                  ⋮
                </span>

              </div>

              <div className="mt-8 flex items-end justify-between border-t pt-5">

                <div>

                  <p className="text-sm text-slate-500">
                    Available Budget
                  </p>

                  <p className="mt-1 text-3xl font-bold text-green-700">
                    ₹{Number(user.budget).toLocaleString("en-IN")}
                  </p>

                </div>

                <button
                  onClick={() => router.push("/onboarding")}
                  className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                >
                  View Details
                </button>

              </div>

            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
                ✓
              </div>

              <h2 className="mt-4 text-center text-xl font-bold">
                Profile Ready
              </h2>

              <p className="mt-2 text-center text-sm leading-6 text-slate-600">
                आपकी business information save हो चुकी है।
              </p>

              <button
                onClick={() => router.push("/onboarding")}
                className="mt-6 w-full rounded-lg bg-slate-100 py-3 text-sm font-semibold transition hover:bg-slate-200"
              >
                Update Profile
              </button>

            </div>

          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2">

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-bold">
                  Business Performance
                </h2>

                <select className="rounded-lg border bg-white px-3 py-2 text-sm">
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                </select>

              </div>

              <div className="mt-8">
                <BusinessChart />
              </div>

            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                Business Health
              </h2>

              <div className="mt-8 flex justify-center">

                <div className="flex h-32 w-32 items-center justify-center rounded-full border-[12px] border-green-200">

                  <div className="text-center">

                    <p className="text-3xl font-bold text-green-700">
                      82
                    </p>

                    <p className="text-xs text-slate-500">
                      /100
                    </p>

                  </div>

                </div>

              </div>

              <p className="mt-5 text-center font-semibold text-green-700">
                Strong Performance
              </p>

              <div className="mt-6 space-y-4 border-t pt-5 text-sm">

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Sales Growth
                  </span>

                  <span className="font-semibold text-green-700">
                    +12%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Profit Margin
                  </span>

                  <span className="font-semibold text-green-700">
                    +5%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Cash Flow
                  </span>

                  <span className="font-semibold">
                    Stable
                  </span>
                </div>

              </div>

            </div>

          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-2">

            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <span className="text-2xl">
                  🔮
                </span>

                <h2 className="text-xl font-bold">
                  What-If Simulator
                </h2>

              </div>

              <p className="mt-2 text-sm text-slate-600">
                अलग-अलग business situations को select करके
                उनका possible financial impact देखें।
              </p>

              <div className="mt-6 space-y-3">

                <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition hover:bg-slate-50">

                  <div className="flex gap-3">

                    <input
                      type="checkbox"
                      checked={salesDrop}
                      onChange={(e) => setSalesDrop(e.target.checked)}
                      className="mt-1"
                    />

                    <div>

                      <p className="font-semibold">
                        Sales 20% कम हो जाए
                      </p>

                      <p className="text-xs text-slate-500">
                        Seasonal demand कम होने पर
                      </p>

                    </div>

                  </div>

                  <span className="font-semibold text-red-600">
                    -₹16,000
                  </span>

                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border p-4 transition hover:bg-slate-50">

                  <div className="flex gap-3">

                    <input
                      type="checkbox"
                      checked={bulkBuyers}
                      onChange={(e) => setBulkBuyers(e.target.checked)}
                      className="mt-1"
                    />

                    <div>

                      <p className="font-semibold">
                        5 नए bulk buyers मिलें
                      </p>

                      <p className="text-xs text-slate-500">
                        Sales बढ़ने की संभावना
                      </p>

                    </div>

                  </div>

                  <span className="font-semibold text-green-700">
                    +₹25,000
                  </span>

                </label>

              </div>

              <div className="mt-6 border-t pt-5">

                <p className="text-sm text-slate-500">
                  Projected Balance
                </p>

                <p className="mt-1 text-3xl font-bold">
                  ₹{projectedBalance.toLocaleString("en-IN")}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Selected scenarios ke according estimated balance.
                </p>

              </div>

            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <span className="text-2xl">
                  ⚠️
                </span>

                <h2 className="text-xl font-bold">
                  3-Month Risk Analysis
                </h2>

              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-500">
                    Current Cash Buffer
                  </p>

                  <p className="mt-2 text-xl font-bold">
                    ₹1.2L
                  </p>

                </div>

                <div className="rounded-xl bg-red-50 p-4">

                  <p className="text-xs text-red-600">
                    Projected Max Loss
                  </p>

                  <p className="mt-2 text-xl font-bold text-red-600">
                    -₹45k
                  </p>

                </div>

              </div>

              <div className="mt-6">

                <div className="flex justify-between text-sm">

                  <span>
                    Risk Level: Moderate
                  </span>

                  <span className="text-red-600">
                    37%
                  </span>

                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-200">

                  <div className="h-2 w-[37%] rounded-full bg-red-500" />

                </div>

              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-600">

                <p>
                  ✓ आपका cash buffer projected loss को handle कर सकता है।
                </p>

                <p>
                  💡 Variable costs को कम करने से risk घट सकता है।
                </p>

              </div>

              <button className="mt-6 w-full rounded-lg border border-red-500 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                View Detailed Forecast
              </button>

            </div>

          </section>

          <section className="mt-8">

            <h2 className="text-xl font-bold">
              Quick Access
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">

              <div
                onClick={() => router.push("/dashboard/ai-guide")}
                className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-md"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                  🤖
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  AI Business Guide
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  अपने business idea, budget और location के आधार पर
                  personalized guidance पाएं।
                </p>

                <p className="mt-5 font-semibold text-green-700">
                  Open AI Guide →
                </p>

              </div>

              <div
                onClick={() => router.push("/dashboard/schemes")}
                className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  🏦
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  Government Schemes
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  आपके business के लिए relevant सरकारी योजनाओं
                  की जानकारी देखें।
                </p>

                <p className="mt-5 font-semibold text-blue-700">
                  View Schemes →
                </p>

              </div>

              <div
                onClick={() => router.push("/dashboard/growth")}
                className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-md"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                  📈
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  Business Growth
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  नए customers, markets और growth opportunities
                  खोजने में मदद पाएं।
                </p>

                <p className="mt-5 font-semibold text-orange-600">
                  Explore Growth →
                </p>

              </div>

            </div>

          </section>

          <section className="mt-8 mb-10 rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-lg font-bold">
              सहायता चाहिए?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              VyaparMitra आपके business journey में सही information,
              schemes और resources तक पहुंचने में मदद करता है।
            </p>

          </section>

        </div>

      </div>

      <footer className="border-t bg-white">

        <div className="mx-auto max-w-7xl px-6 py-5 text-center text-sm text-slate-500">
          VyaparMitra — छोटे व्यवसायों के लिए डिजिटल मार्गदर्शन
        </div>

      </footer>

    </main>
  );
}