'use client';

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Logo } from '@/components/logo';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 dark:border-slate-800/50 border-slate-200 bg-white/80 dark:bg-brand-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo href="/" />
        <nav className="flex items-center gap-6">
          <Link href="/properties" className="text-slate-400 hover:text-white transition">
            Properties
          </Link>
          <Link href="/calculator" className="text-slate-400 hover:text-white transition">
            Calculator
          </Link>
          <Link href="/compare" className="text-slate-400 hover:text-white transition">
            Compare
          </Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
            Dashboard
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link
            href="/login"
            className="rounded-lg bg-cyan-500/20 px-4 py-2 text-cyan-400 hover:bg-cyan-500/30 transition"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
