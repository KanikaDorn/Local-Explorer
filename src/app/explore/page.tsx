"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ExploreHero } from "@/components/ExploreHero";
import { CategoryBar } from "@/components/CategoryBar";
import { ExploreCard } from "@/components/ExploreCard";
import { ExploreDetailModal } from "@/components/ExploreDetailModal";

// Unified explore spots data with local Cambodia images
const EXPLORE_SPOTS = [
  // Cafes
  {
    id: "khema-cafe",
    title: "Khéma Café – BKK1",
    category: "cafe",
    location: "Phnom Penh, Cambodia",
    description: "An upscale French-Khmer café offering artisan coffee, fresh pastries, and a refined atmosphere in the heart of BKK1.",
    image: "/Brown-coffee-Phnom-Penh.jpg",
    address: "No. 44, Street 57, BKK1, Phnom Penh"
  },
  {
    id: "brown-coffee",
    title: "Brown Coffee – Riverside",
    category: "cafe",
    location: "Phnom Penh, Cambodia",
    description: "Cambodia's beloved coffee chain with river views, serving signature iced lattes and fresh brews in a modern setting.",
    image: "/Emily-Lush-coffee-breakfast-phnom-penh-artillery-2.jpg",
    address: "Sisowath Quay, Phnom Penh"
  },
  {
    id: "cafe-lotus",
    title: "Café Lotus",
    category: "cafe",
    location: "Phnom Penh, Cambodia",
    description: "A cozy café near the National Museum, perfect for post-temple relaxation with traditional Khmer coffee blends.",
    image: "/Cafe Lotus.jpg",
    address: "Near National Museum, Phnom Penh"
  },
  {
    id: "factory-cafe",
    title: "Factory Café – Chak Angre",
    category: "cafe",
    location: "Phnom Penh, Cambodia",
    description: "Industrial-chic café with exposed brick, artisan roasts, and a menu of creative beverages and light bites.",
    image: "/phnom-penh-temple-coffee.jpg",
    address: "Chak Angre, Phnom Penh"
  },
  // Relax
  {
    id: "riverside-walk",
    title: "Sisowath Quay Riverside",
    category: "relax",
    location: "Phnom Penh, Cambodia",
    description: "A scenic 3km riverfront promenade along the Tonle Sap and Mekong rivers, perfect for evening strolls and sunset views.",
    image: "/Phnom-Penh.jpeg",
    address: "Sisowath Quay, Phnom Penh"
  },
  {
    id: "night-market",
    title: "Riverside Night Market",
    category: "relax",
    location: "Phnom Penh, Cambodia",
    description: "A vibrant evening market with street food stalls, local crafts, and live entertainment along the riverfront.",
    image: "/Riverside Night Market.jpeg",
    address: "Sisowath Quay, Phnom Penh"
  },
  {
    id: "kampot-salt-fields",
    title: "Kampot Salt Fields",
    category: "relax",
    location: "Kampot, Cambodia",
    description: "Peaceful salt flats stretching to the horizon, offering stunning sunset photography and a glimpse into traditional salt harvesting.",
    image: "/jeyakumaran-mayooresan-hxQ6jA1RV3s-unsplash-scaled-e1700055246433-1024x607.jpg",
    address: "Kampot Province"
  },
  {
    id: "food-experience",
    title: "Local Khmer Dining",
    category: "relax",
    location: "Phnom Penh, Cambodia",
    description: "Experience authentic Cambodian cuisine with fresh river fish, amok curry, and local delicacies in a relaxed setting.",
    image: "/grilled-tonle-sap-fish-siem-reap-fine-dining.jpg",
    address: "Various locations in Phnom Penh"
  },
  // Culture
  {
    id: "royal-palace",
    title: "Royal Palace Complex",
    category: "culture",
    location: "Phnom Penh, Cambodia",
    description: "The stunning royal residence featuring the Silver Pagoda, Throne Hall, and beautiful Khmer architecture dating back to the 1860s.",
    image: "/The-6-Best-Things-to-do-in-Phnom-Penh-Royal-Palace.jpg",
    address: "Samdach Sothearos Blvd, Phnom Penh"
  },
  {
    id: "national-museum",
    title: "National Museum of Cambodia",
    category: "culture",
    location: "Phnom Penh, Cambodia",
    description: "Home to the world's largest collection of Khmer art, including sculptures, ceramics, and artifacts from Angkor-era temples.",
    image: "/National Museum of Cambodia.jpg",
    address: "Street 13, Phnom Penh"
  },
  {
    id: "wat-phnom",
    title: "Wat Phnom Temple",
    category: "culture",
    location: "Phnom Penh, Cambodia",
    description: "The legendary founding temple of Phnom Penh, set atop a 27-meter hill with peaceful gardens and resident elephants.",
    image: "/Copy-of-DSC_3984-Edit.jpg",
    address: "Norodom Boulevard, Phnom Penh"
  },
  {
    id: "khmer-cuisine",
    title: "Traditional Khmer Cuisine",
    category: "culture",
    location: "Cambodia",
    description: "Discover the rich flavors of Cambodian cooking – from fish amok to lok lak – that blend influences from Thailand, Vietnam, and India.",
    image: "/572-khmer-cuisine.jpg",
    address: "Various locations throughout Cambodia"
  },
];

interface SpotData {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  image: string;
  address?: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [selectedSpot, setSelectedSpot] = useState<SpotData | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push("/login?redirect=/explore");
      } else {
        setIsAuthenticated(true);
      }
      if (user) setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // Filter spots based on selected category
  const filteredSpots = category === "all" 
    ? EXPLORE_SPOTS 
    : EXPLORE_SPOTS.filter(spot => spot.category === category);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FDF8F3]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-[#D4AF37]/30 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-[#D4AF37]/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FDF8F3] pb-20 font-sans">
      
      {/* Container */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 pt-6">
        
        {/* Hero Section */}
        <ExploreHero />

        {/* Category Filter Bar */}
        <div className="sticky top-[64px] z-30 bg-[#FDF8F3]/95 backdrop-blur-sm pt-2 mb-6">
          <CategoryBar selectedCategory={category} onSelectCategory={setCategory} />
        </div>

        {/* Results Count */}
        <div className="max-w-[1400px] mx-auto mb-6">
          <p className="text-gray-500 text-sm">
            Showing <span className="font-semibold text-gray-900">{filteredSpots.length}</span> places
            {category !== "all" && (
              <span> in <span className="font-semibold text-[#D4AF37]">{category.charAt(0).toUpperCase() + category.slice(1)}</span></span>
            )}
          </p>
        </div>

        {/* Explore Cards Grid */}
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSpots.map(spot => (
              <ExploreCard 
                key={spot.id}
                title={spot.title}
                location={spot.location}
                category={spot.category}
                description={spot.description}
                image={spot.image}
                onClick={() => setSelectedSpot(spot)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredSpots.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No places found in this category.</p>
              <button 
                onClick={() => setCategory("all")}
                className="mt-4 text-[#D4AF37] font-medium hover:underline"
              >
                View all places
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <ExploreDetailModal 
        isOpen={!!selectedSpot}
        onClose={() => setSelectedSpot(null)}
        data={selectedSpot}
      />
    </div>
  );
}
