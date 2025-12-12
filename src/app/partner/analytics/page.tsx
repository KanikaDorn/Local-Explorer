"use client";

import { useEffect, useState } from "react";
import apiFetch from "@/lib/apiClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/KPICard";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  Heart,
  MousePointer,
} from "lucide-react";

interface AnalyticsData {
  total_views: number;
  total_saves: number;
  total_clicks: number;
  average_ctr: number;
  views_trend?: number;
  saves_trend?: number;
  ctr_trend?: number;
  daily_views: Array<{ date: string; views: number }>;
  top_spots: Array<{
    id: string;
    title: string;
    views: number;
    saves?: number;
    ctr?: number;
  }>;
}

export default function PartnerAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">(
    "month"
  );

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await apiFetch(`/api/partner/analytics?range=${dateRange}`);
        if (res?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [dateRange]);

  const handleExport = () => {
    if (!data?.daily_views) return;

    const csv = [
      ["Date", "Views"],
      ...data.daily_views.map((d) => [d.date, d.views]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-600">
          Track your location performance and user engagement
        </p>
      </div>

      {/* Date Range Selector */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-2">
            {(["week", "month", "year"] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange(range)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!data}
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Views"
          value={data?.total_views || 0}
          subtitle={`Last ${dateRange}`}
          icon={<Eye className="w-6 h-6" />}
          variant="primary"
          trend={data?.views_trend || 0}
        />

        <KPICard
          title="Total Saves"
          value={data?.total_saves || 0}
          subtitle={`Last ${dateRange}`}
          icon={<Heart className="w-6 h-6" />}
          variant="danger"
          trend={data?.saves_trend || 0}
        />

        <KPICard
          title="Click-through Rate"
          value={`${(data?.average_ctr || 0).toFixed(2)}%`}
          subtitle={`Last ${dateRange}`}
          icon={<MousePointer className="w-6 h-6" />}
          variant="success"
          trend={data?.ctr_trend || 0}
        />

        <KPICard
          title="Total Clicks"
          value={data?.total_clicks || 0}
          subtitle={`Last ${dateRange}`}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="warning"
        />
      </div>

      {/* Top Performing Spots */}
      {data?.top_spots && data.top_spots.length > 0 && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Top Performing Locations
          </h2>
          <div className="space-y-4">
            {data.top_spots.map((spot, idx) => (
              <div
                key={spot.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      #{idx + 1} {spot.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {spot.views.toLocaleString()} views
                      {spot.saves && ` • ${spot.saves.toLocaleString()} saves`}
                      {spot.ctr && ` • CTR: ${spot.ctr.toFixed(2)}%`}
                    </p>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (spot.views / (data.top_spots?.[0]?.views || 1)) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Daily Data Chart */}
      {data?.daily_views && data.daily_views.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Daily Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-right py-2 px-2 font-semibold text-gray-700">
                    Views
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.daily_views.map((day) => (
                  <tr key={day.date} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-900">{day.date}</td>
                    <td className="text-right py-3 px-2 text-gray-600">
                      {day.views.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
