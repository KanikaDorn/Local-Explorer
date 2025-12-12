"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ExploreHero } from "@/components/ExploreHero";
import { CategoryBar } from "@/components/CategoryBar";
import { ExploreCard } from "@/components/ExploreCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
// import { getSpots } from "@/lib/spots"; 
import { Spot } from "@/lib/types";

// Mock Data for specific Cambodian sections
const PHNOM_PENH_CAFES = [
  {
    id: "khema-cafe",
    title: "Khema Café – BKK1",
    city: "Phnom Penh",
    price_level: 2, // $$
    price_text: "$3 / drink",
    rating: 4.9,
    reviews: 320,
    cover_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800"
  },
  {
    id: "brown-coffee",
    title: "Brown Coffee – Riverside",
    city: "Phnom Penh",
    price_level: 2,
    price_text: "$2.5 / drink",
    rating: 4.7,
    reviews: 512,
    cover_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800"
  },
  {
    id: "factory-cafe",
    title: "Factory Café – Chak Angre",
    city: "Phnom Penh",
    price_level: 2,
    price_text: "$2.5 / drink",
    rating: 4.8,
    reviews: 180,
    cover_url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800"
  },
  {
    id: "tini-cafe",
    title: "TINI Café – Toul Tom Poung",
    city: "Phnom Penh",
    price_level: 2,
    price_text: "$3 / drink",
    rating: 4.8,
    reviews: 210,
    cover_url: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800"
  },
];

const KAMPOT_RELAX = [
  {
    id: "river-park",
    title: "River Park Kampot",
    city: "Kampot",
    price_level: 2,
    price_text: "Entry $5",
    rating: 5.0,
    reviews: 89,
    cover_url: "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=800"
  },
  {
    id: "les-manguiers",
    title: "Les Manguiers Resort",
    city: "Kampot",
    price_level: 2,
    price_text: "Day Pass $7",
    rating: 4.9,
    reviews: 150,
    cover_url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800"
  },
  {
    id: "arcadia",
    title: "Arcadia Waterpark",
    city: "Kampot",
    price_level: 2,
    price_text: "Entry $5",
    rating: 4.7,
    reviews: 300,
    cover_url: "https://images.unsplash.com/photo-1533240332313-0da4d14774de?auto=format&fit=crop&w=800"
  },
  {
    id: "salt-fields",
    title: "Kampot Salt Fields Viewing Spot",
    city: "Kampot",
    price_level: 1,
    price_text: "Free",
    rating: 4.8,
    reviews: 120,
    cover_url: "https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?auto=format&fit=crop&w=800"
  },
];

const SIEM_REAP_CULTURE = [
  {
    id: "angkor-wat",
    title: "Angkor Wat Complex",
    city: "Siem Reap",
    price_level: 4,
    price_text: "Entry $37",
    rating: 5.0,
    reviews: 15000,
    cover_url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800"
  },
  {
    id: "national-museum",
    title: "Angkor National Museum",
    city: "Siem Reap",
    price_level: 3,
    price_text: "Entry $12",
    rating: 4.8,
    reviews: 850,
    cover_url: "https://images.unsplash.com/photo-1599813354224-4c55c0aae462?auto=format&fit=crop&w=800"
  },
  {
    id: "old-market",
    title: "Old Market & Night Market",
    city: "Siem Reap",
    price_level: 1,
    price_text: "Free",
    rating: 4.7,
    reviews: 2100,
    cover_url: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800"
  },
  {
    id: "wat-damnak",
    title: "Wat Damnak",
    city: "Siem Reap",
    price_level: 1,
    price_text: "Free",
    rating: 4.9,
    reviews: 320,
    cover_url: "https://images.unsplash.com/photo-1623140156943-7f7cd44923e3?auto=format&fit=crop&w=800"
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("Cafés");

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        // For development/preview, we might want to bypass or specific login
        // But per valid request, user must be logged in
        router.push("/login?redirect=/explore");
      } else {
        setIsAuthenticated(true);
      }
      if (user) setIsLoading(false); // Only set loading false if existing, else redirect happens
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FDFBF7] dark:bg-black">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-black pb-20 font-sans">
      
      {/* Container */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 pt-6">
        
        {/* Hero Section */}
        <ExploreHero />

        {/* Categories */}
        <div className="sticky top-[64px] z-30 bg-[#FDFBF7]/95 backdrop-blur-sm dark:bg-black/95 pt-2 mb-8 border-b border-gray-100 dark:border-gray-800">
            <CategoryBar selectedCategory={category} onSelectCategory={setCategory} />
        </div>

        {/* Content Sections */}
        <div className="space-y-16 max-w-[1600px] mx-auto">
          
          {/* Section 1: Phnom Penh Cafes */}
          <section>
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">⭐ Top-Rated Cafés in Phnom Penh</h3>
               <div className="flex gap-2">
                 <Button variant="outline" size="icon" className="rounded-full h-8 w-8 hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37]"><ChevronLeft className="h-4 w-4" /></Button>
                 <Button variant="outline" size="icon" className="rounded-full h-8 w-8 hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37]"><ChevronRight className="h-4 w-4" /></Button>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {PHNOM_PENH_CAFES.map(spot => (
                    <ExploreCard 
                      key={spot.id} 
                      title={spot.title}
                      location={spot.city}
                      price={spot.price_text}
                      rating={spot.rating}
                      reviews={spot.reviews}
                      image={spot.cover_url}
                      onClick={() => {}} 
                    />
                ))}
            </div>
          </section>

          {/* Section 2: Relaxing Places in Kampot */}
          <section>
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">🌿 Relaxing Places in Kampot</h3>
               <div className="flex gap-2">
                 <Button variant="outline" size="icon" className="rounded-full h-8 w-8 hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37]"><ChevronLeft className="h-4 w-4" /></Button>
                 <Button variant="outline" size="icon" className="rounded-full h-8 w-8 hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37]"><ChevronRight className="h-4 w-4" /></Button>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {KAMPOT_RELAX.map(spot => (
                    <ExploreCard 
                      key={spot.id} 
                      title={spot.title}
                      location={spot.city}
                      price={spot.price_text}
                      rating={spot.rating}
                      reviews={spot.reviews}
                      image={spot.cover_url}
                      onClick={() => {}}
                    />
                ))}
            </div>
          </section>

           {/* Section 3: Cultural & Heritage in Siem Reap */}
           <section>
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">🕌 Cultural & Heritage in Siem Reap</h3>
               <div className="flex gap-2">
                 <Button variant="outline" size="icon" className="rounded-full h-8 w-8 hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37]"><ChevronLeft className="h-4 w-4" /></Button>
                 <Button variant="outline" size="icon" className="rounded-full h-8 w-8 hover:bg-[#D4AF37] hover:text-white hover:border-[#D4AF37]"><ChevronRight className="h-4 w-4" /></Button>
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {SIEM_REAP_CULTURE.map(spot => (
                    <ExploreCard 
                       key={spot.id} 
                       title={spot.title}
                       location={spot.city}
                       price={spot.price_text}
                       rating={spot.rating}
                       reviews={spot.reviews}
                       image={spot.cover_url}
                       onClick={() => {}}
                    />
                ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
