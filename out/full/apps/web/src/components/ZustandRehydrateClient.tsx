'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCurrencyStore } from '@/stores/useCurrencyStore';

/**
 * `persist` must not hydrate during SSR — it async-merges into the store and can crash Next
 * (plain "Internal Server Error"). With `skipHydration: true`, rehydrate only in the browser,
 * after `AuthHydrator` has registered `onFinishHydration`.
 */
export function ZustandRehydrateClient() {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
    void useCurrencyStore.persist.rehydrate();
  }, []);
  return null;
}
