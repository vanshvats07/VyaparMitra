import type { Metadata } from "next";
import OnboardingForm from "./onboarding-form";

export const metadata: Metadata = {
  title: "Create your business profile | VyaparMitra",
  description:
    "Share your business idea, experience, and resources to begin your VyaparMitra journey.",
};

export default function OnboardingPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8 sm:py-16">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          Your starting point
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Let&apos;s understand your business journey.
        </h1>
        <p className="mt-4 leading-7 text-muted">
          A few details help us keep your next steps relevant to your
          experience, budget, and community.
        </p>
      </div>
      <OnboardingForm />
    </main>
  );
}
