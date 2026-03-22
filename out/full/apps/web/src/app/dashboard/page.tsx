'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { fetchApi } from '@/lib/api';
import { useCurrencyStore } from '@/stores/useCurrencyStore';

const COLORS = ['#22d3ee', '#38bdf8', '#0ea5e9'];

export default function DashboardPage() {
  const displayCurrency = useCurrencyStore((s) => s.currency);
  const [fxRates, setFxRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const results: Record<string, number> = {};
      const pairList: [string, string][] = [];
      const pushPair = (from: string, to: string) => {
        if (from === to) return;
        pairList.push([from, to]);
      };
      pushPair('USD', 'INR');
      pushPair('USD', 'AED');
      pushPair('USD', displayCurrency);
      const seen = new Set<string>();
      for (const [from, to] of pairList) {
        const key = `${from}→${to}`;
        if (seen.has(key)) continue;
        seen.add(key);
        try {
          const r = await fetchApi<{ rate: number }>(`/fx/latest?from=${from}&to=${to}`);
          results[key] = r.rate;
        } catch {
          results[key] =
            to === 'INR' ? 83 : to === 'AED' ? 3.67 : from === 'USD' && to === 'USD' ? 1 : 1;
        }
      }
      setFxRates(results);
      setLoading(false);
    };
    load();
  }, [displayCurrency]);

  const pieData = [
    { name: 'India', value: 45 },
    { name: 'UAE', value: 30 },
    { name: 'US', value: 25 },
  ];

  const barData = [
    { market: 'India', yield: 4.2, cagr: 8.1 },
    { market: 'UAE', yield: 5.1, cagr: 6.2 },
    { market: 'US', yield: 3.8, cagr: 4.5 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-cyan-400">Investify</Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-slate-400 hover:text-white">Home</Link>
            <Link href="/properties" className="text-slate-400 hover:text-white">Properties</Link>
            <Link href="/calculator" className="text-slate-400 hover:text-white">Calculator</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold text-white">Multi-Currency Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Live FX rates & market overview — display currency:{' '}
          <span className="font-mono text-cyan-400">{displayCurrency}</span>
        </p>

        {/* FX Rates */}
        <div className="mt-8 rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
          <h2 className="font-semibold text-white">Live FX Rates (USD base)</h2>
          {loading ? (
            <p className="mt-4 text-slate-500">Loading...</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-6">
              <div className="rounded-lg bg-slate-800/50 px-4 py-2">
                <span className="text-slate-500">USD → INR</span>
                <span className="ml-2 font-mono text-cyan-400">
                  {fxRates['USD→INR']?.toFixed(2) ?? '—'}
                </span>
              </div>
              <div className="rounded-lg bg-slate-800/50 px-4 py-2">
                <span className="text-slate-500">USD → AED</span>
                <span className="ml-2 font-mono text-cyan-400">
                  {fxRates['USD→AED']?.toFixed(2) ?? '—'}
                </span>
              </div>
              {displayCurrency !== 'USD' && (
                <div className="rounded-lg bg-slate-800/50 px-4 py-2">
                  <span className="text-slate-500">USD → {displayCurrency}</span>
                  <span className="ml-2 font-mono text-cyan-400">
                    {fxRates[`USD→${displayCurrency}`]?.toFixed(4) ?? '—'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
            <h2 className="font-semibold text-white">Portfolio by Market</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
            <h2 className="font-semibold text-white">Yield vs CAGR by Market</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="market" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                    formatter={(v: number) => [`${v}%`, '']}
                  />
                  <Bar dataKey="yield" fill="#22d3ee" name="Rental Yield %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cagr" fill="#0ea5e9" name="5Y CAGR %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
          <h2 className="font-semibold text-white">Quick Actions</h2>
          <div className="mt-4 flex gap-4">
            <Link
              href="/calculator"
              className="rounded-lg bg-cyan-500/20 px-4 py-2 text-cyan-400 hover:bg-cyan-500/30 transition"
            >
              ROI Calculator
            </Link>
            <Link
              href="/properties"
              className="rounded-lg bg-cyan-500/20 px-4 py-2 text-cyan-400 hover:bg-cyan-500/30 transition"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
