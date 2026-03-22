# Debugging: Images & Map

## Checklist

### 1. Mapbox Token
- [ ] Add `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.local` (or `.env`)
- [ ] Get free token at [mapbox.com](https://mapbox.com)
- [ ] Restart dev server after changing env vars

### 2. Images
- [ ] **Images array not empty**: API returns `images` relation. Check Network tab: `/api/v1/properties` should have `images: [{ url: "..." }]`
- [ ] **Add images to existing DB**: Run `npm run add-images` to add Unsplash images to properties without them
- [ ] **Next.js Image domains**: `next.config.js` has `remotePatterns` for `images.unsplash.com`, `picsum.photos`, `placehold.co`
- [ ] **Fallback**: If image fails or is null, `PropertyImage` shows gradient placeholder

### 3. Map
- [ ] **Latitude & longitude not null**: Properties need valid `latitude` and `longitude`. Run generator with validated coords.
- [ ] **Map container height**: `h-[500px]` is set on `PropertyMap` container
- [ ] **Dynamic import**: Map uses `dynamic(() => ..., { ssr: false })` to avoid hydration errors
- [ ] **CORS**: Mapbox tiles load from mapbox.com; no CORS issues for map tiles

### 4. Markers
- [ ] Properties with `latitude` and `longitude` appear as markers
- [ ] Clicking marker shows popup (title, city, AI score)
- [ ] Heatmap toggle adds density layer (min 5 properties)

### 5. Common Issues

| Issue | Fix |
|-------|-----|
| Map blank, no token message | Add `NEXT_PUBLIC_MAPBOX_TOKEN` |
| Map loads but no markers | Check API response has `latitude`, `longitude` |
| Images 403 / broken | Verify `remotePatterns` in next.config.js |
| Hydration mismatch | Map & GlobalMap use `dynamic` with `ssr: false` |
| Marker popup blank | Check `title` and `city` are defined |

### 6. Run Commands

```bash
# Generate 10K properties + images
npm run generate-data

# Add images only (for existing properties)
npm run add-images
```
