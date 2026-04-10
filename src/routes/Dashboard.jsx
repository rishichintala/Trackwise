// src/pages/Dashboard.jsx
import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { useCurrency } from "../context/CurrencyContext";
import { Link } from "react-router-dom";
import {
  FaUtensils,
  FaCar,
  FaHome,
  FaHeartbeat,
  FaShoppingBag,
  FaBriefcase,
  FaBolt,
  FaGamepad,
  FaChartLine,
  FaQuestion,
  FaTags,
} from "react-icons/fa";

const categoryIcons = {
  Groceries: <FaShoppingBag className="inline-block text-xl text-teal-500" />,
  Dining: <FaUtensils className="inline-block text-xl text-blue-500" />,
  Transport: <FaCar className="inline-block text-xl text-orange-500" />,
  Housing: <FaHome className="inline-block text-xl text-purple-500" />,
  Subscriptions: <FaBolt className="inline-block text-xl text-yellow-500" />,
  Health: <FaHeartbeat className="inline-block text-xl text-red-500" />,
  "Personal Care": <FaHeartbeat className="inline-block text-xl text-pink-500" />,
  Entertainment: <FaGamepad className="inline-block text-xl text-rose-500" />,
  Miscellaneous: <FaQuestion className="inline-block text-xl text-gray-400" />,
};

export default function Dashboard() {
  const {
    budgetsThisMonth,
    incomeThisMonth,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    expensesThisMonth,
    totalThisMonth
  } = useData();
  const { currencySymbol } = useCurrency();

  const [year, month] = selectedMonth.split("-").map(Number);
  const selectedDate = new Date(year, month - 1);
  const displayMonthName = selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Totals (Current Month Focus)
  const monthlySavings = incomeThisMonth - totalThisMonth;

  // Recent 5 (Filtered by selected month)
  const recent = useMemo(() => {
    return [...expensesThisMonth]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [expensesThisMonth]);

  // Spend per category for budget cards (Selected Month Only)
  const spentPerCategory = useMemo(() => {
    return expensesThisMonth.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {});
  }, [expensesThisMonth]);

  // If no income for this month yet, show a prompt
  const showSetupPrompt = incomeThisMonth <= 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* ========== Title & Optional Setup Prompt ========== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Snapshot for <span className="font-semibold text-blue-600">{displayMonthName}</span></p>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border">
          <label htmlFor="month-filter" className="text-sm font-medium text-gray-500 whitespace-nowrap">Filter Month:</label>
          <select
            id="month-filter"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
          >
            {availableMonths.map(m => {
              const [y, mm] = m.split("-");
              const d = new Date(Number(y), Number(mm) - 1);
              const label = d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
              return <option key={m} value={m}>{label}</option>
            })}
          </select>
        </div>
      </div>

      {showSetupPrompt && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaChartLine className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You haven't set an income for <span className="font-bold">{displayMonthName}</span> yet.
                Visit the <Link to="/budgets" className="font-bold underline italic">Budgets</Link> tab to set it up!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========== 1) Action Summary Cards Row ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Income Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-b-4 border-blue-500 group">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none">Income ({displayMonthName})</p>
            <div className="p-2 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform">
              <FaChartLine className="text-blue-500 text-sm" />
            </div>
          </div>
          <h3 className="text-xl font-black text-gray-900 leading-tight">
            {currencySymbol}{incomeThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-b-4 border-red-500 group">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none">Expenses ({displayMonthName})</p>
            <div className="p-2 bg-red-50 rounded-lg group-hover:scale-110 transition-transform">
              <FaBolt className="text-red-500 text-sm" />
            </div>
          </div>
          <h3 className="text-xl font-black text-gray-900 leading-tight">
            {currencySymbol}{totalThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>

        {/* Monthly Savings Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-b-4 border-teal-500 group">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none">Savings ({displayMonthName})</p>
            <div className="p-2 bg-teal-50 rounded-lg group-hover:scale-110 transition-transform">
              <FaChartLine className="text-teal-500 text-sm" />
            </div>
          </div>
          <h3 className={`text-xl font-black leading-tight ${monthlySavings >= 0 ? "text-teal-600" : "text-red-600"}`}>
            {monthlySavings < 0 && "-"}
            {currencySymbol}{Math.abs(monthlySavings).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>

      </div>

      {/* ========== 2) Recent Transactions ========== */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Recent Transactions
        </h2>
        <p className="text-gray-600 text-sm mb-4">Transactions in this period</p>

        {/* Desktop Table (sm and up) */}
        <div className="hidden sm:block">
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-gray-600 font-medium">
                    Category
                  </th>
                  <th className="px-4 py-3 text-gray-600 font-medium">Item</th>
                  <th className="px-4 py-3 text-gray-600 font-medium">Date</th>
                  <th className="px-4 py-3 text-gray-600 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((exp) => (
                  <tr key={exp.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 flex items-center space-x-2 text-gray-700">
                      {categoryIcons[exp.category] ||
                        <FaTags className="inline-block text-xl text-blue-300" />}
                      <span>{exp.category}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {exp.itemName || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(exp.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-red-500">
                      −{currencySymbol}
                      {Number(exp.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards (below sm) */}
        <div className="space-y-4 sm:hidden">
          {recent.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-xl shadow-lg p-4 flex flex-col"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2 text-gray-700">
                  {categoryIcons[exp.category] ||
                    <FaTags className="inline-block text-xl text-blue-300" />}
                  <span className="font-medium">{exp.category}</span>
                </div>
                <div className="font-semibold text-red-500">
                  −{currencySymbol}
                  {Number(exp.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              {exp.itemName && (
                <div className="text-sm font-semibold text-gray-800 mb-1">
                  {exp.itemName}
                </div>
              )}
              <div className="text-gray-500 text-sm">
                {new Date(exp.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}

          {recent.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
              No transactions yet.
            </div>
          )}
        </div>
      </div>

      {/* ========== 3) Budget Goals Overview ========== */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Budget Goals Overview
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Quick look at your top budget goals
        </p>
        <div className="bg-white rounded-xl shadow-lg divide-y">
          {budgetsThisMonth.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No budgets set yet for this month.
            </div>
          )}

          {budgetsThisMonth.map((b) => {
            const spent = spentPerCategory[b.category] || 0;
            const percentage = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
            const overBudget = spent > b.limit;
            const reachedBudget = spent === b.limit;
            const nearLimit = spent < b.limit && percentage >= 80;
            const safe = percentage < 80;

            const barColor = overBudget
              ? "bg-red-500"
              : reachedBudget
                ? "bg-blue-500"
                : nearLimit
                  ? "bg-orange-400"
                  : "bg-green-500";

            return (
              <div key={b.id} className="p-6">
                {/* 
                On mobile (default), stack category and amounts; 
                on sm+ display in a row.
              */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
                  <div className="flex items-center space-x-2 text-gray-800 font-medium text-lg">
                    {categoryIcons[b.category] ||
                      categoryIcons["Miscellaneous"]}
                    <span>{b.category}</span>
                  </div>
                  <div className="text-gray-700 font-semibold mt-2 sm:mt-0">
                    {currencySymbol}
                    {spent.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    {"  /  "}
                    {currencySymbol}
                    {b.limit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`${barColor} h-2`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {overBudget && (
                  <p className="text-red-500 text-sm">
                    🚨 Over budget by {currencySymbol}
                    {(spent - b.limit).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
                {reachedBudget && (
                  <p className="text-blue-500 text-sm">
                    ✅ You have reached your budget
                  </p>
                )}
                {nearLimit && !reachedBudget && (
                  <p className="text-orange-500 text-sm">
                    ⚠️ Nearing your budget limit
                  </p>
                )}
                {safe && <p className="text-green-500 text-sm">✔️ On track</p>}
              </div>
            );
          })}
        </div>
      </div >
    </div >
  );
}