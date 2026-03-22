'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCurrencyStore } from '@/stores/useCurrencyStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const displayCurrency = useCurrencyStore((s) => s.currency);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetchApi<{
        accessToken: string;
        user?: { id: string; email: string; firstName?: string; lastName?: string; role?: string };
      }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          investorType: 'nri',
          preferredCurrency: displayCurrency,
        }),
      });
      if (res.accessToken && res.user) {
        setAuth(res.accessToken, res.user);
        toast.success('Account created — welcome!');
        router.push('/dashboard');
      }
    } catch (e) {
      setError('Registration failed. Email may already exist.');
      toast.error('Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center text-2xl font-bold text-cyan-400 mb-8">
          Investify
        </Link>
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-8"
        >
          <h1 className="text-xl font-semibold text-white">Create Account</h1>
          <p className="mt-2 text-slate-500">Start investing globally</p>
          {error && (
            <p className="mt-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-500">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"
                />
              </div>
            </div>
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
                minLength={6}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-cyan-500 py-3 font-medium text-slate-950 hover:bg-cyan-400 transition"
          >
            Create Account
          </button>
          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account? <Link href="/login" className="text-cyan-400 hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
