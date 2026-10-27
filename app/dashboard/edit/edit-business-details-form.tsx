"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { businessCategories } from "../../../lib/profile-schema";
import {
  businessDetailsSchema,
  type BusinessDetailsInput,
} from "../../../lib/profile-schema";
import type { SupportedLanguage } from "../../../lib/profile-options";
import { messages } from "../../../lib/translations";

type Props = {
  initialDetails: BusinessDetailsInput;
  language: SupportedLanguage;
};

export default function EditBusinessDetailsForm({
  initialDetails,
  language,
}: Props) {
  const router = useRouter();
  const copy = messages[language];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");

    const formData = new FormData(event.currentTarget);
    const result = businessDetailsSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );
    if (!result.success) {
      setStatusMessage(copy.editValidation);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        setStatusMessage(copy.editError);
        return;
      }

      setStatusMessage(copy.editSuccess);
      router.refresh();
    } catch {
      setStatusMessage(copy.networkError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <header className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          {copy.profileTitle}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {copy.editBusinessTitle}
        </h1>
        <p className="mt-4 leading-7 text-muted">
          {copy.editBusinessDescription}
        </p>
      </header>

      <form
        className="space-y-6 rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-8"
        onSubmit={handleSubmit}
      >
        <label className="grid gap-2 text-sm font-medium">
          {copy.businessStatus}
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue={initialDetails.businessStatus}
            name="businessStatus"
            required
          >
            <option value="planning">{copy.planning}</option>
            <option value="operating">{copy.operating}</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          {copy.experienceLevel}
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue={initialDetails.experienceLevel}
            name="experienceLevel"
            required
          >
            <option value="beginner">{copy.beginner}</option>
            <option value="some">{copy.someExperience}</option>
            <option value="experienced">{copy.experienced}</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          {copy.businessIdea}
          <textarea
            className="min-h-28 rounded-xl border border-border bg-background px-4 py-3 text-base"
            defaultValue={initialDetails.businessIdea}
            maxLength={160}
            minLength={3}
            name="businessIdea"
            required
            rows={3}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          {copy.businessCategory}
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue={initialDetails.businessCategory}
            name="businessCategory"
            required
          >
            {businessCategories.map((category) => (
              <option key={category} value={category}>
                {copy.categoryLabels[category]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          {copy.availableBudget}
          <input
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue={initialDetails.availableBudget}
            min={1}
            name="availableBudget"
            required
            step={1}
            type="number"
          />
        </label>

        {statusMessage ? (
          <p
            className="rounded-xl bg-background px-4 py-3 text-sm"
            role={statusMessage === copy.editSuccess ? "status" : "alert"}
          >
            {statusMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-6 py-3 font-semibold transition-colors hover:border-brand hover:text-brand"
            href="/dashboard"
          >
            {copy.cancel}
          </Link>
          <button
            className="min-h-12 rounded-full bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? copy.savingChanges : copy.saveChanges}
          </button>
        </div>
      </form>
    </>
  );
}
