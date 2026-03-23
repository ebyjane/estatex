import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PropertyImageEntity } from './property-image.entity';

@Entity('properties')
export class PropertyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'country_id' })
  countryId: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @Column({ name: 'agent_id', nullable: true })
  agentId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'property_type', nullable: true })
  propertyType: string;

  @Column({ name: 'listing_type' })
  listingType: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  price: number;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

  @Column({ name: 'area_sqft', type: 'decimal', precision: 12, scale: 2, nullable: true })
  areaSqft: number;

  @Column({ nullable: true })
  bedrooms: number;

  @Column({ nullable: true })
  bathrooms: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ name: 'address_line1', nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  zip: string;

  @Column({ default: 'draft' })
  status: string;

  @Column({ name: 'owner_name', nullable: true })
  ownerName: string;

  @Column({ name: 'owner_email', nullable: true })
  ownerEmail: string;

  @Column({ name: 'owner_phone', nullable: true })
  ownerPhone: string;

  /** string[] of amenity keys, stored as JSON */
  @Column({ type: 'simple-json', nullable: true })
  amenities: string[] | null;

  @Column({ nullable: true })
  furnishing: string;

  @Column({ name: 'floor_number', nullable: true })
  floorNumber: number;

  @Column({ name: 'total_floors', nullable: true })
  totalFloors: number;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 18, scale: 2, nullable: true })
  depositAmount: number;

  @Column({ name: 'maintenance_monthly', type: 'decimal', precision: 18, scale: 2, nullable: true })
  maintenanceMonthly: number;

  @Column({ name: 'whatsapp_opt_in', default: false })
  whatsappOptIn: boolean;

  @Column({ name: 'reject_reason', type: 'text', nullable: true })
  rejectReason: string | null;

  @Column({ name: 'ai_value_score', nullable: true })
  aiValueScore: number;

  @Column({ name: 'ai_price_suggestion', type: 'decimal', precision: 18, scale: 2, nullable: true })
  aiPriceSuggestion: number;

  @Column({ name: 'rental_yield', type: 'decimal', precision: 5, scale: 2, nullable: true })
  rentalYield: number;

  @Column({ name: 'cagr_5y', type: 'decimal', precision: 5, scale: 2, nullable: true })
  cagr5y: number;

  @Column({ name: 'risk_score', type: 'decimal', precision: 4, scale: 2, nullable: true })
  riskScore: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'ai_category', nullable: true })
  aiCategory: string;

  @Column({ name: 'growth_projection_5yr', type: 'decimal', precision: 5, scale: 2, nullable: true })
  growthProjection5yr: number;

  @Column({ name: 'rental_estimate', type: 'decimal', precision: 18, scale: 2, nullable: true })
  rentalEstimate: number;

  @Column({ name: 'area_demand_index', nullable: true })
  areaDemandIndex: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'video_url', type: 'text', nullable: true })
  videoUrl: string | null;

  /** Ordered gallery videos (first mirrors videoUrl for legacy clients). */
  @Column({ name: 'video_urls', type: 'simple-json', nullable: true })
  videoUrls: string[] | null;

  @Column({ name: 'owner_verified', default: false })
  ownerVerified: boolean;

  /** 0–100 composite trust score (verified + owner + completeness − fraud). */
  @Column({ name: 'trust_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  trustScore: number;

  @Column({ name: 'data_completeness', type: 'int', nullable: true })
  dataCompleteness: number;

  @Column({ name: 'fraud_flag', default: false })
  fraudFlag: boolean;

  /** Listing hidden from search after this time (30-day policy). Null = no expiry (legacy). */
  @Column({ name: 'listing_expires_at', type: 'timestamp', nullable: true })
  listingExpiresAt: Date | null;

  @Column({ name: 'report_count', default: 0 })
  reportCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PropertyImageEntity, (img) => img.property)
  images: PropertyImageEntity[];
}
