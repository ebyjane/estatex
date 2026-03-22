'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { suggestSeoForPath } from '@/lib/seo-admin-defaults';
import { useAuthStore } from '@/stores/useAuthStore';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Database,
  Eye,
  FileSpreadsheet,
  Globe,
  LayoutDashboard,
  Pencil,
  Plus,
  Search,
  Settings,
  Upload,
  Users,
  Video,
} from 'lucide-react';

const TABS = [
  'overview',
  'properties',
  'users',
  'leads',
  'seo',
  'analytics',
  'ingestion',
  'settings',
] as const;
type Tab = (typeof TABS)[number];

const CSV_FIELDS =
  'title, description, country, city, price, currency, lat, lng, bedrooms, bathrooms, area_sqft, rental_estimate, video_url';

function httpStatusFromFetchError(e: unknown): number | null {
  const msg = String((e as Error)?.message ?? '');
  try {
    const j = JSON.parse(msg) as { statusCode?: number };
    if (typeof j.statusCode === 'number') return j.statusCode;
  } catch {
    /* plain text body */
  }
  if (/\b401\b/.test(msg) || /Unauthorized/i.test(msg)) return 401;
  if (/\b403\b/.test(msg) || /Forbidden/i.test(msg)) return 403;
  return null;
}

export default function AdminDashboard() {
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const [tab, setTab] = useState<Tab>('overview');
  /** Gate tab data loads — admin routes return 401 without JWT, 403 for non-admin role. */
  const [adminAccess, setAdminAccess] = useState<'pending' | 'ok' | 'unauthorized' | 'forbidden' | 'error'>('pending');
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [propsList, setPropsList] = useState<
    { id: string; title: string; city?: string; price: number; listingType: string; aiValueScore?: number; status: string; isFeatured?: boolean }[]
  >([]);
  const [propFilters, setPropFilters] = useState({ city: '', status: '', listingType: '' });
  const [users, setUsers] = useState<
    { id: string; email: string; firstName?: string; lastName?: string; role: string; accountStatus: string }[]
  >([]);
  const [leads, setLeads] = useState<
    { id: string; name?: string; email?: string; phone?: string; status: string; propertyId?: string }[]
  >([]);
  const [seoRows, setSeoRows] = useState<
    {
      id: string;
      pagePath: string;
      metaTitle: string;
      metaDescription: string;
      keywords?: string | null;
      canonicalUrl?: string | null;
      ogTitle?: string | null;
      ogDescription?: string | null;
    }[]
  >([]);
  const [seoEditId, setSeoEditId] = useState<string | null>(null);
  const [seoForm, setSeoForm] = useState({
    pagePath: '/buy-in-mumbai',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
  });
  const [settings, setSettings] = useState<{
    defaultCurrency: string;
    fxOverridesJson: string | null;
    aiWeightsJson: string | null;
  } | null>(null);
  const [ingestLogs, setIngestLogs] = useState<{ at: string; action: string; detail: string }[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [videoForm, setVideoForm] = useState({ propertyId: '', videoUrl: '' });
  const [rentSeedBusy, setRentSeedBusy] = useState(false);

  const loadOverview = useCallback(async () => {
    try {
      const data = await fetchApi<Record<string, unknown>>('/admin/overview');
      setOverview(data);
      setAdminAccess('ok');
    } catch (e) {
      const code = httpStatusFromFetchError(e);
      if (code === 401) setAdminAccess('unauthorized');
      else if (code === 403) setAdminAccess('forbidden');
      else {
        toast.error('Could not load overview');
        setAdminAccess('error');
      }
    }
  }, []);

  const loadProperties = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (propFilters.city) q.set('city', propFilters.city);
      if (propFilters.status) q.set('status', propFilters.status);
      if (propFilters.listingType) q.set('listingType', propFilters.listingType);
      q.set('limit', '50');
      const r = await fetchApi<{ data: typeof propsList }>(`/admin/properties?${q}`);
      setPropsList(r.data);
    } catch {
      toast.error('Could not load properties');
    }
  }, [propFilters]);

  const loadUsers = useCallback(async () => {
    try {
      const r = await fetchApi<{ data: typeof users }>('/admin/users');
      setUsers(r.data);
    } catch {
      toast.error('Could not load users');
    }
  }, []);

  const loadLeads = useCallback(async () => {
    try {
      const r = await fetchApi<{ data: typeof leads }>('/admin/leads');
      setLeads(r.data);
    } catch {
      toast.error('Could not load leads');
    }
  }, []);

  const loadSeo = useCallback(async () => {
    try {
      const rows = await fetchApi<typeof seoRows>('/admin/seo');
      setSeoRows(rows);
    } catch {
      toast.error('Could not load SEO');
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const s = await fetchApi<typeof settings>('/admin/settings');
      setSettings(s);
    } catch {
      toast.error('Could not load settings');
    }
  }, []);

  const loadIngestion = useCallback(async () => {
    try {
      const r = await fetchApi<{ data: typeof ingestLogs }>('/admin/ingestion-logs');
      setIngestLogs(r.data);
    } catch {
      /* optional */
    }
  }, []);

  useEffect(() => {
    if (!sessionChecked) return;
    void loadOverview();
  }, [sessionChecked, loadOverview]);

  useEffect(() => {
    if (adminAccess !== 'ok') return;
    if (tab === 'properties') void loadProperties();
    if (tab === 'users') void loadUsers();
    if (tab === 'leads') void loadLeads();
    if (tab === 'seo') void loadSeo();
    if (tab === 'settings') void loadSettings();
    if (tab === 'ingestion') void loadIngestion();
  }, [adminAccess, tab, loadProperties, loadUsers, loadLeads, loadSeo, loadSettings, loadIngestion]);

  const patchProperty = async (id: string, body: Record<string, unknown>) => {
    try {
      await fetchApi(`/admin/properties/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      toast.success('Updated');
      void loadProperties();
      void loadOverview();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setUploadResult(null);
    const text = await csvFile.text();
    const lines = text.split('\n').filter(Boolean);
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s/g, '_'));
    const errors: string[] = [];
    let success = 0;
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, j) => {
        row[h] = values[j] || '';
      });
      try {
        const countries = await fetchApi<{ id: string; code: string }[]>('/countries');
        const country = countries.find((c) => c.code === (row.country || 'IND').toUpperCase());
        if (!country) throw new Error('Invalid country');
        await fetchApi('/properties', {
          method: 'POST',
          body: JSON.stringify({
            title: row.title || 'Untitled',
            description: row.description,
            city: row.city,
            countryId: country.id,
            price: parseFloat(row.price) || 0,
            currencyCode: row.currency || 'USD',
            latitude: parseFloat(row.lat) || undefined,
            longitude: parseFloat(row.lng) || undefined,
            bedrooms: parseInt(row.bedrooms, 10) || undefined,
            bathrooms: parseInt(row.bathrooms, 10) || undefined,
            areaSqft: parseFloat(row.area_sqft) || undefined,
            rentalEstimate: parseFloat(row.rental_estimate) || undefined,
            videoUrl: row.video_url?.trim() || undefined,
            listingType: row.listing_type?.trim() || 'sale',
            propertyType: row.property_type?.trim() || undefined,
          }),
        });
        success++;
      } catch (e) {
        errors.push(`Row ${i + 1}: ${(e as Error).message}`);
      }
    }
    setUploadResult({ success, errors });
    setCsvFile(null);
    try {
      await fetchApi('/admin/ingestion-log', {
        method: 'POST',
        body: JSON.stringify({ action: 'csv', detail: `${success} rows` }),
      });
    } catch {
      /* ignore */
    }
    void loadOverview();
    void loadIngestion();
    if (success) toast.success(`Imported ${success} row(s)`);
  };

  if (!sessionChecked) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-400">Restoring session…</p>
      </div>
    );
  }

  if (adminAccess === 'pending') {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-400">Verifying admin access…</p>
      </div>
    );
  }

  if (adminAccess === 'error') {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="text-xl font-semibold text-white">Could not load admin overview</h1>
        <p className="mt-3 text-sm text-slate-400">Check that the API is running and try again.</p>
        <button
          type="button"
          className="mt-6 inline-block rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-cyan-400"
          onClick={() => {
            setAdminAccess('pending');
            void loadOverview();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (adminAccess === 'unauthorized') {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="text-xl font-semibold text-white">Sign in to open the control panel</h1>
        <p className="mt-3 text-sm text-slate-400">
          Admin APIs require a JWT. Use the demo admin account after seeding:{' '}
          <code className="text-cyan-400">admin@investify.com</code> /{' '}
          <code className="text-slate-500">admin123</code>
        </p>
        <Link
          href="/login?next=/admin"
          className="mt-6 inline-block rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-cyan-400"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (adminAccess === 'forbidden') {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="text-xl font-semibold text-white">Admin role required</h1>
        <p className="mt-3 text-sm text-slate-400">
          Your account is signed in but does not have the <strong className="text-slate-300">admin</strong> role. Sign
          in as <code className="text-cyan-400">admin@investify.com</code> (seed password{' '}
          <code className="text-slate-500">admin123</code>) or ask an admin to promote your user.
        </p>
        <Link href="/login?next=/admin" className="mt-6 inline-block text-cyan-400 hover:underline">
          Switch account
        </Link>
      </div>
    );
  }

  const charts = (overview?.charts as Record<string, unknown>) || {};
  const growth = (charts.listingsGrowth as { date: string; count: number }[]) || [];
  const cities = (charts.cityDistribution as { city: string; count: number }[]) || [];
  const typeSplit = (charts.listingTypeSplit as { type: string; count: number }[]) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white md:text-3xl">Investify Control Panel</h1>
          <p className="mt-1 text-sm text-slate-500">Overview, listings, users, leads, SEO, ingestion & settings</p>
        </div>
        <Link
          href="/post-property"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-cyan-400"
        >
          <Plus className="h-4 w-4" />
          Post property
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ['overview', LayoutDashboard, 'Overview'],
            ['properties', Search, 'Properties'],
            ['users', Users, 'Users'],
            ['leads', Users, 'Leads'],
            ['seo', Globe, 'SEO'],
            ['analytics', BarChart3, 'Analytics'],
            ['ingestion', Database, 'Ingestion'],
            ['settings', Settings, 'Settings'],
          ] as const
        ).map(([id, Icon, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
              tab === id
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'overview' && overview && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {(
                [
                  ['Total properties', overview.totalProperties],
                  ['Active listings', overview.activeListings],
                  ['Pending review', overview.pendingListings],
                  ['Active users', overview.activeUsers],
                  ['Leads', overview.totalLeads],
                  ['Undervalued (AI≥80)', overview.undervaluedListings],
                ] as [string, unknown][]
              ).map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-white">{String(value ?? '—')}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
                <h3 className="text-sm font-semibold text-white">Listings growth (45d)</h3>
                <div className="mt-4 flex h-40 items-end gap-1">
                  {growth.slice(-20).map((g) => (
                    <div
                      key={g.date}
                      className="flex-1 min-w-[6px] rounded-t bg-cyan-500/60"
                      style={{ height: `${Math.max(8, (g.count / (Math.max(...growth.map((x) => x.count), 1) || 1)) * 100)}%` }}
                      title={`${g.date}: ${g.count}`}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-sm font-semibold text-white">Avg yield</h3>
                <p className="mt-2 text-3xl font-bold text-cyan-400">
                  {(Number.isFinite(Number(overview.avgYield)) ? Number(overview.avgYield) : 0).toFixed(1)}%
                </p>
                <p className="mt-4 text-xs text-slate-500">{String(overview.revenueNote ?? '')}</p>
                <p className="mt-2 text-lg font-semibold text-slate-400">Revenue: ${String(overview.revenue ?? '—')}</p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-sm font-semibold text-white">Top cities</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {cities.slice(0, 8).map((c) => (
                    <li key={c.city} className="flex justify-between text-slate-300">
                      <span>{c.city}</span>
                      <span className="font-mono text-cyan-400">{c.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-sm font-semibold text-white">Rent vs sale</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {typeSplit.map((t) => (
                    <li key={t.type} className="flex justify-between text-slate-300">
                      <span className="capitalize">{t.type}</span>
                      <span className="font-mono text-emerald-400">{t.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === 'properties' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <input
                placeholder="City filter"
                value={propFilters.city}
                onChange={(e) => setPropFilters((f) => ({ ...f, city: e.target.value }))}
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
              />
              <select
                value={propFilters.status}
                onChange={(e) => setPropFilters((f) => ({ ...f, status: e.target.value }))}
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
              >
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={propFilters.listingType}
                onChange={(e) => setPropFilters((f) => ({ ...f, listingType: e.target.value }))}
                className="rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
              >
                <option value="">All types</option>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
              <button
                type="button"
                onClick={() => void loadProperties()}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
              >
                Apply
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-slate-400">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">AI</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 w-[min(280px,32vw)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {propsList.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 text-slate-200">
                      <td className="p-3 max-w-[200px] truncate">{p.title}</td>
                      <td className="p-3">{p.city}</td>
                      <td className="p-3 font-mono text-xs">{p.price}</td>
                      <td className="p-3 capitalize">{p.listingType}</td>
                      <td className="p-3">{p.aiValueScore ?? '—'}</td>
                      <td className="p-3">
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
                            p.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : p.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-200'
                                : 'bg-slate-500/20 text-slate-300'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex min-w-[220px] max-w-[280px] flex-col gap-2.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {p.status === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  className="rounded-md bg-emerald-600/85 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
                                  onClick={() => void patchProperty(p.id, { status: 'active', isVerified: true })}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="rounded-md bg-red-600/85 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                                  onClick={() =>
                                    void patchProperty(p.id, {
                                      status: 'rejected',
                                      rejectReason: 'Does not meet guidelines',
                                    })
                                  }
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="rounded-md border border-amber-500/45 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-500/20"
                              onClick={() => void patchProperty(p.id, { isFeatured: !p.isFeatured })}
                            >
                              {p.isFeatured ? 'Unfeature' : 'Feature'}
                            </button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/property/${p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-[2rem] flex-1 items-center justify-center gap-1.5 rounded-lg border border-cyan-500/45 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:border-cyan-400/60 hover:bg-cyan-500/20 sm:flex-initial sm:justify-start"
                            >
                              <Eye className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                              View
                            </Link>
                            <Link
                              href={`/post-property?edit=${p.id}`}
                              className="inline-flex min-h-[2rem] flex-1 items-center justify-center gap-1.5 rounded-lg border border-violet-500/50 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-100 transition hover:border-violet-400/60 hover:bg-violet-500/20 sm:flex-initial sm:justify-start"
                            >
                              <Pencil className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
                              Edit
                            </Link>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-slate-400">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 text-slate-200">
                    <td className="p-3">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3">{u.accountStatus ?? 'active'}</td>
                    <td className="p-3 space-x-2">
                      <button
                        type="button"
                        className="text-xs text-cyan-400 hover:underline"
                        onClick={async () => {
                          const next = (u.accountStatus ?? 'active') === 'active' ? 'blocked' : 'active';
                          try {
                            await fetchApi(`/admin/users/${u.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ accountStatus: next }),
                            });
                            void loadUsers();
                          } catch {
                            toast.error('Failed');
                          }
                        }}
                      >
                        {(u.accountStatus ?? 'active') === 'active' ? 'Block' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="text-xs text-violet-400 hover:underline"
                        onClick={async () => {
                          const next = u.role === 'admin' ? 'buyer' : 'admin';
                          if (!confirm(`Set role to ${next}?`)) return;
                          try {
                            await fetchApi(`/admin/users/${u.id}`, {
                              method: 'PATCH',
                              body: JSON.stringify({ role: next }),
                            });
                            void loadUsers();
                          } catch {
                            toast.error('Failed');
                          }
                        }}
                      >
                        Toggle admin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'leads' && (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-slate-400">
                <tr>
                  <th className="p-3">Property</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b border-white/5 text-slate-200">
                    <td className="p-3 font-mono text-xs">{l.propertyId || '—'}</td>
                    <td className="p-3">
                      <div>{l.name}</div>
                      <div className="text-xs text-slate-500">{l.email}</div>
                      <div className="text-xs text-slate-500">{l.phone}</div>
                    </td>
                    <td className="p-3">{l.status}</td>
                    <td className="p-3 space-x-2">
                      {(['contacted', 'closed', 'new'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="text-xs text-cyan-400 hover:underline"
                          onClick={async () => {
                            try {
                              await fetchApi(`/admin/leads/${l.id}`, {
                                method: 'PATCH',
                                body: JSON.stringify({ status: s }),
                              });
                              void loadLeads();
                            } catch {
                              toast.error('Failed');
                            }
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'seo' && (
          <div className="grid gap-8 lg:grid-cols-2">
            <form
              className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6"
              onSubmit={async (e) => {
                e.preventDefault();
                const title = seoForm.metaTitle.trim();
                const desc = seoForm.metaDescription.trim();
                if (title.length < 8 || desc.length < 24) {
                  toast.error('Meta title (≥8 chars) and description (≥24 chars) are required.');
                  return;
                }
                try {
                  await fetchApi('/admin/seo', {
                    method: 'POST',
                    body: JSON.stringify({
                      ...(seoEditId ? { id: seoEditId } : {}),
                      pagePath: seoForm.pagePath.trim(),
                      metaTitle: title,
                      metaDescription: desc,
                      keywords: seoForm.keywords.trim() || undefined,
                      canonicalUrl: seoForm.canonicalUrl.trim() || undefined,
                      ogTitle: seoForm.ogTitle.trim() || undefined,
                      ogDescription: seoForm.ogDescription.trim() || undefined,
                    }),
                  });
                  toast.success('SEO saved (JSON-LD generated on the server)');
                  setSeoEditId(null);
                  void loadSeo();
                } catch {
                  toast.error('Save failed');
                }
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-white">Page URL & meta</h3>
                {seoEditId ? (
                  <span className="text-xs text-amber-400">Editing {seoEditId.slice(0, 8)}…</span>
                ) : null}
              </div>
              <input
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="Page path e.g. /buy-in-mumbai, /rent-in-bangalore, /property-in-dubai"
                value={seoForm.pagePath}
                onChange={(e) => {
                  setSeoEditId(null);
                  setSeoForm((f) => ({ ...f, pagePath: e.target.value }));
                }}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
                  onClick={() => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const s = suggestSeoForPath(seoForm.pagePath, origin);
                    if (!s) {
                      toast.error('No template for this path. Use /buy-in-* , /rent-in-* , /property-in-* , or /buy/property-in-*');
                      return;
                    }
                    setSeoForm((f) => ({
                      ...f,
                      metaTitle: s.metaTitle,
                      metaDescription: s.metaDescription,
                      keywords: s.keywords,
                      canonicalUrl: s.canonicalUrl,
                      ogTitle: s.ogTitle,
                      ogDescription: s.ogDescription,
                    }));
                    toast.success('Filled suggested meta for this URL');
                  }}
                >
                  Fill suggested meta
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
                  onClick={() => {
                    setSeoEditId(null);
                    setSeoForm({
                      pagePath: '/buy-in-mumbai',
                      metaTitle: '',
                      metaDescription: '',
                      keywords: '',
                      canonicalUrl: '',
                      ogTitle: '',
                      ogDescription: '',
                    });
                  }}
                >
                  New page
                </button>
              </div>
              <input
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="Meta title"
                value={seoForm.metaTitle}
                onChange={(e) => setSeoForm((f) => ({ ...f, metaTitle: e.target.value }))}
              />
              <textarea
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="Meta description (155–160 chars ideal for Google)"
                rows={3}
                value={seoForm.metaDescription}
                onChange={(e) => setSeoForm((f) => ({ ...f, metaDescription: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="Keywords (comma-separated)"
                value={seoForm.keywords}
                onChange={(e) => setSeoForm((f) => ({ ...f, keywords: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="Canonical URL (full URL)"
                value={seoForm.canonicalUrl}
                onChange={(e) => setSeoForm((f) => ({ ...f, canonicalUrl: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="OpenGraph title (optional)"
                value={seoForm.ogTitle}
                onChange={(e) => setSeoForm((f) => ({ ...f, ogTitle: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                placeholder="OpenGraph description (optional)"
                value={seoForm.ogDescription}
                onChange={(e) => setSeoForm((f) => ({ ...f, ogDescription: e.target.value }))}
              />
              <button type="submit" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950">
                {seoEditId ? 'Update SEO' : 'Save SEO'}
              </button>
            </form>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-white">Configured pages</h3>
              <p className="mt-1 text-xs text-slate-500">
                Click a row to edit. JSON-LD WebPage is generated on save when omitted.
              </p>
              <ul className="mt-4 max-h-[70vh] space-y-2 overflow-y-auto text-sm text-slate-300">
                {seoRows.length === 0 ? (
                  <li className="text-slate-500">No rows yet — enter a path, click &quot;Fill suggested meta&quot;, then save.</li>
                ) : (
                  seoRows.map((r) => (
                    <li
                      key={r.id}
                      className="flex cursor-pointer flex-col gap-1 border-b border-white/5 py-2 hover:bg-white/5"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSeoEditId(r.id);
                        setSeoForm({
                          pagePath: r.pagePath,
                          metaTitle: r.metaTitle ?? '',
                          metaDescription: r.metaDescription ?? '',
                          keywords: r.keywords ?? '',
                          canonicalUrl: r.canonicalUrl ?? '',
                          ogTitle: r.ogTitle ?? '',
                          ogDescription: r.ogDescription ?? '',
                        });
                      }}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter' || ev.key === ' ') {
                          ev.preventDefault();
                          setSeoEditId(r.id);
                          setSeoForm({
                            pagePath: r.pagePath,
                            metaTitle: r.metaTitle ?? '',
                            metaDescription: r.metaDescription ?? '',
                            keywords: r.keywords ?? '',
                            canonicalUrl: r.canonicalUrl ?? '',
                            ogTitle: r.ogTitle ?? '',
                            ogDescription: r.ogDescription ?? '',
                          });
                        }
                      }}
                    >
                      <span className="font-mono text-xs text-cyan-400">{r.pagePath}</span>
                      {r.metaTitle ? (
                        <span className="line-clamp-2 text-xs text-slate-400">{r.metaTitle}</span>
                      ) : null}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="text-xs text-red-400"
                          onClick={async (ev) => {
                            ev.stopPropagation();
                            if (!confirm('Delete?')) return;
                            try {
                              await fetchApi(`/admin/seo/${r.id}`, { method: 'DELETE' });
                              if (seoEditId === r.id) {
                                setSeoEditId(null);
                              }
                              void loadSeo();
                            } catch {
                              toast.error('Delete failed');
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}

        {tab === 'analytics' && overview && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Analytics mirrors Overview charts for now. Export & cohort reports can plug into the same{' '}
              <code className="text-cyan-500/90">/admin/overview</code> payload.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 p-4">
                <p className="text-xs text-slate-500">Conversion placeholder</p>
                <p className="text-2xl font-bold text-white">—</p>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <p className="text-xs text-slate-500">Sessions (wire GA4)</p>
                <p className="text-2xl font-bold text-white">—</p>
              </div>
              <div className="rounded-xl border border-white/10 p-4">
                <p className="text-xs text-slate-500">Lead → deal</p>
                <p className="text-2xl font-bold text-white">—</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'ingestion' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                CSV upload
              </h3>
              <p className="mt-2 text-xs text-slate-500">{CSV_FIELDS}</p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="mt-4 block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-4 file:py-2 file:text-cyan-400"
              />
              <button
                type="button"
                onClick={() => void handleCsvUpload()}
                disabled={!csvFile}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-white disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Ingest
              </button>
              {uploadResult && (
                <p className="mt-3 text-sm text-slate-400">
                  OK: {uploadResult.success} · Errors: {uploadResult.errors.slice(0, 2).join('; ')}
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Database className="h-5 w-5" />
                India rent seed
              </h3>
              <button
                type="button"
                disabled={rentSeedBusy}
                onClick={async () => {
                  setRentSeedBusy(true);
                  try {
                    await fetchApi('/admin/seed', {
                      method: 'POST',
                      body: JSON.stringify({ mode: 'indiaRent' }),
                    });
                    toast.success('Seed triggered');
                    void loadOverview();
                    void loadIngestion();
                  } catch {
                    toast.error('Seed failed');
                  } finally {
                    setRentSeedBusy(false);
                  }
                }}
                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {rentSeedBusy ? '…' : 'Run India rent seed'}
              </button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:col-span-2">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Video className="h-5 w-5" />
                Bulk video URL
              </h3>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  placeholder="Property ID"
                  value={videoForm.propertyId}
                  onChange={(e) => setVideoForm((f) => ({ ...f, propertyId: e.target.value }))}
                  className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                />
                <input
                  placeholder="Video URL"
                  value={videoForm.videoUrl}
                  onChange={(e) => setVideoForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  className="flex-[2] rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await fetchApi(`/properties/${videoForm.propertyId}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ videoUrl: videoForm.videoUrl || null }),
                      });
                      toast.success('Saved');
                    } catch {
                      toast.error('Failed');
                    }
                  }}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:col-span-2">
              <h3 className="font-semibold text-white">Ingestion log</h3>
              <ul className="mt-3 max-h-48 overflow-y-auto font-mono text-xs text-slate-400">
                {ingestLogs.map((l, i) => (
                  <li key={i}>
                    {l.at} · {l.action} · {l.detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === 'settings' && settings && (
          <form
            className="max-w-xl space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6"
            onSubmit={async (e) => {
              e.preventDefault();
              let fx: Record<string, number> | undefined;
              let ai: { yieldWeight?: number; growthWeight?: number; riskWeight?: number } | undefined;
              try {
                if (settings.fxOverridesJson?.trim()) fx = JSON.parse(settings.fxOverridesJson);
              } catch {
                toast.error('Invalid FX JSON');
                return;
              }
              try {
                if (settings.aiWeightsJson?.trim()) ai = JSON.parse(settings.aiWeightsJson);
              } catch {
                toast.error('Invalid AI weights JSON');
                return;
              }
              try {
                await fetchApi('/admin/settings', {
                  method: 'PATCH',
                  body: JSON.stringify({
                    defaultCurrency: settings.defaultCurrency,
                    fxOverrides: fx,
                    aiWeights: ai,
                  }),
                });
                toast.success('Settings saved');
              } catch {
                toast.error('Failed');
              }
            }}
          >
            <h3 className="font-semibold text-white">Platform settings</h3>
            <label className="block text-xs text-slate-500">Default currency</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
              value={settings.defaultCurrency}
              onChange={(e) => setSettings((s) => (s ? { ...s, defaultCurrency: e.target.value } : s))}
            />
            <label className="block text-xs text-slate-500">FX overrides (JSON map → USD)</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-xs text-white"
              rows={4}
              placeholder='{"INR": 0.012}'
              value={settings.fxOverridesJson || ''}
              onChange={(e) => setSettings((s) => (s ? { ...s, fxOverridesJson: e.target.value } : s))}
            />
            <label className="block text-xs text-slate-500">AI scoring weights (JSON)</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-xs text-white"
              rows={3}
              placeholder='{"yieldWeight":1,"growthWeight":1,"riskWeight":1}'
              value={settings.aiWeightsJson || ''}
              onChange={(e) => setSettings((s) => (s ? { ...s, aiWeightsJson: e.target.value } : s))}
            />
            <button type="submit" className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950">
              Save settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
