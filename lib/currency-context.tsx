"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface CurrencyContextType {
  currency: 'INR' | 'USD';
  toggleCurrency: () => void;
  convertPrice: (price: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [exchangeRate, setExchangeRate] = useState(83); // Default rate, will be updated from API
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('/api/exchange-rate');
        const data = await response.json();
        if (data.inrRate) {
          setExchangeRate(data.inrRate);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      }
    };

    fetchExchangeRate();
  }, []);

  const toggleCurrency = () => {
    setCurrency((prevCurrency) => (prevCurrency === 'INR' ? 'USD' : 'INR'));
  };

  const convertPrice = (price: number) => {
    if (currency === 'USD') {
      return price / exchangeRate;
    }
    return price;
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <CurrencyContext.Provider value={{ currency: 'INR', toggleCurrency, convertPrice }}>
        {children}
      </CurrencyContext.Provider>
    );
  }

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
