"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";

interface ExploreCardProps {
  title: string;
  location: string;
  category: string;
  description: string;
  image: string;
  onClick: () => void;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  cafe: { bg: "bg-amber-100", text: "text-amber-700" },
  relax: { bg: "bg-emerald-100", text: "text-emerald-700" },
  culture: { bg: "bg-purple-100", text: "text-purple-700" },
};

export const ExploreCard = ({ title, location, category, description, image, onClick }: ExploreCardProps) => {
  const colors = categoryColors[category] || { bg: "bg-gray-100", text: "text-gray-700" };
  
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#D4AF37]/30"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image 
          src={image} 
          alt={title} 
          fill 
          className="object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} backdrop-blur-sm`}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-1">
          {title}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
          {description}
        </p>
        
        <div className="flex items-center gap-1.5 text-gray-400 mt-1">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{location}</span>
        </div>
      </div>
    </div>
  );
};
