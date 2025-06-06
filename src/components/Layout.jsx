// src/components/Layout.jsx
import { NavLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ========== NAV BAR ========== */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* You can put your brand/logo here */}
          <div className="text-2xl font-bold text-gray-800">MyBudgetApp</div>

          {/* Simple navigation links */}
          <div className="flex space-x-6">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-gray-600 hover:text-blue-600 ${
                  isActive ? "text-blue-600 font-medium" : ""
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/expenses"
              className={({ isActive }) =>
                `text-gray-600 hover:text-blue-600 ${
                  isActive ? "text-blue-600 font-medium" : ""
                }`
              }
            >
              Expenses
            </NavLink>

            <NavLink
              to="/budgets"
              className={({ isActive }) =>
                `text-gray-600 hover:text-blue-600 ${
                  isActive ? "text-blue-600 font-medium" : ""
                }`
              }
            >
              Budgets
            </NavLink>

            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `text-gray-600 hover:text-blue-600 ${
                  isActive ? "text-blue-600 font-medium" : ""
                }`
              }
            >
              Reports
            </NavLink>
          </div>
        </div>
      </nav>

      {/* ========== PAGE CONTENT AREA ========== */}
      <main className="flex-1 w-full">
        {/* 
          Every “page” will be injected here as the value of `children`.
          We wrap it in a max-width container with padding, so all pages
          look consistent.
        */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
      {/* ========== FOOTER ========== */}
      <footer className="bg-white text-center text-sm text-gray-500 py-4 border-t">
        © 2025 Trackwise | Built with ❤️ by Sai Rishith Chintala
      </footer>
    </div>
    
  );
}
