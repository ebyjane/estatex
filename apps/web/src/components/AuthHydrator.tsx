'use client';

import { useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { useAuthStore, type AuthUser } from '@/stores/useAuthStore';

/**
 * After zustand rehydrates persisted `user`, sync with `localStorage` JWT:
 * - No token but persisted user → logout (fixes navbar "logged in" while API gets 401).
 * - Token → validate with `/auth/me` and refresh or clear user.
 * Always ends with `sessionChecked: true` so gated pages (e.g. /admin) fetch after auth is consistent.
 */
export function AuthHydrator() {
  useEffect(() => {
    let cancelled = false;

    const syncSession = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        if (useAuthStore.getState().user) {
          useAuthStore.getState().logout();
        } else {
          useAuthStore.getState().markSessionChecked();
        }
        return;
      }

      try {
        const u = await fetchApi<AuthUser | null>('/auth/me');
        if (cancelled) return;
        if (u) useAuthStore.getState().setUser(u);
        else useAuthStore.getState().logout();
      } catch {
        if (!cancelled) useAuthStore.getState().logout();
      } finally {
        if (!cancelled) useAuthStore.getState().markSessionChecked();
      }
    };

    if (useAuthStore.persist.hasHydrated()) {
      void syncSession();
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        void syncSession();
      });
      return () => {
        cancelled = true;
        unsub();
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
