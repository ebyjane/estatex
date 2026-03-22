import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import { persistWebStorage } from '@/lib/persistWebStorage';

export type DisplayCurrency = 'INR' | 'USD' | 'AED';

type CurrencyPersisted = {
  currency: DisplayCurrency;
  setCurrency: (c: DisplayCurrency) => void;
};

export const useCurrencyStore = create(
  persist<CurrencyPersisted>(
    (set) => ({
      currency: 'INR',
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'investify-currency-v1',
      storage: persistWebStorage as PersistStorage<CurrencyPersisted>,
      skipHydration: true,
    },
  ),
);
