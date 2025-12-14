"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import apiFetch from "@/lib/apiClient";
import { Card } from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Filter,
  MapPin,
  Eye,
  Heart,
  Trash2,
  Edit,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Location {
  id: string;
  title: string;
  category: string;
  address: string;
  city: string;
  published: boolean;
  views?: number;
  saves?: number;
  created_at: string;
  cover_url?: string;
  status?: "published" | "draft" | "pending";
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "published" | "draft"
  >("all");
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const addToast = (props: { message: string; duration?: number; actionLabel?: string; onAction?: () => void }) => {
    toast({
      title: props.message,
      action:
        props.actionLabel && props.onAction ? (
          <ToastAction altText={props.actionLabel} onClick={props.onAction}>
            {props.actionLabel}
          </ToastAction>
        ) : undefined,
    });
  };

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await apiFetch("/api/partner/spots");
        if (res?.success) {
          setLocations(res.data || []);
        } else {
          console.error(res?.error || "Failed to load locations");
        }
      } catch (err) {
        console.error("Error loading locations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch = loc.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && loc.published) ||
      (filterStatus === "draft" && !loc.published);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await apiFetch(`/api/partner/spots/${id}`, {
        method: "DELETE",
      });

      if (res?.success) {
        setLocations((prev) => prev.filter((loc) => loc.id !== id));
        addToast({
          message: `"${title}" has been deleted`,
          duration: 3000,
        });
      } else {
        addToast({
          message: res?.error || "Failed to delete location",
          duration: 3000,
        });
      }
    } catch (err) {
      console.error("Error deleting location:", err);
      addToast({
        message: "Failed to delete location",
        duration: 3000,
      });
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Locations</h1>
          <p className="text-gray-600">
            Create and manage your business locations
          </p>
        </div>
        <Link href="/partner/locations/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "published", "draft"] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {status === "all"
                  ? "All"
                  : status === "published"
                  ? "Published"
                  : "Draft"}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Locations Grid */}
      {filteredLocations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <Card
              key={location.id}
              className="overflow-hidden hover:shadow-lg transition flex flex-col"
            >
              {location.cover_url && (
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={location.cover_url}
                    alt={location.title}
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 flex-1">
                    {location.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${
                      location.published
                        ? "bg-green-100 text-green-800"
                        : location.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {location.published
                      ? "Published"
                      : location.status === "pending"
                      ? "Pending"
                      : "Draft"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {location.address}
                  <br />
                  <span className="text-xs text-gray-500">
                    {location.category} • {location.city}
                  </span>
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {location.views || 0} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {location.saves || 0} saves
                  </span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Link
                    href={`/partner/locations/${location.id}`}
                    className="flex-1"
                  >
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(location.id, location.title)}
                    disabled={deleting[location.id]}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No locations yet
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first location
          </p>
          <Link href="/partner/locations/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create First Location
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
