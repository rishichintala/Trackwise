import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { ChartPieIcon, BanknotesIcon, SparklesIcon } from '@heroicons/react/24/outline';

const links = [
  { to: '/dashboard',  label: 'Dashboard',  icon: ChartPieIcon  },
  { to: '/expenses',   label: 'Expenses',   icon: BanknotesIcon },
  { to: '/budgets',    label: 'Budgets',    icon: BanknotesIcon },
  { to: '/reports',    label: 'Reports',    icon: ChartPieIcon  },
  { to: '/assistant',  label: 'Assistant',  icon: SparklesIcon  },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="bg-white shadow">
      <ul className="flex gap-4 px-6 py-3">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to} className="relative">
            <Link to={to} className="flex items-center gap-1 px-3 py-1">
              <Icon className="h-5 w-5" />
              {label}
            </Link>
            {pathname === to && (
              <motion.span
                layoutId="nav-underline"
                className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-brand"
              />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
