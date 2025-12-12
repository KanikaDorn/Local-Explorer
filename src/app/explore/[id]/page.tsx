"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSpotById } from "@/lib/spots";
import { Spot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ArrowLeft, Share2, Heart } from "lucide-react";
import { Map } from "@/components/Map";
import { Badge } from "@/components/ui/badge";

export default function SpotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpot = async () => {
      if (!params?.id) return;
      setIsLoading(true);
      try {
        const data = await getSpotById(params.id as string);
        setSpot(data);
      } catch (error) {
        console.error("Error fetching spot:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpot();
  }, [params?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-gray-500">Spot not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen pb-20">
      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        {spot.cover_url ? (
          <img
            src={spot.cover_url}
            alt={spot.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
            <MapPin className="h-20 w-20 text-gray-400" />
          </div>
        )}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 backdrop-blur-md bg-white/50 hover:bg-white/80 dark:bg-black/50 dark:hover:bg-black/80"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-10">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
            <div className="flex-1">
               <div className="flex items-center gap-2 mb-2">
                 <Badge variant="secondary" className="capitalize">{spot.category}</Badge>
                 {spot.price_level && (
                    <span className="text-sm text-gray-500 font-medium">
                      {"$".repeat(spot.price_level)}
                    </span>
                 )}
               </div>
              <h1 className="text-3xl font-bold mb-2">{spot.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin className="h-4 w-4" />
                {spot.address}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" /> Share
              </Button>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Heart className="h-4 w-4" /> Save
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">About</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {spot.description}
                </p>
              </div>

              {spot.tags && spot.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {spot.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
               {spot.extra?.hours && (
                 <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="flex items-center gap-2 font-semibold mb-3">
                      <Clock className="h-4 w-4" /> Opening Hours
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {spot.extra.hours}
                    </p>
                 </div>
               )}

               <div className="h-48 rounded-lg overflow-hidden border">
                 <Map 
                   spots={[spot]} 
                   center={spot.location.coordinates}
                   zoom={15}
                 />
               </div>
               
               <Button className="w-full" variant="outline">
                 Get Directions
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
