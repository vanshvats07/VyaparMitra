"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/useLanguage";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function FinancialRecordModal({ record, onClose, onSave, language }) {
  const { t } = useLanguage(language);
  const localizedMonths = t("dashboard.months");
  const [form, setForm] = useState({
    month: record?.month || "",
    year: record?.year || new Date().getFullYear().toString(),
    sales: record?.sales ?? "",
    expenses: record?.expenses ?? "",
  });
  const [error, setError] = useState("");

  function handleChange(event) {
    setError("");
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const sales = Number(form.sales);
    const expenses = Number(form.expenses);

    if (!form.month || !form.year) return setError(t("financial.required"));
    if (form.sales === "" || !Number.isFinite(sales)) return setError(t("financial.validSales"));
    if (form.expenses === "" || !Number.isFinite(expenses)) return setError(t("financial.validExpenses"));
    if (sales < 0 || expenses < 0) return setError(t("financial.nonNegative"));

    onSave({ ...form, year: Number(form.year), sales, expenses });
  }

  const profit = Number(form.sales || 0) - Number(form.expenses || 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700">{t("financial.recent")}</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {record ? t("financial.editRecord") : t("financial.add")}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              {t("financial.month")}
              <select name="month" value={form.month} onChange={handleChange} className="mt-2 w-full rounded-xl border px-3 py-2.5 font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" required>
                <option value="">{t("financial.selectMonth")}</option>
                {months.map((month, index) => <option key={month} value={month}>{localizedMonths[index]}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              {t("financial.year")}
              <input name="year" type="number" min="2000" max="2100" value={form.year} onChange={handleChange} className="mt-2 w-full rounded-xl border px-3 py-2.5 font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" required />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              {t("financial.sales")}
              <input name="sales" type="number" min="0" step="0.01" value={form.sales} onChange={handleChange} placeholder="50000" className="mt-2 w-full rounded-xl border px-3 py-2.5 font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" required />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              {t("financial.expenses")}
              <input name="expenses" type="number" min="0" step="0.01" value={form.expenses} onChange={handleChange} placeholder="30000" className="mt-2 w-full rounded-xl border px-3 py-2.5 font-normal outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" required />
            </label>
          </div>

          <div className={`rounded-xl p-4 ${profit >= 0 ? "bg-green-50" : "bg-red-50"}`}>
            <p className="text-sm text-slate-600">{t("financial.calculated")}</p>
            <p className={`mt-1 text-xl font-bold ${profit >= 0 ? "text-green-700" : "text-red-700"}`}>₹{profit.toLocaleString("en-IN")}</p>
            {Number(form.expenses) > Number(form.sales) && <p className="mt-2 text-xs font-semibold text-red-700">{t("financial.expenseWarning")}</p>}
          </div>

          {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>
            <button type="submit" className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800">{t("common.save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}