"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readJsonResponse } from "@/lib/clientHttp";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => {
        if (response.ok) router.replace("/dashboard");
      })
      .catch(() => {});
  }, [router]);

  function handleChange(event) {
    setErrorMessage("");
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await readJsonResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid phone number or password.");
      }

      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(error.message || "Unable to log in right now. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xl font-bold text-green-700">🚩 VyaparMitra</p>
            <p className="text-xs text-slate-500">Aapka Business Digital Mitra</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-semibold text-slate-600 hover:text-green-700"
          >
            ← Home
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-md px-6 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">🔐</div>
          <h1 className="mt-5 text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="mt-3 text-slate-600">Log in to continue to your personalized business dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <label className="block text-sm font-semibold text-slate-700">
            Phone Number
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              inputMode="tel"
              autoComplete="tel"
              placeholder="Enter 10-digit phone number"
              className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              required
            />
          </label>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="mt-2 w-full rounded-xl border px-4 py-3 font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              required
            />
          </label>

          {errorMessage && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-green-700 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <button type="button" onClick={() => router.push("/onboarding")} className="font-semibold text-green-700 hover:underline">
              Sign Up
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}
