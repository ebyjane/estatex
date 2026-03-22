'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { useCurrencyStore } from '@/stores/useCurrencyStore';

interface ComparisonItem {
  id: string;
  title: string;
  price: number;
  currencyCode: string;
  priceInTarget: number;
  targetCurrency: string;
  aiValueScore?: number;
  rentalYield?: number;
  cagr5y?: number;
  riskScore?: number;
  city?: string;
  propertyType?: string;
}

function parseIds(str: string): string[] {
  return str.split(',').map((s) => s.trim()).filter(Boolean);
}

function CompareContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams?.get('ids') || '';
  const [ids, setIds] = useState<string[]>(() => parseIds(idsParam));
  const [data, setData] = useState<{ properties: ComparisonItem[] } | null>(null);
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const [newId, setNewId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCompare = async () => {
    if (ids.length === 0) {
      setData({ properties: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await fetchApi<{ properties: ComparisonItem[] }>(
        `/compare?ids=${ids.join(',')}&currency=${currency}`
      );
      setData(res);
    } catch {
      setData({ properties: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIds(parseIds(idsParam));
  }, [idsParam]);

  useEffect(() => {
    fetchCompare();
  }, [ids.join(','), currency]);

  const addProperty = () => {
    const trimmed = newId.trim();
    if (trimmed && ids.length < 3 && !ids.includes(trimmed)) {
      setIds([...ids, trimmed]);
      setNewId('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-xl font-bold text-cyan-400">Investify</Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-slate-400 hover:text-white">Home</Link>
            <Link href="/properties" className="text-slate-400 hover:text-white">Properties</Link>
            <Link href="/calculator" className="text-slate-400 hover:text-white">Calculator</Link>
            <Link href="/dashboard" className="text-slate-400 hover:text-white">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold text-white">Smart Compare</h1>
        <p className="mt-2 text-slate-500">
          Compare up to 3 properties — yield, risk, growth. Built for{' '}
          <span className="text-cyan-400/90">India · Dubai · US</span> in one workflow with live FX.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Property ID"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addProperty()}
              className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white w-64"
            />
            <button
              onClick={addProperty}
              disabled={ids.length >= 3}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-slate-950 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add ({ids.length}/3)
            </button>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'USD' | 'INR' | 'AED')}
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"
            title="Compare prices in your app display currency"
          >
            <option value="USD">USD</option>
            <option value="INR">INR</option>
            <option value="AED">AED</option>
          </select>
        </div>

        {ids.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {ids.map((id) => (
              <span
                key={id}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1 text-sm"
              >
                {id.slice(0, 8)}…
                <button
                  onClick={() => setIds(ids.filter((i) => i !== id))}
                  className="text-slate-500 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="mt-4 text-sm text-slate-600">
          Paste property IDs from listing URLs (e.g. /properties/abc-123)
        </p>

        {loading && <p className="mt-8 text-slate-500">Loading...</p>}

        {!loading && data && data.properties.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="p-4 text-left text-slate-500 font-medium">Metric</th>
                  {data.properties.map((p) => (
                    <th key={p.id} className="p-4 text-left text-white font-medium max-w-[200px] truncate">
                      {p.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700/50">
                  <td className="p-4 text-slate-500">Price</td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-4">
                      <span className="text-cyan-400 font-mono">
                        {p.targetCurrency} {p.priceInTarget.toLocaleString()}
                      </span>
                      <span className="ml-1 text-slate-600 text-sm">
                        ({p.currencyCode} {p.price.toLocaleString()})
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="p-4 text-slate-500">AI Value Score</td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-4 font-mono">
                      {p.aiValueScore ?? '—'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="p-4 text-slate-500">Rental Yield %</td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-4 font-mono">
                      {p.rentalYield != null ? `${p.rentalYield.toFixed(1)}%` : '—'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="p-4 text-slate-500">5Y CAGR %</td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-4 font-mono">
                      {p.cagr5y != null ? `${p.cagr5y.toFixed(1)}%` : '—'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="p-4 text-slate-500">Risk Score</td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-4 font-mono">
                      {p.riskScore != null ? p.riskScore.toFixed(1) : '—'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="p-4 text-slate-500">Location</td>
                  {data.properties.map((p) => (
                    <td key={p.id} className="p-4">
                      <Link href={`/property/${p.id}`} className="text-cyan-400 hover:underline">
                        View →
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {!loading && data && data.properties.length === 0 && ids.length > 0 && (
          <div className="mt-8 rounded-xl border border-slate-700/50 bg-slate-900/50 p-12 text-center text-slate-500">
            No properties found. Check IDs and try again.
          </div>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
