"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface PublicItinerary {
  id: string;
  title: string;
  description?: string;
  itinerary: any;
  created_at: string;
}

export default function PublicItineraryPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const [itinerary, setItinerary] = useState<PublicItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/public/itineraries/${token}`);
        const json = await res.json();
        if (json?.itinerary) setItinerary(json.itinerary);
        else if (json?.error) {
          alert(json.error);
          router.push("/");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load shared itinerary");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, router]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!itinerary) return <p className="p-6">Shared itinerary not found.</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{itinerary.title}</h1>
          <p className="text-sm text-gray-500">
            Created {formatDate(itinerary.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <p className="text-gray-700">{itinerary.description}</p>

        <div className="space-y-3">
          {(itinerary.itinerary?.stops || []).map((stop: any) => (
            <div key={stop.order} className="p-3 border rounded-md">
              <div className="flex justify-between">
                <h3 className="font-semibold">{stop.title}</h3>
                <span className="text-sm text-gray-500">{stop.start_time}</span>
              </div>
              {stop.description && (
                <p className="text-sm text-gray-600 mt-1">{stop.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
