"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function BusinessChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-xl bg-slate-50 px-6 text-center">
        <div>
          <p className="font-semibold text-slate-700">No financial records yet</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Add your first financial record to see your business performance.
          </p>
        </div>
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
          <Line type="monotone" dataKey="sales" name="Sales" stroke="#15803d" strokeWidth={3} />
          <Line type="monotone" dataKey="profit" name="Profit" stroke="#2563eb" strokeWidth={3} />
          <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#dc2626" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}