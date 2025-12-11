# LocalExplore - Quick Start Guide

## 🚀 Getting Started

### 1. Environment Setup

Create or update `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mspnvlvpbxsflzwfrktv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
VERTEX_AI_PROJECT_ID=your_project_id
VERTEX_AI_LOCATION=us-central1
GEMINI_AI_API_KEY=your_gemini_key

# Payments
BAKONG_API_KEY=your_bakong_key
BAKONG_SECRET_KEY=your_secret
BAKONG_MERCHANT_ID=your_merchant_id

# Maps
NEXT_PUBLIC_MAP_STYLE_URL=https://demotiles.maplibre.org/style.json

# App
NEXT_PUBLIC_APP_NAME=LocalExplore
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

The database schema is pre-configured in Supabase. To verify:

1. Go to Supabase Dashboard
2. Check that tables exist:

   - profiles, partners, admins
   - spots, itineraries, plan_locations
   - subscriptions, payments
   - analytics_events, feedback
   - bucket_list, spot_embeddings

3. Run migrations if needed:
   ```sql
   -- Execute contents of supabase_schema.sql
   -- Execute contents of supabase_embeddings.sql
   ```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Available Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🗺️ App Navigation

### Public Routes

- `/` - Home page
- `/explore` - Discover spots
- `/signup` - Create account
- `/login` - Sign in

### Protected Routes (After Login)

- `/plans` - Your itineraries
- `/bucket-list` - Saved spots
- `/profile` - User profile (under development)

### Admin Routes (Under Development)

- `/admin/dashboard` - Admin panel
- `/admin/analytics` - Platform analytics

### Partner Routes (Under Development)

- `/partner/dashboard` - Partner panel
- `/partner/analytics` - Business analytics

## 📦 Core Lib Functions

### Authentication

```typescript
import { signUp, signIn, signOut, getCurrentUser } from "@/lib/auth";

// Sign up
await signUp("user@example.com", "password");

// Sign in
await signIn("user@example.com", "password");

// Get current user
const user = await getCurrentUser();
```

### Spots/Locations

```typescript
import {
  getSpots,
  searchSpots,
  getSpotById,
  getNearbySpots,
} from "@/lib/spots";

// Get all spots
const spots = await getSpots(limit, offset, filters);

// Search spots
const results = await searchSpots("cafe", limit);

// Get by ID
const spot = await getSpotById(spotId);

// Nearby spots (radius in km)
const nearby = await getNearbySpots(lat, lng, radiusKm, limit);
```

### Itineraries

```typescript
import {
  getItineraries,
  createItinerary,
  deleteItinerary,
} from "@/lib/itineraries";

// Get user itineraries
const plans = await getItineraries(profileId, limit);

// Create new itinerary
await createItinerary(profileId, title, description, itineraryData);

// Delete itinerary
await deleteItinerary(itineraryId);
```

### Bucket List

```typescript
import {
  getBucketList,
  addToBucketList,
  removeFromBucketList,
} from "@/lib/bucketList";

// Get bucket list
const items = await getBucketList(profileId);

// Add to list
await addToBucketList(profileId, spotId);

// Remove from list
await removeFromBucketList(profileId, spotId);
```

### Analytics

```typescript
import { logEvent, getSpotAnalytics } from "@/lib/analytics";

// Log user event
await logEvent(profileId, "view", spotId, {});

// Get spot stats
const stats = await getSpotAnalytics(spotId);
```

## 🎨 UI Components

All shadcn/ui components are available:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
```

### Custom Components

```typescript
import { SpotCard } from "@/components/SpotCard";
import { ItineraryCard } from "@/components/ItineraryCard";
import { Map } from "@/components/Map";
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel } from "@/components/FilterPanel";
```

## 🔌 API Routes

All API routes follow standard patterns:

### GET /api/[resource]

Returns list with pagination

```
GET /api/spots?limit=20&offset=0
GET /api/itineraries?limit=10
```

### POST /api/[resource]

Creates new resource

```json
{
  "title": "My Plan",
  "description": "Weekend in Phnom Penh"
}
```

### Authentication

Include `user-id` header in requests:

```
GET /api/plans
Headers: { user-id: user_uuid }
```

## 🛠️ Troubleshooting

### "Unauthorized" Error

- Check if user-id header is included
- Verify user is logged in
- Check Supabase auth setup

### "No spots found"

- Verify spots exist in database with `published: true`
- Check Supabase connection
- Try `/api/spots` endpoint directly

### Map not showing

- Verify `NEXT_PUBLIC_MAP_STYLE_URL` is set
- Check MapLibre GL CSS is imported
- Try different map style URL

### AI features not working

- Verify `GEMINI_AI_API_KEY` is set
- Check Gemini API quotas
- Test with `/api/itineraries/generate` endpoint

## 📚 Database Schema Highlights

### Key Tables

- **profiles** - User accounts with roles
- **spots** - Locations with geospatial data
- **itineraries** - AI-generated plans with embeddings
- **subscriptions** - Billing tiers
- **analytics_events** - User interactions
- **spot_embeddings** - Vector search index

### Relationships

```
profiles (1) ──→ (many) itineraries
profiles (1) ──→ (many) subscriptions
partners (1) ──→ (many) spots
spots (1) ──→ (many) feedback
spots (1) ──→ (many) analytics_events
```

## 🚀 Deployment Checklist

Before deploying:

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Test all API endpoints
- [ ] Verify payment integration
- [ ] Set up analytics
- [ ] Configure email notifications
- [ ] Security review
- [ ] Performance testing

## 📞 Support

For issues or questions:

1. Check IMPLEMENTATION_STATUS.md
2. Review API documentation in docs/
3. Check Supabase dashboard
4. Review console logs

---

**Happy Coding! 🎉**
