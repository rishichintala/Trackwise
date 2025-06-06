// import { useMemo } from "react";
// import { useData } from "../context/DataContext";
// import { useCurrency } from "../context/CurrencyContext";
// import {
//   FaUtensils,
//   FaCar,
//   FaHome,
//   FaHeartbeat,
//   FaShoppingBag,
//   FaBriefcase,
//   FaBolt,
//   FaGamepad,
//   FaChartLine,
//   FaQuestion,
// } from "react-icons/fa";

// const categoryIcons = {
//   Food: <FaUtensils className="inline-block text-xl text-blue-500" />,
//   Transport: <FaCar className="inline-block text-xl text-orange-500" />,
//   Housing: <FaHome className="inline-block text-xl text-purple-500" />,
//   Entertainment: <FaGamepad className="inline-block text-xl text-pink-500" />,
//   Utilities: <FaBolt className="inline-block text-xl text-yellow-500" />,
//   Health: <FaHeartbeat className="inline-block text-xl text-red-500" />,
//   Shopping: <FaShoppingBag className="inline-block text-xl text-teal-500" />,
//   Business: <FaBriefcase className="inline-block text-xl text-gray-500" />,
//   Income: <FaChartLine className="inline-block text-xl text-green-600" />,
//   Miscellaneous: <FaQuestion className="inline-block text-xl text-gray-400" />,
// };

// export default function Dashboard() {
//   const { expenses, budgets, income } = useData();
//   const { currencySymbol, setCurrency } = useCurrency();

//   // Re‐apply saved currency on mount (so symbol stays correct if user reloads)
//   useMemo(() => {
//     const saved = localStorage.getItem("tw_currency");
//     if (saved) {
//       setCurrency(saved);
//     }
//   }, [setCurrency]);

//   // Compute totals
//   const totalExpenses = useMemo(
//     () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
//     [expenses]
//   );
//   const currentBalance = income - totalExpenses;

//   // Recent transactions (5 most recent)
//   const recent = useMemo(() => {
//     return [...expenses]
//       .sort((a, b) => new Date(b.date) - new Date(a.date))
//       .slice(0, 5);
//   }, [expenses]);

//   // Spend per category for budgets
//   const spentPerCategory = useMemo(() => {
//     return expenses.reduce((acc, e) => {
//       acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
//       return acc;
//     }, {});
//   }, [expenses]);

//   // If no income or no budgets, show a prompt at top
//   const showSetupPrompt = income <= 0;

//   return (
//     <section className="space-y-8 p-4 bg-gray-50 min-h-screen">
//       {/* Title */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
//         <p className="text-gray-600 mt-1">Welcome back to your budget app!</p>
//       </div>

//       {/* Setup Prompt */}
//       {showSetupPrompt && (
//         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
//           <p className="text-yellow-800">
//             🚀 To begin tracking your finances, first go to the Budgets page and set your monthly income and currency.
//           </p>
//         </div>
//       )}

//       {/* 1) Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//         {/* Total Income */}
//         <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
//           <div className="flex justify-between items-center">
//             <div className="text-gray-700 font-medium">Total Income</div>
//             <FaChartLine className="text-gray-400" />
//           </div>
//           <div className="text-2xl font-semibold text-gray-900 mt-4">
//             {currencySymbol}
//             {income.toLocaleString(undefined, {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             })}
//           </div>
//           <div className="text-gray-500 text-sm mt-1">All income received</div>
//         </div>

//         {/* Total Expenses */}
//         <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
//           <div className="flex justify-between items-center">
//             <div className="text-gray-700 font-medium">Total Expenses</div>
//             <FaBolt className="text-gray-400" />
//           </div>
//           <div className="text-2xl font-semibold text-gray-900 mt-4">
//             {currencySymbol}
//             {totalExpenses.toLocaleString(undefined, {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             })}
//           </div>
//           <div className="text-gray-500 text-sm mt-1">All expenses paid</div>
//         </div>

//         {/* Current Balance */}
//         <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
//           <div className="flex justify-between items-center">
//             <div className="text-gray-700 font-medium">Current Balance</div>
//             <FaChartLine className="text-gray-400" />
//           </div>
//           <div
//             className={`text-2xl font-semibold mt-4 ${
//               currentBalance < 0 ? "text-red-600" : "text-gray-900"
//             }`}
//           >
//             {currencySymbol}
//             {currentBalance.toLocaleString(undefined, {
//               minimumFractionDigits: 2,
//               maximumFractionDigits: 2,
//             })}
//           </div>
//           <div className="text-gray-500 text-sm mt-1">Income − Expenses</div>
//         </div>
//       </div>

//       {/* 2) Recent Transactions */}
//       <div>
//         <h2 className="text-xl font-semibold text-gray-800 mb-2">Recent Transactions</h2>
//         <p className="text-gray-600 text-sm mb-4">Your last 5 transactions</p>
//         <div className="overflow-x-auto bg-white rounded-xl shadow">
//           <table className="w-full text-left">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-4 py-3 text-gray-600 font-medium">Category</th>
//                 <th className="px-4 py-3 text-gray-600 font-medium">Date</th>
//                 <th className="px-4 py-3 text-gray-600 font-medium">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {recent.map((exp) => (
//                 <tr key={exp.id} className="border-b last:border-b-0">
//                   <td className="px-4 py-3 flex items-center space-x-2 text-gray-700">
//                     {categoryIcons[exp.category] || categoryIcons["Miscellaneous"]}
//                     <span>{exp.category}</span>
//                   </td>
//                   <td className="px-4 py-3 text-gray-500">
//                     {new Date(exp.date).toLocaleDateString(undefined, {
//                       year: "numeric",
//                       month: "short",
//                       day: "numeric",
//                     })}
//                   </td>
//                   <td className="px-4 py-3 font-medium">
//                     <span className="text-red-500">
//                       −{currencySymbol}
//                       {Number(exp.amount).toLocaleString(undefined, {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2,
//                       })}
//                     </span>
//                   </td>
//                 </tr>
//               ))}

//               {recent.length === 0 && (
//                 <tr>
//                   <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
//                     No transactions yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* 3) Budget Goals Overview */}
//       <div>
//         <h2 className="text-xl font-semibold text-gray-800 mb-2">Budget Goals Overview</h2>
//         <p className="text-gray-600 text-sm mb-4">Quick look at your top budget goals</p>
//         <div className="bg-white rounded-xl shadow divide-y">
//           {budgets.length === 0 && (
//             <div className="p-6 text-center text-gray-500">No budgets set yet.</div>
//           )}
//           {budgets.map((b) => {
//             const spent = spentPerCategory[b.category] || 0;
//             const percentage = Math.min((spent / b.limit) * 100, 100);
//             const overBudget = spent > b.limit;
//             const reachedBudget = spent === b.limit;
//             const nearLimit = spent < b.limit && percentage >= 80;
//             const safe = percentage < 80;

//             // Color logic for the progress bar
//             const barColor = overBudget
//               ? "bg-red-500"
//               : reachedBudget
//               ? "bg-blue-500"
//               : nearLimit
//               ? "bg-orange-400"
//               : "bg-green-500";

//             return (
//               <div key={b.id} className="p-6">
//                 <div className="flex justify-between items-center mb-2">
//                   <div className="flex items-center space-x-2 text-gray-800 font-medium text-lg">
//                     {categoryIcons[b.category] || categoryIcons["Miscellaneous"]}
//                     <span>{b.category}</span>
//                   </div>
//                   <div className="text-gray-700 font-semibold">
//                     {currencySymbol}
//                     {spent.toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                     {" / "}
//                     {currencySymbol}
//                     {b.limit.toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                   </div>
//                 </div>

//                 <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
//                   <div
//                     className={`${barColor} h-2`}
//                     style={{ width: `${percentage}%` }}
//                   />
//                 </div>

//                 {overBudget && (
//                   <p className="text-red-500 text-sm">
//                     🚨 Over budget by {currencySymbol}
//                     {(spent - b.limit).toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                   </p>
//                 )}
//                 {reachedBudget && (
//                   <p className="text-blue-500 text-sm">✅ You have reached your budget</p>
//                 )}
//                 {nearLimit && !reachedBudget && (
//                   <p className="text-orange-500 text-sm">⚠️ Nearing your budget limit</p>
//                 )}
//                 {safe && (
//                   <p className="text-green-500 text-sm">✔️ On track</p>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }






























// src/pages/Dashboard.jsx
import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { useCurrency } from "../context/CurrencyContext";
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
} from "react-icons/fa";

const categoryIcons = {
  Food: <FaUtensils className="inline-block text-xl text-blue-500" />,
  Transport: <FaCar className="inline-block text-xl text-orange-500" />,
  Housing: <FaHome className="inline-block text-xl text-purple-500" />,
  Entertainment: <FaGamepad className="inline-block text-xl text-pink-500" />,
  Utilities: <FaBolt className="inline-block text-xl text-yellow-500" />,
  Health: <FaHeartbeat className="inline-block text-xl text-red-500" />,
  Shopping: <FaShoppingBag className="inline-block text-xl text-teal-500" />,
  Business: <FaBriefcase className="inline-block text-xl text-gray-500" />,
  Miscellaneous: <FaQuestion className="inline-block text-xl text-gray-400" />,
};

export default function Dashboard() {
  const { expenses, budgets, income } = useData();
  const { currencySymbol, setCurrency } = useCurrency();

  // Re‐apply currency on mount
  useMemo(() => {
    const saved = localStorage.getItem("tw_currency");
    if (saved) {
      setCurrency(saved);
    }
  }, [setCurrency]);

  // Totals
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );
  const currentBalance = income - totalExpenses;

  // Recent 5
  const recent = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [expenses]);

  // Spend per category for budget cards
  const spentPerCategory = useMemo(() => {
    return expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {});
  }, [expenses]);

  // If no income yet, show a prompt
  const showSetupPrompt = income <= 0;

  return (
    <>
      {/* ========== Title & Optional Setup Prompt ========== */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back to your budget app!</p>
      </div>

      {showSetupPrompt && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-8">
          <p className="text-yellow-800 text-sm">
            🚀 To begin tracking your finances, please go to the Budgets page
            and set your monthly income and currency.
          </p>
        </div>
      )}

      {/* ========== 1) Summary Cards Row ========== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="text-gray-700 font-medium">Total Income</div>
            <FaChartLine className="text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900 mt-4">
            {currencySymbol}
            {income.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-gray-500 text-sm mt-1">All income received</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="text-gray-700 font-medium">Total Expenses</div>
            <FaBolt className="text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900 mt-4">
            {currencySymbol}
            {totalExpenses.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-gray-500 text-sm mt-1">All expenses paid</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="text-gray-700 font-medium">Current Balance</div>
            <FaChartLine className="text-gray-400" />
          </div>
          <div
            className={`text-2xl font-semibold mt-4 ${
              currentBalance < 0 ? "text-red-600" : "text-gray-900"
            }`}
          >
            {currencySymbol}
            {currentBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-gray-500 text-sm mt-1">Income − Expenses</div>
        </div>
      </div>

      {/* ========== 2) Recent Transactions ========== */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Recent Transactions
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Your last 5 transactions
        </p>
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-gray-600 font-medium">Category</th>
                <th className="px-4 py-3 text-gray-600 font-medium">Date</th>
                <th className="px-4 py-3 text-gray-600 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((exp) => (
                <tr key={exp.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 flex items-center space-x-2 text-gray-700">
                    {categoryIcons[exp.category] || categoryIcons["Miscellaneous"]}
                    <span>{exp.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(exp.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <span className="text-red-500">
                      −{currencySymbol}
                      {Number(exp.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
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

      {/* ========== 3) Budget Goals Overview ========== */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Budget Goals Overview
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Quick look at your top budget goals
        </p>
        <div className="bg-white rounded-xl shadow-lg divide-y">
          {budgets.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No budgets set yet.
            </div>
          )}
          {budgets.map((b) => {
            const spent = spentPerCategory[b.category] || 0;
            const percentage = Math.min((spent / b.limit) * 100, 100);
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
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2 text-gray-800 font-medium text-lg">
                    {categoryIcons[b.category] || categoryIcons["Miscellaneous"]}
                    <span>{b.category}</span>
                  </div>
                  <div className="text-gray-700 font-semibold">
                    {currencySymbol}
                    {spent.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    {" / "}
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
      </div>
    </>
  );
}
