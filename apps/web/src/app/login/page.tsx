'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiBaseDisplay, fetchApi } from '@/lib/api';
import { useAuthStore, type AuthUser } from '@/stores/useAuthStore';
import { Logo } from '@/components/logo';
import toast from 'react-hot-toast';

function safeRedirectPath(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('://')) return '/dashboard';
  return next;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const DEMO_EMAIL = 'admin@estatex.ai';
  const DEMO_PASSWORD = 'admin123';

  const setAuth = useAuthStore((s) => s.setAuth);

  const signIn = async (loginEmail: string, loginPassword: string) => {
    setError('');
    const res = await fetchApi<{ accessToken: string; user?: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });

    if (!res?.accessToken) {
      setError('Invalid response from server');
      toast.error('Login failed');
      return;
    }

    const token = res.accessToken.trim();
    if (res.user) {
      setAuth(token, res.user);
    } else {
      localStorage.setItem('token', token);
      try {
        const u = await fetchApi<AuthUser | null>('/auth/me');
        if (!u) throw new Error('profile');
        setAuth(token, u);
      } catch {
        localStorage.removeItem('token');
        setError('Signed in but could not load your profile. Try again.');
        toast.error('Login incomplete');
        return;
      }
    }

    toast.success('Signed in');
    const next =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null;
    router.push(safeRedirectPath(next));
  };

  const explainNetwork = () =>
    `Cannot reach API at ${apiBaseDisplay()}. Start the Nest API, set NEXT_PUBLIC_API_URL to match it, and ensure the API has DATABASE_URL (PostgreSQL / Supabase) in apps/api/.env.`;

  function messageFromLoginError(err: unknown): string {
    if (err instanceof TypeError) return explainNetwork();
    const raw = err instanceof Error ? err.message : String(err);
    try {
      const j = JSON.parse(raw) as { message?: string | string[] };
      const m = j.message;
      if (Array.isArray(m)) return m.join(', ');
      if (typeof m === 'string') return m;
    } catch {
      /* plain text */
    }
    if (raw && raw.length < 220) return raw;
    return 'Invalid credentials';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (err) {
      if (err instanceof TypeError) {
        setError(explainNetwork());
        toast.error('Cannot reach API');
      } else {
        const msg = messageFromLoginError(err);
        setError(msg);
        toast.error('Login failed');
      }
    }
  };

  const handleDemoLogin = async () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
    try {
      await signIn(DEMO_EMAIL, DEMO_PASSWORD);
    } catch (err) {
      if (err instanceof TypeError) setError(explainNetwork());
      else setError(messageFromLoginError(err));
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo href="/" />
        </div>
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-white/10 bg-brand-card/80 p-8 shadow-brand"
        >
          <h1 className="text-xl font-semibold text-white">Sign In</h1>
          <p className="mt-2 text-slate-500">Access your investment dashboard</p>
          {error && (
            <p className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm text-slate-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"
              />
            </div>
          </div>
          <button type="submit" className="mt-6 w-full btn-primary py-3">
            Sign In
          </button>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="mt-3 w-full rounded-lg border border-slate-600 bg-slate-800/80 py-3 font-medium text-slate-200 hover:bg-slate-800 transition"
          >
            Try demo (admin@estatex.ai)
          </button>
          <p className="mt-4 text-center text-sm text-slate-500">
            No account? <Link href="/register" className="text-cyan-400 hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
