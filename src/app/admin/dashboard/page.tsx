"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiFetch from "@/lib/apiClient";
import { Card } from "@/components/ui/card";

interface DashboardMetrics {
  total_users: number;
  total_spots: number;
  pending_reviews: number;
  total_revenue: number;
  active_subscriptions: number;
  system_health: string;
  alerts: Array<{ type: string; message: string; severity: string }>;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const res = await apiFetch("/api/admin/dashboard");
        if (res?.success) {
          setMetrics(res.data);
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
        <p>Loading dashboard...</p>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Overview of platform operations and metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="p-6">
          <div className="text-gray-500 text-sm font-medium mb-2">
            Total Users
          </div>
          <div className="text-3xl font-bold">{metrics?.total_users ?? 0}</div>
          <p className="text-xs text-gray-400 mt-2">Registered accounts</p>
        </Card>

        <Card className="p-6">
          <div className="text-gray-500 text-sm font-medium mb-2">
            Total Spots
          </div>
          <div className="text-3xl font-bold">{metrics?.total_spots ?? 0}</div>
          <p className="text-xs text-gray-400 mt-2">Locations</p>
        </Card>

        <Card className="p-6">
          <div className="text-gray-500 text-sm font-medium mb-2">
            Pending Review
          </div>
          <div className="text-3xl font-bold text-yellow-600">
            {metrics?.pending_reviews ?? 0}
          </div>
          <p className="text-xs text-gray-400 mt-2">Awaiting approval</p>
        </Card>

        <Card className="p-6">
          <div className="text-gray-500 text-sm font-medium mb-2">
            Subscriptions
          </div>
          <div className="text-3xl font-bold">
            {metrics?.active_subscriptions ?? 0}
          </div>
          <p className="text-xs text-gray-400 mt-2">Active plans</p>
        </Card>

        <Card className="p-6">
          <div className="text-gray-500 text-sm font-medium mb-2">
            Total Revenue
          </div>
          <div className="text-3xl font-bold">
            ${metrics?.total_revenue ?? 0}
          </div>
          <p className="text-xs text-gray-400 mt-2">All time</p>
        </Card>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">System Status</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Overall Health</p>
              <p className="text-2xl font-bold text-green-600">
                {metrics?.system_health ?? "Healthy"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-xl">✓</span>
            </div>
          </div>
        </Card>

        {metrics?.pending_reviews ? (
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <h2 className="text-xl font-bold mb-4">⚠️ Action Required</h2>
            <p className="text-yellow-800 mb-4">
              {metrics.pending_reviews} locations need review
            </p>
            <Link href="/admin/moderation">
              <button className="text-yellow-600 hover:text-yellow-700 font-medium">
                Review Now →
              </button>
            </Link>
          </Card>
        ) : null}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/users">
            <div className="p-4 border rounded-lg hover:bg-blue-50 transition cursor-pointer">
              <div className="font-semibold mb-2">👥 Manage Users</div>
              <p className="text-sm text-gray-600">
                View and manage user accounts
              </p>
            </div>
          </Link>

          <Link href="/admin/moderation">
            <div className="p-4 border rounded-lg hover:bg-blue-50 transition cursor-pointer">
              <div className="font-semibold mb-2">🔍 Review Content</div>
              <p className="text-sm text-gray-600">
                Approve or reject locations
              </p>
            </div>
          </Link>

          <Link href="/admin/payments">
            <div className="p-4 border rounded-lg hover:bg-blue-50 transition cursor-pointer">
              <div className="font-semibold mb-2">💳 View Payments</div>
              <p className="text-sm text-gray-600">
                Payment history and reports
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {metrics?.alerts && metrics.alerts.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Recent Alerts</h2>
          {metrics.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                alert.severity === "critical"
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <p className="font-semibold">{alert.type}</p>
              <p className="text-sm text-gray-600">{alert.message}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
