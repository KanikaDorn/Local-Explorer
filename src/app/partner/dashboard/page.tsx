"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiFetch from "@/lib/apiClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/KPICard";
import {
  MapPin,
  Eye,
  Heart,
  TrendingUp,
  Plus,
  AlertCircle,
} from "lucide-react";

interface DashboardMetrics {
  total_spots: number;
  total_views: number;
  total_saves: number;
  pending_reviews: number;
  revenue_this_month: number;
  active_subscription: string;
  views_trend?: number;
  saves_trend?: number;
  revenue_trend?: number;
  recent_spots?: Array<{
    id: string;
    title: string;
    views: number;
    saves: number;
    status: string;
  }>;
}

export default function PartnerDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const res = await apiFetch("/api/partner/dashboard");
        if (res?.success) {
          setMetrics(res.data);
        } else {
          console.error(res?.error || "Failed to load metrics");
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's your business performance overview.
          </p>
        </div>
        <Link href="/partner/locations/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Locations"
          value={metrics?.total_spots ?? 0}
          subtitle="Active listings"
          icon={<MapPin className="w-6 h-6" />}
          variant="primary"
          trend={metrics?.saves_trend || 0}
        />

        <KPICard
          title="Total Views"
          value={metrics?.total_views ?? 0}
          subtitle="This month"
          icon={<Eye className="w-6 h-6" />}
          variant="success"
          trend={metrics?.views_trend || 0}
        />

        <KPICard
          title="Saved By Users"
          value={metrics?.total_saves ?? 0}
          subtitle="Total saves"
          icon={<Heart className="w-6 h-6" />}
          variant="danger"
          trend={metrics?.saves_trend || 0}
        />

        <KPICard
          title="Revenue (MTD)"
          value={`$${metrics?.revenue_this_month ?? 0}`}
          subtitle={metrics?.active_subscription ?? "No subscription"}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="warning"
          trend={metrics?.revenue_trend || 0}
        />
      </div>

      {/* Quick Actions */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/partner/locations/new" className="block">
            <div className="p-4 border rounded-lg hover:bg-blue-50 transition cursor-pointer">
              <div className="font-semibold mb-2 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add New Location
              </div>
              <p className="text-sm text-gray-600">
                Add a new cafe or business location
              </p>
            </div>
          </Link>

          <Link href="/partner/profile" className="block">
            <div className="p-4 border rounded-lg hover:bg-blue-50 transition cursor-pointer">
              <div className="font-semibold mb-2">✏️ Edit Profile</div>
              <p className="text-sm text-gray-600">
                Update business information
              </p>
            </div>
          </Link>

          <Link href="/partner/subscriptions" className="block">
            <div className="p-4 border rounded-lg hover:bg-blue-50 transition cursor-pointer">
              <div className="font-semibold mb-2">📈 Upgrade Plan</div>
              <p className="text-sm text-gray-600">Get more features and reach</p>
            </div>
          </Link>
        </div>
      </Card>

      {/* Pending Reviews Alert */}
      {metrics?.pending_reviews ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">
                Pending Review
              </h3>
              <p className="text-yellow-800 mb-3">
                You have {metrics.pending_reviews} location(s) awaiting admin
                approval. Check your email for updates.
              </p>
              <Link href="/partner/locations">
                <Button variant="outline" size="sm">
                  View Locations
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Recent Locations */}
      {metrics?.recent_spots && metrics.recent_spots.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Locations</h2>
          <div className="space-y-3">
            {metrics.recent_spots.map((spot) => (
              <div
                key={spot.id}
                className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{spot.title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className="inline-block mr-4">
                      👁️ {spot.views.toLocaleString()} views
                    </span>
                    <span className="inline-block mr-4">
                      ❤️ {spot.saves.toLocaleString()} saves
                    </span>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        spot.status === "published"
                          ? "bg-green-100 text-green-800"
                          : spot.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {spot.status}
                    </span>
                  </div>
                </div>
                <Link href={`/partner/locations/${spot.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
