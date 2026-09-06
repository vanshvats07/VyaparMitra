"use client";

import { useLanguage } from "@/lib/useLanguage";

function formatCurrency(value) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function FinancialSummary({ records, language }) {
  const { t } = useLanguage(language);
  const totals = records.reduce(
    (summary, record) => ({
      sales: summary.sales + Number(record.sales || 0),
      expenses: summary.expenses + Number(record.expenses || 0),
      profit: summary.profit + Number(record.profit ?? Number(record.sales || 0) - Number(record.expenses || 0)),
    }),
    { sales: 0, expenses: 0, profit: 0 }
  );
  const margin = totals.sales > 0 ? (totals.profit / totals.sales) * 100 : 0;

  const items = [
    [t("financial.totalSales"), formatCurrency(totals.sales), "text-green-700"],
    [t("financial.totalExpenses"), formatCurrency(totals.expenses), "text-red-600"],
    [t("financial.totalProfit"), formatCurrency(totals.profit), totals.profit >= 0 ? "text-green-700" : "text-red-600"],
    [t("financial.profitMargin"), `${margin.toFixed(1)}%`, "text-blue-700"],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value, color]) => (
        <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}