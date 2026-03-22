import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('countries')
export class CountryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 3 })
  code: string;

  @Column({ length: 100 })
  name: string;

  /** Default lets SQLite `synchronize` add the column to existing DBs without failing NOT NULL on temp table copy. */
  @Column({ name: 'currency_code', length: 3, default: 'USD' })
  currencyCode: string;

  @Column({ length: 50, nullable: true })
  region: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ name: 'tax_rate_default', type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxRateDefault: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
