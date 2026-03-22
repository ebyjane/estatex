# Global AI-Powered Real Estate Investment Platform - Architecture

## Overview

Scalable architecture designed for **1M+ users** targeting NRI, GCC, US, and cross-border property investors.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CDN / Edge (Vercel/Cloudflare)                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┴───────────────────────────────────────┐
│                         Next.js 14 (App Router)                              │
│  - SSG/ISR for landing, SSR for dashboard, Client components for interactivity│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┴───────────────────────────────────────┐
│                         API Gateway (NestJS)                                  │
│  - Rate limiting, Auth validation, Request routing                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌───────────────┐           ┌─────────────────┐           ┌─────────────────┐
│ Auth Service  │           │ Property Service│           │ Investment Svc  │
│ (Passport JWT)│           │ (CRUD + AI)     │           │ (Calc, FX, AI)  │
└───────────────┘           └─────────────────┘           └─────────────────┘
        │                             │                             │
        └─────────────────────────────┼─────────────────────────────┘
                                      │
┌─────────────────────────────────────┴───────────────────────────────────────┐
│                         Data Layer                                           │
│  PostgreSQL │ Redis │ Elasticsearch │ Blob Storage (S3/R2)                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┴───────────────────────────────────────┐
│                         External Services                                    │
│  OpenAI │ Mapbox │ FX API │ SendGrid/AWS SES                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Scalability Strategy (1M+ Users)

| Layer | Strategy |
|-------|----------|
| **Frontend** | Next.js Edge, ISR, CDN caching, code splitting |
| **API** | Horizontal scaling, connection pooling, Redis session store |
| **Database** | Read replicas, partitioning by `country_id`, connection pooling (PgBouncer) |
| **Search** | Elasticsearch cluster, index sharding by region |
| **Cache** | Redis Cluster, multi-layer (L1: in-memory, L2: Redis) |
| **Assets** | CDN + image optimization (Sharp/Cloudinary) |

## Microservices (MVP → Full)

**MVP (Monolith-first):** Single NestJS app with modular structure for fast iteration.

**Phase 2:** Extract services:
- `auth-service`
- `property-service`
- `investment-service`
- `report-service`
- `notification-service`

## Tech Stack Summary

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Recharts, Mapbox GL |
| Backend | Node.js 20+, NestJS 10+ |
| Database | PostgreSQL 16 |
| Search | Elasticsearch 8 |
| Cache | Redis 7 |
| Maps | Mapbox GL JS |
| AI | OpenAI API (GPT-4) |
| Auth | Passport.js + JWT, OAuth2 (Google, Microsoft) |
| Currency | ExchangeRate-API / Fixer.io |
| Containers | Docker, Docker Compose |
