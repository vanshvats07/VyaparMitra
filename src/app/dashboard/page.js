"use client";

import BusinessChart from "./components/BusinessChart";
import WhatIfSimulator from "./components/WhatIfSimulator";
import RiskAnalysis from "./components/RiskAnalysis";
import FinancialRecordModal from "./components/FinancialRecordModal";
import FinancialRecords from "./components/FinancialRecords";
import FinancialSummary from "./components/FinancialSummary";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteFinancialRecord,
  getFinancialRecords,
  saveFinancialRecord,
  updateFinancialRecord,
} from "@/lib/financialStorage";
import {
  calculateBusinessReadiness,
  getReadinessLabel,
} from "@/lib/businessReadiness";
import { useLanguage } from "@/lib/useLanguage";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [financialRecords, setFinancialRecords] = useState([]);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage(user?.language);

  const financialData = financialRecords;
  const readiness = calculateBusinessReadiness(user, financialRecords);
  const readinessLabel = getReadinessLabel(readiness.readinessScore, user?.language);

  const readJsonResponse = async (response, endpoint) => {
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("application/json")) {
      throw new Error(
        `Request to ${endpoint} failed with status ${response.status}. The server returned a non-JSON response. Please check the server logs.`
      );
    }

    try {
      return await response.json();
    } catch {
      throw new Error(
        `Request to ${endpoint} failed with status ${response.status}. The server returned invalid JSON.`
      );
    }
  };

  const loadUser = async () => {
    try {
      setFinancialRecords(getFinancialRecords());
      const sessionResponse = await fetch("/api/auth/me");
      const sessionData = await readJsonResponse(sessionResponse, "/api/auth/me");
      if (!sessionResponse.ok || !sessionData.success || !sessionData.user?._id) {
        throw new Error("Your session has expired. Please log in again.");
      }
      const userId = sessionData.user._id;

      const userEndpoint = `/api/users/${userId}`;
      const [userResponse, metricsResponse] = await Promise.all([
        fetch(userEndpoint),
        fetch(`/api/users/${userId}/metrics`),
      ]);
      const userData = await readJsonResponse(userResponse, userEndpoint);
      const metricsData = await readJsonResponse(
        metricsResponse,
        `/api/users/${userId}/metrics`
      );

      if (!userResponse.ok || !userData.success || !userData.user) {
        throw new Error(userData.message || "Failed to load user profile");
      }

      if (!metricsResponse.ok || !metricsData.success) {
        throw new Error(metricsData.message || "Failed to load business metrics");
      }

      setUser(userData.user);
      window.localStorage.setItem("vyaparMitraUser", JSON.stringify(userData.user));
      setMetrics(metricsData.metrics);

      const historyEndpoint = `/api/metrics/${userId}`;
      const historyResponse = await fetch(historyEndpoint);
      const historyData = await readJsonResponse(historyResponse, historyEndpoint);
      if (!historyResponse.ok || !historyData.success) {
        throw new Error(historyData.message || "Failed to load business history");
      }

      try {
        const insightsEndpoint = `/api/insights?userId=${userId}`;
        const insightsResponse = await fetch(insightsEndpoint);
        const insightsData = await readJsonResponse(
          insightsResponse,
          insightsEndpoint
        );

        if (!insightsResponse.ok || !insightsData.success) {
          throw new Error(insightsData.message || "Unable to load business insights");
        }

        setInsights(insightsData.insights || null);
      } catch (insightsLoadError) {
        console.error("Failed to load business insights:", insightsLoadError);
        setInsights({
          summary: t("dashboard.insightFallback"),
          opportunities: [t("financial.insightOpportunityFallback")],
          risks: [t("financial.insightRiskFallback")],
          nextSteps: [t("financial.insightNextStepFallback")],
          isFallback: true,
        });
      } finally {
        setInsightsLoading(false);
      }
    } catch (loadError) {
      console.error("Failed to load dashboard data:", loadError);
      setError(
        loadError.message ||
          "Could not load your business profile. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadUser(), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setInsights(null);
    setInsightsLoading(true);
    loadUser();
  };

  function handleSaveRecord(record) {
    const savedRecord = editingRecord
      ? updateFinancialRecord(editingRecord.id, record)
      : saveFinancialRecord(record);
    setFinancialRecords((currentRecords) => editingRecord
      ? currentRecords.map((currentRecord) => currentRecord.id === savedRecord.id ? { ...currentRecord, ...savedRecord } : currentRecord)
      : [...currentRecords, savedRecord]);
    setEditingRecord(null);
    setIsRecordModalOpen(false);
  }

  function handleEditRecord(record) {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  }

  function handleDeleteRecord(record) {
    if (!window.confirm(`${t("financial.delete")} ${record.month} ${record.year} ${t("financial.record")}?`)) return;
    deleteFinancialRecord(record.id);
    setFinancialRecords((currentRecords) => currentRecords.filter((currentRecord) => currentRecord.id !== record.id));
  }

  async function handleLogout() {
    if (!window.confirm(`${t("common.logout")}?`)) return;
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("userId");
    localStorage.removeItem("vyaparMitraUserId");
    localStorage.removeItem("vyaparMitraUser");
    router.replace("/onboarding");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-700" />
          <p className="text-sm font-medium text-slate-600">
            {t("dashboard.loading")}
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
            {t("dashboard.unable")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {error || t("dashboard.profileMissing")}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleRetry}
              className="w-full rounded-xl bg-green-700 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              {t("common.retry")}
            </button>
            <button
              onClick={() => router.push("/onboarding")}
              className="w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {t("common.onboarding")}
            </button>
          </div>
        </div>
      </main>
    );
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
              {t("dashboard.businessSupport")}
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
              {t("common.editProfile")}
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              {t("common.logout")}
            </button>

          </div>

        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">

        <aside className="hidden w-60 shrink-0 lg:block">

          <div className="sticky top-[89px] flex h-[calc(100vh-113px)] flex-col rounded-2xl border border-green-100 bg-white p-3 shadow-sm">

            <div className="mb-4 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t("dashboard.mainMenu")}
              </p>
            </div>

            <button
              className="flex w-full items-center gap-3 rounded-xl bg-green-700 px-4 py-3 text-left text-sm font-semibold text-white shadow-sm"
            >
              <span>🏠</span>
              {t("common.dashboard")}
            </button>

            <button
              onClick={() => router.push("/dashboard/ai-guide")}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-green-50 hover:text-green-700"
            >
              <span>🤖</span>
              {t("dashboard.aiGuide")}
            </button>

            <button
              onClick={() => router.push("/dashboard/schemes")}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
            >
              <span>🏦</span>
              {t("dashboard.schemes")}
            </button>

            <button
              onClick={() => router.push("/dashboard/growth")}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-orange-700"
            >
              <span>📈</span>
              {t("dashboard.growth")}
            </button>

            <button
              onClick={() => router.push("/dashboard/invoice-scanner")}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-green-50 hover:text-green-700"
            >
              <span>🧾</span>
              {t("dashboard.invoice")}
            </button>

            <button
              onClick={() => router.push("/dashboard/local-analyzer")}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-green-50 hover:text-green-700"
            >
              <span>📍</span>
              {t("dashboard.localAnalyzer")}
            </button>

            <div className="my-4 border-t" />

            <button
              onClick={() => router.push("/onboarding?edit=1")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <span>⚙️</span>
              {t("common.editProfile")}
            </button>

            <div className="mt-auto rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 p-4">
              <p className="text-sm font-bold text-green-700">
                🚩 VyaparMitra
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {t("common.footer")}
              </p>
            </div>

          </div>

        </aside>

        <div className="min-w-0 flex-1">

          <section className="mb-8">

            <p className="text-sm font-semibold text-green-700">
              {t("dashboard.title")}
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              {t("dashboard.greeting", { name: user.name })} 👋
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              {t("dashboard.subtitle")}
            </p>

          </section>

          <section className="grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm md:col-span-2">

              <div className="flex items-start justify-between">

                <div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    {user.businessCategory || t("common.business")}
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
                    {t("common.availableBudget")}
                  </p>

                  <p className="mt-1 text-3xl font-bold text-green-700">
                    ₹{Number(user.budget).toLocaleString("en-IN")}
                  </p>

                </div>

                <div>

                  <p className="text-sm text-slate-500">
                    {t("common.experience")}
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-800">
                    {user.experience || t("dashboard.notProvided")}
                  </p>

                </div>

                <button
                  onClick={() => router.push("/onboarding?edit=1")}
                  className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                >
                  {t("dashboard.viewDetails")}
                </button>

              </div>

            </div>

            <div className="flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
                {readiness.readinessScore >= 95 ? "✓" : "!"}
              </div>

              <h2 className="mt-4 text-center text-xl font-bold">
                {readinessLabel}
              </h2>

              <p className="mt-2 text-center text-sm leading-6 text-slate-600">
                {t("dashboard.profileComplete", { percent: readiness.profileCompletion })}
              </p>

              <button
                onClick={() => router.push("/onboarding?edit=1")}
                className="mt-6 w-full rounded-lg bg-slate-100 py-2.5 text-sm font-semibold transition hover:bg-slate-200"
              >
                {t("dashboard.updateProfile")}
              </button>

            </div>

          </section>

          <section className="mt-8 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2">

              <div className="flex items-center justify-between">

                <h2 className="text-xl font-bold">
                  {t("dashboard.performance")}
                </h2>
                <button
                  onClick={() => { setEditingRecord(null); setIsRecordModalOpen(true); }}
                  className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
                >
                  {t("dashboard.addFinancialRecord")}
                </button>

              </div>

              <div className="mt-8">
                <BusinessChart data={financialData} language={user.language} />
              </div>

              <div className="mt-6 border-t pt-6">
                <FinancialSummary records={financialRecords} language={user.language} />
              </div>

            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                {t("dashboard.scoreTitle")}
              </h2>

              <div className="mt-8 flex justify-center">

                <div
                  className="flex h-32 w-32 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#15803d ${readiness.readinessScore * 3.6}deg, #dcfce7 0deg)`,
                  }}
                >

                  <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white text-center">

                    <p className="text-3xl font-bold text-green-700">
                      {readiness.readinessScore}
                    </p>

                    <p className="text-xs text-slate-500">
                      /100
                    </p>

                  </div>

                </div>

              </div>

              <p className="mt-5 text-center font-semibold text-green-700">
                {readinessLabel}
              </p>

              <div className="mt-5 rounded-xl bg-green-50 p-4 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">{t("dashboard.whyScore")}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <span>{t("dashboard.profile")}: {readiness.factors.profile}/20</span>
                  <span>{t("dashboard.financialHealth")}: {readiness.factors.financialHealth}/40</span>
                  <span>{t("dashboard.stability")}: {readiness.factors.stability}/20</span>
                  <span>{t("common.budget")}: {readiness.factors.budget}/10</span>
                  <span>{t("common.experience")}: {readiness.factors.experience}/10</span>
                </div>
                <p className="mt-3 font-semibold text-green-700">{t("dashboard.total")}: {readiness.readinessScore}/100</p>
              </div>

              <div className="mt-6 space-y-4 border-t pt-5 text-sm">

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {t("dashboard.profileCompletion")}
                  </span>

                  <span className="font-semibold text-green-700">
                    {readiness.profileCompletion}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {t("common.availableBudget")}
                  </span>

                  <span className="font-semibold text-green-700">
                    {user.budget !== undefined && user.budget !== null && String(user.budget).trim() !== ""
                      ? `₹${Number(user.budget).toLocaleString("en-IN")}`
                      : t("dashboard.notProvided")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {t("common.experience")}
                  </span>

                  <span className="font-semibold">
                    {user.experience || t("dashboard.notProvided")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {t("dashboard.financialRecords")}
                  </span>

                  <span className="font-semibold">
                    {readiness.financialRecordCount}
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
                  {t("dashboard.whatIf")}
                </h2>

              </div>

              <WhatIfSimulator
                records={financialRecords}
                language={user.language}
              />

            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <span className="text-2xl">
                  ⚠️
                </span>

                <h2 className="text-xl font-bold">
                  {t("dashboard.riskAnalysis")}
                </h2>

              </div>

              <RiskAnalysis records={financialRecords} language={user.language} />

            </div>

          </section>

          <div className="mt-8">
            <FinancialRecords
              records={financialRecords}
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
              language={user.language}
            />
          </div>

          <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">
              <span className="text-2xl">
                💡
              </span>

              <div>
                <h2 className="text-xl font-bold">
                  {t("dashboard.aiInsights")}
                </h2>

                <p className="text-sm text-slate-500">
                  {t("dashboard.insightsSubtitle")}
                </p>
              </div>
            </div>

            {insightsLoading ? (
              <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                {t("dashboard.insightsLoading")}
              </p>
            ) : !insights ? (
              <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                {t("dashboard.insightsEmpty")}
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {insights.isFallback && (
                  <p className="text-xs font-medium text-amber-700">
                    {t("dashboard.aiFallback")}
                  </p>
                )}
                <p className="rounded-xl bg-green-50 p-4 text-sm leading-6 text-slate-700">
                  {insights.summary}
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-700">
                      {t("dashboard.opportunities")}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                      {insights.opportunities.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-700">
                      {t("dashboard.risks")}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                      {insights.risks.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-4">
                    <p className="text-sm font-semibold text-orange-700">
                      {t("dashboard.nextSteps")}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                      {insights.nextSteps.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </section>

          <section className="mt-8">

            <h2 className="text-xl font-bold">
              {t("dashboard.quickAccess")}
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
                  {t("dashboard.aiGuide")}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {t("dashboard.aiGuideDescription")}
                </p>

                <p className="mt-5 font-semibold text-green-700">
                  {t("dashboard.openAiGuide")} →
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
                  {t("dashboard.schemes")}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {t("dashboard.schemesDescription")}
                </p>

                <p className="mt-5 font-semibold text-blue-700">
                  {t("dashboard.viewSchemes")} →
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
                  {t("dashboard.growth")}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {t("dashboard.growthDescription")}
                </p>

                <p className="mt-5 font-semibold text-orange-600">
                  {t("dashboard.exploreGrowth")} →
                </p>

              </div>

            </div>

          </section>

          <section className="mt-8 mb-10 rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="text-lg font-bold">
              {t("dashboard.needHelp")}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {t("dashboard.helpDescription")}
            </p>

          </section>

        </div>

      </div>

      <footer className="border-t bg-white">

        <div className="mx-auto max-w-7xl px-6 py-5 text-center text-sm text-slate-500">
          VyaparMitra — {t("common.footer")}
        </div>

      </footer>

      {isRecordModalOpen && (
        <FinancialRecordModal
          key={editingRecord?.id || "new-record"}
          record={editingRecord}
          onClose={() => { setEditingRecord(null); setIsRecordModalOpen(false); }}
          onSave={handleSaveRecord}
          language={user.language}
        />
      )}

    </main>
  );
}