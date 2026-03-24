'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { CheckCircle2, ChevronLeft, ChevronRight, Home, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { coerceOptionalLatLng } from '@/lib/geo';
import { fetchApi } from '@/lib/api';
import { uploadPropertyMediaToSupabase } from '@/lib/propertiesStorageUpload';
import { isSupabaseBrowserConfigured } from '@/lib/supabase-browser';
import { useAuthStore } from '@/stores/useAuthStore';
import { LocationMapPicker } from './LocationMapPicker';

const DRAFT_KEY = 'estatex-post-property-draft';

export type PropertyCategory = 'residential' | 'commercial' | 'land';
export type ListingTypeOpt = 'rent' | 'sale' | 'pg' | 'flatmates';

export interface PostDraft {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  city: string;
  whatsappOptIn: boolean;
  propertyCategory: PropertyCategory;
  listingType: ListingTypeOpt;
  title: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  areaSqft: string;
  furnishing: string;
  floorNumber: string;
  totalFloors: string;
  addressLine1: string;
  state: string;
  latitude: string;
  longitude: string;
  price: string;
  currencyCode: string;
  /** ISO-like country code for API (e.g. IND). */
  countryCode: string;
  depositAmount: string;
  maintenanceMonthly: string;
  expectedRentMonthly: string;
  imageUrlsText: string;
  videoUrl: string;
  /** Admin: multiple video URLs (lines); combined with uploads on submit. */
  videoUrlsText: string;
  /** Must match one of the image URLs; saved as sort_order 0. */
  primaryImageUrl: string;
  /** Must match one of video URLs (when multiple); first in carousel among videos. */
  primaryVideoUrl: string;
  amenities: string[];
}

const emptyDraft = (): PostDraft => ({
  ownerName: '',
  ownerEmail: '',
  ownerPhone: '',
  city: '',
  whatsappOptIn: false,
  propertyCategory: 'residential',
  listingType: 'sale',
  title: '',
  description: '',
  bedrooms: '',
  bathrooms: '',
  areaSqft: '',
  furnishing: '',
  floorNumber: '',
  totalFloors: '',
  addressLine1: '',
  state: '',
  latitude: '',
  longitude: '',
  price: '',
  currencyCode: 'INR',
  countryCode: 'IND',
  depositAmount: '',
  maintenanceMonthly: '',
  expectedRentMonthly: '',
  imageUrlsText: '',
  videoUrl: '',
  videoUrlsText: '',
  primaryImageUrl: '',
  primaryVideoUrl: '',
  amenities: [],
});

const AMENITY_OPTS = [
  { id: 'parking', label: 'Parking' },
  { id: 'lift', label: 'Lift' },
  { id: 'power_backup', label: 'Power backup' },
  { id: 'gym', label: 'Gym' },
  { id: 'security', label: 'Security' },
] as const;

const STEPS = [
  'Contact',
  'Property type',
  'Listing type',
  'Details',
  'Location',
  'Pricing',
  'Media',
  'Amenities',
  'Review',
] as const;

function categoryToPropertyType(c: PropertyCategory): string {
  if (c === 'commercial') return 'commercial';
  if (c === 'land') return 'land';
  return 'apartment';
}

function propertyTypeToCategory(pt?: string): PropertyCategory {
  if (pt === 'commercial') return 'commercial';
  if (pt === 'land') return 'land';
  return 'residential';
}

interface PropertyForEdit {
  id: string;
  title: string;
  description?: string;
  price: number;
  currencyCode: string;
  propertyType?: string;
  listingType: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  city?: string;
  state?: string;
  addressLine1?: string;
  latitude?: number;
  longitude?: number;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  furnishing?: string;
  floorNumber?: number;
  totalFloors?: number;
  depositAmount?: number;
  maintenanceMonthly?: number;
  whatsappOptIn?: boolean;
  amenities?: string[];
  videoUrl?: string | null;
  videoUrls?: string[] | null;
  images?: { url: string; sortOrder?: number }[];
  rentalEstimate?: number;
  countryCode?: string;
}

function mapPropertyToDraft(p: PropertyForEdit, isAdmin: boolean): PostDraft {
  const raw = p as unknown as Record<string, unknown>;
  const ownerName = String(p.ownerName ?? raw['owner_name'] ?? '').trim();
  const ownerEmail = String(p.ownerEmail ?? raw['owner_email'] ?? '').trim();
  const ownerPhone = String(p.ownerPhone ?? raw['owner_phone'] ?? '').trim();
  const imgs = [...(p.images ?? [])].sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
  const imageUrlsText = imgs.map((i) => i.url).join('\n');
  const vids = p.videoUrls?.length ? [...p.videoUrls] : p.videoUrl ? [String(p.videoUrl)] : [];
  const lt = p.listingType;
  const listingType = (['rent', 'sale', 'pg', 'flatmates'].includes(lt) ? lt : 'sale') as ListingTypeOpt;

  return {
    ...emptyDraft(),
    ownerName,
    ownerEmail,
    ownerPhone,
    city: p.city ?? '',
    whatsappOptIn: !!p.whatsappOptIn,
    propertyCategory: propertyTypeToCategory(p.propertyType),
    listingType,
    title: p.title ?? '',
    description: p.description ?? '',
    bedrooms: p.bedrooms != null ? String(p.bedrooms) : '',
    bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
    areaSqft: p.areaSqft != null ? String(Number(p.areaSqft)) : '',
    furnishing: p.furnishing ?? '',
    floorNumber: p.floorNumber != null ? String(p.floorNumber) : '',
    totalFloors: p.totalFloors != null ? String(p.totalFloors) : '',
    addressLine1: p.addressLine1 ?? '',
    state: p.state ?? '',
    latitude: p.latitude != null ? String(p.latitude) : '',
    longitude: p.longitude != null ? String(p.longitude) : '',
    price: p.price != null ? String(Number(p.price)) : '',
    currencyCode: (p.currencyCode ?? 'INR').toUpperCase().slice(0, 3),
    countryCode: (p.countryCode ?? 'IND').toUpperCase().slice(0, 3),
    depositAmount: p.depositAmount != null ? String(Number(p.depositAmount)) : '',
    maintenanceMonthly: p.maintenanceMonthly != null ? String(Number(p.maintenanceMonthly)) : '',
    expectedRentMonthly: p.rentalEstimate != null ? String(Number(p.rentalEstimate)) : '',
    imageUrlsText,
    videoUrl: !isAdmin ? vids[0] ?? '' : '',
    videoUrlsText: isAdmin ? vids.join('\n') : '',
    primaryImageUrl: imgs[0]?.url ?? '',
    primaryVideoUrl: vids[0] ?? '',
    amenities: Array.isArray(p.amenities) ? [...p.amenities] : [],
  };
}

function splitHttpUrls(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
}

function parseImageUrls(text: string, max = 24): string[] {
  return splitHttpUrls(text).slice(0, max);
}

function appendUrlLines(current: string, urls: string[]): string {
  const next = urls.filter(Boolean);
  if (!next.length) return current;
  const base = current.trim();
  return base ? `${base}\n${next.join('\n')}` : next.join('\n');
}

/** Plain numbers, commas/spaces, or Indian units (crore/lakh). */
function parseMoneyInput(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  const lower = s.toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ').trim();

  const crore = lower.match(/^([\d.]+)\s*(crore|cr)s?$/);
  if (crore) {
    const n = Number(crore[1]);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n * 1e7;
  }

  const lakh = lower.match(/^([\d.]+)\s*(lakh|lac|lacs|lk)s?$/);
  if (lakh) {
    const n = Number(lakh[1]);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n * 1e5;
  }

  const plain = lower.replace(/[₹$€£\s]/g, '');
  const n = Number(plain);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function loadDraft(): PostDraft {
  if (typeof window === 'undefined') return emptyDraft();
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return emptyDraft();
    const o = JSON.parse(raw) as Partial<PostDraft>;
    return { ...emptyDraft(), ...o, amenities: Array.isArray(o.amenities) ? o.amenities.map(String) : [] };
  } catch {
    return emptyDraft();
  }
}

export function PostPropertyWizard({ editQuery: editQueryProp = '' }: { editQuery?: string }) {
  const router = useRouter();
  /** From server `page.tsx` searchParams — avoids useSearchParams() router edge cases on /post-property. */
  const editQuery = editQueryProp.trim();
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');
  const sessionChecked = useAuthStore((s) => s.sessionChecked);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PostDraft>(emptyDraft);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [done, setDone] = useState<{
    id: string;
    aiValueScore?: number;
    rentalYield?: number;
    riskScore?: number;
    status?: string;
    isEdit?: boolean;
  } | null>(null);

  useEffect(() => {
    // Avoid merging a stale local draft when opening ?edit= — that masked the loaded listing (wrong city, empty contact).
    if (editQuery) {
      setDraft(emptyDraft());
    } else {
      setEditId(null);
      setDraft(loadDraft());
    }
    setHydrated(true);
  }, [editQuery]);

  useEffect(() => {
    if (!hydrated || !editQuery || !sessionChecked) return;
    setEditLoading(true);
    void fetchApi<PropertyForEdit>(`/properties/${editQuery}/for-edit`)
      .then((p) => {
        setEditId(p.id);
        const adminNow = useAuthStore.getState().user?.role === 'admin';
        setDraft(mapPropertyToDraft(p, adminNow));
        setStep(0);
        toast.success('Loaded listing — make changes and save.');
      })
      .catch((e) => {
        setEditId(null);
        const msg = (e as Error).message || '';
        toast.error(
          msg.includes('401') || msg.toLowerCase().includes('unauthorized')
            ? 'Sign in to edit this listing.'
            : 'Could not load listing for edit.',
        );
      })
      .finally(() => setEditLoading(false));
  }, [hydrated, editQuery, sessionChecked]);

  useEffect(() => {
    if (!hydrated) return;
    /** Don’t persist until `for-edit` succeeded — otherwise an empty draft overwrites localStorage mid-load. */
    if (editQuery && !editId) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch {
        /* quota */
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [draft, hydrated, editQuery, editId]);

  const imageUrlChoices = useMemo(
    () => (isAdmin ? splitHttpUrls(draft.imageUrlsText) : parseImageUrls(draft.imageUrlsText, 500)),
    [isAdmin, draft.imageUrlsText],
  );
  const videoUrlChoices = useMemo(() => {
    if (isAdmin) return splitHttpUrls(draft.videoUrlsText);
    const v = draft.videoUrl.trim();
    return v ? [v] : [];
  }, [isAdmin, draft.videoUrlsText, draft.videoUrl]);

  useEffect(() => {
    if (!hydrated) return;
    const pi = draft.primaryImageUrl.trim();
    if (pi && !imageUrlChoices.some((u) => u.trim() === pi)) {
      setDraft((d) => ({ ...d, primaryImageUrl: '' }));
    }
    const pv = draft.primaryVideoUrl.trim();
    if (pv && !videoUrlChoices.some((u) => u.trim() === pv)) {
      setDraft((d) => ({ ...d, primaryVideoUrl: '' }));
    }
  }, [hydrated, draft.primaryImageUrl, draft.primaryVideoUrl, imageUrlChoices, videoUrlChoices]);

  /** Map preview: use coerced coords so invalid/wrapped longitudes still center correctly. */
  const mapCoords = useMemo(() => {
    if (draft.latitude.trim() === '' && draft.longitude.trim() === '') {
      return { latitude: null as number | null, longitude: null as number | null };
    }
    const r = coerceOptionalLatLng(
      draft.latitude.trim() === '' ? '' : draft.latitude,
      draft.longitude.trim() === '' ? '' : draft.longitude,
    );
    if (!r.ok || !r.coords) {
      return { latitude: null as number | null, longitude: null as number | null };
    }
    return { latitude: r.coords.latitude, longitude: r.coords.longitude };
  }, [draft.latitude, draft.longitude]);

  const setField = useCallback(<K extends keyof PostDraft>(key: K, value: PostDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const uploadMediaFromPicker = useCallback(
    async (files: FileList | null, kind: 'image' | 'video') => {
      if (!files?.length) return;
      if (!isSupabaseBrowserConfigured()) {
        toast.error(
          'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, create the `properties` bucket, and allow uploads.',
        );
        return;
      }
      let list = Array.from(files).filter((f) =>
        kind === 'image' ? f.type.startsWith('image/') : f.type.startsWith('video/'),
      );
      if (!list.length) {
        toast.error(kind === 'image' ? 'Select image files' : 'Select video files');
        return;
      }
      if (!isAdmin && kind === 'video' && list.length > 1) {
        toast('Public listings use one video URL — uploading the first file only.');
        list = list.slice(0, 1);
      }
      setUploadBusy(true);
      try {
        const urls = await uploadPropertyMediaToSupabase(list, kind);
        if (kind === 'image') {
          setDraft((d) => ({ ...d, imageUrlsText: appendUrlLines(d.imageUrlsText, urls) }));
        } else if (isAdmin) {
          setDraft((d) => ({ ...d, videoUrlsText: appendUrlLines(d.videoUrlsText, urls) }));
        } else {
          const first = urls[0];
          if (!first) return;
          let applied = false;
          setDraft((d) => {
            if (!d.videoUrl.trim()) {
              applied = true;
              return { ...d, videoUrl: first };
            }
            return d;
          });
          if (!applied) toast.error('Clear the video URL field to replace it with an upload.');
        }
        toast.success(`Uploaded ${urls.length} file(s) to Supabase`);
      } catch (e) {
        const msg = (e as Error).message || 'Upload failed';
        toast.error(msg.length > 200 ? `${msg.slice(0, 197)}…` : msg);
      } finally {
        setUploadBusy(false);
      }
    },
    [isAdmin],
  );

  const validateStep = useCallback(
    (i: number): string | null => {
      switch (i) {
        case 0:
          if (!draft.ownerName.trim()) return 'Please enter your name.';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.ownerEmail.trim())) return 'Valid email required.';
          if (!draft.ownerPhone.trim()) return 'Phone number required.';
          if (!draft.city.trim()) return 'City required.';
          return null;
        case 3:
          if (!draft.title.trim()) return 'Listing title required.';
          if (draft.bedrooms.trim() && Number.isNaN(Number(draft.bedrooms))) return 'BHK must be a number.';
          if (draft.bathrooms.trim() && Number.isNaN(Number(draft.bathrooms))) return 'Bathrooms must be a number.';
          if (draft.areaSqft.trim() && Number.isNaN(Number(draft.areaSqft))) return 'Area must be a number.';
          return null;
        case 4: {
          if (!draft.addressLine1.trim()) return 'Address required.';
          const cr = coerceOptionalLatLng(
            draft.latitude.trim() === '' ? '' : draft.latitude,
            draft.longitude.trim() === '' ? '' : draft.longitude,
          );
          if (!cr.ok) return cr.error;
          return null;
        }
        case 5: {
          const p = parseMoneyInput(draft.price);
          if (p == null) {
            return draft.listingType === 'sale'
              ? 'Enter a valid sale price (e.g. 32000000 or 3.2 crore). For yield estimates, use “Expected monthly rent” below.'
              : 'Enter a valid monthly rent (numbers only, or e.g. 60,000).';
          }
          return null;
        }
        default:
          return null;
      }
    },
    [draft],
  );

  const goNext = () => {
    const err = validateStep(step);
    if (err) {
      toast.error(err);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraft(emptyDraft());
    setStep(0);
    toast.success('Draft cleared');
  };

  const submit = async () => {
    const err = validateStep(5) || validateStep(4) || validateStep(3) || validateStep(0);
    if (err) {
      toast.error(err);
      return;
    }
    setSubmitting(true);
    try {
      if (editId && typeof window !== 'undefined' && !localStorage.getItem('token')?.trim()) {
        toast.error('Sign in to save changes.');
        return;
      }
      if (isAdmin && typeof window !== 'undefined' && !localStorage.getItem('token')?.trim()) {
        toast.error('Sign in first to submit as admin (uploads and admin publish need a valid session).');
        return;
      }
      const imageUrls = isAdmin ? splitHttpUrls(draft.imageUrlsText) : parseImageUrls(draft.imageUrlsText, 500);
      const coordResult = coerceOptionalLatLng(
        draft.latitude.trim() === '' ? '' : draft.latitude,
        draft.longitude.trim() === '' ? '' : draft.longitude,
      );
      if (!coordResult.ok) {
        toast.error(coordResult.error);
        setSubmitting(false);
        return;
      }
      let latSend: number | undefined;
      let lngSend: number | undefined;
      if (coordResult.coords) {
        latSend = coordResult.coords.latitude;
        lngSend = coordResult.coords.longitude;
        if (coordResult.adjusted) {
          setDraft((d) => ({
            ...d,
            latitude: String(coordResult.coords!.latitude),
            longitude: String(coordResult.coords!.longitude),
          }));
          toast.success(
            'Coordinates were corrected to valid map ranges (latitude −90°–90°, longitude −180°–180°).',
          );
        }
      }

      if (editId) {
        const body: Record<string, unknown> = {
          title: draft.title.trim(),
          description: draft.description.trim() || undefined,
          countryCode: draft.countryCode.trim().toUpperCase().slice(0, 3) || 'IND',
          city: draft.city.trim(),
          state: draft.state.trim() || undefined,
          addressLine1: draft.addressLine1.trim(),
          propertyType: categoryToPropertyType(draft.propertyCategory),
          listingType: draft.listingType,
          price: parseMoneyInput(draft.price) ?? 0,
          currencyCode: draft.currencyCode.trim().toUpperCase().slice(0, 3),
          areaSqft: draft.areaSqft.trim() ? Number(draft.areaSqft) : undefined,
          bedrooms: draft.bedrooms.trim() ? Number(draft.bedrooms) : undefined,
          bathrooms: draft.bathrooms.trim() ? Number(draft.bathrooms) : undefined,
          latitude: latSend,
          longitude: lngSend,
          ownerName: draft.ownerName.trim(),
          ownerEmail: draft.ownerEmail.trim(),
          ownerPhone: draft.ownerPhone.trim(),
          furnishing: draft.furnishing.trim() || undefined,
          floorNumber: draft.floorNumber.trim() ? Number(draft.floorNumber) : undefined,
          totalFloors: draft.totalFloors.trim() ? Number(draft.totalFloors) : undefined,
          depositAmount: draft.depositAmount.trim() ? parseMoneyInput(draft.depositAmount) ?? undefined : undefined,
          maintenanceMonthly: draft.maintenanceMonthly.trim()
            ? parseMoneyInput(draft.maintenanceMonthly) ?? undefined
            : undefined,
          whatsappOptIn: draft.whatsappOptIn,
          amenities: draft.amenities.length ? draft.amenities : undefined,
          imageUrls: imageUrls.length ? imageUrls : undefined,
        };
        if (draft.primaryImageUrl.trim()) body.primaryImageUrl = draft.primaryImageUrl.trim();
        if (isAdmin) {
          const vids = splitHttpUrls(draft.videoUrlsText);
          if (vids.length) body.videoUrls = vids;
          if (draft.primaryVideoUrl.trim()) body.primaryVideoUrl = draft.primaryVideoUrl.trim();
        } else {
          body.videoUrl = draft.videoUrl.trim() || undefined;
        }
        if (draft.listingType === 'sale' && draft.expectedRentMonthly.trim()) {
          const er = parseMoneyInput(draft.expectedRentMonthly);
          if (er != null) body.expectedRentMonthly = er;
        }
        const res = await fetchApi<{
          id?: string;
          aiValueScore?: number;
          rentalYield?: number;
          riskScore?: number;
          status?: string;
        }>(`/properties/${editId}`, { method: 'PATCH', body: JSON.stringify(body) });
        localStorage.removeItem(DRAFT_KEY);
        setDone({
          id: res.id ?? editId,
          aiValueScore: res.aiValueScore,
          rentalYield: res.rentalYield,
          riskScore: res.riskScore,
          status: res.status ?? 'active',
          isEdit: true,
        });
        setEditId(null);
        router.replace('/post-property');
        toast.success('Listing updated');
        return;
      }

      const body: Record<string, unknown> = {
        title: draft.title.trim(),
        description: draft.description.trim() || undefined,
        countryCode: draft.countryCode.trim().toUpperCase().slice(0, 3) || 'IND',
        city: draft.city.trim(),
        state: draft.state.trim() || undefined,
        addressLine1: draft.addressLine1.trim(),
        propertyType: categoryToPropertyType(draft.propertyCategory),
        listingType: draft.listingType,
        price: parseMoneyInput(draft.price) ?? 0,
        currencyCode: draft.currencyCode.trim().toUpperCase().slice(0, 3),
        areaSqft: draft.areaSqft.trim() ? Number(draft.areaSqft) : undefined,
        bedrooms: draft.bedrooms.trim() ? Number(draft.bedrooms) : undefined,
        bathrooms: draft.bathrooms.trim() ? Number(draft.bathrooms) : undefined,
        latitude: latSend,
        longitude: lngSend,
        ownerName: draft.ownerName.trim(),
        ownerEmail: draft.ownerEmail.trim(),
        ownerPhone: draft.ownerPhone.trim(),
        furnishing: draft.furnishing.trim() || undefined,
        floorNumber: draft.floorNumber.trim() ? Number(draft.floorNumber) : undefined,
        totalFloors: draft.totalFloors.trim() ? Number(draft.totalFloors) : undefined,
        depositAmount: draft.depositAmount.trim() ? parseMoneyInput(draft.depositAmount) ?? undefined : undefined,
        maintenanceMonthly: draft.maintenanceMonthly.trim()
          ? parseMoneyInput(draft.maintenanceMonthly) ?? undefined
          : undefined,
        whatsappOptIn: draft.whatsappOptIn,
        amenities: draft.amenities.length ? draft.amenities : undefined,
        imageUrls: imageUrls.length ? imageUrls : undefined,
      };
      if (draft.primaryImageUrl.trim()) body.primaryImageUrl = draft.primaryImageUrl.trim();
      if (isAdmin) {
        const vids = splitHttpUrls(draft.videoUrlsText);
        if (vids.length) body.videoUrls = vids;
        if (draft.primaryVideoUrl.trim()) body.primaryVideoUrl = draft.primaryVideoUrl.trim();
      } else {
        body.videoUrl = draft.videoUrl.trim() || undefined;
      }
      if (draft.listingType === 'sale' && draft.expectedRentMonthly.trim()) {
        const er = parseMoneyInput(draft.expectedRentMonthly);
        if (er != null) body.expectedRentMonthly = er;
      }

      const submitPath = isAdmin ? '/admin/submit-listing' : '/properties/submit-listing';
      const res = await fetchApi<{
        id: string;
        aiValueScore?: number;
        rentalYield?: number;
        riskScore?: number;
        status?: string;
      }>(submitPath, { method: 'POST', body: JSON.stringify(body) });
      localStorage.removeItem(DRAFT_KEY);
      setDone({
        id: res.id,
        aiValueScore: res.aiValueScore,
        rentalYield: res.rentalYield,
        riskScore: res.riskScore,
        status: res.status ?? 'pending',
      });
      toast.success('Listing submitted for review');
    } catch (e) {
      toast.error((e as Error).message?.slice(0, 200) || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        Loading…
      </div>
    );
  }

  /** Until auth is ready, `for-edit` does not run — show spinner instead of a draft polluted by localStorage. */
  if (editQuery && (!sessionChecked || editLoading)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        {!sessionChecked ? 'Checking session…' : 'Loading listing…'}
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle2 className="h-9 w-9 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">{done.isEdit ? 'Changes saved' : 'Submitted successfully'}</h1>
        <p className="text-sm text-slate-400">
          {done.isEdit ? (
            <>
              Listing ID: <code className="text-cyan-400">{done.id}</code> — updates are live if the listing is approved
              and active.
            </>
          ) : (
            <>
              Your listing is <strong className="text-amber-200">pending admin approval</strong>. Reference ID:{' '}
              <code className="text-cyan-400">{done.id}</code>
            </>
          )}
        </p>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left text-sm text-slate-300">
          <p className="mb-2 flex items-center gap-2 font-medium text-white">
            <Sparkles className="h-4 w-4 text-violet-400" />
            Auto AI enrichment
          </p>
          <ul className="space-y-1 text-slate-400">
            <li>AI value score: {done.aiValueScore != null ? <span className="text-cyan-400">{done.aiValueScore}</span> : '—'}</li>
            <li>Rental yield: {done.rentalYield != null ? <span className="text-cyan-400">{Number(done.rentalYield).toFixed(1)}%</span> : '—'}</li>
            <li>Risk score: {done.riskScore != null ? <span className="text-cyan-400">{done.riskScore}</span> : '—'}</li>
          </ul>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/property/${done.id}`}
            className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-medium text-slate-950 hover:bg-cyan-400"
          >
            View listing
          </Link>
          <Link
            href="/properties"
            className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-slate-200 hover:bg-white/5"
          >
            Browse listings
          </Link>
          <button
            type="button"
            onClick={() => {
              setDone(null);
              setDraft(emptyDraft());
              setStep(0);
            }}
            className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-slate-200 hover:bg-white/5"
          >
            {done.isEdit ? 'Done' : 'Post another'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 transition-opacity duration-300">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400/90">
            <Home className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">List on EstateX</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">{editId ? 'Edit listing' : 'Post a property'}</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            {editId
              ? 'Update your listing details and save. Changes apply after you submit the final step.'
              : 'Multi-step flow with auto-save. After you publish, we run AI scoring and queue your listing for verification.'}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Trusted owners · Verified after approval
        </div>
      </div>

      <div>
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div key={step} className="animate-fade-in-step rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        {step === 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-xs font-medium text-slate-400">Full name</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                value={draft.ownerName}
                onChange={(e) => setField('ownerName', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Email</span>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                value={draft.ownerEmail}
                onChange={(e) => setField('ownerEmail', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Phone</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                value={draft.ownerPhone}
                onChange={(e) => setField('ownerPhone', e.target.value)}
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs font-medium text-slate-400">City</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                placeholder="e.g. Mumbai"
                value={draft.city}
                onChange={(e) => setField('city', e.target.value)}
              />
            </label>
            <label className="flex cursor-pointer items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-500"
                checked={draft.whatsappOptIn}
                onChange={(e) => setField('whatsappOptIn', e.target.checked)}
              />
              <span className="text-sm text-slate-300">Contact me on WhatsApp for leads</span>
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-wrap gap-3">
            {(
              [
                { id: 'residential' as const, label: 'Residential' },
                { id: 'commercial' as const, label: 'Commercial' },
                { id: 'land' as const, label: 'Land / Plot' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setField('propertyCategory', t.id)}
                className={clsx(
                  'rounded-xl border px-5 py-3 text-sm font-medium transition-all',
                  draft.propertyCategory === t.id
                    ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-wrap gap-3">
            {(
              [
                { id: 'rent' as const, label: 'Rent' },
                { id: 'sale' as const, label: 'Sale' },
                { id: 'pg' as const, label: 'PG / Hostel' },
                { id: 'flatmates' as const, label: 'Flatmates' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setField('listingType', t.id)}
                className={clsx(
                  'rounded-xl border px-5 py-3 text-sm font-medium transition-all',
                  draft.listingType === t.id
                    ? 'border-violet-500/60 bg-violet-500/15 text-violet-200'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-xs font-medium text-slate-400">Listing title</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                placeholder="e.g. 2 BHK semi-furnished near metro"
                value={draft.title}
                onChange={(e) => setField('title', e.target.value)}
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs font-medium text-slate-400">Description (optional)</span>
              <textarea
                className="mt-1 min-h-[100px] w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                value={draft.description}
                onChange={(e) => setField('description', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">BHK / Bedrooms</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                inputMode="decimal"
                value={draft.bedrooms}
                onChange={(e) => setField('bedrooms', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Bathrooms</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                inputMode="decimal"
                value={draft.bathrooms}
                onChange={(e) => setField('bathrooms', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Area (sq ft)</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                inputMode="decimal"
                value={draft.areaSqft}
                onChange={(e) => setField('areaSqft', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Furnishing</span>
              <select
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                value={draft.furnishing}
                onChange={(e) => setField('furnishing', e.target.value)}
              >
                <option value="">Select</option>
                <option value="unfurnished">Unfurnished</option>
                <option value="semi-furnished">Semi-furnished</option>
                <option value="fully-furnished">Fully furnished</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Floor</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                inputMode="numeric"
                value={draft.floorNumber}
                onChange={(e) => setField('floorNumber', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Total floors in building</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                inputMode="numeric"
                value={draft.totalFloors}
                onChange={(e) => setField('totalFloors', e.target.value)}
              />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Address</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                value={draft.addressLine1}
                onChange={(e) => setField('addressLine1', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">State (optional)</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                value={draft.state}
                onChange={(e) => setField('state', e.target.value)}
              />
            </label>
            <p className="text-xs text-slate-500">Click the map to drop a pin, or type coordinates.</p>
            <LocationMapPicker
              latitude={mapCoords.latitude}
              longitude={mapCoords.longitude}
              onChange={(lat, lng) => {
                setDraft((d) => ({
                  ...d,
                  latitude: String(lat.toFixed(6)),
                  longitude: String(lng.toFixed(6)),
                }));
              }}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-slate-400">Latitude</span>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-sm text-white"
                  value={draft.latitude}
                  onChange={(e) => setField('latitude', e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-400">Longitude</span>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-sm text-white"
                  value={draft.longitude}
                  onChange={(e) => setField('longitude', e.target.value)}
                />
              </label>
            </div>
            <p className="text-xs text-slate-500">
              Valid ranges: latitude −90° to 90°, longitude −180° to 180°. Out-of-range values are corrected on save
              (e.g. wrapped longitude).
            </p>
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-xs font-medium text-slate-400">
                {draft.listingType === 'rent' || draft.listingType === 'pg' || draft.listingType === 'flatmates'
                  ? 'Monthly rent'
                  : 'Sale price'}
              </span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                inputMode="decimal"
                value={draft.price}
                onChange={(e) => setField('price', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Currency</span>
              <select
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                value={draft.currencyCode}
                onChange={(e) => setField('currencyCode', e.target.value)}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="AED">AED</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Security deposit</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                inputMode="decimal"
                value={draft.depositAmount}
                onChange={(e) => setField('depositAmount', e.target.value)}
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs font-medium text-slate-400">Maintenance (monthly, optional)</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                inputMode="decimal"
                value={draft.maintenanceMonthly}
                onChange={(e) => setField('maintenanceMonthly', e.target.value)}
              />
            </label>
            {draft.listingType === 'sale' && (
              <label className="block md:col-span-2">
                <span className="text-xs font-medium text-slate-400">Expected monthly rent (for yield / AI, optional)</span>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  inputMode="decimal"
                  value={draft.expectedRentMonthly}
                  onChange={(e) => setField('expectedRentMonthly', e.target.value)}
                />
              </label>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Paste URLs below and/or upload files — uploads go to your Supabase Storage bucket{' '}
              <code className="text-cyan-400/90">properties</code>; public URLs are saved in this form and sent as JSON
              when you submit. Configure <code className="text-slate-500">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code className="text-slate-500">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
            </p>
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
              <span className="text-xs font-medium text-slate-300">Upload to Supabase</span>
              <label
                className={`cursor-pointer rounded-lg border border-white/15 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 ${uploadBusy ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  disabled={uploadBusy}
                  onChange={(e) => {
                    void uploadMediaFromPicker(e.target.files, 'image');
                    e.target.value = '';
                  }}
                />
                Add images
              </label>
              <label
                className={`cursor-pointer rounded-lg border border-white/15 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 ${uploadBusy ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input
                  type="file"
                  accept="video/*"
                  multiple={isAdmin}
                  className="sr-only"
                  disabled={uploadBusy}
                  onChange={(e) => {
                    void uploadMediaFromPicker(e.target.files, 'video');
                    e.target.value = '';
                  }}
                />
                Add videos
              </label>
              {uploadBusy ? <Loader2 className="h-4 w-4 animate-spin text-cyan-400" aria-label="Uploading" /> : null}
            </div>
            <label className="block">
              <span className="text-xs font-medium text-slate-400">Image URLs</span>
              <textarea
                className="mt-1 min-h-[140px] w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-xs text-white"
                placeholder="https://cdn.example.com/a.jpg&#10;https://cdn.example.com/b.jpg"
                value={draft.imageUrlsText}
                onChange={(e) => setField('imageUrlsText', e.target.value)}
              />
            </label>
            <div className="grid gap-2 md:grid-cols-3">
              {(isAdmin ? splitHttpUrls(draft.imageUrlsText) : parseImageUrls(draft.imageUrlsText))
                .slice(0, 60)
                .map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="" className="h-24 w-full rounded-lg border border-white/10 object-cover" />
                ))}
            </div>
            {isAdmin ? (
              <label className="block">
                <span className="text-xs font-medium text-slate-400">Video URLs (one per line, optional)</span>
                <textarea
                  className="mt-1 min-h-[100px] w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 font-mono text-xs text-white"
                  placeholder="https://… or use Add videos above"
                  value={draft.videoUrlsText}
                  onChange={(e) => setField('videoUrlsText', e.target.value)}
                />
              </label>
            ) : (
              <label className="block">
                <span className="text-xs font-medium text-slate-400">Video URL (optional)</span>
                <input
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white"
                  placeholder="https://…"
                  value={draft.videoUrl}
                  onChange={(e) => setField('videoUrl', e.target.value)}
                />
              </label>
            )}
            {imageUrlChoices.length >= 2 && (
              <label className="block">
                <span className="text-xs font-medium text-slate-400">
                  Cover image (first on listing cards & image order in gallery)
                </span>
                <select
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                  value={draft.primaryImageUrl}
                  onChange={(e) => setField('primaryImageUrl', e.target.value)}
                >
                  <option value="">First in list above (default)</option>
                  {imageUrlChoices.map((url) => (
                    <option key={url} value={url}>
                      {url.length > 80 ? `${url.slice(0, 80)}…` : url}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {videoUrlChoices.length >= 2 && (
              <label className="block">
                <span className="text-xs font-medium text-slate-400">First video in gallery</span>
                <select
                  className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
                  value={draft.primaryVideoUrl}
                  onChange={(e) => setField('primaryVideoUrl', e.target.value)}
                >
                  <option value="">First in list above (default)</option>
                  {videoUrlChoices.map((url) => (
                    <option key={url} value={url}>
                      {url.length > 80 ? `${url.slice(0, 80)}…` : url}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        {step === 7 && (
          <div className="flex flex-wrap gap-3">
            {AMENITY_OPTS.map((a) => {
              const on = draft.amenities.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      amenities: on ? d.amenities.filter((x) => x !== a.id) : [...d.amenities, a.id],
                    }))
                  }
                  className={clsx(
                    'rounded-xl border px-4 py-2 text-sm transition-all',
                    on ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200' : 'border-white/10 bg-white/5 text-slate-300',
                  )}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        )}

        {step === 8 && (
          <div className="space-y-4 text-sm text-slate-300">
            <dl className="grid gap-3 md:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Contact</dt>
                <dd>
                  {draft.ownerName} · {draft.ownerEmail} · {draft.ownerPhone}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Location</dt>
                <dd>
                  {draft.city}
                  {draft.state ? `, ${draft.state}` : ''}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Type</dt>
                <dd>
                  {draft.propertyCategory} · {draft.listingType}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Price</dt>
                <dd>
                  {draft.currencyCode} {draft.price}
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-xs text-slate-500">Title</dt>
                <dd className="font-medium text-white">{draft.title}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-xs text-slate-500">Address</dt>
                <dd>{draft.addressLine1}</dd>
              </div>
              {(draft.primaryImageUrl || draft.primaryVideoUrl) && (
                <div className="md:col-span-2 space-y-1">
                  <dt className="text-xs text-slate-500">Media order</dt>
                  <dd className="text-slate-400">
                    {draft.primaryImageUrl ? (
                      <span className="block truncate" title={draft.primaryImageUrl}>
                        Cover image: {draft.primaryImageUrl}
                      </span>
                    ) : null}
                    {draft.primaryVideoUrl ? (
                      <span className="block truncate" title={draft.primaryVideoUrl}>
                        First video: {draft.primaryVideoUrl}
                      </span>
                    ) : null}
                  </dd>
                </div>
              )}
            </dl>
            <p className="text-xs text-slate-500">
              By publishing you agree that your listing will be reviewed. Only approved listings appear publicly.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={clearDraft}
          className="text-xs text-slate-500 underline hover:text-slate-300"
        >
          Clear saved draft
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-1 rounded-xl bg-cyan-500 px-5 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={() => void submit()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editId ? 'Save changes' : 'Publish property'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
