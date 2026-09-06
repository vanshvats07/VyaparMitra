"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readJsonResponse } from "@/lib/clientHttp";
import states from "india-location-data/src/data/states.json";
import districts from "india-location-data/src/data/districts.json";
import blocks from "india-location-data/src/data/blocks.json";

const sortedStates = [...states].sort((first, second) =>
  first.name.localeCompare(second.name)
);

const sortedDistricts = [...districts].sort((first, second) =>
  first.name.localeCompare(second.name)
);

export default function Onboarding() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    state: "",
    district: "",
    village: "",
    businessIdea: "",
    businessCategory: "",
    budget: "",
    experience: "",
    language: "en",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [customVillage, setCustomVillage] = useState("");
  const [isCustomVillage, setIsCustomVillage] = useState(false);
  const [accountExists, setAccountExists] = useState(false);

  const selectedState = sortedStates.find((state) => state.name === form.state);
  const availableDistricts = selectedState
    ? sortedDistricts.filter(
        (district) =>
          district.stateId === selectedState.id ||
          selectedState.districtIds?.includes(district.id)
      )
    : [];
  const selectedDistrict = availableDistricts.find(
    (district) => district.name === form.district
  );
  const districtVillages = selectedDistrict
    ? blocks
        .filter((block) => block.districtId === selectedDistrict.id)
        .sort((first, second) => first.name.localeCompare(second.name))
    : [];
  const availableVillages = districtVillages;

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isEditMode = searchParams.get("edit") === "1";

    fetch("/api/auth/me")
      .then((response) => {
        if (response.ok && !isEditMode) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {});

    if (!isEditMode) return undefined;

    const timer = setTimeout(() => {
      fetch("/api/auth/me")
        .then((response) => readJsonResponse(response))
        .then((data) => {
          if (!data.success || !data.user) {
            throw new Error(data.message || "Failed to load your profile.");
          }

          setEditingUserId(data.user._id);
          setForm({
            name: data.user.name || "",
            phone: data.user.phone || "",
            state: data.user.state || "",
            district: data.user.district || "",
            village: data.user.village || "",
            businessIdea: data.user.businessIdea || "",
            businessCategory: data.user.businessCategory || "",
            budget: String(data.user.budget ?? ""),
            experience: data.user.experience || "",
            language: data.user.language || "en",
            password: "",
            confirmPassword: "",
          });
        })
        .catch((error) => setErrorMessage(error.message));
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [router]);

  function handleChange(e) {
    if (errorMessage) setErrorMessage("");

    if (e.target.name === "state") {
      setForm({ ...form, state: e.target.value, district: "", village: "" });
      setCustomVillage("");
      setIsCustomVillage(false);
      return;
    }

    if (e.target.name === "district") {
      setForm({ ...form, district: e.target.value, village: "" });
      setCustomVillage("");
      setIsCustomVillage(false);
      return;
    }

    if (e.target.name === "village" && e.target.value === "__other__") {
      setForm({ ...form, village: "" });
      setCustomVillage("");
      setIsCustomVillage(true);
      return;
    }

    if (e.target.name === "customVillage") {
      setCustomVillage(e.target.value);
      setForm({ ...form, village: e.target.value });
      return;
    }

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setAccountExists(false);

    try {
      const endpoint = editingUserId
        ? `/api/users/${editingUserId}`
        : "/api/users";
      const payload = { ...form };
      if (editingUserId && !payload.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }

      const response = await fetch(endpoint, {
        method: editingUserId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        let msg = data.message || "Failed to save user profile.";
        if (data.errors && Object.keys(data.errors).length > 0) {
          msg = Object.values(data.errors).join(", ");
        }
        setErrorMessage(msg);
        if (response.status === 409) setAccountExists(true);
        setLoading(false);
        return;
      }

      if (data.user) {
        localStorage.setItem("vyaparMitraUser", JSON.stringify(data.user));
      }

      // Redirect to /dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage("Network error: Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <div>
            <p className="text-xl font-bold text-green-700">
              🚩 VyaparMitra
            </p>

            <p className="text-xs text-slate-500">
              Your Digital Business Mitra
            </p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="text-sm font-semibold text-slate-600 hover:text-green-700"
          >
            ← Home
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
            🚀
          </div>

          <h1 className="mt-5 text-3xl font-bold text-slate-900 md:text-4xl">
            Tell Us About Your Business
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            कुछ basic information दें ताकि VyaparMitra
            आपके लिए बेहतर business guidance तैयार कर सके।
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border bg-white p-6 shadow-sm md:p-8"
        >
          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              ⚠️ {errorMessage}
              {accountExists && (
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-3 block rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  Go to Login
                </button>
              )}
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900">
              👤 Personal Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              अपने बारे में basic information दें।
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Your Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Phone Number
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

          </div>

          <>
            <div className="mb-8 mt-10">
              <h2 className="text-xl font-bold text-slate-900">🔒 Account Security</h2>
              <p className="mt-1 text-sm text-slate-500">
                {editingUserId ? "Set a password if this older account does not have one yet." : "Create a password to securely access your dashboard."}
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" minLength="8" required={!editingUserId} placeholder={editingUserId ? "Optional" : "At least 8 characters"} className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" minLength="8" required={!editingUserId && Boolean(form.password)} placeholder={editingUserId ? "Optional" : "Re-enter your password"} className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
              </div>
            </div>
          </>

          <div className="mb-8 mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              📍 Location
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              आपका business कहाँ operate करेगा?
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            <div>
              <label className="text-sm font-semibold text-slate-700">
                State
              </label>

              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Select state</option>
                {sortedStates.map((state) => (
                  <option key={state.id} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                District
              </label>

              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                required
                disabled={!form.state}
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  {form.state ? "Select district" : "Select state first"}
                </option>
                {availableDistricts.map((district) => (
                  <option key={district.id} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Village / City
              </label>

              {availableVillages.length > 0 ? (
                <select
                  name="village"
                  value={form.village}
                  onChange={handleChange}
                  disabled={!form.district}
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                >
                  <option value="">
                    {form.district ? "Select village / city" : "Select district first"}
                  </option>
                  {form.village &&
                    !availableVillages.some(
                      (village) => village.name === form.village
                    ) && (
                    <option value={form.village}>{form.village}</option>
                  )}
                  {availableVillages.map((village) => (
                    <option key={village.id} value={village.name}>
                      {village.name}
                    </option>
                  ))}
                  <option value="__other__">Other village / city</option>
                </select>
              ) : (
                <input
                  name="village"
                  value={form.village}
                  onChange={handleChange}
                  disabled={!form.district}
                  placeholder={form.district ? "Enter village / town / city" : "Select district first"}
                  className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              )}

              {form.district && availableVillages.length === 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  No verified village or town list is available for this district. Enter the locality manually.
                </p>
              )}

              {isCustomVillage && availableVillages.length > 0 && (
                <input
                  name="customVillage"
                  value={customVillage || form.village}
                  onChange={handleChange}
                  placeholder="Enter village / city"
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              )}
            </div>

          </div>

          <div className="mb-8 mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              🏪 Business Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              अपने business idea के बारे में बताएं।
            </p>
          </div>

          <div className="space-y-5">

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Business Idea
              </label>

              <textarea
                name="businessIdea"
                value={form.businessIdea}
                onChange={handleChange}
                placeholder="Example: Dairy shop, clothing store, food processing..."
                required
                rows="3"
                className="mt-2 w-full resize-none rounded-xl border px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Business Category
              </label>

              <select
                name="businessCategory"
                value={form.businessCategory}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">
                  Select category
                </option>

                <option value="Agriculture">
                  Agriculture
                </option>

                <option value="Dairy">
                  Dairy
                </option>

                <option value="Food Processing">
                  Food Processing
                </option>

                <option value="Retail">
                  Retail
                </option>

                <option value="Manufacturing">
                  Manufacturing
                </option>

                <option value="Services">
                  Services
                </option>

                <option value="Technology">
                  Technology
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

          </div>

          <div className="mb-8 mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              💰 Financial Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              आपके पास business के लिए कितना budget है?
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Available Budget
              </label>

              <div className="relative mt-2">

                <span className="absolute left-4 top-3 text-slate-500">
                  ₹
                </span>

                <input
                  name="budget"
                  type="number"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="200000"
                  required
                  min="0"
                  className="w-full rounded-xl border py-3 pl-9 pr-4 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Business Experience
              </label>

              <select
                name="experience"
                value={form.experience}
                onChange={handleChange}
                required
                className="mt-2 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">
                  Select experience
                </option>

                <option value="Beginner">
                  Beginner
                </option>

                <option value="Some Experience">
                  Some Experience
                </option>

                <option value="Experienced">
                  Experienced
                </option>

              </select>
            </div>

          </div>

          <div className="mb-8 mt-10">
            <h2 className="text-xl font-bold text-slate-900">
              🌐 Language Preference
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              आप VyaparMitra से किस भाषा में guidance चाहते हैं?
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  language: "en",
                })
              }
              className={`rounded-xl border p-4 text-left transition ${
                form.language === "en"
                  ? "border-green-500 bg-green-50"
                  : "hover:bg-slate-50"
              }`}
            >
              <p className="font-bold">🇬🇧 English</p>

              <p className="mt-1 text-sm text-slate-500">
                Business guidance in English
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  language: "hi",
                })
              }
              className={`rounded-xl border p-4 text-left transition ${
                form.language === "hi"
                  ? "border-green-500 bg-green-50"
                  : "hover:bg-slate-50"
              }`}
            >
              <p className="font-bold">🇮🇳 हिंदी</p>

              <p className="mt-1 text-sm text-slate-500">
                हिंदी में business guidance
              </p>
            </button>

          </div>

          <div className="mt-10 border-t pt-6">

            <div className="rounded-xl bg-green-50 p-4">

              <p className="text-sm font-semibold text-green-800">
                🔒 Your information is safe
              </p>

              <p className="mt-1 text-xs leading-5 text-green-700">
                यह information आपके personalized business
                dashboard को तैयार करने के लिए इस्तेमाल होगी।
              </p>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-green-600 py-4 text-base font-bold text-white transition hover:bg-green-700 disabled:opacity-60"
            >
              {loading
                ? "Saving Your Profile..."
                : editingUserId
                  ? "Save Profile Changes →"
                  : "Create My Business Dashboard →"}
            </button>

            {!editingUserId && (
              <p className="mt-5 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-semibold text-green-700 hover:underline"
                >
                  Login
                </button>
              </p>
            )}

          </div>

        </form>

      </div>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5 text-center text-sm text-slate-500">
          VyaparMitra — आपका Digital Business Mitra
        </div>
      </footer>

    </main>
  );
}