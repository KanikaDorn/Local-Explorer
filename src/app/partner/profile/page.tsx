"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiFetch from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PartnerProfile {
  id: string;
  company_name: string;
  vat_number?: string;
  contact_phone: string;
  contact_email: string;
  description?: string;
  website?: string;
  logo_url?: string;
  cover_url?: string;
  business_hours?: Record<string, string>;
}

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export default function PartnerProfile() {
  const router = useRouter();
  const { toast } = useToast();
  const addToast = ({ message }: { message: string; duration?: number }) => toast({ title: message });
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [formData, setFormData] = useState<Partial<PartnerProfile>>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiFetch("/api/partner/profile");
        if (res?.success) {
          setProfile(res.data);
          setFormData(res.data);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        addToast({
          message: "Failed to load profile",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [addToast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "logo") {
      setUploadingLogo(true);
    } else {
      setUploadingCover(true);
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);
      formDataToSend.append("type", type);

      const res = await apiFetch("/api/partner/profile/upload", {
        method: "POST",
        body: formDataToSend,
      });

      if (res?.success) {
        setFormData((prev) => ({
          ...prev,
          [type === "logo" ? "logo_url" : "cover_url"]: res.data.url,
        }));
        addToast({
          message: `${
            type === "logo" ? "Logo" : "Cover"
          } uploaded successfully`,
          duration: 3000,
        });
      } else {
        addToast({
          message: res?.error || "Failed to upload image",
          duration: 3000,
        });
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      addToast({
        message: "Error uploading image",
        duration: 3000,
      });
    } finally {
      if (type === "logo") {
        setUploadingLogo(false);
      } else {
        setUploadingCover(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await apiFetch("/api/partner/profile", {
        method: "PUT",
        body: JSON.stringify(formData),
      });

      if (res?.success) {
        setProfile(res.data);
        addToast({
          message: "Profile updated successfully",
          duration: 3000,
        });
      } else {
        addToast({
          message: res?.error || "Failed to update profile",
          duration: 3000,
        });
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      addToast({
        message: "Error saving profile",
        duration: 3000,
      });
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Business Profile</h1>
        <p className="text-gray-600">
          Manage your business information and public profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Cover Image */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Cover Image</h2>
          <div className="relative">
            {formData.cover_url ? (
              <img
                src={formData.cover_url}
                alt="Cover"
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No cover image</span>
              </div>
            )}
            <label className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-gray-50 transition flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">
                {uploadingCover ? "Uploading..." : "Change"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "cover")}
                disabled={uploadingCover}
                className="hidden"
              />
            </label>
          </div>
        </Card>

        {/* Logo & Basic Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          <div className="space-y-6">
            {/* Logo */}
            <div>
              <label className="block text-sm font-medium mb-4">
                Business Logo
              </label>
              <div className="flex items-center gap-6">
                {formData.logo_url ? (
                  <img
                    src={formData.logo_url}
                    alt="Logo"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No logo</span>
                  </div>
                )}
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "logo")}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Company Name *
              </label>
              <Input
                name="company_name"
                value={formData.company_name || ""}
                onChange={handleChange}
                placeholder="Your business name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Business Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Tell users about your business, what makes you special..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-2">
                {formData.description?.length || 0}/500 characters
              </p>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Phone *
              </label>
              <Input
                name="contact_phone"
                value={formData.contact_phone || ""}
                onChange={handleChange}
                placeholder="+855 XX XXX XXXX"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Email *
              </label>
              <Input
                name="contact_email"
                type="email"
                value={formData.contact_email || ""}
                onChange={handleChange}
                placeholder="business@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Website (Optional)
              </label>
              <Input
                name="website"
                type="url"
                value={formData.website || ""}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                VAT Number (Optional)
              </label>
              <Input
                name="vat_number"
                value={formData.vat_number || ""}
                onChange={handleChange}
                placeholder="Your VAT number"
              />
            </div>
          </div>
        </Card>

        {/* Business Hours */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Business Hours</h2>
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div key={day.key} className="grid grid-cols-3 items-center gap-4">
                <div className="font-medium text-gray-700">{day.label}</div>
                <div className="col-span-2">
                  <Input
                    placeholder="e.g. 09:00 - 17:00 or Closed"
                    value={formData.business_hours?.[day.key] || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        business_hours: {
                          ...prev.business_hours,
                          [day.key]: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Save Actions */}
        <Card className="p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              Required fields marked with *
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData(profile || {})}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}