"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiFetch from "@/lib/apiClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Eye,
  Heart,
  Edit,
  Trash2,
  Share2,
  Calendar,
  Tag,
  DollarSign,
} from "lucide-react";
import { Map } from "@/components/Map";
import { useToast } from "@/hooks/use-toast";

interface Location {
  id: string;
  title: string;
  description?: string;
  category: string;
  address: string;
  city: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  tags?: string[];
  price_level?: number;
  currency: string;
  cover_url?: string;
  published: boolean;
  views?: number;
  saves?: number;
  created_at: string;
  updated_at: string;
  status?: "published" | "draft" | "pending";
}

export default function LocationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const addToast = (props: { message: string; duration?: number; actionLabel?: string; onAction?: () => void }) => {
    toast({
      title: props.message,
      duration: props.duration,
      // Simple action mapping if needed, or ignore action for now to fix build
    } as any);
  };
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadLocation = async () => {
      try {
        const res = await apiFetch(`/api/partner/spots/${id}`);
        if (res?.success) {
          setLocation(res.data);
        } else {
          addToast({
            message: res?.error || "Failed to load location",
            duration: 3000,
          });
          router.push("/partner/locations");
        }
      } catch (err) {
        console.error("Error loading location:", err);
        addToast({
          message: "Error loading location",
          duration: 3000,
        });
        router.push("/partner/locations");
      } finally {
        setLoading(false);
      }
    };

    loadLocation();
  }, [id, router, addToast]);

  const handleDelete = async () => {
    if (
      !window.confirm(`Delete "${location?.title}"? This cannot be undone.`)
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await apiFetch(`/api/partner/spots/${id}`, {
        method: "DELETE",
      });

      if (res?.success) {
        addToast({
          message: "Location deleted successfully",
          duration: 3000,
        });
        router.push("/partner/locations");
      } else {
        addToast({
          message: res?.error || "Failed to delete location",
          duration: 3000,
        });
      }
    } catch (err) {
      console.error("Error deleting location:", err);
      addToast({
        message: "Error deleting location",
        duration: 3000,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handlePublish = async (publish: boolean) => {
    try {
      const res = await apiFetch(`/api/partner/spots/${id}`, {
        method: "PUT",
        body: JSON.stringify({ published: publish }),
      });

      if (res?.success) {
        setLocation(res.data);
        addToast({
          message: `Location ${publish ? "published" : "unpublished"}`,
          duration: 3000,
        });
      } else {
        addToast({
          message: res?.error || "Failed to update location",
          duration: 3000,
        });
      }
    } catch (err) {
      console.error("Error updating location:", err);
      addToast({
        message: "Error updating location",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Location not found</p>
        <Link href="/partner/locations">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Back to Locations
          </Button>
        </Link>
      </div>
    );
  }

  const lat = location.location.coordinates[1];
  const lng = location.location.coordinates[0];

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{location.title}</h1>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
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
                ? "Pending Review"
                : "Draft"}
            </span>
          </div>
          <p className="text-gray-600 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {location.address}, {location.city}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handlePublish(!location.published)}
          >
            {location.published ? "📴 Unpublish" : "🚀 Publish"}
          </Button>
          <Link href={`/partner/locations/${id}/edit`}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          {location.cover_url && (
            <Card className="overflow-hidden">
              <img
                src={location.cover_url}
                alt={location.title}
                className="w-full h-96 object-cover"
              />
            </Card>
          )}

          {/* Description */}
          {location.description && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {location.description}
              </p>
            </Card>
          )}

          {/* Tags */}
          {location.tags && location.tags.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Tag className="w-6 h-6" />
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {location.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Map */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Location Map
            </h2>
            <div className="h-96 rounded-lg overflow-hidden">
              <Map
                spots={[
                  {
                    id: location.id,
                    title: location.title,
                    location: location.location,
                  } as any,
                ]}
                center={[lng, lat]}
                zoom={15}
              />
            </div>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Performance</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Views
                  </span>
                  <span className="text-2xl font-bold">
                    {location.views || 0}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Saves
                  </span>
                  <span className="text-2xl font-bold">
                    {location.saves || 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Details */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Details</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-600">Category</p>
                <p className="font-semibold text-gray-900">
                  {location.category}
                </p>
              </div>

              {location.price_level && (
                <div>
                  <p className="text-gray-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Price Level
                  </p>
                  <p className="font-semibold text-gray-900">
                    {"$".repeat(location.price_level)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-gray-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created
                </p>
                <p className="font-semibold text-gray-900">
                  {new Date(location.created_at).toLocaleDateString()}
                </p>
              </div>

              {location.updated_at !== location.created_at && (
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(location.updated_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <Button
              variant="outline"
              className="w-full justify-center gap-2 mb-3"
            >
              <Share2 className="w-4 h-4" />
              Share Location
            </Button>
            <Link href={`/explore?spot=${id}`} className="block">
              <Button variant="outline" className="w-full justify-center">
                👁️ View as User
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
