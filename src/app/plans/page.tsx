"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Itinerary } from "@/lib/types";
import {
  getItineraries,
  deleteItinerary,
  duplicateItinerary,
} from "@/lib/itineraries";
import { getCurrentUser } from "@/lib/auth";
import { ItineraryCard } from "@/components/ItineraryCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PlansPage() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUserAndFetchItineraries = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }

        setUser(currentUser);

        // Fetch itineraries
        const data = await getItineraries(currentUser.id, 20);
        setItineraries(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAndFetchItineraries();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      try {
        await deleteItinerary(id);
        setItineraries(itineraries.filter((i) => i.id !== id));
      } catch (error) {
        console.error("Error deleting itinerary:", error);
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      if (!user) return;
      await duplicateItinerary(id, user.id);
      // Refresh list
      const data = await getItineraries(user.id, 20);
      setItineraries(data);
    } catch (error) {
      console.error("Error duplicating itinerary:", error);
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
        <h1 className="text-4xl font-bold">My Plans</h1>
        <Link href="/generate-plan">
          <Button>Generate New Plan</Button>
        </Link>
      </div>

      {itineraries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No plans yet. Start by generating your first plan!
          </p>
          <Link href="/generate-plan">
            <Button>Generate a Plan</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((itinerary) => (
            <ItineraryCard
              key={itinerary.id}
              itinerary={itinerary}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
