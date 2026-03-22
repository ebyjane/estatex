import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('app_settings')
export class AppSettingsEntity {
  @PrimaryColumn({ default: 'default' })
  id: string;

  @Column({ name: 'default_currency', length: 3, default: 'USD' })
  defaultCurrency: string;

  /** JSON map currencyCode -> rate vs USD */
  @Column({ name: 'fx_overrides', type: 'text', nullable: true })
  fxOverridesJson: string | null;

  /** JSON: { yieldWeight, growthWeight, riskWeight } */
  @Column({ name: 'ai_weights', type: 'text', nullable: true })
  aiWeightsJson: string | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
