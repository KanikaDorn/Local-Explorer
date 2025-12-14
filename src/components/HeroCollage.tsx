import Image from "next/image";
import { MapPin } from "lucide-react";
import Link from "next/link";

export function HeroCollage() {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] grid grid-cols-12 grid-rows-6 gap-4 p-4">
      {/* Title Section placed within the collage area for mobile, or left side for desktop */}
      <div className="col-span-12 md:col-span-6 row-span-6 flex flex-col justify-center z-10 pr-8">
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-gray-900 leading-tight">
          Discover the World&apos;s <span className="text-orange-500 italic">Hidden</span> Wonders
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-md">
          Find unique locations and authentic experiences. From rare encounters to remarkable destinations, we help you uncover the spark that turns every trip into a cherished story.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
           <Link href="/signup">
             <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition-transform active:scale-95 shadow-lg shadow-orange-500/30 w-full sm:w-auto">
               Join as Explorer
             </button>
           </Link>
           <Link href="/partner/signup">
             <button className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 px-8 py-3 rounded-full font-medium transition-transform active:scale-95 shadow-sm w-full sm:w-auto">
               Join as Partner
             </button>
           </Link>
        </div>
      </div>

      {/* Image Grid */}
      {/* Large Image Top Right */}
      <div className="hidden md:block col-span-3 row-span-3 bg-gray-200 rounded-3xl overflow-hidden relative transform hover:scale-105 transition-transform duration-500">
         <Image src="https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1000&auto=format&fit=crop" alt="Temple" fill className="object-cover" />
         <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-md p-2 rounded-full z-10">
            <MapPin className="text-white h-4 w-4" />
         </div>
      </div>

      {/* Smaller Image Top Far Right */}
      <div className="hidden md:block col-span-3 row-span-2 bg-gray-200 rounded-3xl overflow-hidden relative mt-8 transform hover:scale-105 transition-transform duration-500">
         <Image src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop" alt="Nature" fill className="object-cover" />
      </div>

      {/* Long Image Bottom Middle */}
      <div className="hidden md:block col-span-2 row-span-3 bg-gray-200 rounded-full overflow-hidden relative transform hover:scale-105 transition-transform duration-500 border-4 border-white">
          <Image src="https://images.unsplash.com/photo-1528181304800-259b08848526?q=80&w=1000&auto=format&fit=crop" alt="Street" fill className="object-cover" />
      </div>

       {/* Wide Image Bottom Right */}
      <div className="hidden md:block col-span-4 row-span-3 bg-gray-200 rounded-3xl overflow-hidden relative transform hover:scale-105 transition-transform duration-500">
          <Image src="https://images.unsplash.com/photo-1505886971932-35a0d3bd3160?q=80&w=1000&auto=format&fit=crop" alt="Landscape" fill className="object-cover" />
      </div>
      
      {/* Decorative dashed lines could be SVGs here */}
    </div>
  );
}
