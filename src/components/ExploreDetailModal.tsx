"use client";

import { X, MapPin } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface ExploreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    title: string;
    location: string;
    category: string;
    description: string;
    image: string;
    address?: string;
  } | null;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  cafe: { bg: "bg-amber-100", text: "text-amber-700" },
  relax: { bg: "bg-emerald-100", text: "text-emerald-700" },
  culture: { bg: "bg-purple-100", text: "text-purple-700" },
};

export const ExploreDetailModal = ({ isOpen, onClose, data }: ExploreDetailModalProps) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const colors = categoryColors[data.category] || { bg: "bg-gray-100", text: "text-gray-700" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-colors backdrop-blur-md shadow-md"
        >
          <X className="w-5 h-5 text-gray-800" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto md:min-h-[450px]">
            <Image 
              src={data.image} 
              alt={data.title} 
              fill 
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
            {/* Category Badge */}
            <span className={`inline-block self-start px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${colors.bg} ${colors.text}`}>
              {data.category.charAt(0).toUpperCase() + data.category.slice(1)}
            </span>
            
            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-gray-900 mb-4">
              {data.title}
            </h2>
            
            {/* Location */}
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm font-medium">{data.location}</span>
            </div>
            
            {/* Address */}
            {data.address && (
              <p className="text-sm text-gray-400 mb-6 pl-6">
                {data.address}
              </p>
            )}

            {/* Description */}
            <div className="flex-1 overflow-y-auto mt-4">
              <h3 className="font-bold text-lg mb-3 text-gray-800">About this place</h3>
              <p className="text-gray-600 leading-relaxed">
                {data.description}
              </p>
            </div>

            {/* Action Button */}
            <div className="border-t border-gray-100 pt-6 mt-6">
              <button 
                onClick={onClose}
                className="w-full bg-[#D4AF37] text-white font-medium py-3.5 rounded-xl hover:bg-[#C5A028] transition-colors shadow-lg shadow-[#D4AF37]/20"
              >
                Add to Bucket List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
