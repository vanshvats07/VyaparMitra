"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getFinancialRecords } from "@/lib/financialStorage";
import { createDemoCompetitionData } from "@/lib/demoCompetitionData";
import { useLanguage } from "@/lib/useLanguage";

const initialForm = {
  businessName: "",
  businessCategory: "",
  state: "",
  district: "",
  city: "",
  budget: "",
  targetCustomers: "",
};

const loadingMessages = [
  "Understanding your local market...",
  "Analyzing competition...",
  "Finding business opportunities...",
];

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function Field({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <input
        name={name}
        type={type}
        min={type === "number" ? "0" : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
      />
    </label>
  );
}

function ScoreCard({ label, value, tone = "green" }) {
  const toneClasses = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold ${toneClasses[tone] || toneClasses.green}`}>{value}</p>
    </div>
  );
}

function ListSection({ title, items, numbered = false, unavailable = "Data unavailable." }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {items.length ? (
        numbered ? (
          <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-slate-600">{items.map((item) => <li key={item}>{item}</li>)}</ol>
        ) : (
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">{items.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green-600" />{item}</li>)}</ul>
        )
      ) : <p className="mt-4 text-sm text-slate-500">{unavailable}</p>}
    </section>
  );
}

function readJsonResponse(response, endpoint) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(`Request to ${endpoint} returned an invalid response.`);
  }
  return response.json();
}

function CompetitionCard({ competitor, isDemo, labels }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">{competitor.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{competitor.category}</p>
        </div>
        {isDemo && <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-800">{labels.example}</span>}
      </div>
      <div className="mt-4 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
        <p><strong>{labels.rating}:</strong> {competitor.rating || labels.unavailable}</p>
        <p><strong>{labels.reviews}:</strong> {competitor.reviewCount || labels.unavailable}</p>
        <p><strong>{labels.distance}:</strong> {competitor.distance || labels.unavailable}</p>
        <p><strong>{labels.price}:</strong> {competitor.priceRange || labels.unavailable}</p>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500"><strong>{labels.location}:</strong> {competitor.location || labels.unavailable}</p>
      <p className="mt-3 text-[11px] font-semibold text-slate-400">{labels.source}: {competitor.source}</p>
    </article>
  );
}

export default function LocalMarketAnalyzer() {
  const [profileLanguage, setProfileLanguage] = useState("en");
  const { t, language } = useLanguage(profileLanguage);
function createClientFallback(form, experience) {
  const profile = {
    ...form,
    village: form.city,
    experience,
  };
  return {
    success: true,
    source: "demo",
    isDemo: true,
    lastUpdated: null,
    message: t("dashboard.local.fallback"),
    competitors: createDemoCompetitionData(profile),
    assessment: {
      level: "Medium",
      explanation: language === "hi" ? `${form.businessCategory || "चयनित व्यवसाय"} के आधार पर प्रतिस्पर्धा मध्यम आंकी गई है। स्थानीय प्रतिस्पर्धी डेटा उपलब्ध नहीं है, इसलिए यह केवल संकेतात्मक आकलन है।` : `Competition is assessed as Medium based on your ${form.businessCategory || "selected business"} context. Local competitor data is currently unavailable, so this assessment is indicative rather than location-verified.`,
    },
  };
}
  const router = useRouter();
  const timerRef = useRef(null);
  const competitionContextRef = useRef({ form: initialForm, experience: "Not provided" });
  const [form, setForm] = useState(initialForm);
  const [experience, setExperience] = useState("Not provided");
  const [loadingStep, setLoadingStep] = useState(-1);
  const [assessment, setAssessment] = useState(null);
  const [source, setSource] = useState("");
  const [competition, setCompetition] = useState(null);
  const [competitionLoading, setCompetitionLoading] = useState(true);
  const [competitionError, setCompetitionError] = useState("");
  const [error, setError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  const loadCompetition = useCallback(async () => {
    setCompetitionLoading(true);
    setCompetitionError("");
    try {
      const response = await fetch("/api/competition", { cache: "no-store" });
      const data = await readJsonResponse(response, "/api/competition");
      if (!response.ok || !data.success || !Array.isArray(data.competitors)) {
        throw new Error(data.message || t("dashboard.local.competitionError"));
      }
      setCompetition(data);
    } catch (competitionLoadError) {
      console.error("Failed to load competition data:", competitionLoadError);
      setCompetition(createClientFallback(competitionContextRef.current.form, competitionContextRef.current.experience));
      setCompetitionError("");
    } finally {
      setCompetitionLoading(false);
    }
  }, []);

  useEffect(() => {
    const competitionTimer = setTimeout(() => loadCompetition(), 0);
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => {
        if (!data.success || !data.user) throw new Error(t("dashboard.local.profileError"));
        const user = data.user;
        const profileForm = {
          businessName: user.businessIdea || "",
          businessCategory: user.businessCategory || "",
          state: user.state || "",
          district: user.district || "",
          city: user.village || "",
          budget: user.budget ?? "",
          targetCustomers: "",
        };
        setProfileLanguage(user.language || "en");
        const profileExperience = user.experience || t("dashboard.notProvided");
        competitionContextRef.current = { form: profileForm, experience: profileExperience };
        setForm(profileForm);
        setExperience(profileExperience);
      })
      .catch(() => setError(t("dashboard.local.profileError")))
      .finally(() => setProfileLoading(false));
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(competitionTimer);
    };
  }, [loadCompetition]);

  function updateField(event) {
    setForm((current) => {
      const nextForm = { ...current, [event.target.name]: event.target.value };
      competitionContextRef.current = { form: nextForm, experience };
      return nextForm;
    });
  }

  async function analyzeMarket(event) {
    event.preventDefault();
    setError("");
    setAssessment(null);
    if (!form.businessCategory.trim() || !form.state.trim() || !form.district.trim()) {
      setError(t("dashboard.local.analyzeError"));
      return;
    }

    setLoadingStep(0);
    timerRef.current = setInterval(() => {
      setLoadingStep((current) => Math.min(current + 1, loadingMessages.length - 1));
    }, 1800);

    try {
      const records = getFinancialRecords().slice(-24).map((record) => ({
        month: String(record.month || ""),
        sales: Number(record.sales || 0),
        expenses: Number(record.expenses || 0),
        profit: Number(record.profit ?? Number(record.sales || 0) - Number(record.expenses || 0)),
      }));
      const response = await fetch("/api/market/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language, budget: Number(form.budget || 0), experience, existingFinancialData: records }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || t("dashboard.local.marketError"));
      setAssessment(data.assessment);
      setSource(data.source || "AI Market Assessment");
    } catch (analysisError) {
      setError(analysisError.message || t("dashboard.local.unavailableAnalysis"));
    } finally {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setLoadingStep(-1);
    }
  }

  const location = [form.city, form.district, form.state].filter(Boolean).join(", ");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div><p className="text-xl font-bold text-green-700">🚩 VyaparMitra</p><p className="text-xs text-slate-500">{t("dashboard.local.title")}</p></div>
          <button onClick={() => router.push("/dashboard")} className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← {t("dashboard.local.dashboard")}</button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-3xl bg-green-700 p-8 text-white shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-100">{t("dashboard.local.eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{t("dashboard.local.title")}</h1>
          <p className="mt-3 max-w-2xl text-green-100">{t("dashboard.local.subtitle")}</p>
        </section>

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="text-xl font-bold">{t("dashboard.local.businessLocation")}</h2><p className="mt-1 text-sm text-slate-500">{t("dashboard.local.profileHelp")}</p></div>
            {location && <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">{location}</span>}
          </div>
          <form onSubmit={analyzeMarket} className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label={t("dashboard.local.category")} name="businessCategory" value={form.businessCategory} onChange={updateField} placeholder={t("dashboard.local.placeholderCategory")} />
            <Field label={t("dashboard.local.name")} name="businessName" value={form.businessName} onChange={updateField} placeholder={t("dashboard.local.placeholderName")} />
            <Field label={t("dashboard.local.state")} name="state" value={form.state} onChange={updateField} />
            <Field label={t("dashboard.local.district")} name="district" value={form.district} onChange={updateField} />
            <Field label={t("dashboard.local.city")} name="city" value={form.city} onChange={updateField} />
            <Field label={t("dashboard.local.budget")} name="budget" value={form.budget} onChange={updateField} type="number" placeholder="200000" />
            <label className="text-sm font-semibold text-slate-700 md:col-span-2">{t("dashboard.local.target")}<textarea name="targetCustomers" value={form.targetCustomers} onChange={updateField} rows="3" placeholder={t("dashboard.local.placeholderTarget")} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100" /></label>
            <div className="flex items-center gap-3 md:col-span-2"><button type="submit" disabled={profileLoading || loadingStep >= 0} className="rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50">{loadingStep >= 0 ? [t("dashboard.local.loadingOne"), t("dashboard.local.loadingTwo"), t("dashboard.local.loadingThree")][loadingStep] : t("dashboard.local.analyze")}</button>{loadingStep >= 0 && <span className="text-sm text-slate-500">{t("dashboard.local.moments")}</span>}</div>
          </form>
          {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </section>

        {assessment && <div className="mt-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-green-700">{t("dashboard.local.assessing", { location: location || (language === "hi" ? "चयनित क्षेत्र" : "your selected area") })}</p><h2 className="mt-1 text-2xl font-bold">{t("dashboard.local.overview")}</h2></div><span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{source}</span></div>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm lg:col-span-1"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Market Opportunity</p><p className="mt-2 text-3xl font-bold text-green-700">{assessment.marketOpportunityScore}<span className="text-base text-slate-400"> / 100</span></p><div className="mt-4 h-2 rounded-full bg-green-100"><div className="h-2 rounded-full bg-green-600" style={{ width: `${assessment.marketOpportunityScore}%` }} /></div></div>
            <ScoreCard label={t("dashboard.local.competition")} value={assessment.competitionLevel} tone="blue" />
            <ScoreCard label={t("dashboard.local.demand")} value={assessment.demandPotential} tone="green" />
            <ScoreCard label={t("dashboard.local.difficulty")} value={assessment.entryDifficulty} tone="amber" />
            <ScoreCard label={t("dashboard.local.risk")} value={assessment.businessRisk} tone="red" />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{t("dashboard.local.competitionAnalysis")}</h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {competition?.isDemo ? t("dashboard.local.demoData") : t("dashboard.local.realData")}
                  </p>
                </div>
                <button onClick={loadCompetition} disabled={competitionLoading} className="rounded-lg border border-green-700 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50">
                  {competitionLoading ? t("common.loading") : t("dashboard.local.refresh")}
                </button>
              </div>

              {competitionLoading ? (
                <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">{t("dashboard.local.loadingCompetitors")}</p>
              ) : competitionError ? (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5"><p className="text-sm text-red-700">{competitionError}</p><button onClick={loadCompetition} className="mt-3 text-sm font-semibold text-red-700 underline">{t("dashboard.local.tryAgain")}</button></div>
              ) : competition?.isDemo ? (
                <>
                  <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">{t("dashboard.local.demoNotice")}</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">{competition.competitors.map((competitor) => <CompetitionCard key={competitor.name} competitor={competitor} isDemo labels={{ example: t("dashboard.local.example"), rating: t("dashboard.local.rating"), reviews: t("dashboard.local.reviews"), distance: t("dashboard.local.distance"), price: t("dashboard.local.price"), location: t("dashboard.local.location"), source: t("dashboard.local.source"), unavailable: t("dashboard.local.unavailable") }} />)}</div>
                </>
              ) : (
                <>
                  <p className="mt-5 text-xs font-semibold text-green-700">{t("dashboard.local.liveData")}{competition.lastUpdated ? ` • ${new Date(competition.lastUpdated).toLocaleString("en-IN")}` : ""}</p>
                  {competition.competitors.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{competition.competitors.map((competitor) => <CompetitionCard key={`${competitor.name}-${competitor.location || "result"}`} competitor={competitor} labels={{ example: t("dashboard.local.example"), rating: t("dashboard.local.rating"), reviews: t("dashboard.local.reviews"), distance: t("dashboard.local.distance"), price: t("dashboard.local.price"), location: t("dashboard.local.location"), source: t("dashboard.local.source"), unavailable: t("dashboard.local.unavailable") }} />)}</div> : <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">{t("dashboard.local.noResults")}</p>}
                </>
              )}

              {competition?.assessment && <div className="mt-6 border-t pt-5"><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{competition.isDemo ? t("dashboard.local.demoAssessment") : t("dashboard.local.aiAssessment")}</p><p className="mt-2 text-sm leading-6 text-slate-600">{competition.assessment.explanation}</p></div>}
            </section>
            <ListSection title={t("dashboard.local.opportunities")} items={assessment.opportunities} unavailable={t("dashboard.local.unavailable")} />
          </section>

          <section className="grid gap-6 lg:grid-cols-2"><ListSection title={t("dashboard.local.standOut")} items={assessment.competitiveAdvantages} numbered unavailable={t("dashboard.local.unavailable")} /><ListSection title={t("dashboard.local.locationStrategy")} items={assessment.locationStrategy} unavailable={t("dashboard.local.unavailable")} /></section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">{t("dashboard.local.segments")}</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{assessment.customerSegments.length ? assessment.customerSegments.map((segment) => <article key={segment.name} className="rounded-xl bg-slate-50 p-4"><h3 className="font-bold">{segment.name}</h3><p className="mt-2 text-sm text-green-700"><strong>{t("dashboard.local.potential")}:</strong> {segment.potential}</p><p className="mt-2 text-sm leading-6 text-slate-600"><strong>{t("dashboard.local.whyMatters")}:</strong> {segment.whyItMatters}</p><p className="mt-2 text-sm leading-6 text-slate-600"><strong>{t("dashboard.local.approach")}:</strong> {segment.suggestedApproach}</p></article>) : <p className="text-sm text-slate-500">{t("dashboard.local.unavailable")}</p>}</div></section>

          <section className="grid gap-6 lg:grid-cols-2"><ListSection title={t("dashboard.local.gaps")} items={assessment.marketGaps} unavailable={t("dashboard.local.unavailable")} /><section className="rounded-2xl border border-green-200 bg-green-50 p-6"><p className="text-xs font-semibold uppercase tracking-wide text-green-700">{t("dashboard.local.aiAssessment")}</p><h2 className="mt-2 text-xl font-bold">{t("dashboard.local.recommendation")}</h2><p className="mt-4 text-sm leading-6 text-slate-700">{assessment.recommendation.summary}</p><div className="mt-5 space-y-4 text-sm"><p><strong>{t("dashboard.local.biggestOpportunity")}</strong> {assessment.recommendation.biggestOpportunity}</p><p><strong>{t("dashboard.local.biggestRisk")}</strong> {assessment.recommendation.biggestRisk}</p><p><strong>{t("dashboard.local.firstAction")}</strong> {assessment.recommendation.firstAction}</p><p><strong>{t("dashboard.local.avoid")}</strong> {assessment.recommendation.avoid}</p></div></section></section>
        </div>}
      </div>
    </main>
  );
}
