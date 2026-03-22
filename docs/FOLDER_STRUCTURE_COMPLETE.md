# Investify — Complete Folder Structure

```
real-estate/
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── calculator/
│   │   │   ├── countries/
│   │   │   ├── compare/
│   │   │   ├── entities/
│   │   │   ├── fx/
│   │   │   ├── properties/
│   │   │   ├── ai/                   # AI Value Score logic
│   │   │   │   └── ai-score.service.ts
│   │   │   ├── stripe/               # Stripe integration
│   │   │   │   ├── stripe.module.ts
│   │   │   │   ├── stripe.service.ts
│   │   │   │   └── stripe.controller.ts
│   │   │   ├── admin/                # Admin + ingestion
│   │   │   │   ├── admin.module.ts
│   │   │   │   ├── admin.controller.ts
│   │   │   │   ├── admin.service.ts
│   │   │   │   └── ingestion.service.ts
│   │   │   └── subscriptions/
│   │   ├── package.json
│   │   └── ...
│   │
│   └── web/                          # Next.js Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx              # Landing (conversion)
│       │   │   ├── properties/
│       │   │   │   └── page.tsx
│       │   │   ├── property/
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx       # Detail with charts
│       │   │   ├── compare/
│       │   │   ├── calculator/
│       │   │   ├── dashboard/
│       │   │   └── admin/
│       │   │       └── page.tsx           # Admin ingestion
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── Navbar.tsx
│       │   │   │   └── Footer.tsx
│       │   │   ├── property/
│       │   │   │   ├── PropertyCard.tsx   # Premium glass card
│       │   │   │   └── PropertyCardSkeleton.tsx
│       │   │   ├── charts/
│       │   │   ├── ui/
│       │   │   └── GlobalMap.tsx
│       │   └── lib/
│       │       ├── api.ts
│       │       ├── ai-score.ts            # Client-side score utils
│       │       └── currency.ts
│       └── ...
│
├── packages/
│   └── shared/
│       └── src/
│           └── ai-score.ts               # Shared AI score formula
│
├── scripts/
│   ├── seed.ts
│   └── example-property.json
│
└── docs/
    ├── DEPLOYMENT.md
    └── DATABASE_SCHEMA.md
```
