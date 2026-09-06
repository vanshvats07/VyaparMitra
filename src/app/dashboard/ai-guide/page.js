"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import {
  getBusinessIdeas,
  getBusinessStrategy,
  getGrowthActions,
  getLocationStrategy,
} from "@/lib/businessRecommendations";
import { useLanguage } from "@/lib/useLanguage";

export default function AIGuide() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userError, setUserError] = useState("");
  const [userId, setUserId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [asking, setAsking] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationError, setRecommendationError] = useState("");
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const { t } = useLanguage(user?.language);
  const {
    supported: speechSupported,
    listening,
    error: speechError,
    toggleListening,
    stopListening,
  } = useSpeechRecognition({
    language: user?.language,
    onText: setQuestion,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUserId(data.user._id);
            setUser(data.user);
          } else {
            router.push("/login");
          }
        })
        .catch((fetchError) => {
          console.error("Failed to load AI guide profile:", fetchError);
          setUserError("Unable to load your business profile right now.");
        });
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim() || !userId) return;

    stopListening();

    setAsking(true);
    setAnswerError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: question }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not generate guidance.");
      }

      setAnswer(data.reply);
    } catch (error) {
      setAnswerError(error.message || "Could not generate guidance.");
    } finally {
      setAsking(false);
    }
  }

  async function handleRecommendations() {
    if (!userId) return;

    setLoadingRecommendations(true);
    setRecommendationError("");

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not generate recommendations.");
      }

      setRecommendations(data.recommendations || []);
    } catch (error) {
      setRecommendationError(
        error.message || "Could not generate recommendations."
      );
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">{userError || t("common.loading")}</p>
      </main>
    );
  }

  const businessIdea = getBusinessIdeas(user)[0];
  const businessStrategy = getBusinessStrategy(user);
  const growthAction = getGrowthActions(user)[0];
  const locationStrategy = getLocationStrategy(user);

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <p className="text-xl font-bold text-green-700">
              🚩 VyaparMitra
            </p>
            <p className="text-xs text-slate-500">
              {t("common.footer")}
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            ← {t("common.dashboard")}
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">

        <section className="rounded-3xl bg-green-700 p-8 text-white md:p-10">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl">
            🤖
          </div>

          <p className="mt-6 text-sm font-semibold text-green-100">
            {t("dashboard.aiGuide")}
          </p>

          <h1 className="mt-2 text-3xl font-bold md:text-4xl">
            {t("dashboard.aiGuidePage.hello")} {user.name} 👋
          </h1>

          <p className="mt-4 max-w-2xl text-green-100">
            {user.language === "hi" ? "आपके व्यवसाय विचार, बजट और स्थान को समझकर VyaparMitra बेहतर निर्णय लेने में आपकी मदद करेगा।" : "VyaparMitra will understand your business idea, budget, and location to help you make better business decisions."}
          </p>

        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              {t("common.businessIdea")}
            </p>
            <p className="mt-2 text-lg font-bold">
              {user.businessIdea}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              {t("common.availableBudget")}
            </p>
            <p className="mt-2 text-lg font-bold text-green-700">
              ₹{Number(user.budget).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              {t("common.location")}
            </p>
            <p className="mt-2 text-lg font-bold">
              {user.district}, {user.state}
            </p>
          </div>

        </section>

        <section className="mt-8">

          <h2 className="text-2xl font-bold">
            {t("dashboard.aiGuidePage.helpTitle")}
          </h2>

          <p className="mt-2 text-slate-600">
            {t("dashboard.aiGuidePage.helpSubtitle")}
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <div onClick={() => router.push("/dashboard/business-idea")} className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-3xl">💡</div>

              <h3 className="mt-4 text-lg font-bold">
                {t("common.businessIdea")}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {businessIdea.description} {businessIdea.reason} {businessIdea.budgetRange}.
                Difficulty: {businessIdea.difficulty}.
              </p>

              <p className="mt-5 font-semibold text-green-700">
                {t("common.explore")} →
              </p>
            </div>

            <div onClick={() => router.push("/dashboard/business-strategy")} className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-3xl">💰</div>

              <h3 className="mt-4 text-lg font-bold">
                {t("dashboard.aiGuidePage.businessStrategy")}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {user.language === "hi" ? "लक्षित ग्राहक" : "Target customers"}: {businessStrategy.targetCustomer}. {businessStrategy.pricing}
                {" "}{businessStrategy.expenseControl}
              </p>

              <p className="mt-5 font-semibold text-green-700">
                {t("dashboard.aiGuidePage.planBudget")} →
              </p>
            </div>

            <div onClick={() => router.push("/dashboard/location-strategy")} className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-3xl">📍</div>

              <h3 className="mt-4 text-lg font-bold">
                {t("dashboard.aiGuidePage.locationStrategy")}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {locationStrategy.area} {locationStrategy.customers} {locationStrategy.suppliers}
                {" "}{locationStrategy.cost}
              </p>

              <p className="mt-5 font-semibold text-green-700">
                {t("common.viewStrategy")} →
              </p>
            </div>

            <div onClick={() => router.push("/dashboard/growth")} className="cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="text-3xl">📈</div>

              <h3 className="mt-4 text-lg font-bold">
                {t("dashboard.aiGuidePage.growthStrategy")}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {growthAction.description}
              </p>

              <p className="mt-5 font-semibold text-green-700">
                {t("common.explore")} →
              </p>
            </div>

          </div>

        </section>

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>

            <div>
              <h2 className="font-bold">
                {t("dashboard.aiGuidePage.personalized")}
              </h2>

              <p className="text-sm text-slate-500">
                {t("dashboard.aiGuidePage.recommendationsHere")}
              </p>
            </div>
          </div>

          <form onSubmit={handleAsk} className="mt-5 space-y-4">
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t("dashboard.aiGuidePage.askPlaceholder")}
                rows="4"
                maxLength="2000"
                className="w-full resize-none rounded-xl border px-4 py-3 pr-16 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />

              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  aria-label={listening ? t("dashboard.aiGuidePage.stopVoice") : t("dashboard.aiGuidePage.startVoice")}
                  title={listening ? t("dashboard.aiGuidePage.listening") : t("dashboard.aiGuidePage.startVoice")}
                  className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border text-lg transition ${
                    listening
                      ? "animate-pulse border-red-300 bg-red-50 text-red-600"
                      : "border-slate-300 bg-white text-slate-600 hover:border-green-500 hover:text-green-700"
                  }`}
                >
                  🎙️
                </button>
              )}
            </div>

            {listening && (
              <p className="text-xs font-medium text-green-700">{t("dashboard.aiGuidePage.listening")}</p>
            )}

            {speechError && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {speechError}
              </p>
            )}

            {answerError && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {answerError}
              </p>
            )}

            <button
              type="submit"
              disabled={asking || !question.trim()}
              className="rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
            >
              {asking ? t("dashboard.aiGuidePage.thinking") : t("dashboard.aiGuidePage.ask")}
            </button>

            <button
              type="button"
              onClick={handleRecommendations}
              disabled={loadingRecommendations}
              className="ml-3 rounded-xl border border-green-700 px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50 disabled:opacity-60"
            >
              {loadingRecommendations
                ? t("dashboard.aiGuidePage.preparing")
                : t("dashboard.aiGuidePage.getRecommendations")}
            </button>

            {answer && (
              <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                {answer}
              </div>
            )}

            {recommendationError && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {recommendationError}
              </p>
            )}

            {recommendations.length > 0 && (
              <div className="space-y-3">
                {recommendations.map((recommendation) => (
                  <article
                    key={`${recommendation.title}-${recommendation.priority}`}
                    className="rounded-xl border bg-slate-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-bold text-slate-900">
                        {recommendation.title}
                      </h3>
                      <span className="text-xs font-semibold uppercase text-green-700">
                        {recommendation.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {recommendation.description}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {t("dashboard.aiGuidePage.whyFits")}: {recommendation.reason}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </form>

        </section>

      </div>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5 text-center text-sm text-slate-500">
          VyaparMitra — {t("common.footer")}
        </div>
      </footer>

    </main>
  );
}