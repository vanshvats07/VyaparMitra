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
      <OnboardingForm />
    </main>
  );
}
