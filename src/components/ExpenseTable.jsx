// src/components/ExpenseTable.jsx
import { useState, useEffect } from "react";
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
  FaTrash,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import toast from "react-hot-toast";

const categoryIcons = {
  Food: <FaUtensils className="text-blue-500" />,
  Transport: <FaCar className="text-orange-500" />,
  Housing: <FaHome className="text-purple-500" />,
  Entertainment: <FaGamepad className="text-pink-500" />,
  Utilities: <FaBolt className="text-yellow-500" />,
  Health: <FaHeartbeat className="text-red-500" />,
  Shopping: <FaShoppingBag className="text-teal-500" />,
  Business: <FaBriefcase className="text-gray-500" />,
  Income: <FaChartLine className="text-green-600" />,
  Miscellaneous: <FaQuestion className="text-gray-400" />,
};

const categories = Object.keys(categoryIcons);

export default function ExpenseTable() {
  const { expenses, delExpense, editExpense } = useData();
  const { currencySymbol, setCurrency } = useCurrency();
  const [editing, setEditing] = useState(null);

  // Re-apply saved currency on mount
  useEffect(() => {
    const saved = localStorage.getItem("tw_currency");
    if (saved) {
      setCurrency(saved);
    }
  }, [setCurrency]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(editing.amount);
    if (!amount || amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    editExpense({ ...editing, amount });
    toast.success("Expense updated!");
    setEditing(null);
  };

  return (
    <>
      {expenses.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No expenses yet. Start by adding one!
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow border"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-2 font-medium text-gray-800">
                  {categoryIcons[exp.category] ||
                    categoryIcons["Miscellaneous"]}
                  {exp.category}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(exp.date).toDateString()}
                </div>
              </div>

              <div className="text-right mt-2 md:mt-0">
                <div className="text-blue-500 font-bold text-lg flex items-center justify-end">
                  <span className="mr-1">{currencySymbol}</span>
                  {Number(exp.amount).toFixed(2)}
                </div>
                <div className="flex justify-end gap-4 mt-2 text-gray-500 text-sm">
                  <button onClick={() => setEditing(exp)} title="Edit">
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      delExpense(exp.id);
                      toast.success("Expense deleted successfully");
                    }}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        // Dark backdrop
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <form
            onSubmit={handleEditSubmit}
            className="
              bg-white 
              p-6 
              rounded-xl 
              shadow-xl 
              w-full 
              max-w-sm   /* ← was max-w-md before; now capped at ~384px */
              mx-4       /* ← ensures ~16px of margin on very narrow screens */
              space-y-4 
              relative
            "
          >
            {/* Close “X” */}
            <button
              onClick={() => setEditing(null)}
              type="button"
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <FaTimes />
            </button>

            <h2 className="text-lg font-semibold text-gray-700">
              Edit Expense
            </h2>

            {/* Amount Input */}
            <div>
              <label className="text-sm text-gray-600">Amount</label>
              <div className="mt-1 flex items-center space-x-2 border rounded p-2 bg-gray-50">
                <span className="text-gray-700">{currencySymbol}</span>
                <input
                  type="number"
                  className="flex-1 bg-transparent outline-none text-gray-800"
                  value={editing.amount}
                  onChange={(e) =>
                    setEditing({ ...editing, amount: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="text-sm text-gray-600">Category</label>
              <select
                className="w-full border p-2 rounded mt-1 bg-gray-50 text-gray-800"
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-sm text-gray-600">Date</label>
              <DatePicker
                selected={new Date(editing.date)}
                // onChange={(date) =>
                //   setEditing({
                //     ...editing,
                //     date: date.toISOString().split("T")[0],
                //   })
                // }
                onChange={(date) => {
                  const localMidnight = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate()
                  );
                  setEditing({
                    ...editing,
                    date: localMidnight.toISOString().split("T")[0],
                  });
                }}
                className="w-full border p-2 rounded bg-gray-50 text-gray-800 mt-1"
                maxDate={new Date()}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
