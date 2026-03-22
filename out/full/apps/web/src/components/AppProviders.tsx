'use client';

import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CurrencyProvider } from '@/components/context/CurrencyContext';
import { AuthHydrator } from '@/components/AuthHydrator';
import { ZustandRehydrateClient } from '@/components/ZustandRehydrateClient';
import { NavbarWithContext } from '@/components/layout/NavbarWithContext';

/** Load toast UI only in the browser — avoids SSR/webpack issues with goober + hot-toast. */
const ClientToaster = dynamic(
  async () => {
    const { Toaster } = await import('react-hot-toast');
    return function LoadedToaster() {
      return (
        <Toaster
          position="top-center"
          toastOptions={{ className: 'bg-slate-900 text-slate-100 border border-white/10' }}
        />
      );
    };
  },
  { ssr: false },
);

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthHydrator />
        <ZustandRehydrateClient />
        <ClientToaster />
        <NavbarWithContext showAdmin />
        <main className="relative z-0 min-h-screen pt-16">{children}</main>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
