import { Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function ExploreHero() {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden mb-8 shadow-2xl">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=2606&auto=format&fit=crop"
        alt="Hero Background"
        fill
        className="object-cover"
        priority
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
        <h2 className="text-white text-lg md:text-xl font-medium mb-2 tracking-wide font-serif shadow-sm">
          Find Your Local Escape
        </h2>
        <h1 className="text-white text-4xl md:text-6xl font-bold font-serif mb-10 tracking-tight drop-shadow-lg">
          Discover Cambodia Like a Local
        </h1>

        {/* Search Bar Container */}
        <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 pr-2.5 flex flex-col md:flex-row items-center shadow-xl max-w-5xl w-full mx-auto animate-fade-in-up transition-all hover:shadow-2xl hover:bg-white text-gray-800">
          
          {/* Where */}
          <div className="flex-1 w-full md:w-[28%] px-6 py-3 md:py-2 border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 rounded-full transition-colors cursor-pointer text-left">
            <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">Where</div>
            <div className="text-sm text-gray-500 truncate">Cities & Provinces</div>
          </div>

          {/* Visit Date */}
          <div className="flex-1 w-full md:w-[24%] px-6 py-3 md:py-2 border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 rounded-full transition-colors cursor-pointer text-left">
            <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">Visit Date</div>
            <div className="text-sm text-gray-500 truncate">Add dates</div>
          </div>

          {/* Group Size */}
          <div className="flex-1 w-full md:w-[24%] px-6 py-3 md:py-2 border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 rounded-full transition-colors cursor-pointer text-left">
            <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">Guests</div>
            <div className="text-sm text-gray-500 truncate">Group Size</div>
          </div>

           {/* Category */}
           <div className="flex-1 w-full md:w-[24%] px-6 py-3 md:py-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer text-left relative">
            <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-0.5">Category</div>
            <div className="text-sm text-gray-500 truncate">Café, Nature...</div>
          </div>

          {/* Search Button */}
          <Button 
            size="icon" 
            className="rounded-full w-12 h-12 bg-[#D4AF37] hover:bg-[#C5A028] text-white shrink-0 mt-2 md:mt-0 shadow-md transition-transform active:scale-95 ml-2"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
