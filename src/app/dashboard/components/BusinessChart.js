"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function BusinessChart({ metrics = [] }) {
  const data = metrics.map((metric) => ({
    month: metric.month,
    sales: metric.sales,
    profit: metric.profit,
    expenses: metric.expenses,
  }));

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-slate-500">
        No business metrics recorded yet.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Line
            type="monotone"
            dataKey="sales"
            name="Sales"
            stroke="#15803d"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="#2563eb"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#dc2626"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}