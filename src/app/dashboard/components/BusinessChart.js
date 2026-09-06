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
import { useLanguage } from "@/lib/useLanguage";

const englishMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BusinessChart({ data = [], language }) {
  const { t } = useLanguage(language);
  const localizedMonths = t("dashboard.months");
  if (data.length === 0) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-xl bg-slate-50 px-6 text-center">
        <div>
          <p className="font-semibold text-slate-700">{t("financial.none")}</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            {t("financial.performanceEmpty")}
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
          <XAxis dataKey="month" tickFormatter={(month) => {
            const monthIndex = englishMonths.indexOf(month);
            return monthIndex >= 0 ? localizedMonths[monthIndex] : month;
          }} />
          <YAxis />
          <Tooltip labelFormatter={(month) => {
            const monthIndex = englishMonths.indexOf(month);
            return monthIndex >= 0 ? localizedMonths[monthIndex] : month;
          }} />
          <Legend />
          <Line type="monotone" dataKey="sales" name={t("financial.salesChart")} stroke="#15803d" strokeWidth={3} />
          <Line type="monotone" dataKey="profit" name={t("financial.profitChart")} stroke="#2563eb" strokeWidth={3} />
          <Line type="monotone" dataKey="expenses" name={t("financial.expensesChart")} stroke="#dc2626" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}