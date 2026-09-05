"use client";

import BusinessChart from "./components/BusinessChart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateWhatIf, getWhatIfImpacts } from "@/lib/whatIf";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesDrop, setSalesDrop] = useState(false);
  const [bulkBuyers, setBulkBuyers] = useState(false);

  const loadUser = async (id) => {
    try {
      const [userResponse, metricsResponse] = await Promise.all([
        fetch(`/api/users/${id}`),
        fetch(`/api/metrics/${id}`),
      ]);

      const userData = await userResponse.json();
      const metricsData = await metricsResponse.json();

      if (!userResponse.ok || !userData.success || !userData.user) {
        throw new Error(userData.message || "Failed to load user profile");
      }

      if (!metricsResponse.ok || !metricsData.success) {
        throw new Error(metricsData.message || "Failed to load business metrics");
      }

      setUser(userData.user);
      setMetrics(metricsData.metrics || []);
    } catch (err) {
      console.error("Failed to load user from API:", err);
      setError(
        err.message ||
          "Could not load your business profile. Please check your connection and try again."
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("vyaparMitraUserId");

    if (!userId) {
      const timer = setTimeout(() => {
        setError(
          "No user profile found. Please complete the onboarding process first."
        );
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => loadUser(userId), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("vyaparMitraUserId");

    if (!userId) {
      setError(
        "No user profile found. Please complete the onboarding process first."
      );
      setLoading(false);
      return;
    }

    loadUser(userId);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />
          <p className="text-sm font-medium text-slate-600">
            Loading your business dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
            ⚠️
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Unable to Load Profile
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {error || "We couldn't find your business profile."}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleRetry}
              className="w-full rounded-xl bg-green-700 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Retry
            </button>
            <button
              onClick={() => router.push("/onboarding")}
              className="w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Go to Onboarding
            </button>
          </div>
        </div>
      </main>
    );
  }

  const latestMetric = metrics[metrics.length - 1];
  const firstMetric = metrics[0];
  const totalSales = metrics.reduce((total, metric) => total + metric.sales, 0);
  const totalProfit = metrics.reduce((total, metric) => total + metric.profit, 0);
  const salesGrowth =
    firstMetric && firstMetric.sales > 0
      ? ((latestMetric.sales - firstMetric.sales) / firstMetric.sales) * 100
      : 0;
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
  const healthScore = metrics.length
    ? Math.max(0, Math.min(100, Math.round(50 + salesGrowth + profitMargin)))
    : 0;
  const healthLabel =
    healthScore >= 70
      ? "Strong Performance"
      : healthScore >= 40
        ? "Needs Attention"
        : "At Risk";
  const cashFlowLabel = totalProfit >= 0 ? "Positive" : "Negative";
  const currentCashBuffer = Number(user.budget) || 0;
  const projectedMaxLoss = Math.round((latestMetric?.sales || 0) * 0.2 * 3);
  const riskPercent = currentCashBuffer
    ? Math.min(100, Math.round((projectedMaxLoss / currentCashBuffer) * 100))
    : 0;
  const riskLabel =
    riskPercent > 50 ? "High" : riskPercent > 20 ? "Moderate" : "Low";
  const whatIfImpacts = getWhatIfImpacts(latestMetric?.sales || 0);
  const projectedBalance = calculateWhatIf({
    baseBalance: currentCashBuffer,
    latestSales: latestMetric?.sales || 0,
    salesDrop,
    bulkBuyers,
  });

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
              {user.language === "en" ? "🇬🇧 English" : "🇮🇳 हिंदी"}
            </span>

            <button
              onClick={() => router.push("/onboarding?edit=1")}
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
              onClick={() => router.push("/onboarding?edit=1")}
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
                    📍 {user.village ? `${user.village}, ` : ""}{user.district}, {user.state}
                  </p>

                </div>

                <span className="text-2xl text-slate-400">
                  ⋮
                </span>

              </div>

              <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t pt-5">

                <div>

                  <p className="text-sm text-slate-500">
                    Available Budget
                  </p>

                  <p className="mt-1 text-3xl font-bold text-green-700">
                    ₹{Number(user.budget).toLocaleString("en-IN")}
                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    Experience Level
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-800">
                    {user.experience || "Beginner"}
                  </p>

                </div>

                <button
                  onClick={() => router.push("/onboarding?edit=1")}
                  className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                >
                  View Details
                </button>

              </div>

            </div>

            <div className="flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm">

              <div>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
                    {user.name ? user.name.charAt(0).toUpperCase() : "👤"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-bold text-slate-900">
                      {user.name}
                    </h2>
                    <p className="truncate text-xs text-slate-500">
                      📞 {user.phone}
                    </p>
                  </div>

                  <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Profile Ready
                  </span>
                </div>

                <div className="mt-5 space-y-2.5 border-t pt-4 text-xs">

                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="max-w-[150px] truncate text-right font-semibold text-slate-800">
                      {user.village ? `${user.village}, ` : ""}{user.district}, {user.state}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Experience:</span>
                    <span className="font-semibold text-slate-800">
                      {user.experience || "Beginner"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Language:</span>
                    <span className="font-semibold text-slate-800">
                      {user.language === "hi" ? "हिंदी (Hindi)" : "English"}
                    </span>
                  </div>

                </div>

              </div>

              <button
                onClick={() => router.push("/onboarding?edit=1")}
                className="mt-6 w-full rounded-lg bg-slate-100 py-2.5 text-sm font-semibold transition hover:bg-slate-200"
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
                <BusinessChart metrics={metrics} />
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
                      {healthScore}
                    </p>

                    <p className="text-xs text-slate-500">
                      /100
                    </p>

                  </div>

                </div>

              </div>

              <p className="mt-5 text-center font-semibold text-green-700">
                {healthLabel}
              </p>

              <div className="mt-6 space-y-4 border-t pt-5 text-sm">

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Sales Growth
                  </span>

                  <span className="font-semibold text-green-700">
                    {salesGrowth >= 0 ? "+" : ""}{salesGrowth.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Profit Margin
                  </span>

                  <span className="font-semibold text-green-700">
                    {profitMargin >= 0 ? "+" : ""}{profitMargin.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    Cash Flow
                  </span>

                  <span className="font-semibold">
                    {cashFlowLabel}
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
                    -₹{whatIfImpacts.salesDrop.toLocaleString("en-IN")}
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
                    +₹{whatIfImpacts.bulkBuyers.toLocaleString("en-IN")}
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
                    ₹{currentCashBuffer.toLocaleString("en-IN")}
                  </p>

                </div>

                <div className="rounded-xl bg-red-50 p-4">

                  <p className="text-xs text-red-600">
                    Projected Max Loss
                  </p>

                  <p className="mt-2 text-xl font-bold text-red-600">
                    -₹{projectedMaxLoss.toLocaleString("en-IN")}
                  </p>

                </div>

              </div>

              <div className="mt-6">

                <div className="flex justify-between text-sm">

                  <span>
                    Risk Level: {riskLabel}
                  </span>

                  <span className="text-red-600">
                    {riskPercent}%
                  </span>

                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-200">

                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{ width: `${riskPercent}%` }}
                  />

                </div>

              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-600">

                <p>
                  {riskPercent <= 100
                    ? "✓ आपका cash buffer projected loss को handle कर सकता है।"
                    : "⚠️ आपका projected loss available budget से अधिक है।"}
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