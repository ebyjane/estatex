'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import toast from 'react-hot-toast';

export type AiSearchItem = {
  id: string;
  title: string;
  city?: string;
  price: number;
  currencyCode: string;
  propertyType?: string;
  aiValueScore?: number;
  aiCategory?: string;
  rentalYield?: number;
  cagr5y?: number;
  riskScore?: number;
  images?: { url: string }[];
  aiRecommended?: boolean;
  trustScore?: number;
  isVerified?: boolean;
  fraudFlag?: boolean;
  trustBreakdown?: {
    verifiedListing: boolean;
    ownerAuthenticated: boolean;
    dataCompletenessPct: number;
    fraudReview: boolean;
  };
};

export type AiPlaceScope = 'any' | 'city' | 'address';

export function AISearch({
  onResults,
  countryCode,
  countryId,
}: {
  onResults: (items: AiSearchItem[], meta: { query: string; parsed: unknown }) => void;
  /** Match Properties page country filter (IND / UAE / USA). Omit for worldwide. */
  countryCode?: string;
  countryId?: string;
}) {
  const [q, setQ] = useState('');
  const [placeScope, setPlaceScope] = useState<AiPlaceScope>('any');
  const [explicitCity, setExplicitCity] = useState('');
  const [explicitAddress, setExplicitAddress] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const query = q.trim();
    const ec = explicitCity.trim();
    const ea = explicitAddress.trim();
    if (query.length < 2 && ec.length < 2 && ea.length < 2) {
      toast.error('Enter at least 2 characters in the search, or in City or Address');
      return;
    }
    setBusy(true);
    try {
      const body: {
        query: string;
        countryCode?: string;
        countryId?: string;
        placeScope: AiPlaceScope;
        explicitCity?: string;
        explicitAddress?: string;
      } = {
        query,
        placeScope,
      };
      if (countryId?.trim()) body.countryId = countryId.trim();
      else if (countryCode?.trim() && countryCode.trim().toLowerCase() !== 'all') {
        body.countryCode = countryCode.trim().toUpperCase();
      }
      if (ec.length >= 2) body.explicitCity = ec;
      if (ea.length >= 2) body.explicitAddress = ea;

      const res = await fetchApi<{ items: AiSearchItem[]; total: number; parsed: unknown }>('/ai/search', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      onResults(res.items, { query: query || `${ec || ''} ${ea || ''}`.trim(), parsed: res.parsed });
      toast.success(`Found ${res.items.length} matches`);
    } catch {
      toast.error('AI search failed — check API connection');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative z-20 mt-6 flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400 pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void submit()}
            placeholder="e.g. 2BHK under 80L, high yield — or use City / Address below"
            className="w-full rounded-xl border border-violet-500/30 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
          />
        </div>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-medium text-slate-950 shadow-brand transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Search className="h-4 w-4" />
          {busy ? 'Searching…' : 'EstateX Search'}
        </button>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-900/40 p-3 sm:p-4">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <label htmlFor="ai-place-scope" className="shrink-0 text-xs font-medium text-slate-400">
            Match main search location in
          </label>
          <select
            id="ai-place-scope"
            value={placeScope}
            onChange={(e) => setPlaceScope(e.target.value as AiPlaceScope)}
            className="w-full rounded-lg border border-white/15 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 sm:max-w-md"
          >
            <option value="any">All fields (city, address, title, description)</option>
            <option value="city">City &amp; state only</option>
            <option value="address">Address line, title &amp; description (use when area is in address, not city)</option>
          </select>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label htmlFor="ai-explicit-city" className="mb-1 block text-xs text-slate-500">
              City or state contains (optional)
            </label>
            <input
              id="ai-explicit-city"
              value={explicitCity}
              onChange={(e) => setExplicitCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void submit()}
              placeholder="e.g. Bangalore or Karnataka"
              className="w-full rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>
          <div>
            <label htmlFor="ai-explicit-address" className="mb-1 block text-xs text-slate-500">
              Address / area contains (optional)
            </label>
            <input
              id="ai-explicit-address"
              value={explicitAddress}
              onChange={(e) => setExplicitAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void submit()}
              placeholder="e.g. Anekal, Whitefield"
              className="w-full rounded-lg border border-white/15 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
            />
          </div>
        </div>
        <p className="text-[11px] leading-snug text-slate-500">
          Optional fields narrow results (all must match). State names like Karnataka also match major cities in that state
          when the city field is set but state is empty. If Address is filled, only listings containing that text in
          address/title/description are shown — clear it to see all Bangalore listings.
        </p>
      </div>
    </div>
  );
}
