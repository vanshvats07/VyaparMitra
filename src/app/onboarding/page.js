"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    localStorage.setItem(
      "vyaparMitraUser",
      JSON.stringify(form)
    );

    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
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

              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Uttar Pradesh"
                required
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                District
              </label>

              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="Lucknow"
                required
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Village / City
              </label>

              <input
                name="village"
                value={form.village}
                onChange={handleChange}
                placeholder="Enter location"
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
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
                ? "Creating Your Dashboard..."
                : "Create My Business Dashboard →"}
            </button>

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