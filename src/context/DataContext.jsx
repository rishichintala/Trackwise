import { createContext, useContext, useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const Ctx = createContext();
export const useData = () => useContext(Ctx);

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "/api";

export function DataProvider({ children }) {
  const { token, user } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [monthlyIncomes, setMonthlyIncomes] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return localStorage.getItem("tw_selectedMonth") || defaultMonth;
  });

  // Persist month selection across navigation/reloads
  useEffect(() => {
    localStorage.setItem("tw_selectedMonth", selectedMonth);
  }, [selectedMonth]);

  // Authenticated axios instance
  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: { Authorization: `Bearer ${token}` }
    });
  }, [token]);

  // Fetch initial data
  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          setDataLoading(true);
          const [expRes, budRes, incRes] = await Promise.all([
            api.get("/expenses"),
            api.get("/budgets"),
            api.get("/incomes")
          ]);
          setExpenses(expRes.data);
          // Normalize backend Budget(amount) -> UI Budget(limit)
          setBudgets(budRes.data.map(b => ({ ...b, limit: Number(b.amount) })));
          setMonthlyIncomes(incRes.data);

          // Seed custom categories from expenses if empty
          const cats = new Set(expRes.data.map(e => e.category));
          setCustomCategories(Array.from(cats));
        } catch (err) {
          console.error("Error fetching data:", err);
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    } else {
      setExpenses([]);
      setBudgets([]);
      setMonthlyIncomes([]);
      setDataLoading(false);
    }
  }, [token, api]);

  /* CRUD helpers that sync with backend */
  const addExpense = async (e) => {
    try {
      const res = await api.post("/expenses", e);
      setExpenses(p => [res.data, ...p]);
    } catch (err) {
      console.error("Failed to add expense", err);
    }
  };

  const editExpense = async (e) => {
    try {
      const res = await api.put(`/expenses/${e.id}`, e);
      setExpenses(p => p.map(x => x.id === e.id ? res.data : x));
    } catch (err) {
      console.error("Failed to edit expense", err);
    }
  };

  const delExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(p => p.filter(x => x.id !== id));
    } catch (err) {
      console.error("Failed to delete expense", err);
    }
  };

  const addBudget = async (b) => {
    try {
      const payload = {
        category: b.category,
        month: b.month,
        amount: b.limit,
      };
      const res = await api.post("/budgets", payload);
      setBudgets(p => {
        const normalized = { ...res.data, limit: Number(res.data.amount) };
        const exists = p.find(x => x.category === normalized.category && x.month === normalized.month);
        if (exists) {
          return p.map(x =>
            x.category === normalized.category && x.month === normalized.month ? normalized : x
          );
        }
        return [normalized, ...p];
      });
    } catch (err) {
      console.error("Failed to save budget", err);
    }
  };

  const delBudget = async (category) => {
    try {
      await api.delete(`/budgets/${category}`);
      setBudgets(p => p.filter(x => x.category !== category));
    } catch (err) {
      console.error("Failed to delete budget category", err);
    }
  };

  // For this app, "edit" is the same as "upsert for this category+month"
  const editBudget = addBudget;

  const setIncomeForMonth = async (amount, month) => {
    try {
      const res = await api.post("/incomes", { amount, month });
      setMonthlyIncomes(p => {
        const exists = p.find(i => i.month === month);
        if (exists) return p.map(i => i.month === month ? res.data : i);
        return [...p, res.data];
      });
    } catch (err) {
      console.error("Failed to save income", err);
    }
  };

  const addCategory = name => {
    if (!customCategories.includes(name)) {
      setCustomCategories(p => [...p, name]);
    }
  };
  const delCategory = name => setCustomCategories(p => p.filter(x => x !== name));

  /* Derived data for SELECTED month */
  const availableMonths = useMemo(() => {
    const months = new Set();
    months.add(defaultMonth);
    months.add(selectedMonth);
    expenses.forEach(e => {
      const d = new Date(e.date);
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    budgets.forEach(b => {
      if (b?.month) months.add(b.month);
    });
    monthlyIncomes.forEach(i => {
      if (i?.month) months.add(i.month);
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [expenses, budgets, monthlyIncomes, defaultMonth, selectedMonth]);

  const expensesThisMonth = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === month - 1 && d.getFullYear() === year;
    });
  }, [expenses, selectedMonth]);

  const budgetsThisMonth = useMemo(() => {
    const categories = Array.from(new Set(budgets.map(b => b.category)));
    return categories.map(cat => {
      const records = budgets
        .filter(b => b.category === cat && b.month <= selectedMonth)
        .sort((a, b) => b.month.localeCompare(a.month));
      return records[0];
    }).filter(Boolean);
  }, [budgets, selectedMonth]);

  const totalThisMonth = useMemo(() => {
    return expensesThisMonth.reduce((s, e) => s + Number(e.amount), 0);
  }, [expensesThisMonth]);

  const incomeThisMonth = useMemo(() => {
    const entry = monthlyIncomes.find(i => i.month === selectedMonth);
    return entry ? Number(entry.amount) : 0;
  }, [monthlyIncomes, selectedMonth]);

  const value = {
    expenses, addExpense, editExpense, delExpense,
    budgets, budgetsThisMonth, addBudget, editBudget, delBudget,
    monthlyIncomes, setIncomeForMonth, incomeThisMonth,
    customCategories, addCategory, delCategory,
    selectedMonth, setSelectedMonth, availableMonths,
    expensesThisMonth, totalThisMonth,
    dataLoading,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
