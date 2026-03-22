'use client';

import { useEffect, useState } from 'react';
import { apiUrl } from '@/lib/api';
import { useCurrencyStore, type DisplayCurrency } from '@/stores/useCurrencyStore';

export function useDisplayPrice(price: number, currencyCode: string) {
  const display = useCurrencyStore((s) => s.currency);
  const [state, setState] = useState<{
    value: number;
    currency: DisplayCurrency | string;
    loading: boolean;
  }>({ value: price, currency: currencyCode, loading: true });

  useEffect(() => {
    let cancelled = false;
    const from = (currencyCode || 'USD').toUpperCase();
    const to = display.toUpperCase();

    if (from === to) {
      setState({ value: price, currency: display, loading: false });
      return;
    }

    setState((s) => ({ ...s, loading: true }));
    const q = `amount=${encodeURIComponent(String(price))}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    fetch(apiUrl(`/fx/convert?${q}`))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { converted?: number }) => {
        if (!cancelled) {
          setState({
            value: typeof d.converted === 'number' ? d.converted : price,
            currency: display,
            loading: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ value: price, currency: from, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, [price, currencyCode, display]);

  return state;
}
