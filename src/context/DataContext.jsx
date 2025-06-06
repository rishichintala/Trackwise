import { createContext, useContext, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import useLocalStorage from '../hooks/useLocalStorage';

const Ctx = createContext();
export const useData = () => useContext(Ctx);

export function DataProvider({ children }) {
  const [expenses, setExpenses] = useLocalStorage('tw_expenses', []);
  const [budgets,  setBudgets]  = useLocalStorage('tw_budgets',  []);
  const [income,   setIncome]   = useLocalStorage('tw_income',   0);

  /* CRUD helpers */
  const addExpense = e  => setExpenses(p => [{ id: uuid(), ...e }, ...p]);
  const editExpense = e => setExpenses(p => p.map(x => x.id === e.id ? e : x));
  const delExpense = id => setExpenses(p => p.filter(x => x.id !== id));

  const addBudget  = b  => setBudgets(p => [{ id: uuid(), ...b }, ...p]);
  const editBudget = b  => setBudgets(p => p.map(x => x.id === b.id ? b : x));
  const delBudget  = id => setBudgets(p => p.filter(x => x.id !== id));

  /* Derived total for current month */
  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, e) => s + Number(e.amount), 0);
  }, [expenses]);

  const value = {
    expenses, addExpense, editExpense, delExpense,
    budgets,  addBudget,  editBudget,  delBudget,
    income, setIncome,
    totalThisMonth,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
