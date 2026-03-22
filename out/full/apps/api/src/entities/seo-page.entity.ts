import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('seo_pages')
export class SeoPageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Normalized path e.g. /buy-in-mumbai or /property-in-bangalore */
  @Column({ name: 'page_path', unique: true })
  pagePath: string;

  @Column({ name: 'meta_title', type: 'text' })
  metaTitle: string;

  @Column({ name: 'meta_description', type: 'text' })
  metaDescription: string;

  @Column({ type: 'text', nullable: true })
  keywords: string | null;

  @Column({ name: 'canonical_url', type: 'text', nullable: true })
  canonicalUrl: string | null;

  @Column({ name: 'og_title', type: 'text', nullable: true })
  ogTitle: string | null;

  @Column({ name: 'og_description', type: 'text', nullable: true })
  ogDescription: string | null;

  /** Optional custom JSON-LD string; otherwise generated from fields */
  @Column({ name: 'json_ld', type: 'text', nullable: true })
  jsonLd: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
