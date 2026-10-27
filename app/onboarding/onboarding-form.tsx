"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { indianStatesAndUnionTerritories, supportedLanguages } from "../../lib/profile-options";
import { profileInputSchema } from "../../lib/profile-schema";

export default function OnboardingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const parsedProfile = profileInputSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );

    if (!parsedProfile.success) {
      setErrorMessage("Please review the required details and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedProfile.data),
      });

      if (!response.ok) {
        setErrorMessage("We could not save your profile. Please try again.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage(
        "We could not reach VyaparMitra. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-8 rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-8"
      onSubmit={handleSubmit}
    >
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-5 text-xl font-semibold">About you</legend>
        <label className="grid gap-2 text-sm font-medium">
          Your name
          <input
            autoComplete="name"
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            maxLength={100}
            minLength={2}
            name="fullName"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Mobile number (India)
          <input
            autoComplete="tel"
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            inputMode="tel"
            name="phoneNumber"
            pattern="(\+91[\s-]?)?[6-9][0-9]{9}"
            required
            type="tel"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Preferred language
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue="en"
            name="preferredLanguage"
            required
          >
            {supportedLanguages.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-3">
        <legend className="mb-5 text-xl font-semibold">Where you are</legend>
        <label className="grid gap-2 text-sm font-medium">
          State or union territory
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue=""
            name="state"
            required
          >
            <option disabled value="">
              Choose your state
            </option>
            {indianStatesAndUnionTerritories.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          District
          <input
            autoComplete="address-level2"
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            maxLength={80}
            minLength={2}
            name="district"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Village, town, or city
          <input
            autoComplete="address-level3"
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            maxLength={100}
            minLength={2}
            name="village"
            required
          />
        </label>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-5 text-xl font-semibold">Your business</legend>
        <label className="grid gap-2 text-sm font-medium">
          Business status
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue="planning"
            name="businessStatus"
            required
          >
            <option value="planning">I am planning to start</option>
            <option value="operating">I already run a business</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Experience level
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue="beginner"
            name="experienceLevel"
            required
          >
            <option value="beginner">I am new to business</option>
            <option value="some">I have some experience</option>
            <option value="experienced">I have run a business before</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
          What business idea are you exploring?
          <textarea
            className="min-h-28 rounded-xl border border-border bg-background px-4 py-3 text-base"
            maxLength={160}
            minLength={3}
            name="businessIdea"
            required
            rows={3}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Business category
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue=""
            name="businessCategory"
            required
          >
            <option disabled value="">
              Choose a category
            </option>
            <option value="agriculture">Agriculture</option>
            <option value="food">Food</option>
            <option value="retail">Retail and shopkeeping</option>
            <option value="services">Services</option>
            <option value="manufacturing">Making or manufacturing</option>
            <option value="other">Another category</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Available budget (INR)
          <input
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            min={1}
            name="availableBudget"
            required
            step={1}
            type="number"
          />
        </label>
      </fieldset>

      {errorMessage ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-sm leading-6 text-muted">
          Your profile is available in this browser after you continue. Keep
          your device private.
        </p>
        <button
          className="min-h-12 rounded-full bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Saving your profile..." : "Create my profile"}
        </button>
      </div>
    </form>
  );
}
