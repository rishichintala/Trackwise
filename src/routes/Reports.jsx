// import { useState } from 'react';
// import { useData } from '../context/DataContext';
// import PieChart from '../components/PieChart';
// import BarChart from '../components/BarChart';
// import dayjs from 'dayjs';

// export default function Reports() {
//   const { expenses } = useData();
//   const [range, setRange] = useState({ from: '', to: '' });

//   /* filter by date range */
//   const filtered = expenses.filter(e => {
//     const d = new Date(e.date);
//     return (!range.from || d >= new Date(range.from)) &&
//            (!range.to   || d <= new Date(range.to));
//   });

//   /* aggregate */
//   const byCat = filtered.reduce((acc, e) => {
//     acc[e.category] = (acc[e.category] || 0) + +e.amount;
//     return acc;
//   }, {});
//   const byMonth = filtered.reduce((acc, e) => {
//     const m = dayjs(e.date).format('YYYY‑MM');
//     acc[m] = (acc[m] || 0) + +e.amount;
//     return acc;
//   }, {});

//   return (
//     <section className="space-y-8">
//       {/* date pickers */}
//       <div className="bg-white p-4 rounded shadow flex gap-4">
//         <label>
//           From&nbsp;
//           <input
//             type="date"
//             value={range.from}
//             onChange={e => setRange({ ...range, from: e.target.value })}
//           />
//         </label>
//         <label>
//           To&nbsp;
//           <input
//             type="date"
//             value={range.to}
//             onChange={e => setRange({ ...range, to: e.target.value })}
//           />
//         </label>
//       </div>

//       {/* charts */}
//       <div className="grid md:grid-cols-2 gap-6">
//         <div className="bg-white p-4 rounded shadow">
//           <h3 className="mb-2 font-medium">Spending by Category</h3>
//           <PieChart data={byCat} />
//         </div>
//         <div className="bg-white p-4 rounded shadow">
//           <h3 className="mb-2 font-medium">Monthly Trend</h3>
//           <BarChart labels={Object.keys(byMonth)} totals={Object.values(byMonth)} />
//         </div>
//       </div>

//       {/* summary */}
//       <div className="bg-white p-4 rounded shadow">
//         <p>Total Transactions: <b>{filtered.length}</b></p>
//         <p>Total Spent: <b>${filtered.reduce((s, e) => s + +e.amount, 0)}</b></p>
//       </div>
//     </section>
//   );
// }



import { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useCurrency } from "../context/CurrencyContext";
import PieChart from "../components/PieChart";
import BarChart from "../components/BarChart";
import dayjs from "dayjs";

export default function Reports() {
  const { expenses } = useData();
  const { currencySymbol, setCurrency } = useCurrency();
  const [range, setRange] = useState({ from: "", to: "" });

  // Re‐apply saved currency on mount
  useEffect(() => {
    const saved = localStorage.getItem("tw_currency");
    if (saved) {
      setCurrency(saved);
    }
  }, [setCurrency]);

  /* Filter expenses by date range */
  const filtered = expenses.filter((e) => {
    const d = new Date(e.date);
    const afterFrom = !range.from || d >= new Date(range.from);
    const beforeTo = !range.to || d <= new Date(range.to);
    return afterFrom && beforeTo;
  });

  /* Aggregate spending by category */
  const byCat = filtered.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  /* Aggregate spending by month */
  const byMonth = filtered.reduce((acc, e) => {
    const m = dayjs(e.date).format("YYYY-MM");
    acc[m] = (acc[m] || 0) + Number(e.amount);
    return acc;
  }, {});

  /* Provide a consistent color palette for categories */
  const categoryColors = {
    Food: "#3B82F6", // blue-500
    Transport: "#F97316", // orange-500
    Housing: "#8B5CF6", // purple-500
    Entertainment: "#DB2777", // pink-600
    Utilities: "#FACC15", // yellow-400
    Health: "#EF4444", // red-500
    Shopping: "#14B8A6", // teal-500
    Business: "#6B7280", // gray-500
    Miscellaneous: "#9CA3AF", // gray-400
  };

  /* Build arrays for PieChart: labels, values, and corresponding colors */
  const pieLabels = Object.keys(byCat);
  const pieData = pieLabels.map((cat) => byCat[cat]);
  const pieColors = pieLabels.map((cat) => categoryColors[cat] || "#D1D5DB");

  /* Build arrays for BarChart: month labels sorted, and amounts */
  const monthLabels = Object.keys(byMonth).sort();
  const monthTotals = monthLabels.map((m) => byMonth[m]);

  /* Calculate summary */
  const totalTransactions = filtered.length;
  const totalSpent = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  /* Format date range for display */
  const formatDate = (str) => dayjs(str).format("MMM D, YYYY");
  let rangeText = "All Time";
  if (range.from && range.to) {
    rangeText = `From ${formatDate(range.from)} to ${formatDate(range.to)}`;
  } else if (range.from) {
    rangeText = `From ${formatDate(range.from)}`;
  } else if (range.to) {
    rangeText = `Up to ${formatDate(range.to)}`;
  }

  return (
    <section className="space-y-8 p-4">
      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-xl shadow flex flex-col md:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-gray-700 text-sm font-medium">From&nbsp;</label>
          <input
            type="date"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
            className="border rounded p-2 text-gray-800"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-gray-700 text-sm font-medium">To&nbsp;</label>
          <input
            type="date"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
            className="border rounded p-2 text-gray-800"
          />
        </div>
      </div>
       {/* Summary */}
       <div className="bg-white p-6 rounded-xl shadow space-y-2">
        <p className="text-gray-700">
          <span className="font-medium">Date Range:</span> {rangeText}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Total Transactions:</span>{" "}
          <b>{totalTransactions}</b>
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Total Spent:</span>{" "}
          <b>
            {currencySymbol}
            {totalSpent.toFixed(2)}
          </b>
        </p>
      </div>
      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart: Spending by Category */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">
            Spending by Category
          </h3>
          <PieChart
            labels={pieLabels}
            data={pieData}
            backgroundColor={pieColors}
          />
        </div>

        {/* Bar Chart: Monthly Trend */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-700">
            Monthly Trend
          </h3>
          <BarChart
            labels={monthLabels}
            totals={monthTotals}
            backgroundColor="#9CA3AF" // light gray for total bars
          />
        </div>
      </div>
    </section>
  );
}
