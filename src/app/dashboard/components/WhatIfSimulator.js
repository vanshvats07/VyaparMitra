"use client";

import { useState } from "react";

function formatCurrency(value) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function WhatIfSimulator({ records = [] }) {
  const [salesDecrease, setSalesDecrease] = useState(false);
  const [bulkBuyers, setBulkBuyers] = useState(false);

  if (records.length === 0) {
    return <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">Add financial records to activate the simulator.</p>;
  }

  const totals = records.reduce((summary, record) => ({
    sales: summary.sales + Number(record.sales || 0),
    expenses: summary.expenses + Number(record.expenses || 0),
    profit: summary.profit + Number(record.profit ?? Number(record.sales || 0) - Number(record.expenses || 0)),
  }), { sales: 0, expenses: 0, profit: 0 });
  const averageSales = totals.sales / records.length;
  const averageExpenses = totals.expenses / records.length;
  const currentProfit = totals.profit / records.length;
  const decreasedSales = salesDecrease ? averageSales * 0.8 : averageSales;
  const bulkBuyerSales = bulkBuyers ? Math.max(averageSales * 0.1, 5000) : 0;
  const projectedSales = decreasedSales + bulkBuyerSales;
  const projectedProfit = projectedSales - averageExpenses;
  const scenarioImpact = projectedProfit - currentProfit;

  return (
    <>
      <p className="mt-2 text-sm text-slate-600">Select a scenario to estimate its effect on your average monthly result.</p>
      <p className="mt-2 text-xs font-medium text-amber-700">Estimate based on your saved financial records.</p>
      <div className="mt-5 space-y-3 border-t pt-5 text-sm">
        <label className="flex items-center gap-3 text-slate-700"><input type="checkbox" checked={salesDecrease} onChange={(event) => setSalesDecrease(event.target.checked)} className="h-4 w-4 accent-green-700" />Sales decrease by 20%</label>
        <label className="flex items-center gap-3 text-slate-700"><input type="checkbox" checked={bulkBuyers} onChange={(event) => setBulkBuyers(event.target.checked)} className="h-4 w-4 accent-green-700" />5 new bulk buyers</label>
      </div>
      <div className="mt-6 grid gap-3 text-center sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Current</p><p className="mt-1 text-sm font-bold">{formatCurrency(currentProfit)}</p></div>
        <div className={`rounded-xl p-3 ${scenarioImpact >= 0 ? "bg-green-50" : "bg-red-50"}`}><p className="text-xs text-slate-500">Scenario Impact</p><p className={`mt-1 text-sm font-bold ${scenarioImpact >= 0 ? "text-green-700" : "text-red-700"}`}>{scenarioImpact >= 0 ? "+" : ""}{formatCurrency(scenarioImpact)}</p></div>
        <div className="rounded-xl bg-green-50 p-3"><p className="text-xs text-slate-500">Projected</p><p className="mt-1 text-sm font-bold text-green-700">{formatCurrency(projectedProfit)}</p></div>
      </div>
      <p className="mt-4 text-xs text-slate-500">Projected sales: {formatCurrency(projectedSales)}. Expenses are held at your current average.</p>
    </>
  );
}