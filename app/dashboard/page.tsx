import Link from "next/link";
import { redirect } from "next/navigation";
import { formatBudget } from "../../lib/format-budget";
import { getCurrentProfile } from "../../lib/profile-session";
import { messages } from "../../lib/translations";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/onboarding");
  }
  const copy = messages[profile.preferredLanguage];

  return (
    <main
      className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8 sm:py-16"
      lang={profile.preferredLanguage === "hi" ? "hi" : "en"}
    >
      <header className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
            {copy.dashboardEyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {copy.welcome(profile.fullName)}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">
            {copy.dashboardDescription}
          </p>
        </div>
        <Link
          className="rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
          href="/"
        >
          {copy.backHome}
        </Link>
      </header>

      <section
        aria-labelledby="profile-title"
        className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-brand">
              {copy.profileTitle}
            </p>
            <h2 className="mt-2 text-2xl font-semibold" id="profile-title">
              {profile.businessIdea}
            </h2>
          </div>
          <span className="rounded-full bg-background px-4 py-2 text-sm font-medium text-brand">
            {profile.businessStatus === "planning"
              ? copy.statusPlanning
              : copy.statusOperating}
          </span>
        </div>

        <dl className="mt-8 grid gap-5 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-sm text-muted">{copy.profileLocation}</dt>
            <dd className="mt-1 font-medium">
              {[profile.village, profile.district, profile.state].join(", ")}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">{copy.profileCategory}</dt>
            <dd className="mt-1 font-medium">
              {copy.categoryLabels[profile.businessCategory]}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">{copy.profileBudget}</dt>
            <dd className="mt-1 font-medium">
              {formatBudget(profile.availableBudget)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">{copy.profileExperience}</dt>
            <dd className="mt-1 font-medium">
              {profile.experienceLevel === "beginner"
                ? copy.experienceBeginner
                : profile.experienceLevel === "some"
                  ? copy.experienceSome
                  : copy.experienceExperienced}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
