// import { useState, useEffect } from "react";
// import { useData } from "../context/DataContext";
// import { useCurrency } from "../context/CurrencyContext";
// import toast from "react-hot-toast";
// import { v4 as uuid } from "uuid";
// import {
//   FaUtensils, FaCar, FaHome, FaHeartbeat, FaShoppingBag, FaBriefcase,
//   FaBolt, FaGamepad, FaChartLine, FaQuestion, FaTrash, FaEdit
// } from "react-icons/fa";

// const categoryIcons = {
//   Food: <FaUtensils />,
//   Transport: <FaCar />,
//   Housing: <FaHome />,
//   Entertainment: <FaGamepad />,
//   Utilities: <FaBolt />,
//   Health: <FaHeartbeat />,
//   Shopping: <FaShoppingBag />,
//   Business: <FaBriefcase />,
//   Income: <FaChartLine />,
//   Miscellaneous: <FaQuestion />,
// };

// const categories = Object.keys(categoryIcons);

// export default function Budgets() {
//   const { budgets, addBudget, delBudget, editBudget, expenses, income, setIncome } = useData();
//   const { currencySymbol, currencyCode, setCurrency, currencyOptions } = useCurrency();

//   const [form, setForm] = useState({ category: "", limit: "", notify: true });
//   const [edit, setEdit] = useState(null);
//   const [confirmCurrency, setConfirmCurrency] = useState(false);
//   const [tempCurrency, setTempCurrency] = useState("");
//   const [currencyLocked, setCurrencyLocked] = useState(!!currencyCode);

//   const spentPerCategory = expenses.reduce((acc, e) => {
//     acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
//     return acc;
//   }, {});

//   useEffect(() => {
//     const saved = localStorage.getItem("tw_currency");
//     if (saved) setCurrency(saved);
//   }, []);

//   const handleSaveIncome = () => {
//     if (!income || income <= 0) {
//       toast.error("Please enter a valid income.");
//       return;
//     }
//     localStorage.setItem("tw_currency", currencyCode);
//     setCurrencyLocked(true);
//     toast.success("Income and currency saved.");
//   };

//   const handleCurrencySelect = (e) => {
//     setTempCurrency(e.target.value);
//     setConfirmCurrency(true);
//   };

//   const confirmCurrencyChange = () => {
//     localStorage.clear();
//     localStorage.setItem("tw_currency", tempCurrency);
//     setCurrency(tempCurrency);
//     window.location.reload();
//   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     if (!form.category || !form.limit || Number(form.limit) <= 0) {
// //       toast.error("Please enter a valid budget");
// //       return;
// //     }

// //     const isDuplicate = budgets.find(
// //       (b) => b.category === form.category && (!edit || edit.id !== b.id)
// //     );
// //     if (isDuplicate) {
// //       toast.error("Budget for this category already exists");
// //       return;
// //     }

// //     const newBudget = { ...form, limit: Number(form.limit) };

// //     if (edit) {
// //       editBudget({ ...newBudget, id: edit.id });
// //       toast.success("Budget updated");
// //     } else {
// //       addBudget({ ...newBudget, id: uuid() });
// //       toast.success("Budget added");
// //     }

// //     setForm({ category: "", limit: "", notify: true });
// //     setEdit(null);
// //   };

// //   const openEdit = (budget) => {
// //     setForm({ category: budget.category, limit: budget.limit, notify: budget.notify });
// //     setEdit(budget);
// //   };
// const handleSubmit = (e) => {
//     e.preventDefault();
  
//     if (!income || income <= 0 || !currencyLocked) {
//       toast.error("Set valid income and currency before adding a budget");
//       return;
//     }
  
//     if (!form.category || !form.limit || Number(form.limit) <= 0) {
//       toast.error("Please enter a valid budget");
//       return;
//     }
  
//     const isDuplicate = budgets.find(
//       (b) => b.category === form.category && (!edit || edit.id !== b.id)
//     );
//     if (isDuplicate) {
//       toast.error("Budget for this category already exists");
//       return;
//     }
  
//     const newBudget = { ...form, limit: Number(form.limit) };
  
//     if (edit) {
//       editBudget({ ...newBudget, id: edit.id });
//       toast.success("Budget updated");
//     } else {
//       addBudget({ ...newBudget, id: uuid() });
//       toast.success("Budget added");
//     }
  
//     setForm({ category: "", limit: "", notify: true });
//     setEdit(null);
//   };
  

//   return (
//     <section className="max-w-4xl mx-auto space-y-8 p-4">
//       {/* Income and Currency */}
//       <div className="bg-white p-6 rounded-xl shadow space-y-4">
//         <h2 className="text-lg font-semibold text-gray-700">Set Monthly Income & Currency</h2>
//         <div className="flex flex-col md:flex-row gap-4 items-center">
//           <input
//             type="number"
//             value={income}
//             onChange={(e) => setIncome(Number(e.target.value))}
//             className="w-full border p-2 rounded"
//             placeholder="e.g., 3000"
//           />
//           <select
//             disabled={currencyLocked}
//             value={currencyCode}
//             onChange={handleCurrencySelect}
//             className="border rounded p-2 w-full"
//           >
//             {Object.keys(currencyOptions).map((cur) => (
//               <option key={cur} value={cur}>{cur}</option>
//             ))}
//           </select>
//         </div>
//         <div className="flex gap-3 justify-end">
//           {!currencyLocked && (
//             <button
//               onClick={handleSaveIncome}
//               className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
//             >
//               Save Income
//             </button>
//           )}
//           {currencyLocked && (
//             <button
//               onClick={() => setCurrencyLocked(false)}
//               className="text-blue-600 underline text-sm"
//             >
//               Change Currency
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Budget Form */}
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
//         <h2 className="text-lg font-semibold text-gray-700">{edit ? "Edit Budget" : "Add New Budget"}</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="text-sm text-gray-600">Category</label>
//             <select
//               className="w-full border p-2 rounded mt-1"
//               value={form.category}
//               onChange={(e) => setForm({ ...form, category: e.target.value })}
//             >
//               <option value="">-- Select --</option>
//               {categories.map((cat) => (
//                 <option key={cat} value={cat}>{cat}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="text-sm text-gray-600">Limit</label>
//             <input
//               type="number"
//               className="w-full border p-2 rounded mt-1"
//               placeholder="e.g., 500"
//               value={form.limit}
//               onChange={(e) => setForm({ ...form, limit: e.target.value })}
//             />
//           </div>
//           <div className="flex items-center mt-6">
//             <input
//               type="checkbox"
//               checked={form.notify}
//               onChange={(e) => setForm({ ...form, notify: e.target.checked })}
//               className="mr-2"
//             />
//             <span className="text-sm text-gray-600">Notify me at 80%</span>
//           </div>
//         </div>
//         <div className="flex justify-end pt-2 gap-2">
//           {edit && (
//             <button
//               type="button"
//               onClick={() => {
//                 setEdit(null);
//                 setForm({ category: "", limit: "", notify: true });
//               }}
//               className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
//             >
//               Cancel
//             </button>
//           )}
//           <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
//             {edit ? "Update Budget" : "Set Budget"}
//           </button>
//         </div>
//       </form>

//       {/* Budget Cards */}
//       <div className="grid gap-4 md:grid-cols-2">
//         {budgets.map((b) => {
//           const spent = spentPerCategory[b.category] || 0;
//           const remaining = b.limit - spent;
//           const percentage = Math.min((spent / b.limit) * 100, 100);
//           const overBudget = spent > b.limit;
//           const nearLimit = !overBudget && percentage >= 80 && percentage < 100;
//           const barColor = overBudget ? "bg-red-500" : nearLimit ? "bg-orange-400" : "bg-blue-500";

//           if (nearLimit && b.notify) {
//             toast("⚠️ You're nearing your budget for " + b.category);
//           }

//           return (
//             <div key={b.id} className="bg-white p-4 rounded-xl shadow space-y-2">
//               <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-2 font-medium text-gray-800">
//                   {categoryIcons[b.category] || <FaQuestion />}
//                   {b.category}
//                 </div>
//                 <div className="flex gap-3 text-gray-500 text-sm">
//                   <button onClick={() => openEdit(b)} title="Edit"><FaEdit /></button>
//                   <button
//                     onClick={() => {
//                       delBudget(b.id);
//                       toast.success("Budget deleted");
//                     }}
//                     title="Delete"
//                   >
//                     <FaTrash />
//                   </button>
//                 </div>
//               </div>
//               <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div className={`h-2 ${barColor}`} style={{ width: `${percentage}%` }}></div>
//               </div>
//               <div className="text-sm text-gray-600 space-y-0.5">
//                 <p>Limit: {currencySymbol}{b.limit.toFixed(2)}</p>
//                 <p>Spent: {currencySymbol}{spent.toFixed(2)}</p>
//                 <p>Remaining: {currencySymbol}{remaining.toFixed(2)}</p>
//                 {nearLimit && b.notify && <p className="text-orange-500">⚠️ Nearing your budget limit</p>}
//                 {overBudget && <p className="text-red-500">🚨 Over budget!</p>}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Currency Change Confirmation Modal */}
//       {confirmCurrency && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded shadow-xl max-w-sm text-center space-y-4">
//             <h2 className="text-lg font-semibold text-gray-800">Change Currency?</h2>
//             <p className="text-gray-600 text-sm">
//               Changing currency will reset all your data. Do you want to continue?
//             </p>
//             <div className="flex justify-center gap-4 pt-2">
//               <button
//                 onClick={() => setConfirmCurrency(false)}
//                 className="px-4 py-2 rounded bg-gray-300 text-sm text-gray-700"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmCurrencyChange}
//                 className="px-4 py-2 rounded bg-red-600 text-sm text-white hover:bg-red-700"
//               >
//                 Yes, Reset
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }











import { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { useCurrency } from "../context/CurrencyContext";
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
} from "react-icons/fa";

const categoryIcons = {
  Food: <FaUtensils />,
  Transport: <FaCar />,
  Housing: <FaHome />,
  Entertainment: <FaGamepad />,
  Utilities: <FaBolt />,
  Health: <FaHeartbeat />,
  Shopping: <FaShoppingBag />,
  Business: <FaBriefcase />,
  Income: <FaChartLine />,
  Miscellaneous: <FaQuestion />,
};

const categories = Object.keys(categoryIcons);

export default function Budgets() {
  const {
    budgets,
    addBudget,
    delBudget,
    editBudget,
    expenses,
    income,
    setIncome,
  } = useData();
  const { currencySymbol, currencyCode, setCurrency, currencyOptions } =
    useCurrency();

  // ————————————— STATE —————————————
  const [form, setForm] = useState({ category: "", limit: "", notify: true });
  const [edit, setEdit] = useState(null);

  // Local copy of the “Monthly Income” input
  const [localIncome, setLocalIncome] = useState(income || "");

  // Track which currency is selected
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return (
      localStorage.getItem("tw_currency") ||
      currencyCode ||
      Object.keys(currencyOptions)[0]
    );
  });

  // Lock the dropdown once income > 0
  const [currencyLocked, setCurrencyLocked] = useState(() => {
    return income > 0;
  });

  // Show / hide the “Are you sure you want to reset?” modal
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Sum up how much has been spent in each category
  const spentPerCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
  }, {});

  // On mount: re‐apply any previously‐saved currency
  useEffect(() => {
    const saved = localStorage.getItem("tw_currency");
    if (saved) {
      setCurrency(saved);
    }
  }, [setCurrency]);

  // ————————————— HANDLERS —————————————

  // 1) Save or Update Income:
  //    • First time (income===0) → lock dropdown after saving
  //    • Subsequent times (income>0) → simple update
  const handleSaveOrUpdateIncome = () => {
    const val = Number(localIncome);
    if (!val || val <= 0) {
      toast.error("Please enter a valid income");
      return;
    }

    if (income <= 0) {
      // First‐time save: store income, persist currency, lock dropdown
      setIncome(val);
      localStorage.setItem("tw_currency", selectedCurrency);
      setCurrency(selectedCurrency);
      setCurrencyLocked(true);
      toast.success("Income saved!");
    } else {
      // Just updating existing income
      setIncome(val);
      toast.success("Income updated!");
    }
  };

  // 2) “Change Currency” button → open a confirmation modal instead of immediately unlocking
  const handleChangeCurrencyClick = () => {
    setShowCurrencyModal(true);
  };

  // 3) If the user confirms in the modal (“Yes, Reset All”), we clear everything and reload
  const confirmResetCurrency = () => {
    localStorage.clear();
    localStorage.setItem("tw_currency", selectedCurrency);
    window.location.reload();
  };

  // 4) Budget form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!income || income <= 0) {
      toast.error("Please set a valid income first");
      return;
    }
    if (!form.category || !form.limit || Number(form.limit) <= 0) {
      toast.error("Please enter a valid budget");
      return;
    }

    const isDuplicate = budgets.find(
      (b) => b.category === form.category && (!edit || edit.id !== b.id)
    );
    if (isDuplicate) {
      toast.error("Budget for this category already exists");
      return;
    }

    const newBudget = { ...form, limit: Number(form.limit) };
    if (edit) {
      editBudget({ ...newBudget, id: edit.id });
      toast.success("Budget updated!");
    } else {
      addBudget({ ...newBudget, id: uuid() });
      toast.success("Budget added!");
    }
    setForm({ category: "", limit: "", notify: true });
    setEdit(null);
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
              className={`w-full border rounded p-2 ${
                currencyLocked ? "bg-gray-100" : ""
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
            {income > 0 ? "Update Income" : "Save Income"}
          </button>

          {/* Change Currency (only visible once income > 0) */}
          {income > 0 && (
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
              {categories.map((cat) => (
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
  {budgets.map((b) => {
    const spent = spentPerCategory[b.category] || 0;
    const remaining = b.limit - spent;
    const percentage = Math.min((spent / b.limit) * 100, 100);

    // 1) Over budget: spent > limit → red
    const overBudget = spent > b.limit;
    // 2) Exactly at limit → blue (“reached budget”)
    const reachedBudget = spent === b.limit;
    // 3) Between 80% and just under 100% → orange (“nearing”)
    const nearLimit = spent < b.limit && percentage >= 80;
    // 4) Under 80% → green (“safe”)
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
          <div className="flex items-center gap-2 font-medium text-gray-800">
            {categoryIcons[b.category] || <FaQuestion />} {b.category}
          </div>
          <div className="flex gap-3 text-gray-500 text-sm">
            <button onClick={() => openEdit(b)} title="Edit">
              <FaEdit />
            </button>
            <button
              onClick={() => {
                delBudget(b.id);
                toast.success("Budget deleted");
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
          {/* no message when 'safe' */}
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

