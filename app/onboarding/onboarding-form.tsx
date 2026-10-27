"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  indianStatesAndUnionTerritories,
  supportedLanguages,
  type SupportedLanguage,
} from "../../lib/profile-options";
import {
  businessCategories,
  profileInputSchema,
  type ProfileInput,
} from "../../lib/profile-schema";
import { messages } from "../../lib/translations";

type FieldErrors = Partial<Record<keyof ProfileInput, true>>;

function isProfileField(field: PropertyKey | undefined): field is keyof ProfileInput {
  return (
    typeof field === "string" &&
    Object.prototype.hasOwnProperty.call(profileInputSchema.shape, field)
  );
}

function fieldAttributes(field: keyof ProfileInput, errors: FieldErrors) {
  return {
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  };
}

export default function OnboardingForm() {
  const router = useRouter();
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorKind, setErrorKind] = useState<
    "validation" | "save" | "network" | null
  >(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const copy = messages[language];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorKind(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const parsedProfile = profileInputSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );

    if (!parsedProfile.success) {
      const errors: FieldErrors = {};
      for (const issue of parsedProfile.error.issues) {
        const field = issue.path[0];
        if (isProfileField(field)) {
          errors[field] = true;
        }
      }

      setFieldErrors(errors);
      setErrorKind("validation");
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
        setErrorKind("save");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setErrorKind("network");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div lang={language === "hi" ? "hi" : "en"}>
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          {copy.onboardingEyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {copy.onboardingTitle}
        </h1>
        <p className="mt-4 leading-7 text-muted">{copy.onboardingDescription}</p>
      </div>
      <form
        className="space-y-8 rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-8"
        onSubmit={handleSubmit}
      >
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-5 text-xl font-semibold">{copy.aboutYou}</legend>
        <label className="grid gap-2 text-sm font-medium">
          {copy.fullName}
          <input
            autoComplete="name"
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            maxLength={100}
            minLength={2}
            name="fullName"
            {...fieldAttributes("fullName", fieldErrors)}
            required
          />
          {fieldErrors.fullName ? (
            <span className="text-sm font-normal text-red-800" id="fullName-error">
              {copy.fieldError}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium">
          {copy.phoneNumber}
          <input
            autoComplete="tel"
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            inputMode="tel"
            name="phoneNumber"
            pattern="(\+91[\s-]?)?[6-9][0-9]{9}"
            {...fieldAttributes("phoneNumber", fieldErrors)}
            required
            type="tel"
          />
          {fieldErrors.phoneNumber ? (
            <span className="text-sm font-normal text-red-800" id="phoneNumber-error">
              {copy.fieldError}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium">
          {copy.preferredLanguage}
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            name="preferredLanguage"
            onChange={(event) => {
              const selectedLanguage = supportedLanguages.find(
                ({ value }) => value === event.currentTarget.value,
              );
              if (selectedLanguage) {
                setLanguage(selectedLanguage.value);
              }
            }}
            value={language}
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
        <legend className="mb-5 text-xl font-semibold">{copy.location}</legend>
        <label className="grid gap-2 text-sm font-medium">
          {copy.state}
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue=""
            name="state"
            {...fieldAttributes("state", fieldErrors)}
            required
          >
            <option disabled value="">
              {copy.chooseState}
            </option>
            {indianStatesAndUnionTerritories.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {fieldErrors.state ? (
            <span className="text-sm font-normal text-red-800" id="state-error">
              {copy.fieldError}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium">
          {copy.district}
          <input
            autoComplete="address-level2"
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            maxLength={80}
            minLength={2}
            name="district"
            {...fieldAttributes("district", fieldErrors)}
            required
          />
          {fieldErrors.district ? (
            <span className="text-sm font-normal text-red-800" id="district-error">
              {copy.fieldError}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium">
          {copy.village}
          <input
            autoComplete="address-level3"
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            maxLength={100}
            minLength={2}
            name="village"
            {...fieldAttributes("village", fieldErrors)}
            required
          />
          {fieldErrors.village ? (
            <span className="text-sm font-normal text-red-800" id="village-error">
              {copy.fieldError}
            </span>
          ) : null}
        </label>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-5 text-xl font-semibold">{copy.business}</legend>
        <label className="grid gap-2 text-sm font-medium">
          {copy.businessStatus}
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue="planning"
            name="businessStatus"
            {...fieldAttributes("businessStatus", fieldErrors)}
            required
          >
            <option value="planning">{copy.planning}</option>
            <option value="operating">{copy.operating}</option>
          </select>
          {fieldErrors.businessStatus ? (
            <span className="text-sm font-normal text-red-800" id="businessStatus-error">
              {copy.fieldError}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium">
          {copy.experienceLevel}
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue="beginner"
            name="experienceLevel"
            {...fieldAttributes("experienceLevel", fieldErrors)}
            required
          >
            <option value="beginner">{copy.beginner}</option>
            <option value="some">{copy.someExperience}</option>
            <option value="experienced">{copy.experienced}</option>
          </select>
          {fieldErrors.experienceLevel ? (
            <span className="text-sm font-normal text-red-800" id="experienceLevel-error">
              {copy.fieldError}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
          {copy.businessIdea}
          <textarea
            className="min-h-28 rounded-xl border border-border bg-background px-4 py-3 text-base"
            maxLength={160}
            minLength={3}
            name="businessIdea"
            {...fieldAttributes("businessIdea", fieldErrors)}
            required
            rows={3}
          />
          {fieldErrors.businessIdea ? (
            <span className="text-sm font-normal text-red-800" id="businessIdea-error">
              {copy.fieldError}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium">
          {copy.businessCategory}
          <select
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            defaultValue=""
            name="businessCategory"
            {...fieldAttributes("businessCategory", fieldErrors)}
            required
          >
            <option disabled value="">
              {copy.chooseCategory}
            </option>
            {businessCategories.map((category) => (
              <option key={category} value={category}>
                {copy.categoryLabels[category]}
              </option>
            ))}
          </select>
          {fieldErrors.businessCategory ? (
            <span className="text-sm font-normal text-red-800" id="businessCategory-error">
              {copy.fieldError}
            </span>
          ) : null}
        </label>
        <label className="grid gap-2 text-sm font-medium">
          {copy.availableBudget}
          <input
            className="min-h-12 rounded-xl border border-border bg-background px-4 text-base"
            min={1}
            name="availableBudget"
            {...fieldAttributes("availableBudget", fieldErrors)}
            required
            step={1}
            type="number"
          />
          {fieldErrors.availableBudget ? (
            <span className="text-sm font-normal text-red-800" id="availableBudget-error">
              {copy.fieldError}
            </span>
          ) : null}
        </label>
      </fieldset>

      {errorKind ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {errorKind === "validation"
            ? copy.validationSummary
            : errorKind === "save"
              ? copy.saveError
              : copy.networkError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-sm leading-6 text-muted">{copy.privacyNote}</p>
        <button
          className="min-h-12 rounded-full bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? copy.saving : copy.createProfile}
        </button>
      </div>
      </form>
    </div>
  );
}
