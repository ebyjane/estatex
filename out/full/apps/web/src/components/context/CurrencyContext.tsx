'use client';

import type { ReactNode } from 'react';
import { useCurrencyStore, type DisplayCurrency } from '@/stores/useCurrencyStore';

/** @deprecated layout no longer requires this wrapper — kept for incremental migration */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useCurrency() {
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  return {
    currency,
    setCurrency: (c: string) => {
      if (c === 'INR' || c === 'USD' || c === 'AED') setCurrency(c as DisplayCurrency);
    },
  };
}
