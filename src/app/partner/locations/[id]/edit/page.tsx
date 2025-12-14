"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import apiFetch from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import MapPicker from "@/components/MapPicker";
import supabaseBrowser from "@/lib/supabaseClient";
import { Trash2, Save, ArrowLeft, Image, MapPin } from "lucide-react";

export default function EditLocationPage({
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
    } as any);
  };
  const [spot, setSpot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState<{
    type: string;
    coordinates: [number, number];
  } | null>(null);
  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [address, setAddress] = useState("");
  const [priceLevel, setPriceLevel] = useState<number | null>(null);
  const [published, setPublished] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    active: boolean;
    prevUrl: string | null;
    timeoutId?: number | null;
  }>({ active: false, prevUrl: null, timeoutId: null });

  const handleDeleteCover = async () => {
    try {
      const prev = coverUrl;
      setCoverUrl(null);
      setCoverFile(null);

      const idTimeout = window.setTimeout(async () => {
        try {
          await apiFetch(`/api/partner/spots/${id}`, {
            method: "PUT",
            body: JSON.stringify({ cover_path: null }),
          });
        } catch (e) {
          console.error("server clear cover failed", e);
          setCoverUrl(prev);
        }
        setPendingDelete({ active: false, prevUrl: null, timeoutId: null });
      }, 5000);

      setPendingDelete({ active: true, prevUrl: prev, timeoutId: idTimeout });

      addToast({
        message: "Cover removed.",
        actionLabel: "Undo",
        duration: 5000,
        onAction: () => handleUndoDeleteCover(),
      });
    } catch (err) {
      console.error("delete cover error", err);
    }
  };

  const handleUndoDeleteCover = () => {
    if (pendingDelete?.timeoutId) {
      clearTimeout(pendingDelete.timeoutId);
    }
    setCoverUrl(pendingDelete.prevUrl || null);
    setPendingDelete({ active: false, prevUrl: null, timeoutId: null });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/spots/${id}`);
        const json = await res.json();
        setSpot(json?.spot || null);
        setTitle(json?.spot?.title || "");
        setCategory(json?.spot?.category || "");
        setCity(json?.spot?.city || "");
        setDescription(json?.spot?.description || "");
        setTagsText((json?.spot?.tags || []).join(", "));
        setAddress(json?.spot?.address || "");
        setPriceLevel(json?.spot?.price_level ?? null);
        setPublished(!!json?.spot?.published);
        setCoverUrl(json?.spot?.cover_url || null);

        if (json?.spot?.location?.coordinates) {
          const coords = json.spot.location.coordinates;
          setLocation({ type: "Point", coordinates: [coords[0], coords[1]] });
        }
      } catch (err) {
        console.error(err);
        addToast({ message: "Failed to load location", duration: 3000 });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, addToast]);

  const handleSave = async () => {
    if (!title.trim()) {
      addToast({ message: "Title is required", duration: 3000 });
      return;
    }

    setSaving(true);
    try {
      let uploadedUrl = coverUrl;
      let uploadedPath: string | null = null;

      if (coverFile) {
        setUploading(true);
        const filePath = `spots/${Date.now()}_${coverFile.name}`;
        const { error: upErr } = await supabaseBrowser.storage
          .from("spots")
          .upload(filePath, coverFile, { cacheControl: "3600", upsert: false });

        if (upErr) throw upErr;

        const { data } = supabaseBrowser.storage
          .from("spots")
          .getPublicUrl(filePath);

        uploadedUrl = data?.publicUrl || null;
        uploadedPath = filePath;
        setCoverUrl(uploadedUrl);
        setUploading(false);
      }

      const tags = tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const body: any = {
        title,
        category,
        city,
        description,
        tags,
        address,
        price_level: priceLevel,
        published,
        cover_url: uploadedUrl,
      };

      if (typeof uploadedPath === "string") {
        body.cover_path = uploadedPath;
      }
      if (location) body.location = location;

      const res = await apiFetch(`/api/partner/spots/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });

      if (res?.success) {
        addToast({ message: "Location updated successfully", duration: 3000 });
        router.push(`/partner/locations/${id}`);
      } else {
        addToast({ message: res?.error || "Failed to save", duration: 3000 });
      }
    } catch (err) {
      console.error(err);
      addToast({ message: "Error saving location", duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!spot) {
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

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href={`/partner/locations/${id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Location</h1>
            <p className="text-gray-600 mt-1">{title || "Untitled"}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/partner/locations/${id}`)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter location title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Restaurant, Museum"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Phnom Penh"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of the location"
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <Input
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="e.g., cafes, romantic, local"
                />
              </div>
            </div>
          </Card>

          {/* Cover Image */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Cover Image
            </h2>

            {coverUrl && (
              <div className="mb-4">
                <img
                  src={coverUrl}
                  alt="Cover"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <p className="text-sm text-gray-600">
                    {coverFile
                      ? `Selected: ${coverFile.name}`
                      : "Click to upload a new image"}
                  </p>
                  {uploading && (
                    <p className="text-xs text-blue-600 mt-1">Uploading...</p>
                  )}
                </label>
              </div>

              {coverUrl && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteCover}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Cover
                </Button>
              )}
            </div>
          </Card>

          {/* Location Map */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Click on the map to set the exact location
            </p>
            <div className="h-80 rounded-lg overflow-hidden border border-gray-300">
              <MapPicker
                initial={location?.coordinates || [104.8855, 11.5564]}
                onChange={(p) => setLocation(p)}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Level
                </label>
                <select
                  value={priceLevel ?? ""}
                  onChange={(e) =>
                    setPriceLevel(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Not specified</option>
                  <option value={0}>🆓 Free</option>
                  <option value={1}>💰 Inexpensive</option>
                  <option value={2}>💰💰 Moderate</option>
                  <option value={3}>💰💰💰 Expensive</option>
                  <option value={4}>💎 Luxury</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label
                  htmlFor="published"
                  className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                >
                  Publish this location
                </label>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    published
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {published ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          </Card>

          {/* Info */}
          <Card className="p-6 bg-blue-50 border border-blue-200">
            <h3 className="font-semibold text-sm text-blue-900 mb-2">
              ℹ️ Tips
            </h3>
            <ul className="text-xs text-blue-800 space-y-2">
              <li>✓ Fill in a clear title and category</li>
              <li>✓ Add a high-quality cover image</li>
              <li>✓ Set the exact location on the map</li>
              <li>✓ Publish when ready to show to users</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
