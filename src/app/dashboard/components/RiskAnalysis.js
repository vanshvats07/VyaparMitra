function formatCurrency(value) {
	return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function RiskAnalysis({ analysis }) {
	const riskWidth = analysis.riskLevel === "High" ? "w-full" : analysis.riskLevel === "Moderate" ? "w-2/3" : "w-1/3";
	const riskColor = analysis.riskLevel === "High" ? "bg-red-500" : analysis.riskLevel === "Moderate" ? "bg-orange-500" : "bg-green-500";

	return (
		<>
			<div className="mt-6 grid grid-cols-2 gap-4">
				<div className="rounded-xl bg-slate-50 p-4">
					<p className="text-xs text-slate-500">Current Cash Buffer</p>
					<p className="mt-2 text-xl font-bold">{formatCurrency(analysis.cashBuffer)}</p>
				</div>
				<div className="rounded-xl bg-red-50 p-4">
					<p className="text-xs text-red-600">Projected Max Loss</p>
					<p className="mt-2 text-xl font-bold text-red-600">{formatCurrency(analysis.projectedLoss)}</p>
				</div>
			</div>

			<div className="mt-6">
				<div className="flex justify-between text-sm">
					<span>Risk Level: {analysis.riskLevel}</span>
					<span className={analysis.riskLevel === "High" ? "text-red-600" : "text-orange-600"}>
						{Math.round(analysis.expenseRatio * 100)}% expense ratio
					</span>
				</div>
				<div className="mt-2 h-2 rounded-full bg-slate-200">
					<div className={`h-2 rounded-full ${riskWidth} ${riskColor}`} />
				</div>
			</div>

			<div className="mt-6 grid grid-cols-3 gap-3 text-sm">
				<div><p className="text-xs text-slate-500">3M Revenue</p><p className="mt-1 font-semibold">{formatCurrency(analysis.projectedRevenue)}</p></div>
				<div><p className="text-xs text-slate-500">3M Expenses</p><p className="mt-1 font-semibold">{formatCurrency(analysis.projectedExpenses)}</p></div>
				<div><p className="text-xs text-slate-500">3M Profit</p><p className={`mt-1 font-semibold ${analysis.projectedProfit >= 0 ? "text-green-700" : "text-red-600"}`}>{formatCurrency(analysis.projectedProfit)}</p></div>
			</div>

			{analysis.isDemo && (
				<p className="mt-6 text-sm text-slate-600">Demo analysis — based on sample financial data</p>
			)}
		</>
	);
}
