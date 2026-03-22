import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'country_id', nullable: true })
  countryId: string;

  @Column({ name: 'investor_type', nullable: true })
  investorType: string;

  @Column({ name: 'preferred_currency', default: 'USD' })
  preferredCurrency: string;

  @Column({ default: 'buyer' })
  role: string;

  /** active | blocked */
  @Column({ name: 'account_status', default: 'active' })
  accountStatus: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ name: 'oauth_provider', nullable: true })
  oauthProvider: string;

  @Column({ name: 'oauth_id', nullable: true })
  oauthId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
