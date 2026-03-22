import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PropertyEntity } from './property.entity';
import { UserEntity } from './user.entity';

@Entity('leads')
export class LeadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'property_id', nullable: true })
  propertyId: string | null;

  @ManyToOne(() => PropertyEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'property_id' })
  property?: PropertyEntity;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  /** new | contacted | closed */
  @Column({ default: 'new' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
