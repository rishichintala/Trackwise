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
  const [currency, setCurrency] = useState("USD"); // Default currency

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
