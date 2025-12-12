import Image from "next/image";
import { Star, MapPin } from "lucide-react";

interface ExploreCardProps {
  title: string;
  location: string;
  price: string;
  rating: number;
  reviews: number;
  image: string;
  onClick: () => void;
}

export const ExploreCard = ({ title, location, price, rating, reviews, image, onClick }: ExploreCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer flex flex-col gap-3 p-2 rounded-3xl hover:bg-gray-50 transition-colors"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <Image 
          src={image} 
          alt={title} 
          fill 
          className="object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        {/* Like/Heart Button (Top Right) - Optional, could add later */}
        
        {/* Floating Action/Arrow Button (Bottom Right of Image) */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-90 group-hover:opacity-100 transition-opacity">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
      </div>

      {/* Content */}
      <div className="px-1 space-y-1">
        <div className="flex justify-between items-start">
           <h3 className="font-bold text-gray-900 text-[15px] leading-tight truncate pr-4">{title}</h3>
           <div className="flex items-center gap-1 shrink-0">
             <Star className="w-3.5 h-3.5 fill-black text-black" />
             <span className="text-sm font-medium">{rating}</span>
           </div>
        </div>
        
        <p className="text-sm text-gray-500 truncate">{location}</p>
        
        <div className="flex items-center gap-2 mt-0.5">
           <span className="font-semibold text-gray-900 text-sm">{price}</span>
           <span className="text-gray-500 text-xs">night</span>
        </div>
      </div>
    </div>
  );
};
