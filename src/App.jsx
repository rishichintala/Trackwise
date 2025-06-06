/* src/App.jsx ----------------------------------------------------------- */
import { Routes, Route, Navigate } from 'react-router';
import Navbar    from './components/Navbar';
import Dashboard from './routes/Dashboard';
import Expenses  from './routes/Expenses';
import Budgets   from './routes/Budgets';
import Reports   from './routes/Reports';
import Layout from "./components/Layout";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* top nav bar */}
      {/* <Navbar /> */}

      {/* page content */}
      <main className="flex-1 container mx-auto px-4 py-6">
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses"  element={<Expenses  />} />
          <Route path="/budgets"   element={<Budgets   />} />
          <Route path="/reports"   element={<Reports   />} />
        </Routes>
        </Layout>
      </main>
    </div>
  );
}
