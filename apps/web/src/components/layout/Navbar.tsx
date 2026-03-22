'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Logo } from '@/components/logo';
import { clsx } from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCurrencyStore, type DisplayCurrency } from '@/stores/useCurrencyStore';
import { useAuthStore } from '@/stores/useAuthStore';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/post-property', label: 'Post Property' },
  { href: '/compare', label: 'Compare' },
  { href: '/calculator', label: 'Calculator' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/admin', label: 'Admin' },
];

const CURRENCIES: DisplayCurrency[] = ['INR', 'USD', 'AED'];

export function Navbar({ showAdmin = false }: { showAdmin?: boolean }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const curRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const closeOnOutside = useCallback((e: MouseEvent) => {
    if (curRef.current && !curRef.current.contains(e.target as Node)) setCurrencyOpen(false);
    if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('click', closeOnOutside);
    return () => document.removeEventListener('click', closeOnOutside);
  }, [closeOnOutside]);

  const links = NAV_LINKS.filter((l) => l.href !== '/admin' || showAdmin);
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email?.split('@')[0] || 'Account';

  return (
    <div
      role="banner"
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-brand-bg/95 shadow-brand backdrop-blur-xl"
    >
      <div className="pointer-events-auto mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo href="/" />

        <nav className="relative z-[60] hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                pathname === link.href
                  ? 'text-cyan-400 bg-white/5 shadow-brand'
                  : 'text-slate-400 hover:text-white hover:bg-white/5',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="relative z-[60] flex items-center gap-2">
          <div className="relative" ref={curRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrencyOpen((v) => !v);
                setUserOpen(false);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-white/10 bg-brand-card/80 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-400 transition-all shadow-brand"
            >
              {currency}
              <ChevronDown className={clsx('h-4 w-4 transition', currencyOpen && 'rotate-180')} />
            </button>
            {currencyOpen && (
              <div className="absolute right-0 mt-1 z-[70] w-28 rounded-lg border border-white/10 bg-brand-card py-1 shadow-xl shadow-black/40">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCurrency(c);
                      setCurrencyOpen(false);
                    }}
                    className={clsx(
                      'block w-full px-4 py-2 text-left text-sm',
                      c === currency ? 'text-cyan-400 bg-white/5' : 'text-slate-400 hover:text-white',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-white/10 bg-brand-card/80 text-slate-400 hover:text-cyan-400 hover:border-cyan-400/30 transition-all shadow-brand"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUserOpen((v) => !v);
                  setCurrencyOpen(false);
                }}
                className="flex max-w-[160px] items-center gap-1 rounded-lg border border-cyan-400/35 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-400/20 shadow-brand"
              >
                <span className="truncate">👤 {displayName}</span>
                <ChevronDown className={clsx('h-4 w-4 shrink-0', userOpen && 'rotate-180')} />
              </button>
              {userOpen && (
                <div className="absolute right-0 mt-1 z-[70] min-w-[180px] rounded-lg border border-white/10 bg-brand-card py-1 shadow-xl">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                    onClick={() => setUserOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-primary px-4 py-2 text-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
