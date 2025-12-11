// User Types
export enum UserRole {
  EXPLORER = "explorer",
  PARTNER = "partner",
  ADMIN = "admin",
}

export interface Profile {
  id: string;
  auth_uid: string;
  email: string;
  full_name: string;
  display_name: string;
  locale: "en" | "km";
  avatar_url?: string;
  bio?: string;
  is_partner: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Explorer {
  id: string;
  profile_id: string;
  interests: string[];
  language: "en" | "km" | "both";
}

export interface Partner {
  id: string;
  profile_id: string;
  company_name: string;
  vat_number?: string;
  contact_phone: string;
  contact_email: string;
  accepted: boolean;
  created_at: string;
}

export interface Admin {
  id: string;
  profile_id: string;
  role: string;
  created_at: string;
}

// Location/Spot Types
export interface Spot {
  id: string;
  partner_id?: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  tags: string[];
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  city: string;
  price_level?: number;
  currency: "KHR" | "USD";
  cover_url?: string;
  extra?: Record<string, any>;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpotWithDistance extends Spot {
  distance?: number;
}

// Itinerary Types
export interface ItineraryStop {
  order: number;
  spot_id: string;
  title: string;
  description?: string;
  start_time: string;
  duration_minutes: number;
  address?: string;
  category?: string;
  notes?: string;
}

export interface Itinerary {
  id: string;
  profile_id: string;
  title: string;
  description?: string;
  itinerary: {
    title: string;
    description: string;
    theme?: string;
    budget?: string;
    stops: ItineraryStop[];
    created_at: string;
  };
  embedding?: number[];
  model: string;
  source_docs?: Spot[];
  created_at: string;
}

// Subscription Types
export enum SubscriptionTier {
  FREE = "free",
  BASIC = "basic",
  PREMIUM = "premium",
}

export interface Subscription {
  id: string;
  profile_id: string;
  tier: SubscriptionTier;
  started_at: string;
  expires_at?: string;
  status: "active" | "inactive" | "expired" | "cancelled";
  metadata?: Record<string, any>;
}

// Payment Types
export interface Payment {
  id: string;
  profile_id: string;
  subscription_id?: string;
  provider: "bakong" | "stripe" | "paypal";
  provider_ref: string;
  amount: number;
  currency: "KHR" | "USD";
  status: "pending" | "completed" | "failed" | "refunded";
  raw_response?: Record<string, any>;
  created_at: string;
}

// Analytics Types
export enum AnalyticsEventType {
  VIEW = "view",
  SAVE = "save",
  CLICK = "click",
  SHARE = "share",
  DOWNLOAD = "download",
}

export interface AnalyticsEvent {
  id: number;
  profile_id: string;
  spot_id?: string;
  event_type: AnalyticsEventType;
  event_props?: Record<string, any>;
  created_at: string;
}

export interface AnalyticsSummary {
  total_users: number;
  daily_active_users: number;
  monthly_active_users: number;
  total_revenue: number;
  total_views: number;
  total_saves: number;
}

// Bucket List Types
export interface BucketListItem {
  id: string;
  profile_id: string;
  spot_id: string;
  created_at: string;
}

// Feedback Types
export interface Feedback {
  id: string;
  profile_id: string;
  spot_id?: string;
  itinerary_id?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  meta?: Record<string, any>;
  created_at: string;
}

// API Request Types
export interface GenerateItineraryRequest {
  theme: string;
  party: string;
  budget: string;
  interests: string[];
  duration?: number;
}

export interface SearchSpotRequest {
  query?: string;
  category?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
  offset?: number;
}

// Dashboard Types
export interface PartnerAnalytics {
  total_views: number;
  total_saves: number;
  total_clicks: number;
  revenue: number;
  top_spots: Spot[];
  recent_bookings: any[];
}

export interface AdminDashboard {
  users_count: number;
  daily_active_users: number;
  monthly_active_users: number;
  total_revenue: number;
  total_subscriptions: number;
  active_subscriptions: number;
  recent_payments: Payment[];
  top_spots: Spot[];
}
