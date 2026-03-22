'use client';

import { PropertyCard } from './PropertyCard';
import { useDisplayPrice } from '@/hooks/useDisplayPrice';

type Cat = 'UNDERVALUED' | 'GOOD' | 'FAIR' | 'PREMIUM' | 'HIGH_RISK';

export function PropertyCardWithPrice(props: {
  id: string;
  title: string;
  city?: string;
  price: number;
  currencyCode: string;
  aiValueScore?: number;
  aiCategory?: Cat;
  rentalYield?: number;
  cagr5y?: number;
  riskScore?: number;
  imageUrl?: string;
  propertyType?: string;
  priority?: boolean;
  aiRecommended?: boolean;
  trustScore?: number;
  verified?: boolean;
  fraudFlag?: boolean;
  featured?: boolean;
  listingType?: string;
}) {
  const { value, currency, loading } = useDisplayPrice(props.price, props.currencyCode);

  return (
    <div className="relative z-10">
      {props.aiRecommended && (
        <div className="absolute -top-2 -right-2 z-20 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
          AI recommended
        </div>
      )}
      <PropertyCard
        {...props}
        priceInDisplay={loading ? undefined : value}
        displayCurrency={loading ? props.currencyCode : currency}
      />
    </div>
  );
}
