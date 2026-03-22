# Investify — Production Deployment Guide

## Infrastructure

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, Vercel or AWS Amplify |
| Backend | NestJS, Docker, AWS ECS or Railway |
| Database | PostgreSQL (RDS or managed) |
| Cache | Redis (Elasticache or managed) |
| Search | Elasticsearch (Phase 2) |
| Maps | Mapbox API |
| Payments | Stripe |

## Environment Variables

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://api.investify.com/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=pk...
NEXT_PUBLIC_STRIPE_PUBLISHABLE=pk...
```

### Backend
```
DATABASE_URL=postgresql://user:pass@host:5432/real_estate
REDIS_URL=redis://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
FX_API_KEY=...
MAPBOX_KEY=...
CORS_ORIGIN=https://investify.com
```

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          context: ./apps/api
          push: true
          tags: registry/investify-api:${{ github.sha }}
  deploy:
    needs: build-api
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS/Railway
        run: echo "Deploy step"
```

## Docker (API)

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

## Security Checklist

- [ ] JWT_SECRET in env, not code
- [ ] HTTPS only
- [ ] Helmet middleware
- [ ] Rate limiting (express-rate-limit)
- [ ] Input validation (class-validator)
- [ ] CORS restricted to frontend origin
- [ ] Stripe webhook signature verification

## Monitoring

- **Sentry** – Error tracking
- **LogRocket** – Session replay (optional)
- **CloudWatch** – Logs & metrics
- **Stripe Dashboard** – Payment analytics
