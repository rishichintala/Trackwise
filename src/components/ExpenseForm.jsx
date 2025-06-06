import { useState } from "react";
import { useData } from "../context/DataContext";
import { useCurrency } from "../context/CurrencyContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

const categories = [
  { label: "Food", icon: <FaUtensils /> },
  { label: "Transport", icon: <FaCar /> },
  { label: "Housing", icon: <FaHome /> },
  { label: "Entertainment", icon: <FaGamepad /> },
  { label: "Utilities", icon: <FaBolt /> },
  { label: "Health", icon: <FaHeartbeat /> },
  { label: "Shopping", icon: <FaShoppingBag /> },
  { label: "Business", icon: <FaBriefcase /> },
  { label: "Miscellaneous", icon: <FaQuestion /> },
];

export default function ExpenseForm() {
  const { addExpense, expenses, budgets, income } = useData();
  const { currencySymbol } = useCurrency();

  // Local form state
  const [form, setForm] = useState({
    amount: "",
    category: "",
    date: new Date(),
  });

  // If income is not set (<= 0), do not allow adding expenses
  const isIncomeSet = typeof income === "number" && income > 0;

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1) Prevent add if no valid income
    if (!isIncomeSet) {
      toast.error(
        "Please go to Budgets first and set your monthly income & currency."
      );
      return;
    }

    // 2) Validate amount & category
    if (!form.amount || Number(form.amount) <= 0 || !form.category) {
      toast.error("Please fill in all fields with valid data");
      return;
    }

    // // Build the new expense object
    // const newExpense = {
    //   ...form,
    //   amount: Number(form.amount),
    //   date: form.date.toISOString().split("T")[0],
    //   id: Date.now(),
    // };
// Build the new expense object
form.date.setHours(12); // Set time to noon to avoid timezone issues

const newExpense = {
  ...form,
  amount: Number(form.amount),
  date: `${form.date.getFullYear()}-${String(form.date.getMonth() + 1).padStart(2, "0")}-${String(form.date.getDate()).padStart(2, "0")}`,
  id: Date.now(),
};

    // Calculate total spent in this category so far (before adding)
    const categoryExpenses = expenses
      .filter((e) => e.category === form.category)
      .reduce((acc, e) => acc + Number(e.amount), 0);

    const totalWithNew = categoryExpenses + newExpense.amount;

    // Look up related budget (if any)
    const relatedBudget = budgets.find((b) => b.category === form.category);

    // If nearing 80%
    if (
      relatedBudget &&
      relatedBudget.notify &&
      totalWithNew >= 0.8 * relatedBudget.limit &&
      totalWithNew <= relatedBudget.limit
    ) {
      toast(
        `⚠️ You’re nearing the budget limit for ${form.category}!`,
        { icon: "⚠️" }
      );
    }
    // If over budget
    if (
      relatedBudget &&
      relatedBudget.notify &&
      totalWithNew > relatedBudget.limit
    ) {
      toast(
        `🚨 You’ve exceeded the budget for ${form.category}!`,
        { icon: "🚨" }
      );
    }

    // Finally add the expense
    addExpense(newExpense);
    toast.success("Expense added");
    setForm({ amount: "", category: "", date: new Date() });
  };

  return (
    <div>
      {/* If no income is set, show a prompt banner */}
      {!isIncomeSet && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6 max-w-2xl mx-auto">
          <p className="text-yellow-800 text-sm">
            🚀 Before adding expenses, please go to Budgets and set your
            monthly income & currency.
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Category */}
          <div>
            <label className="text-sm text-gray-600">Category</label>
            <select
              className="w-full border p-2 rounded mt-1 disabled:opacity-50"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              disabled={!isIncomeSet}
            >
              <option value="">-- Select --</option>
              {categories.map((cat) => (
                <option key={cat.label} value={cat.label}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm text-gray-600">Date</label>
            <DatePicker
              selected={form.date}
              onChange={(date) => setForm({ ...form, date })}
              className="w-full border p-2 rounded mt-1 disabled:opacity-50"
              maxDate={new Date()}
              disabled={!isIncomeSet}
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className={`${
              isIncomeSet
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            } px-4 py-2 rounded text-sm`}
            disabled={!isIncomeSet}
          >
            Add Expense
          </button>
        </div>
      </form>
    </div>
  );
}
