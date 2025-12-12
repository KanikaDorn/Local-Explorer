"use client";

import { useState } from "react";
import Link from "next/link";
import apiFetch from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import MapPicker from "@/components/MapPicker";
import supabaseBrowser from "@/lib/supabaseClient";
import { Save, ArrowLeft, Image, MapPin } from "lucide-react";

export default function NewLocationPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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

  const handleClearCover = () => {
    const prev = coverUrl;
    setCoverFile(null);
    setCoverUrl(null);
    const idTimeout = window.setTimeout(() => {
      setPendingDelete({ active: false, prevUrl: null, timeoutId: null });
    }, 5000);
    setPendingDelete({ active: true, prevUrl: prev, timeoutId: idTimeout });

    addToast({
      message: "Cover cleared.",
      actionLabel: "Undo",
      duration: 5000,
      onAction: () => handleUndoClearCover(),
    });
  };

  const handleUndoClearCover = () => {
    if (pendingDelete?.timeoutId) {
      clearTimeout(pendingDelete.timeoutId);
    }
    setCoverUrl(pendingDelete.prevUrl || null);
    setPendingDelete({ active: false, prevUrl: null, timeoutId: null });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      addToast({ message: "Title is required", duration: 3000 });
      return;
    }

    if (!location) {
      addToast({
        message: "Please select a location on the map",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);
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
        cover_path: uploadedPath || null,
        location,
      };

      const res = await apiFetch("/api/partner/spots", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (res?.success) {
        addToast({ message: "Location created successfully", duration: 3000 });
        router.push("/partner/locations");
      } else {
        addToast({
          message: res?.error || "Failed to create location",
          duration: 3000,
        });
      }
    } catch (err) {
      console.error(err);
      addToast({ message: "Error creating location", duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/partner/locations">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create New Location</h1>
            <p className="text-gray-600 mt-1">
              Add a new spot to your portfolio
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/partner/locations")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || uploading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Creating..." : "Create Location"}
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCoverFile(file);
                      // Create preview
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setCoverUrl(e.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <p className="text-sm text-gray-600">
                    {coverFile
                      ? `Selected: ${coverFile.name}`
                      : "Click to upload a cover image"}
                  </p>
                  {uploading && (
                    <p className="text-xs text-blue-600 mt-1">Uploading...</p>
                  )}
                </label>
              </div>

              {coverUrl && (
                <Button
                  variant="destructive"
                  onClick={handleClearCover}
                  className="w-full"
                >
                  Remove Cover
                </Button>
              )}
            </div>
          </Card>

          {/* Location Map */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location *
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Click on the map to set the exact location
            </p>
            {!location && (
              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Location is required to create a spot
                </p>
              </div>
            )}
            <div className="h-80 rounded-lg overflow-hidden border border-gray-300">
              <MapPicker
                initial={[104.8855, 11.5564]}
                onChange={(point) => setLocation(point)}
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
                  Publish after creation
                </label>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    published
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {published ? "Will publish" : "Draft"}
                </span>
              </div>
            </div>
          </Card>

          {/* Tips */}
          <Card className="p-6 bg-blue-50 border border-blue-200">
            <h3 className="font-semibold text-sm text-blue-900 mb-2">
              💡 Tips for success
            </h3>
            <ul className="text-xs text-blue-800 space-y-2">
              <li>✓ Use a descriptive title</li>
              <li>✓ Add a high-quality cover image</li>
              <li>✓ Set the precise location on map</li>
              <li>✓ Write a detailed description</li>
              <li>✓ Add relevant tags</li>
              <li>✓ Set price level if applicable</li>
            </ul>
          </Card>

          {/* Progress */}
          <Card className="p-6 bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-900 mb-3">
              Completion Checklist
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    title ? "bg-green-500 text-white" : "bg-gray-300"
                  }`}
                >
                  {title ? "✓" : ""}
                </span>
                <span className={title ? "text-green-700" : "text-gray-600"}>
                  Title
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    location ? "bg-green-500 text-white" : "bg-gray-300"
                  }`}
                >
                  {location ? "✓" : ""}
                </span>
                <span className={location ? "text-green-700" : "text-gray-600"}>
                  Location
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                    description ? "bg-green-500 text-white" : "bg-gray-300"
                  }`}
                >
                  {description ? "✓" : ""}
                </span>
                <span
                  className={description ? "text-green-700" : "text-gray-600"}
                >
                  Description
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
