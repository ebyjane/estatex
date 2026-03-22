'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { Shield, ShieldCheck, AlertTriangle, Star } from 'lucide-react';
import { PropertyImage } from './PropertyImage';

type AICategory = 'UNDERVALUED' | 'GOOD' | 'FAIR' | 'PREMIUM' | 'HIGH_RISK';

interface PropertyCardProps {
  id: string;
  title: string;
  city?: string;
  country?: string;
  price: number;
  currencyCode: string;
  priceInDisplay?: number;
  displayCurrency?: string;
  aiValueScore?: number;
  aiCategory?: AICategory;
  rentalYield?: number;
  cagr5y?: number;
  riskScore?: number;
  imageUrl?: string;
  propertyType?: string;
  priority?: boolean;
  trustScore?: number;
  verified?: boolean;
  fraudFlag?: boolean;
  featured?: boolean;
  listingType?: string;
}

function getScoreGradient(score?: number, category?: AICategory): string {
  if (category === 'UNDERVALUED') return 'from-emerald-500 to-green-400';
  if (category === 'GOOD') return 'from-blue-500 to-cyan-400';
  if (category === 'FAIR') return 'from-blue-500 to-cyan-400';
  if (category === 'PREMIUM') return 'from-amber-500 to-orange-400';
  if (category === 'HIGH_RISK') return 'from-red-500 to-rose-400';
  if (score != null) {
    if (score >= 80) return 'from-emerald-500 to-green-400';
    if (score >= 60) return 'from-blue-500 to-cyan-400';
    if (score >= 40) return 'from-amber-500 to-orange-400';
  }
  return 'from-slate-500 to-slate-400';
}

export function PropertyCard({
  id,
  title,
  city,
  country,
  price,
  currencyCode,
  priceInDisplay,
  displayCurrency = 'USD',
  aiValueScore,
  aiCategory,
  rentalYield,
  cagr5y,
  riskScore,
  imageUrl,
  propertyType,
  priority = false,
  trustScore,
  verified,
  fraudFlag,
  featured,
  listingType,
}: PropertyCardProps) {
  const gradient = getScoreGradient(aiValueScore, aiCategory);
  const displayPrice = priceInDisplay ?? price;

  return (
    <Link
      href={`/property/${id}`}
      className={clsx(
        'group relative z-10 block cursor-pointer rounded-2xl border bg-brand-card/50 backdrop-blur-lg p-0 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-brand-lg',
        featured
          ? 'border-amber-400/40 ring-2 ring-amber-400/25 hover:border-amber-400/50 hover:shadow-amber-500/10'
          : 'border-white/10 hover:border-cyan-500/30 hover:shadow-cyan-500/10',
      )}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-500 ease-out">
          <PropertyImage
            src={imageUrl}
            propertyId={id}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5 justify-between items-start z-10">
          <div className="flex flex-wrap gap-1.5">
            {aiValueScore != null && (
              <span
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r text-white shadow-lg shadow-brand',
                  gradient,
                )}
                title="EstateX Score — investment quality vs market"
              >
                EstateX {aiValueScore}
              </span>
            )}
            {trustScore != null && (
              <span
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-amber-500/90 text-slate-950 shadow-md"
                title="Trust score — verification, owner, data completeness"
              >
                <Shield className="h-3 w-3" />
                {Math.round(trustScore)}
              </span>
            )}
            {verified && (
              <span className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-600/95 text-white">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            )}
            {fraudFlag && (
              <span className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-red-600/95 text-white">
                <AlertTriangle className="h-3 w-3" />
                Review
              </span>
            )}
            {featured && (
              <span className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/95 text-slate-950 shadow-md">
                <Star className="h-3 w-3 fill-current" />
                Featured
              </span>
            )}
          </div>
          {aiCategory && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-black/40 text-white backdrop-blur">
              {aiCategory.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-xs text-cyan-400/80 font-medium">
          {[propertyType || 'Property', listingType ? listingType.toUpperCase() : null].filter(Boolean).join(' · ')}
        </p>
        <h3 className="mt-1 font-semibold text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {[city, country].filter(Boolean).join(', ')}
        </p>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-xl font-bold text-white">
            {displayCurrency} {Number(displayPrice).toLocaleString()}
          </span>
          {priceInDisplay != null && (
            <span className="text-sm text-slate-600">
              ({currencyCode} {Number(price).toLocaleString()})
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {rentalYield != null && (
            <span className="text-slate-400">
              Rental yield{' '}
              <span className="text-cyan-400 font-medium">{Number(rentalYield).toFixed(1)}%</span>
            </span>
          )}
          {cagr5y != null && (
            <span className="text-slate-400">
              5Y <span className="text-emerald-400 font-medium">{Number(cagr5y).toFixed(1)}%</span>
            </span>
          )}
        </div>

        {riskScore != null && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Risk</span>
              <span>{Number(riskScore).toFixed(0)}%</span>
            </div>
            <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all',
                  riskScore < 30 ? 'bg-emerald-500' :
                  riskScore < 60 ? 'bg-amber-500' : 'bg-red-500'
                )}
                style={{ width: `${Math.min(riskScore, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/5">
          <span className="text-sm text-cyan-400 font-medium group-hover:underline">
            View Analysis →
          </span>
        </div>
      </div>
    </Link>
  );
}
