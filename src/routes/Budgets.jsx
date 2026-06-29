import { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useCurrency } from "../context/CurrencyContext";
import AppDatePicker from "../components/AppDatePicker";
import toast from "react-hot-toast";
import { v4 as uuid } from "uuid";
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
  FaTrash,
  FaEdit,
  FaTags,
} from "react-icons/fa";

const categoryIcons = {
  Groceries: <FaShoppingBag className="text-teal-500" />,
  Dining: <FaUtensils className="text-blue-500" />,
  Transport: <FaCar className="text-orange-500" />,
  Housing: <FaHome className="text-purple-500" />,
  Subscriptions: <FaBolt className="text-yellow-500" />,
  Health: <FaHeartbeat className="text-red-500" />,
  "Personal Care": <FaHeartbeat className="text-pink-500" />,
  Entertainment: <FaGamepad className="text-rose-500" />,
  Miscellaneous: <FaQuestion className="text-gray-400" />,
};

export default function Budgets() {
  const {
    budgetsThisMonth,
    addBudget,
    delBudget,
    editBudget,
    setIncomeForMonth,
    incomeThisMonth,
    customCategories,
    selectedMonth,
    setSelectedMonth,
    monthlyIncomes,
    availableMonths,
    expensesThisMonth,
    budgets,
    dataLoading,
    saveCurrency,
  } = useData();

  const allCategories = [
    ...Object.keys(categoryIcons),
    ...customCategories
  ];
  const { currencySymbol, currencyCode, currencyOptions } = useCurrency();

  const [year, month] = selectedMonth.split("-").map(Number);
  const displayMonthName = new Date(year, month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // ————————————— STATE —————————————
  const [form, setForm] = useState({ category: "", limit: "", notify: true });
  const [edit, setEdit] = useState(null);

  // Local copy of the "Monthly Income" input (sync with context when month changes)
  const [localIncome, setLocalIncome] = useState(incomeThisMonth || "");

  useEffect(() => {
    setLocalIncome(incomeThisMonth || "");
  }, [incomeThisMonth, selectedMonth]);

  // Track which currency is selected — initialise from the context (loaded from DB)
  const [selectedCurrency, setSelectedCurrency] = useState(
    () => currencyCode || Object.keys(currencyOptions)[0]
  );

  // Keep dropdown in sync if the DB-loaded currency arrives after first render
  useEffect(() => {
    if (currencyCode) setSelectedCurrency(currencyCode);
  }, [currencyCode]);

  // Lock the dropdown once ANY income is set in the system
  const currencyLocked = monthlyIncomes && monthlyIncomes.length > 0;

  // Show / hide the "Are you sure you want to reset?" modal
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Sum up how much has been spent in each category (Current Month Only)
  const spentPerCategory = expensesThisMonth.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});


  // ————————————— HANDLERS —————————————

  // 1) Save or Update Income:
  const handleSaveOrUpdateIncome = async () => {
    if (dataLoading) {
      toast("Loading your data… try again in a second.");
      return;
    }
    const val = Number(localIncome);
    if (!val || val <= 0) {
      toast.error("Please enter a valid income");
      return;
    }

    try {
      // If first time setting any income, persist currency choice to DB
      if (!currencyLocked) {
        await saveCurrency(selectedCurrency);
      }

      // Save income for the currently selected month
      await setIncomeForMonth(val, selectedMonth);

      toast.success(`Income for ${displayMonthName} saved!`);
    } catch {
      toast.error("Failed to save income. Please try again.");
    }
  };

  // 2) "Change Currency" button → open a confirmation modal instead of immediately unlocking
  const handleChangeCurrencyClick = () => {
    setShowCurrencyModal(true);
  };

  // 3) If the user confirms in the modal ("Yes, Reset All"), save new currency to DB and reload
  const confirmResetCurrency = async () => {
    try {
      await saveCurrency(selectedCurrency);
    } catch {
      toast.error("Failed to update currency. Please try again.");
      return;
    }
    window.location.reload();
  };

  // 4) Budget form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (dataLoading) {
      toast("Loading your data… try again in a second.");
      return;
    }
    if (!incomeThisMonth || incomeThisMonth <= 0) {
      toast.error("Please set a valid income first");
      return;
    }
    if (!form.category || !form.limit || Number(form.limit) <= 0) {
      toast.error("Please enter a valid budget");
      return;
    }

    // Check if we already have a budget record for THIS specific month
    const existingInMonth = budgets.find(
      (b) => b.category === form.category && b.month === selectedMonth
    );

    const newBudget = { ...form, limit: Number(form.limit), month: selectedMonth };

    try {
      if (existingInMonth) {
        await editBudget({ ...newBudget, id: existingInMonth.id });
        toast.success("Budget updated for this month!");
      } else {
        await addBudget({ ...newBudget, id: uuid() });
        toast.success("Budget set from this month onwards!");
      }

      setForm({ category: "", limit: "", notify: true });
      setEdit(null);
    } catch {
      toast.error("Failed to save budget. Please try again.");
    }
  };

  // 5) Load a budget into edit mode
  const openEdit = (budget) => {
    setForm({
      category: budget.category,
      limit: budget.limit,
      notify: budget.notify,
    });
    setEdit(budget);
  };

  // ————————————— RENDER —————————————
  return (
    <section className="max-w-4xl mx-auto space-y-8 p-4">
      {/* ========== HEADER: Month Filter ========== */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-lg border-b-4 border-indigo-500 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Budget Goals & Progress</h1>
          <p className="text-gray-500 text-sm">Managing limits for <span className="font-bold text-indigo-600">{displayMonthName}</span></p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
          <label htmlFor="month-filter-budgets" className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Selected Period:</label>
          <div className="custom-datepicker-wrapper">
            <AppDatePicker
              selected={new Date(year, month - 1, 1)}
              onChange={(date) => {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, "0");
                setSelectedMonth(`${yyyy}-${mm}`);
              }}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              wrapperClassName="inline-block"
              className="bg-transparent text-sm font-extrabold text-indigo-900 focus:outline-none cursor-pointer min-w-[140px] text-center border-0 shadow-none"
            />
          </div>
        </div>
      </div>

      {/* Income & Currency Section */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">
          Monthly Income & Currency
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Income Input */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Monthly Income
            </label>
            <input
              type="number"
              value={localIncome}
              onChange={(e) => setLocalIncome(e.target.value)}
              placeholder="e.g., 3000"
              className="w-full border rounded p-2"
            />
          </div>

          {/* Currency Dropdown (disabled once income > 0) */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Select Currency
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              disabled={currencyLocked}
              className={`w-full border rounded p-2 ${currencyLocked ? "bg-gray-100" : ""
                }`}
            >
              {Object.keys(currencyOptions).map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-4 pt-2">
          {/* Save or Update Income */}
          <button
            onClick={handleSaveOrUpdateIncome}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            {incomeThisMonth > 0 ? "Update Income" : "Save Income"}
          </button>

          {/* Change Currency (only visible once income > 0) */}
          {incomeThisMonth > 0 && (
            <button
              onClick={handleChangeCurrencyClick}
              className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded text-sm"
            >
              Change Currency
            </button>
          )}
        </div>
      </div>

      {/* Budget Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-700">
          {edit ? "Edit Budget" : "Add New Budget"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">Category</label>
            <select
              className="w-full border p-2 rounded mt-1"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">-- Select --</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Limit</label>
            <input
              type="number"
              className="w-full border p-2 rounded mt-1"
              placeholder="e.g., 500"
              value={form.limit}
              onChange={(e) => setForm({ ...form, limit: e.target.value })}
            />
          </div>
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              checked={form.notify}
              onChange={(e) =>
                setForm({ ...form, notify: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Notify me at 80%</span>
          </div>
        </div>
        <div className="flex justify-end pt-2 gap-2">
          {edit && (
            <button
              type="button"
              onClick={() => {
                setEdit(null);
                setForm({ category: "", limit: "", notify: true });
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            {edit ? "Update Budget" : "Set Budget"}
          </button>
        </div>
      </form>

      {/* Budget Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {budgetsThisMonth.map((b) => {
          const spent = spentPerCategory[b.category] || 0;
          const remaining = b.limit - spent;
          const percentage = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;

          // 1) Over budget: spent > limit → red
          const overBudget = spent > b.limit;
          // 2) Exactly at limit → blue ("reached budget")
          const reachedBudget = spent === b.limit;
          // 3) Between 80% and just under 100% → orange ("nearing")
          const nearLimit = spent < b.limit && percentage >= 80;
          // 4) Under 80% → green ("safe")
          const safe = percentage < 80;

          const barColor = overBudget
            ? "bg-red-500"
            : reachedBudget
              ? "bg-blue-500"
              : nearLimit
                ? "bg-orange-400"
                : "bg-green-500";

          return (
            <div key={b.id} className="bg-white p-4 rounded-xl shadow space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 font-medium text-gray-800">
                    {categoryIcons[b.category] || <FaTags className="text-blue-300" />} {b.category}
                  </div>
                  {b.month < selectedMonth && (
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                      Rolling from {new Date(b.month.split("-")[0], b.month.split("-")[1] - 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 text-gray-500 text-sm">
                  <button onClick={() => openEdit(b)} title="Edit">
                    <FaEdit />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await delBudget(b.category);
                        toast.success(`Removed ${b.category} budget from all months`);
                      } catch {
                        toast.error("Failed to delete budget. Please try again.");
                      }
                    }}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`${barColor} h-2`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Limit: {currencySymbol}
                  {b.limit.toFixed(2)}
                </p>
                <p>
                  Spent: {currencySymbol}
                  {spent.toFixed(2)}
                </p>
                <p>
                  Remaining: {currencySymbol}
                  {remaining.toFixed(2)}
                </p>

                {overBudget && (
                  <p className="text-red-500">🚨 Over budget!</p>
                )}
                {reachedBudget && (
                  <p className="text-blue-500">✅ You have reached your budget</p>
                )}
                {nearLimit && b.notify && (
                  <p className="text-orange-500">⚠️ Nearing your budget limit</p>
                )}
                {safe && (
                  <p className="text-green-500">✔️ On track</p>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {/* ——————————— Currency Change Confirmation Modal ——————————— */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Change Currency?
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Changing the currency will reset all data (income, budgets, expenses).
              Are you sure you want to continue?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCurrencyModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetCurrency}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

