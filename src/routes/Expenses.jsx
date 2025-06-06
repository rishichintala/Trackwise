import ExpenseForm  from '../components/ExpenseForm';
import ExpenseTable from '../components/ExpenseTable';

export default function Expenses() {
  return (
    <section className="space-y-8">
      <ExpenseForm />
      <ExpenseTable />
    </section>
  );
}
