# API Design - Real Estate Investment Platform

Base URL: `/api/v1`

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | - | Register (email + password) |
| POST | `/auth/login` | - | Login, returns JWT |
| POST | `/auth/oauth/:provider` | - | OAuth (google, microsoft) |
| POST | `/auth/refresh` | Refresh | Refresh JWT |
| GET | `/auth/me` | JWT | Current user profile |
| PATCH | `/auth/me` | JWT | Update profile |

## Countries & Currencies

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/countries` | - | List countries (public) |
| GET | `/countries/:id` | - | Country detail + market config |
| GET | `/currencies` | - | List currencies |
| GET | `/fx/latest` | - | Latest FX rates (from=X&to=Y) |
| GET | `/fx/historical` | - | Historical rates (optional) |

## Properties

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/properties` | - | List with filters (country, type, price, geo) |
| GET | `/properties/:id` | - | Property detail |
| POST | `/properties` | JWT | Create (seller/agent) |
| PATCH | `/properties/:id` | JWT | Update |
| DELETE | `/properties/:id` | JWT | Delete |
| POST | `/properties/:id/images` | JWT | Upload images |
| POST | `/properties/ai/description` | JWT | Generate AI description |
| POST | `/properties/ai/price-suggestion` | JWT | AI price suggestion |
| POST | `/properties/ai/valuate` | JWT | Full AI valuation |

## AI Valuation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/valuation` | JWT | Valuate single property (full report) |
| GET | `/valuation/:propertyId` | - | Get cached valuation |

## Investment Calculator

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/calculator/rent-vs-buy` | - | Rent vs Buy comparison |
| POST | `/calculator/irr` | - | IRR calculation |
| POST | `/calculator/roi` | - | ROI calculation |
| POST | `/calculator/down-payment` | - | Down payment + EMI |
| POST | `/calculator/tax-estimate` | - | Tax + hidden costs by country |

## Dashboard & FX

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/summary` | JWT | User dashboard summary |
| GET | `/dashboard/fx-impact` | JWT | ROI impact by currency |
| POST | `/dashboard/currency-simulator` | - | Currency risk simulation |

## Heatmap

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/heatmap/country-scores` | - | Country investment scores |
| GET | `/heatmap/rental-yield` | - | Rental yield by region (geo) |
| GET | `/heatmap/appreciation` | - | Appreciation zones |
| GET | `/heatmap/overpriced` | - | Overpriced detection zones |

## Compare

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/compare?ids=id1,id2,id3&currency=USD` | - | Compare up to 3 properties |
| POST | `/compare` | JWT | Save comparison (Phase 2) |

## Recommendations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/recommendations/similar/:propertyId` | - | Similar properties |
| GET | `/recommendations/undervalued` | - | Undervalued alerts |
| GET | `/recommendations/emerging` | - | Emerging market alerts |
| GET | `/recommendations/personalized` | JWT | Personalized ranking |

## Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reports/investment` | JWT | Generate investment PDF |
| GET | `/reports/:id` | JWT | Download report |
| GET | `/reports` | JWT | User's reports list |

## User Actions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/saved-properties` | JWT | Save property |
| DELETE | `/saved-properties/:propertyId` | JWT | Unsave |
| GET | `/saved-properties` | JWT | List saved |

## Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/countries` | Admin | CRUD countries |
| GET | `/admin/fx` | Admin | FX management |
| PATCH | `/admin/market-config` | Admin | Market growth % |
| POST | `/admin/verify-builder` | Admin | Builder verification |
| GET | `/admin/analytics` | Admin | Platform analytics |

---

## Request/Response Examples

### POST /auth/register
```json
// Request
{ "email": "nri@example.com", "password": "***", "firstName": "Raj", "lastName": "Kumar", "investorType": "nri", "preferredCurrency": "USD" }

// Response
{ "user": { "id": "...", "email": "...", "role": "buyer" }, "accessToken": "...", "expiresIn": 3600 }
```

### GET /properties (query params)
```
?country=IND&type=apartment&minPrice=50000&maxPrice=500000&currency=USD&lat=28.6&lng=77.2&radius=50
```

### POST /calculator/rent-vs-buy
```json
// Request
{
  "propertyPrice": 50000,
  "currency": "USD",
  "downPaymentPct": 20,
  "loanTermYears": 20,
  "interestRatePct": 8,
  "monthlyRent": 500,
  "countryId": "..." 
}

// Response
{
  "rentCost5Y": 30000,
  "buyCost5Y": 45000,
  "breakevenYears": 4.2,
  "recommendation": "buy"
}
```
