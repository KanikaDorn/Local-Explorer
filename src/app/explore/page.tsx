"use client";

import { useEffect, useState } from "react";
import { SpotCard } from "@/components/SpotCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterPanel } from "@/components/FilterPanel";
import { getSpots, searchSpots } from "@/lib/spots";
import { Spot } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function ExplorePage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<{
    category?: string;
    tags?: string[];
  }>({});

  const categories = [
    "cafe",
    "restaurant",
    "bar",
    "museum",
    "temple",
    "shopping",
    "outdoor",
  ];

  useEffect(() => {
    const fetchSpots = async () => {
      setIsLoading(true);
      try {
        const data = await getSpots(100, 0, filters);
        setSpots(data);
      } catch (error) {
        console.error("Error fetching spots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpots();
  }, [filters]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    try {
      if (query) {
        const data = await searchSpots(query, 50);
        setSpots(data);
      } else {
        const data = await getSpots(100, 0, filters);
        setSpots(data);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-6">Explore Phnom Penh</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <FilterPanel categories={categories} onFilterChange={setFilters} />
        </div>

        {/* Spots Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-500">Loading spots...</p>
            </div>
          ) : spots.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96">
              <p className="text-gray-500 mb-4">No spots found</p>
              <Button onClick={() => handleSearch("")}>Clear Search</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
