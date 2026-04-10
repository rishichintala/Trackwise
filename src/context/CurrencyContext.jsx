import { createContext, useContext, useState } from "react";

// Supported currencies and their symbols
const currencyOptions = {
  USD: "$",
  EUR: "€",
  INR: "₹",
  GBP: "£",
  JPY: "¥"
};

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  // Default is USD; DataContext overwrites this from the DB on login
  const [currency, setCurrency] = useState("USD");

  const value = {
    currencyCode: currency,
    currencySymbol: currencyOptions[currency],
    setCurrency,
    currencyOptions,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
