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
        <div className="text-center py-12">
          <p className="text-gray-500">Your bucket list is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
