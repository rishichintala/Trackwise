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
  FaTags,
} from "react-icons/fa";
import toast from "react-hot-toast";

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

export default function ExpenseTable() {
  const {
    expenses,
    delExpense,
    editExpense,
    customCategories,
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    expensesThisMonth
  } = useData();
  const { currencySymbol, setCurrency } = useCurrency();
  const [editing, setEditing] = useState(null);

  const allCategories = [
    ...Object.keys(categoryIcons),
    ...customCategories
  ];

  const [year, month] = selectedMonth.split("-").map(Number);
  const displayMonthName = new Date(year, month - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // ————————————— PAGINATION —————————————
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset page when month changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth]);

  const totalPages = Math.ceil(expensesThisMonth.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = expensesThisMonth.slice(startIndex, startIndex + itemsPerPage);

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

  // Format a stored date string ("YYYY-MM-DDT12:00:00") into local display
  const formatDate = (dateString) => {
    const localDate = new Date(dateString); // parsed as local
    return localDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border gap-4">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">
          Expenses for <span className="text-blue-600 font-extrabold">{displayMonthName}</span>
        </h2>

        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border">
          <label htmlFor="month-filter-exp" className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Show period:</label>
          <select
            id="month-filter-exp"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none cursor-pointer"
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

      {expensesThisMonth.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No expenses yet. Start by adding one!
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Item & Category</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(exp.date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">{exp.itemName}</span>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                            {categoryIcons[exp.category] || <FaTags className="text-blue-300" />}
                            {exp.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {currencySymbol}{Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end gap-3 transition-opacity">
                          <button
                            onClick={() => setEditing(exp)}
                            className="text-gray-400 hover:text-blue-600 p-1"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => {
                              delExpense(exp.id);
                              toast.success("Expense deleted");
                            }}
                            className="text-gray-400 hover:text-red-500 p-1"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View (hidden on desktop) */}
          <div className="sm:hidden space-y-3">
            {paginatedExpenses.map((exp) => (
              <div key={exp.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-lg">
                    {categoryIcons[exp.category] || <FaTags className="text-blue-300" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{exp.itemName || "Unnamed"}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(exp.date)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-black text-red-600">
                    -{currencySymbol}{Number(exp.amount).toFixed(2)}
                  </span>
                  <div className="flex gap-4">
                    <button onClick={() => setEditing(exp)} className="text-gray-400 hover:text-blue-600 text-base">
                      <FaEdit />
                    </button>
                    <button onClick={() => { delExpense(exp.id); toast.success("Deleted"); }} className="text-gray-400 hover:text-red-500 text-base">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white rounded-xl shadow-sm border px-6 py-3 flex items-center justify-between">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-3 py-1 bg-white border rounded text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-3 py-1 bg-white border rounded text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <form
            onSubmit={handleEditSubmit}
            className="
              bg-white 
              p-6 
              rounded-xl 
              shadow-xl 
              w-full 
              max-w-sm   
              mx-4       
              space-y-4 
              relative
            "
          >
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

            {/* Item Name Input */}
            <div>
              <label className="text-sm text-gray-600">Item Name</label>
              <input
                type="text"
                className="w-full border p-2 rounded mt-1 bg-gray-50 text-gray-800 outline-none"
                value={editing.itemName || ""}
                onChange={(e) =>
                  setEditing({ ...editing, itemName: e.target.value })
                }
              />
            </div>

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
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker (store as local midday) */}
            <div>
              <label className="text-sm text-gray-600">Date</label>
              <DatePicker
                selected={new Date(editing.date)}
                onChange={(date) => {
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, "0");
                  const dd = String(date.getDate()).padStart(2, "0");
                  const localMidday = `${yyyy}-${mm}-${dd}T12:00:00`;

                  setEditing({
                    ...editing,
                    date: localMidday,
                  });
                }}
                className="w-full border p-2 rounded bg-gray-50 text-gray-800 mt-1"
                maxDate={new Date()}
              />
            </div>

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
