"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getBucketList,
  removeFromBucketList,
  clearBucketList,
} from "@/lib/bucketList";
import { getCurrentUser } from "@/lib/auth";
import { SpotCard } from "@/components/SpotCard";
import { Button } from "@/components/ui/button";
import { Spot } from "@/lib/types";

export default function BucketListPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUserAndFetchBucketList = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }

        setUser(currentUser);
        const data = await getBucketList(currentUser.id);
        setItems(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndFetchBucketList();
  }, [router]);

  const handleRemove = async (spotId: string) => {
    try {
      if (!user) return;
      await removeFromBucketList(user.id, spotId);
      setItems(items.filter((item) => item.spot_id !== spotId));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleClear = async () => {
    if (confirm("Are you sure you want to clear your entire bucket list?")) {
      try {
        if (!user) return;
        await clearBucketList(user.id);
        setItems([]);
      } catch (error) {
        console.error("Error clearing bucket list:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Bucket List</h1>
        {items.length > 0 && (
          <Button onClick={handleClear} variant="destructive">
            Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-3xl mb-12">
          <p className="text-gray-500">Your bucket list is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {items.map((item) => (
            <div key={item.id}>
              <SpotCard
                spot={item.spots as Spot}
                onAddToList={() => handleRemove(item.spot_id)}
                isInList={true}
              />
            </div>
          ))}
        </div>
      )}

      {/* My Travel Plans Section */}
      <h2 className="text-3xl font-bold mb-8">My Travel Plans</h2>
      <SavedItinerariesList profileId={user?.id} />

    </div>
  );
}

import { getItineraries } from "@/lib/itineraries";
import { Itinerary } from "@/lib/types";
import { Calendar, MapPin as MapIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

function SavedItinerariesList({ profileId }: { profileId: string }) {
  const [plans, setPlans] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) return;
    const fetchPlans = async () => {
        try {
            const data = await getItineraries(profileId);
            setPlans(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchPlans();
  }, [profileId]);

  if (loading) return <div className="text-gray-500">Loading plans...</div>;

  if (plans.length === 0) {
      return (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <p className="text-gray-500 mb-4">You haven't generated any travel plans yet.</p>
             <Link href="/generate-plan">
                <Button>Create a Plan with AI</Button>
             </Link>
          </div>
      );
  }

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
              <Link href={`/plans/${plan.id}`} key={plan.id} className="group">
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                              {plan.itinerary?.theme || "Trip"}
                          </span>
                      </div>
                      <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {plan.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                          {plan.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                         <div className="flex items-center gap-2 text-xs text-gray-400">
                             <Calendar className="h-3 w-3" />
                             {new Date(plan.created_at).toLocaleDateString()}
                         </div>
                         <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                             View Plan <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                         </div>
                      </div>
                  </div>
              </Link>
          ))}
      </div>
  )
}
