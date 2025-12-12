"use client";

import { useEffect, useState } from "react";
import apiFetch from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SystemHealth {
  database: "healthy" | "degraded" | "offline";
  api: "healthy" | "degraded" | "offline";
  storage: "healthy" | "degraded" | "offline";
  uptime_percentage: number;
  last_backup: string;
  error_rate: number;
}

export default function AdminSystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSystemHealth = async () => {
      try {
        const res = await apiFetch("/api/admin/system/health");
        if (res?.success) {
          setHealth(res.data);
        }
      } catch (err) {
        console.error("Error loading system health:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSystemHealth();
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "offline":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const statusBg = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-50 border-green-200";
      case "degraded":
        return "bg-yellow-50 border-yellow-200";
      case "offline":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50";
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading system health...</p>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Settings</h1>
        <p className="text-gray-600">
          Monitor platform health and manage settings
        </p>
      </div>

      {/* System Health */}
      {health && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className={`p-6 border ${statusBg(health.database)}`}>
              <div className="text-gray-600 text-sm font-medium mb-2">
                Database
              </div>
              <div
                className={`text-2xl font-bold ${statusColor(health.database)}`}
              >
                {health.database.charAt(0).toUpperCase() +
                  health.database.slice(1)}
              </div>
            </Card>

            <Card className={`p-6 border ${statusBg(health.api)}`}>
              <div className="text-gray-600 text-sm font-medium mb-2">API</div>
              <div className={`text-2xl font-bold ${statusColor(health.api)}`}>
                {health.api.charAt(0).toUpperCase() + health.api.slice(1)}
              </div>
            </Card>

            <Card className={`p-6 border ${statusBg(health.storage)}`}>
              <div className="text-gray-600 text-sm font-medium mb-2">
                Storage
              </div>
              <div
                className={`text-2xl font-bold ${statusColor(health.storage)}`}
              >
                {health.storage.charAt(0).toUpperCase() +
                  health.storage.slice(1)}
              </div>
            </Card>

            <Card className="p-6 border bg-blue-50 border-blue-200">
              <div className="text-gray-600 text-sm font-medium mb-2">
                Uptime
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {health.uptime_percentage}%
              </div>
            </Card>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Error Rate</span>
                  <span className="font-semibold text-red-600">
                    {health.error_rate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime</span>
                  <span className="font-semibold text-green-600">
                    {health.uptime_percentage}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Backup Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Last Backup</span>
                  <span className="font-semibold">
                    {new Date(health.last_backup).toLocaleDateString()}
                  </span>
                </div>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                  Run Backup Now
                </Button>
              </div>
            </Card>
          </div>

          {/* Admin Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Admin Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-gray-600 hover:bg-gray-700 text-white">
                Clear Cache
              </Button>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                Rebuild Search Index
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Send System Alert
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
