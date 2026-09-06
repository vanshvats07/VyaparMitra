"use client";

import { useState } from "react";

function formatCurrency(value) {
	return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function WhatIfSimulator({ baseline, isDemo }) {
	const [revenueChange, setRevenueChange] = useState(10);
	const [expenseChange, setExpenseChange] = useState(0);
	const baseRevenue = Number(baseline?.revenue || baseline?.sales || 0);
	const baseExpenses = Number(baseline?.expenses || 0);
	const projectedRevenue = baseRevenue * (1 + revenueChange / 100);
	const projectedExpenses = baseExpenses * (1 + expenseChange / 100);
	const projectedProfit = projectedRevenue - projectedExpenses;

	return (
		<>
			<p className="mt-2 text-sm text-slate-600">
				Adjust the scenario to estimate how revenue and expenses could affect monthly profit.
			</p>

			{isDemo && (
				<p className="mt-3 text-xs font-medium text-amber-700">
					Demo baseline — based on sample financial data
				</p>
			)}

			<div className="mt-6 space-y-5 border-t pt-5">
				<label className="block text-sm text-slate-600">
					Revenue change: <span className="font-semibold text-slate-900">{revenueChange}%</span>
					<input
						type="range"
						min="-30"
						max="50"
						value={revenueChange}
						onChange={(event) => setRevenueChange(Number(event.target.value))}
						className="mt-2 w-full accent-green-700"
					/>
				</label>

				<label className="block text-sm text-slate-600">
					Expense change: <span className="font-semibold text-slate-900">{expenseChange}%</span>
					<input
						type="range"
						min="-20"
						max="40"
						value={expenseChange}
						onChange={(event) => setExpenseChange(Number(event.target.value))}
						className="mt-2 w-full accent-red-600"
					/>
				</label>

				<div className="grid grid-cols-3 gap-3 text-center">
					<div className="rounded-xl bg-slate-50 p-3">
						<p className="text-xs text-slate-500">Revenue</p>
						<p className="mt-1 text-sm font-bold">{formatCurrency(projectedRevenue)}</p>
					</div>
					<div className="rounded-xl bg-slate-50 p-3">
						<p className="text-xs text-slate-500">Expenses</p>
						<p className="mt-1 text-sm font-bold">{formatCurrency(projectedExpenses)}</p>
					</div>
					<div className={`rounded-xl p-3 ${projectedProfit >= 0 ? "bg-green-50" : "bg-red-50"}`}>
						<p className="text-xs text-slate-500">Profit</p>
						<p className={`mt-1 text-sm font-bold ${projectedProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
							{formatCurrency(projectedProfit)}
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
