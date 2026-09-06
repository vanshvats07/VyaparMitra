"use client";

function formatCurrency(value) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function RiskAnalysis({ records = [] }) {
  if (records.length < 2) {
    return <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Add at least 2-3 financial records to generate a more meaningful risk estimate.</p>;
  }

  const totals = records.reduce((summary, record) => ({
    sales: summary.sales + Number(record.sales || 0),
    expenses: summary.expenses + Number(record.expenses || 0),
    profit: summary.profit + Number(record.profit ?? Number(record.sales || 0) - Number(record.expenses || 0)),
  }), { sales: 0, expenses: 0, profit: 0 });
  const averageSales = totals.sales / records.length;
  const averageExpenses = totals.expenses / records.length;
  const averageProfit = totals.profit / records.length;
  const expenseRatio = averageSales > 0 ? averageExpenses / averageSales : 1;
  const profitMargin = averageSales > 0 ? averageProfit / averageSales : 0;
  const riskPercentage = Math.min(100, Math.max(0, Math.round(expenseRatio * 70 + Math.max(0, 0.2 - profitMargin) * 100)));
  const riskLevel = riskPercentage >= 65 ? "High" : riskPercentage >= 35 ? "Moderate" : "Low";
  const riskColor = riskLevel === "High" ? "bg-red-500" : riskLevel === "Moderate" ? "bg-orange-500" : "bg-green-500";
  const textColor = riskLevel === "High" ? "text-red-700" : riskLevel === "Moderate" ? "text-orange-700" : "text-green-700";

  return (
    <>
      <p className="mt-2 text-xs font-medium text-amber-700">Estimated from your financial records</p>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Average Sales</p><p className="mt-1 font-semibold">{formatCurrency(averageSales)}</p></div>
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Average Expenses</p><p className="mt-1 font-semibold">{formatCurrency(averageExpenses)}</p></div>
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Average Profit</p><p className={`mt-1 font-semibold ${averageProfit >= 0 ? "text-green-700" : "text-red-600"}`}>{formatCurrency(averageProfit)}</p></div>
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Expense Ratio</p><p className="mt-1 font-semibold">{Math.round(expenseRatio * 100)}%</p></div>
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-sm"><span className="font-semibold">Risk Level: <span className={textColor}>{riskLevel}</span></span><span className="font-semibold">{riskPercentage}%</span></div>
        <div className="mt-2 h-2 rounded-full bg-slate-200"><div className={`h-2 rounded-full ${riskColor}`} style={{ width: `${riskPercentage}%` }} /></div>
        <p className="mt-2 text-xs text-slate-500">Profit margin: {Math.round(profitMargin * 100)}%</p>
      </div>
    </>
  );
}