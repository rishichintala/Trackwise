import { useState } from "react";
import { useData } from "../context/DataContext";
import { useCurrency } from "../context/CurrencyContext";
import AppDatePicker from "./AppDatePicker";
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
  FaPlus,
} from "react-icons/fa";
import toast from "react-hot-toast";

const defaultCategories = [
  { label: "Groceries", icon: <FaShoppingBag /> },
  { label: "Dining", icon: <FaUtensils /> },
  { label: "Transport", icon: <FaCar /> },
  { label: "Housing", icon: <FaHome /> },
  { label: "Subscriptions", icon: <FaBolt /> },
  { label: "Health", icon: <FaHeartbeat /> },
  { label: "Personal Care", icon: <FaHeartbeat /> },
  { label: "Entertainment", icon: <FaGamepad /> },
  { label: "Miscellaneous", icon: <FaQuestion /> },
];

export default function ExpenseForm() {
  const {
    addExpense,
    expenses,
    budgets,
    incomeThisMonth,
    customCategories,
    addCategory,
    selectedMonth,
    monthlyIncomes
  } = useData();
  const { currencySymbol } = useCurrency();

  const [form, setForm] = useState({
    amount: "",
    itemName: "",
    category: "",
    date: new Date(),
  });

  const [newCat, setNewCat] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  const [year, month] = selectedMonth.split("-").map(Number);
  const displayMonthName = new Date(year, month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const isIncomeSet = typeof incomeThisMonth === "number" && incomeThisMonth > 0;

  const allCategories = [
    ...defaultCategories.map(c => c.label),
    ...customCategories
  ];

  const handleAddCustomCategory = () => {
    // Sanitize: trim whitespace, limit length, strip control chars
    const sanitized = newCat.trim().replace(/[\u0000-\u001F\u007F<>]/g, "").slice(0, 40);
    if (sanitized) {
      addCategory(sanitized);
      setForm({ ...form, category: sanitized });
      setNewCat("");
      setShowAddCat(false);
      toast.success(`Category "${sanitized}" added!`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isIncomeSet) {
      toast.error(
        "Please go to Budgets first and set your monthly income & currency."
      );
      return;
    }

    if (!form.amount || Number(form.amount) <= 0 || !form.itemName?.trim() || !form.category) {
      toast.error("Please fill in all fields with valid data");
      return;
    }

    // ─── Validate Income for Selected Date ───
    const picked = form.date;
    const yyyy = picked.getFullYear();
    const mm = String(picked.getMonth() + 1).padStart(2, "0");
    const targetMonth = `${yyyy}-${mm}`;

    const hasIncome = monthlyIncomes.some(
      (i) => i.month === targetMonth && Number(i.amount) > 0
    );

    /* VALIDATION LOGIC START */
    if (!hasIncome) {
      const monthName = picked.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      toast.error(`Cannot add expense for ${monthName}. No income recorded.`);
      return;
    }

    // ─── Build a local date at midnight (user picks only Y-M-D) ───
    // picked, yyyy, mm are defined in the validation block above
    const dd = String(picked.getDate()).padStart(2, "0");

    // Append 'T12:00:00' so JS will parse as local midday (no shift)
    const dateString = `${yyyy}-${mm}-${dd}T12:00:00`;

    const newExpense = {
      ...form,
      itemName: form.itemName.trim().slice(0, 100),
      amount: Number(form.amount),
      date: dateString,
      id: Date.now(),
    };

    const [warnYear, warnMonth] = selectedMonth.split("-").map(Number);
    const categoryExpenses = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return e.category === form.category &&
          d.getFullYear() === warnYear &&
          d.getMonth() === warnMonth - 1;
      })
      .reduce((acc, e) => acc + Number(e.amount), 0);

    const totalWithNew = categoryExpenses + newExpense.amount;
    const relatedBudget = budgets.find((b) => b.category === form.category);

    if (
      relatedBudget &&
      relatedBudget.notify &&
      totalWithNew >= 0.8 * relatedBudget.limit &&
      totalWithNew <= relatedBudget.limit
    ) {
      toast(`⚠️ You're nearing the budget limit for ${form.category}!`);
    }

    if (
      relatedBudget &&
      relatedBudget.notify &&
      totalWithNew > relatedBudget.limit
    ) {
      toast(`🚨 You've exceeded the budget for ${form.category}!`);
    }

    try {
      await addExpense(newExpense);
      toast.success("Expense added");
      setForm({ amount: "", itemName: "", category: "", date: new Date() });
    } catch {
      toast.error("Failed to add expense. Please try again.");
    }
  };

  return (
    <div>
      {!isIncomeSet && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 max-w-2xl mx-auto shadow-sm">
          <p className="text-yellow-800 text-sm">
            🚀 Before adding expenses for <span className="font-bold">{displayMonthName}</span>, please go to <a href="/budgets" className="font-bold underline italic">Budgets</a> and set your monthly income & currency.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4 max-w-2xl mx-auto"
      >
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <FaPlus /> Add Expense
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Amount */}
          <div>
            <label className="text-sm text-gray-600">Amount</label>
            <input
              type="number"
              className="w-full border p-2 rounded mt-1 disabled:opacity-50"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
              disabled={!isIncomeSet}
            />
          </div>

          {/* Item Name */}
          <div>
            <label className="text-sm text-gray-600">Item Name</label>
            <input
              type="text"
              placeholder="e.g. Tablets"
              className="w-full border p-2 rounded mt-1 disabled:opacity-50"
              value={form.itemName}
              onChange={(e) =>
                setForm({ ...form, itemName: e.target.value })
              }
              disabled={!isIncomeSet}
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm text-gray-600">Category</label>
            <div className="flex gap-2">
              <select
                className="w-full border p-2 rounded mt-1 disabled:opacity-50"
                value={form.category}
                onChange={(e) => {
                  if (e.target.value === "___ADD_NEW___") {
                    setShowAddCat(true);
                  } else {
                    setForm({ ...form, category: e.target.value });
                  }
                }}
                disabled={!isIncomeSet}
              >
                <option value="">-- Select --</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="___ADD_NEW___" className="text-blue-600 font-bold">+ Add Custom</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm text-gray-600">Date</label>
            <AppDatePicker
              selected={form.date}
              onChange={(date) => setForm({ ...form, date })}
              disabled={!isIncomeSet}
              maxDate={new Date()}
              className="w-full border border-gray-200 p-2 rounded bg-white text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className={`${isIncomeSet
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
              } px-4 py-2 rounded text-sm`}
            disabled={!isIncomeSet}
          >
            Add Expense
          </button>
        </div>
      </form>

      {/* Custom Category Modal */}
      {showAddCat && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Add Custom Category</h3>
            <input
              type="text"
              className="w-full border p-2 rounded"
              placeholder="e.g. Vacation"
              value={newCat}
              maxLength={40}
              onChange={(e) => setNewCat(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowAddCat(false); setNewCat(""); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
