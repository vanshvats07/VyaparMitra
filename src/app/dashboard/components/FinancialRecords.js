"use client";

import { useLanguage } from "@/lib/useLanguage";

function formatCurrency(value) {
  return `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

export default function FinancialRecords({ records, onEdit, onDelete, language }) {
  const { t } = useLanguage(language);
  const localizedMonths = t("dashboard.months");
  const displayMonth = (month) => {
    const monthIndex = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].indexOf(month);
    return monthIndex >= 0 ? localizedMonths[monthIndex] : month;
  };
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{t("financial.recent")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("financial.saved")}</p>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">{records.length} {records.length === 1 ? t("financial.record") : t("financial.records")}</span>
      </div>

      {records.length === 0 ? (
        <div className="mt-6 rounded-xl bg-slate-50 p-8 text-center">
          <p className="font-semibold text-slate-700">{t("financial.none")}</p>
          <p className="mt-2 text-sm text-slate-500">{t("financial.addToTrack")}</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="pb-3 font-semibold">{t("financial.month")}</th><th className="pb-3 font-semibold">{t("financial.year")}</th><th className="pb-3 font-semibold">{t("financial.sales")}</th><th className="pb-3 font-semibold">{t("financial.expenses")}</th><th className="pb-3 font-semibold">{t("financial.profit")}</th><th className="pb-3 text-right font-semibold">{t("financial.actions")}</th></tr>
            </thead>
            <tbody className="divide-y">
              {[...records].reverse().map((record) => (
                <tr key={record.id} className="text-slate-700">
                  <td className="py-4 font-semibold">{displayMonth(record.month)}</td>
                  <td className="py-4">{record.year}</td>
                  <td className="py-4">{formatCurrency(record.sales)}</td>
                  <td className="py-4">{formatCurrency(record.expenses)}</td>
                  <td className={`py-4 font-semibold ${record.profit >= 0 ? "text-green-700" : "text-red-600"}`}>{formatCurrency(record.profit)}</td>
                  <td className="py-4 text-right"><button onClick={() => onEdit(record)} className="mr-3 font-semibold text-green-700 hover:underline">{t("financial.edit")}</button><button onClick={() => onDelete(record)} className="font-semibold text-red-600 hover:underline">{t("financial.delete")}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}