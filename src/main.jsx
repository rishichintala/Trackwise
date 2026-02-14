/* src/main.jsx ---------------------------------------------------------- */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';   // ← comes from react‑router 7
import { DataProvider } from './context/DataContext';
import { CurrencyProvider } from "./context/CurrencyContext";
import { AuthProvider } from "./context/AuthContext";

import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';   // Tailwind import

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <DataProvider>
        <CurrencyProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </CurrencyProvider>
      </DataProvider>
    </AuthProvider>
  </BrowserRouter>
);
