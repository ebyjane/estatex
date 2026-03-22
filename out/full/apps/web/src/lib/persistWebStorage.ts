import { createJSONStorage, type PersistStorage, type StateStorage } from 'zustand/middleware';

/** `localStorage` is undefined in Node — default zustand `persist` would throw or break RSC. */
const serverNoopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

const raw = createJSONStorage(() =>
  typeof window === 'undefined' ? serverNoopStorage : localStorage,
);

/**
 * Shared SSR-safe storage. Cast at the call site to your `partialize` shape, e.g.
 * `persistWebStorage as PersistStorage<Pick<MyState, 'field'>>`.
 */
export const persistWebStorage = raw as PersistStorage<unknown>;
