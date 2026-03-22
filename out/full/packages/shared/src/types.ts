export type UserRole = 'buyer' | 'seller' | 'agent' | 'admin';
export type InvestorType = 'nri' | 'gcc' | 'us' | 'cross_border';
export type PropertyType = 'apartment' | 'villa' | 'land' | 'commercial';
export type ListingType = 'sale' | 'rent';
export type PropertyStatus = 'draft' | 'active' | 'sold' | 'rented';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  investorType?: InvestorType;
  preferredCurrency: string;
  role: UserRole;
}

export interface Country {
  id: string;
  code: string;
  name: string;
  currencyCode: string;
  region?: string;
}

export interface Property {
  id: string;
  countryId: string;
  title: string;
  description?: string;
  propertyType?: PropertyType;
  listingType: ListingType;
  price: number;
  currencyCode: string;
  areaSqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  aiValueScore?: number;
  rentalYield?: number;
  cagr5y?: number;
  riskScore?: number;
}
