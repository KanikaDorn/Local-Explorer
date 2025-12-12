"use client";

import { useEffect, useState } from "react";
import apiFetch from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ModerationItem {
  id: string;
  spot_id: string;
  title: string;
  reason: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

export default function AdminModerationPage() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch(`/api/admin/spots/moderation`);
        if (res?.success) setItems(res.data || []);
        else console.error(res?.error || "Failed to load");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAction = async (spotId: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this spot?`)) return;
    try {
      const res = await apiFetch(`/api/admin/spots/${spotId}/moderate`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      if (res?.success) {
        setItems(
          items.map((i) =>
            i.spot_id === spotId
              ? { ...i, status: action === "approve" ? "approved" : "rejected" }
              : i
          )
        );
      } else alert(res?.error || "Failed to moderate");
    } catch (err) {
      console.error(err);
      alert("Error moderating spot");
    }
  };

  const filteredItems =
    filter === "pending" ? items.filter((i) => i.status === "pending") : items;

  const pendingCount = items.filter((i) => i.status === "pending").length;

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading moderation queue...</p>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Moderation</h1>
        <p className="text-gray-600">
          Review and approve user-submitted locations
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 font-medium transition ${
            filter === "pending"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 font-medium transition ${
            filter === "all"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All Items ({items.length})
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">
            {filter === "pending"
              ? "No pending moderation items."
              : "No items to display."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        item.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : item.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">ID: {item.spot_id}</p>
                  <div className="flex gap-6 text-sm text-gray-500">
                    <span>Reason: {item.reason}</span>
                    <span>
                      📅 Submitted{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {item.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAction(item.spot_id, "approve")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleAction(item.spot_id, "reject")}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
