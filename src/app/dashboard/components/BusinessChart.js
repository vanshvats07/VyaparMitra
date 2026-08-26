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

const data = [
  { month: "Mar", sales: 52000, profit: 14000, expenses: 38000 },
  { month: "Apr", sales: 58000, profit: 17000, expenses: 41000 },
  { month: "May", sales: 65000, profit: 20000, expenses: 45000 },
  { month: "Jun", sales: 72000, profit: 24000, expenses: 48000 },
  { month: "Jul", sales: 68000, profit: 21000, expenses: 47000 },
  { month: "Aug", sales: 80000, profit: 30000, expenses: 50000 },
];

export default function BusinessChart() {
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