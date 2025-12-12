"use client";

import { useEffect, useState } from "react";
import apiFetch from "@/lib/apiClient";
import { Card } from "@/components/ui/card";

interface AnalyticsData {
  total_users: number;
  active_users: number;
  new_users_today: number;
  total_spots: number;
  pending_spots: number;
  active_subscriptions: number;
  total_revenue: number;
  revenue_this_month: number;
  avg_user_retention: number;
  daily_active_users: number;
  monthly_active_users: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/admin/analytics");
        if (res?.success) setData(res.data);
        else console.error(res?.error || "Failed to load analytics");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading analytics...</p>
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center justify-center py-12">
        <p>No analytics data available.</p>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
        <p className="text-gray-600">
          Monitor your platform's health and growth
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-gray-500 text-sm font-medium mb-2">
            Total Users
          </div>
          <div className="text-3xl font-bold">{data.total_users}</div>
          <p className="text-xs text-gray-400 mt-2">
            {data.new_users_today} new today
          </p>
        </Card>

        <Card className="p-6">
          <div className="text-gray-500 text-sm font-medium mb-2">
            Active Users
          </div>
          <div className="text-3xl font-bold">{data.active_users}</div>
          <p className="text-xs text-gray-400 mt-2">
            DAU: {data.daily_active_users}
          </p>
        </Card>

        <Card className="p-6">
          <div className="text-gray-500 text-sm font-medium mb-2">
            Active Subscriptions
          </div>
          <div className="text-3xl font-bold">{data.active_subscriptions}</div>
          <p className="text-xs text-gray-400 mt-2">Paying customers</p>
        </Card>

        <Card className="p-6">
          <div className="text-gray-500 text-sm font-medium mb-2">
            Total Revenue
          </div>
          <div className="text-3xl font-bold">${data.total_revenue}</div>
          <p className="text-xs text-gray-400 mt-2">
            ${data.revenue_this_month} this month
          </p>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-gray-500 text-sm font-medium mb-2">
            Content Stats
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between">
              <span>Total Spots</span>
              <span className="font-semibold">{data.total_spots}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Review</span>
              <span className="font-semibold text-yellow-600">
                {data.pending_spots}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-gray-500 text-sm font-medium mb-2">
            User Engagement
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between">
              <span>Retention Rate</span>
              <span className="font-semibold">{data.avg_user_retention}%</span>
            </div>
            <div className="flex justify-between">
              <span>MAU</span>
              <span className="font-semibold">{data.monthly_active_users}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      {data.pending_spots > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">
            ⚠️ Pending Reviews
          </h3>
          <p className="text-yellow-800">
            There are {data.pending_spots} locations awaiting moderation review.
          </p>
        </div>
      )}
    </div>
  );
}
