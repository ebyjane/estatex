# Data Generation - Run Instructions

## Prerequisites

1. **PostgreSQL running** (Docker recommended):
   ```bash
   npm run docker:up
   ```

2. **Countries seeded**: The script auto-seeds India, UAE, USA if missing.

## Generate 10,000 Properties

```bash
npm run generate-data
```

This creates:
- **4,000 India** properties (₹40L–₹2.5Cr apartments, ₹1Cr–₹8Cr villas)
- **3,000 Dubai** properties (AED 500k–3M apartments, AED 1.5M–10M villas)
- **3,000 Texas** properties ($150k–$900k homes)

### Environment (optional)

| Variable   | Default   |
|-----------|-----------|
| DB_HOST   | localhost |
| DB_PORT   | 5434      |
| DB_USER   | postgres  |
| DB_PASSWORD | postgres |
| DB_NAME   | real_estate |

## Output

- Inserts in batches of 500
- Auto-calculates: `rental_yield`, `ai_value_score`, `ai_category`, `growth_projection_5yr`
- Ensures V2 columns exist before insert
