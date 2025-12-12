"use client";

import { X, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface ExploreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    title: string;
    location: string;
    price: string;
    rating: number;
    reviews: number;
    description: string;
    images: string[];
    category: string;
  } | null;
}

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/50 hover:bg-white p-2 rounded-full transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5 text-gray-800" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="p-4 md:p-6 grid grid-rows-2 gap-4 h-full min-h-[400px]">
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden row-span-1 h-64 md:h-auto">
              <Image 
                src={data.images[0]} 
                alt={data.title} 
                fill 
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Secondary Images */}
            <div className="grid grid-cols-2 gap-4 row-span-1">
              {data.images.slice(1, 3).map((img, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden h-40 md:h-auto">
                  <Image 
                    src={img} 
                    alt={`${data.title} ${idx + 2}`} 
                    fill 
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 md:py-10 md:pr-10 flex flex-col h-full">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold mb-3">
                {data.category}
              </span>
              <h2 className="text-3xl font-bold font-serif text-gray-900 mb-2">{data.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                   <MapPin className="w-4 h-4 text-gray-400" />
                   {data.location}
                </div>
                <div className="flex items-center gap-1">
                   <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                   <span className="text-gray-900 font-medium">{data.rating}</span> 
                   <span>({data.reviews} reviews)</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-6">
                {data.price} <span className="text-sm font-normal text-gray-500">/ per person</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mb-8">
              <h3 className="font-bold text-lg mb-3">About this place</h3>
              <p className="text-gray-600 leading-relaxed">
                {data.description}
              </p>
            </div>

            <div className="border-t pt-6 mt-auto">
              <button className="w-full bg-gray-900 text-white font-medium py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                Book now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
