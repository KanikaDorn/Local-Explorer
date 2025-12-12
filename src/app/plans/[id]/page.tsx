"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Itinerary } from "@/lib/types";
import { getItineraryById } from "@/lib/itineraries";
import apiFetch from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Clock, MapPin, Share2, Copy, ArrowLeft } from "lucide-react";

interface Props {
  params: { id: string };
}

export default function ItineraryPage({ params }: Props) {
  const { id } = params;
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getItineraryById(id);
        setItinerary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCreateShare = async () => {
    if (!confirm("Create a public share link for this itinerary?")) return;
    setCreating(true);
    try {
      const res = await apiFetch(`/api/itineraries/${id}/share`, {
        method: "POST",
      });
      if ((res as any)?.share?.url) {
        setShareUrl((res as any).share.url);
      } else if ((res as any)?.error) {
        alert((res as any).error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create share link");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard");
    } catch (err) {
      console.error(err);
      alert("Failed to copy");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!itinerary) return (
     <div className="flex flex-col gap-4 justify-center items-center h-[50vh]">
       <p>Itinerary not found.</p>
       <Button onClick={() => router.back()}>Go Back</Button>
     </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
             <ArrowLeft className="h-4 w-4 mr-2" /> Back to Plans
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                 {itinerary.title}
               </h1>
               <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                 <Clock className="h-4 w-4" />
                 Created {formatDate(itinerary.created_at)}
                 {itinerary.itinerary?.theme && (
                   <>
                     <span className="mx-2">•</span>
                     <span className="capitalize">{itinerary.itinerary.theme} Trip</span>
                   </>
                 )}
               </div>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="outline" onClick={handleCreateShare} disabled={creating} className="gap-2">
                 <Share2 className="h-4 w-4" /> 
                 {creating ? "Creating..." : "Share Plan"}
               </Button>
            </div>
          </div>
          
          {shareUrl && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 flex items-center justify-between gap-4">
              <div className="text-sm text-blue-800 dark:text-blue-300 truncate max-w-xl">
                 {shareUrl}
              </div>
              <Button size="sm" variant="ghost" onClick={handleCopy}>
                 <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
            </div>
          )}

           {itinerary.description && (
             <p className="mt-6 text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">
               {itinerary.description}
             </p>
           )}
        </div>

        {/* Timeline */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          
          {(itinerary.itinerary?.stops || []).map((stop: any, index: number) => (
            <div key={stop.order} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                
                {/* Icon Marker */}
                <div className="absolute top-0 left-0 md:left-1/2 flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 shadow shrink-0 md:-translate-x-1/2 z-10 text-blue-500">
                    <MapPin className="h-4 w-4" />
                </div>

                {/* Content Card */}
                <div className="ml-16 md:ml-0 md:w-[calc(50%-40px)] p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                   <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                         {stop.start_time}
                      </span>
                      {stop.category && (
                         <span className="text-xs text-gray-500 capitalize">{stop.category}</span>
                      )}
                   </div>
                   <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{stop.title}</h3>
                   {stop.description && (
                     <p className="text-gray-600 dark:text-gray-400 text-sm">{stop.description}</p>
                   )}
                   {stop.address && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                         <MapPin className="h-3 w-3" /> {stop.address}
                      </div>
                   )}
                </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
