// src/routes/Reports.jsx
import { useState } from "react";
import { useData } from "../context/DataContext";
import { useCurrency } from "../context/CurrencyContext";
import PieChart from "../components/PieChart";
import BarChart from "../components/BarChart";
import dayjs from "dayjs";

export default function Reports() {
  const { expenses } = useData();
  const { currencySymbol } = useCurrency();
  const [range, setRange] = useState({ from: "", to: "" });

  // ─── 1) Filter by date range ───
  const filtered = expenses.filter((e) => {
    const d = new Date(e.date);
    const fromOK = !range.from || d >= new Date(range.from);
    const toOK = !range.to || d <= new Date(range.to);
    return fromOK && toOK;
  });

  // ─── 2) Aggregate by category ───
  const byCat = filtered.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  // ─── 3) Aggregate by month (YYYY-MM) ───
  const byMonth = filtered.reduce((acc, e) => {
    const m = dayjs(e.date).format("YYYY-MM");
    acc[m] = (acc[m] || 0) + Number(e.amount);
    return acc;
  }, {});

  // ─── 4) Build a “Date Range” label ───
  let dateRangeLabel = "All Time";
  if (range.from && range.to) {
    const f = dayjs(range.from).format("MM/DD/YYYY");
    const t = dayjs(range.to).format("MM/DD/YYYY");
    dateRangeLabel = `From ${f} to ${t}`;
  } else if (range.from) {
    const f = dayjs(range.from).format("MM/DD/YYYY");
    dateRangeLabel = `From ${f}`;
  } else if (range.to) {
    const t = dayjs(range.to).format("MM/DD/YYYY");
    dateRangeLabel = `Up to ${t}`;
  }

  // ─── 5) Totals ───
  const totalTx = filtered.length;
  const totalSpent = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  // ─── 6) Prepare chart data ───
  const catLabels = Object.keys(byCat);
  const catValues = Object.values(byCat);

  const CAT_COLORS = [
    "#4F46E5", // indigo-600
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#EF4444", // red-500
    "#3B82F6", // blue-500
    "#8B5CF6", // violet-500
    "#EC4899", // rose-500
    "#14B8A6", // teal-500
    "#F43F5E", // rose-400
    "#6366F1", // slate-500
  ];
  const catColors = catLabels.map((_, idx) => CAT_COLORS[idx % CAT_COLORS.length]);

  const monthLabels = Object.keys(byMonth).sort();
  const monthValues = monthLabels.map((m) => byMonth[m] || 0);
  const barColor = "#2563EB"; // blue-600

  return (
    <section className="space-y-8">
      {/* ── Date Pickers ── */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-col sm:flex-row gap-4">
        <label className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">From</span>
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            className="border rounded p-2"
          />
        </label>
        <label className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">To</span>
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            className="border rounded p-2"
          />
        </label>
      </div>

      {/* ── Totals & Date‐Range Summary ── */}
      <div className="bg-white p-4 rounded-xl shadow space-y-2">
        <p className="text-gray-700 font-medium">
          Date Range:{" "}
          <span className="font-semibold">{dateRangeLabel}</span>
        </p>
        <p className="text-gray-600">
          Total Transactions:{" "}
          <span className="font-semibold">{totalTx}</span>
        </p>
        <p className="text-gray-600">
          Total Spent:{" "}
          <span className="font-semibold">
            {currencySymbol}
            {totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </p>
      </div>

      {/* ── Charts (stack on mobile, side-by-side on ≥md) ── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="mb-2 font-medium text-gray-700">
            Spending by Category
          </h3>
          <PieChart
            labels={catLabels}
            values={catValues}
            colors={catColors}
            currencySymbol={currencySymbol}
          />
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="mb-2 font-medium text-gray-700">Monthly Trend</h3>
          <BarChart
            labels={monthLabels}
            values={monthValues}
            color={barColor}
            currencySymbol={currencySymbol}
          />
        </div>
      </div>
    </section>
  );
}

