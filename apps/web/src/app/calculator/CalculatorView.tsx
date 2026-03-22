'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Logo } from '@/components/logo';
import toast from 'react-hot-toast';
import { fetchApi } from '@/lib/api';
import { convertFx } from '@/lib/fxConvert';
import { useCurrencyStore } from '@/stores/useCurrencyStore';
import type { RentVsBuyChartRow } from './CalculatorCharts';

const RentVsBuyAreaChart = dynamic(
  () => import('./CalculatorCharts').then((m) => m.RentVsBuyAreaChart),
  { ssr: false, loading: () => <div className="mt-4 h-64 animate-pulse rounded-lg bg-white/5" /> },
);

export function CalculatorView() {
  const displayCurrency = useCurrencyStore((s) => s.currency);
  const [propertyPrice, setPropertyPrice] = useState(200000);
  const [downPct, setDownPct] = useState(20);
  const [interest, setInterest] = useState(8);
  const [term, setTerm] = useState(20);
  const [monthlyRent, setMonthlyRent] = useState(1500);
  const [displayResult, setDisplayResult] = useState<{
    rentCost5Y: number;
    buyCost5Y: number;
    emi: number;
    breakevenYears: number;
    recommendation: string;
  } | null>(null);

  const calculate = async () => {
    try {
      const priceUsd = await convertFx(propertyPrice, displayCurrency, 'USD');
      const rentUsd = await convertFx(monthlyRent, displayCurrency, 'USD');
      const res = await fetchApi<{
        rentCost5Y: number;
        buyCost5Y: number;
        emi: number;
        breakevenYears: number;
        recommendation: string;
      }>('/calculator/rent-vs-buy', {
        method: 'POST',
        body: JSON.stringify({
          propertyPrice: priceUsd,
          downPaymentPct: downPct,
          interestRatePct: interest,
          loanTermYears: term,
          monthlyRent: rentUsd,
        }),
      });
      const [rent5, buy5, emi] = await Promise.all([
        convertFx(res.rentCost5Y, 'USD', displayCurrency),
        convertFx(res.buyCost5Y, 'USD', displayCurrency),
        convertFx(res.emi, 'USD', displayCurrency),
      ]);
      setDisplayResult({
        ...res,
        rentCost5Y: rent5,
        buyCost5Y: buy5,
        emi,
      });
      toast.success('Calculation complete');
    } catch (e) {
      console.error(e);
      setDisplayResult(null);
      toast.error('Could not calculate — check connection or try again');
    }
  };

  const chartData: RentVsBuyChartRow[] = displayResult
    ? [
        { year: 'Y1', rent: monthlyRent * 12, buy: displayResult.emi * 12 },
        { year: 'Y2', rent: monthlyRent * 24, buy: displayResult.emi * 24 },
        { year: 'Y3', rent: monthlyRent * 36, buy: displayResult.emi * 36 },
        { year: 'Y4', rent: monthlyRent * 48, buy: displayResult.emi * 48 },
        { year: 'Y5', rent: displayResult.rentCost5Y, buy: displayResult.buyCost5Y },
      ]
    : [];

  return (
    <div className="min-h-screen bg-brand-bg text-slate-100">
      <header className="border-b border-slate-800/50 bg-brand-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo href="/" />
          <nav className="flex gap-6">
            <a href="/" className="text-slate-400 hover:text-white">
              Home
            </a>
            <a href="/properties" className="text-slate-400 hover:text-white">
              Properties
            </a>
            <a href="/dashboard" className="text-slate-400 hover:text-white">
              Dashboard
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold text-white">Rent vs Buy Calculator</h1>
        <p className="mt-2 text-slate-500">
          Compare costs over 5 years — amounts use your display currency ({displayCurrency})
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
            <h2 className="font-semibold text-white">Inputs</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-500">Property Price ({displayCurrency})</label>
                <input
                  type="number"
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(+e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500">Down Payment %</label>
                <input
                  type="number"
                  value={downPct}
                  onChange={(e) => setDownPct(+e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500">Interest Rate %</label>
                <input
                  type="number"
                  value={interest}
                  onChange={(e) => setInterest(+e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500">Loan Term (years)</label>
                <input
                  type="number"
                  value={term}
                  onChange={(e) => setTerm(+e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500">Monthly Rent ({displayCurrency})</label>
                <input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(+e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => void calculate()}
                className="w-full rounded-lg bg-cyan-500 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
              >
                Calculate
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {displayResult && (
              <>
                <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
                  <h2 className="font-semibold text-white">Result</h2>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Rent Cost (5Y)</p>
                      <p className="text-lg font-medium text-white">
                        {displayCurrency}{' '}
                        {displayResult.rentCost5Y.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Buy Cost (5Y)</p>
                      <p className="text-lg font-medium text-white">
                        {displayCurrency}{' '}
                        {displayResult.buyCost5Y.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">EMI</p>
                      <p className="text-lg font-medium text-cyan-400">
                        {displayCurrency}{' '}
                        {displayResult.emi.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Recommendation</p>
                      <p className="text-lg font-medium capitalize text-green-400">
                        {displayResult.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
                {chartData.length > 0 && (
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
                    <h2 className="font-semibold text-white">5-Year Cost Comparison</h2>
                    <RentVsBuyAreaChart data={chartData} displayCurrency={displayCurrency} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
