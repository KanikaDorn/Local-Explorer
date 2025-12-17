"use client";

import { useState } from "react";
import Link from "next/link";
import { ExploreCard } from "./ExploreCard";
import { ExploreDetailModal } from "./ExploreDetailModal";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

// Data Definition - Using local Cambodia images
const PHNOM_PENH_DESTINATIONS = [
  {
    id: "royal-palace",
    title: "Royal Palace",
    category: "Historical Landmark",
    location: "Phnom Penh, Cambodia",
    price: "៛40,000",
    rating: 4.8,
    reviews: 3240,
    description: "A complex of buildings which serves as the royal residence of the King of Cambodia. The Kings of Cambodia have occupied it since it was built in the 1860s, with a period of absence when the country came into turmoil during and after the reign of the Khmer Rouge. The palace was constructed after King Norodom relocated the royal capital from Oudong to Phnom Penh in the mid-19th century.",
    images: [
      "/The-6-Best-Things-to-do-in-Phnom-Penh-Royal-Palace.jpg",
      "/National Museum of Cambodia.jpg",
      "/Phnom-Penh.jpeg"
    ]
  },
  {
    id: "wat-phnom",
    title: "Wat Phnom",
    category: "Temple & Culture",
    location: "Phnom Penh, Cambodia",
    price: "៛4,000",
    rating: 4.5,
    reviews: 1890,
    description: "Wat Phnom is a Buddhist temple (wat) that is the tallest religious structure in the city. It is located on a hill 27 meters high. Legend relates that Daun Penh, a wealthy widow, found four bronze statues of the Buddha in a hollow Log floating in the river. She had a small shrine built on an artificial hill made by the people living in the village to protect the sacred statues.",
    images: [
      "/phnom-penh-temple-coffee.jpg",
      "/National Museum of Cambodia.jpg",
      "/Copy-of-DSC_3984-Edit.jpg"
    ]
  },
  {
    id: "russian-market",
    title: "Russian Market",
    category: "Shopping & Food",
    location: "Phnom Penh, Cambodia",
    price: "Free Entry",
    rating: 4.4,
    reviews: 2100,
    description: "Phsar Tuol Tom Poung, also known as the Russian Market, is the most popular market among tourists and expats and arguably the best place to pick up souvenirs. You'll find everything from clothing, souvenirs, artifacts, and antiques to traditional handicrafts. The food area is also a must-visit for authentic local street food.",
    images: [
      "/Riverside Night Market.jpeg",
      "/vietnamese-restaurant-in-phnom-penh-1.jpg",
      "/Emily-Lush-coffee-breakfast-phnom-penh-artillery-2.jpg"
    ]
  },
  {
    id: "riverside",
    title: "Sisowath Quay",
    category: "City Walk",
    location: "Phnom Penh, Cambodia",
    price: "Free",
    rating: 4.6,
    reviews: 4500,
    description: "Sisowath Quay is a 3-kilometer strip along the intersection of the Mekong and Tonle Sap rivers. It is the most popular area in the city for tourists and locals alike, lined with hotels, restaurants, bars, and cafes. In the evening, the riverside comes alive with people exercising, walking, and enjoying the breeze.",
    images: [
      "/Phnom-Penh.jpeg",
      "/Cafe Lotus.jpg",
      "/Brown-coffee-Phnom-Penh.jpg"
    ]
  }
];

export const ExploreSection = () => {
  const [selectedDestination, setSelectedDestination] = useState<typeof PHNOM_PENH_DESTINATIONS[0] | null>(null);

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex justify-between items-end mb-8">
        <div>
           <h2 className="text-3xl font-bold font-serif text-gray-900">Explore Phnom Penh</h2>
           <p className="mt-2 text-gray-500 max-w-xl">
             From royal heritage to bustling markets, discover the heart of Cambodia.
             Find the best spots, hidden gems, and local favorites.
           </p>
        </div>
        <div className="hidden md:block">
          <Link href="/explore">
            <Button variant="outline" className="rounded-full border-gray-300">
              View all locations <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {PHNOM_PENH_DESTINATIONS.map((dest) => (
           <ExploreCard
             key={dest.id}
             image={dest.images[0]}
             title={dest.title}
             location={dest.location}
             category={dest.category}
             description={dest.description}
             onClick={() => setSelectedDestination(dest)}
           />
         ))}
      </div>

      <ExploreDetailModal 
        isOpen={!!selectedDestination}
        onClose={() => setSelectedDestination(null)}
        data={selectedDestination ? {
          id: selectedDestination.id,
          title: selectedDestination.title,
          location: selectedDestination.location,
          category: selectedDestination.category,
          description: selectedDestination.description,
          image: selectedDestination.images[0],
        } : null}
      />
    </section>
  );
};
