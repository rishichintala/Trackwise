import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* ========== NAV BAR (responsive) ========== */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ─── Brand / Logo ─── */}
            <div className="text-2xl font-bold text-gray-800">Trackwise</div>

            {/* ─── Desktop Menu (hidden on mobile) ─── */}
            <div className="hidden sm:flex space-x-8">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center space-x-1 text-gray-600 hover:text-blue-600 ${isActive ? "text-blue-600 font-medium" : ""
                  }`
                }
              >
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/expenses"
                className={({ isActive }) =>
                  `flex items-center space-x-1 text-gray-600 hover:text-blue-600 ${isActive ? "text-blue-600 font-medium" : ""
                  }`
                }
              >
                <span>Expenses</span>
              </NavLink>
              <NavLink
                to="/budgets"
                className={({ isActive }) =>
                  `flex items-center space-x-1 text-gray-600 hover:text-blue-600 ${isActive ? "text-blue-600 font-medium" : ""
                  }`
                }
              >
                <span>Budgets</span>
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `flex items-center space-x-1 text-gray-600 hover:text-blue-600 ${isActive ? "text-blue-600 font-medium" : ""
                  }`
                }
              >
                <span>Reports</span>
              </NavLink>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                <span>Logout</span>
              </button>
            </div>

            {/* ─── Mobile Hamburger Button (visible on small) ─── */}
            <div className="sm:hidden">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                {menuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ─── Mobile Menu (dropdown) ─── */}
        {menuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-200">
            <ul className="px-2 pt-2 pb-3 space-y-1">
              {["dashboard", "expenses", "budgets", "reports"].map((route) => (
                <li key={route}>
                  <NavLink
                    to={`/${route}`}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 ${isActive ? "bg-gray-100 font-medium text-blue-600" : ""
                      }`
                    }
                  >
                    <span>
                      {route.charAt(0).toUpperCase() + route.slice(1)}
                    </span>
                  </NavLink>
                </li>
              ))}
              {/* Mobile Logout Button */}
              <li className="pt-2 mt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center space-x-1 px-3 py-2 rounded-md text-red-500 hover:bg-red-50 font-medium transition-colors"
                >
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* ========== PAGE CONTENT ========== */}
      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>

      {/* ========== FOOTER (sticky bottom) ========== */}
      <footer className="bg-white border-t text-center text-gray-500 text-sm py-4">
        © {new Date().getFullYear()} Trackwise | Built with ❤️ by{' '}
        <a
          href="https://github.com/rishichintala"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          Sai Rishith Chintala
        </a>{' '}
        and{' '}
        <a
          href="https://github.com/Kavyavemuri25"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          Kavya Vemuri
        </a>
      </footer>
    </div>
  );
}
