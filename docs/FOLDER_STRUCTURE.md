# Folder Structure

## Monorepo Layout

```
real-estate/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/           # Auth module (JWT, register, login)
│   │   │   ├── calculator/     # Investment calculators
│   │   │   ├── countries/      # Countries CRUD
│   │   │   ├── entities/       # TypeORM entities
│   │   │   ├── fx/             # FX rates
│   │   │   ├── properties/     # Properties + AI
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                    # Next.js 14 Frontend
│       ├── src/
│       │   ├── app/            # App Router pages
│       │   │   ├── page.tsx    # Landing
│       │   │   ├── properties/
│       │   │   ├── calculator/
│       │   │   ├── dashboard/
│       │   │   ├── login/
│       │   │   └── register/
│       │   ├── components/
│       │   ├── lib/
│       │   └── ...
│       │   ├── package.json
│       │   └── tailwind.config.ts
│       └── ...
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types.ts
│       │   └── index.ts
│       └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DESIGN.md
│   └── FOLDER_STRUCTURE.md
│
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md
```

## Phase 2 Additions

```
apps/api/src/
├── heatmap/          # Heatmap endpoints
├── compare/          # Smart Compare
├── recommendations/  # AI recommendations
├── reports/          # PDF report generator
└── admin/            # Admin dashboard API
```
