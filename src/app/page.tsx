import { Button } from "@/components/ui/button";
import { HeroCollage } from "@/components/HeroCollage";
import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import { ExploreSection } from "@/components/ExploreSection";

export default function Home() {
  /* Removed topDestinations */

  const latestStories = [
    { title: "10 Hidden Cafes in Phnom Penh", category: "Food & Drink", image: "/Brown-coffee-Phnom-Penh.jpg" },
    { title: "Best Boutique Hotels in Siem Reap", category: "Hotels", image: "/Copy-of-DSC_3984-Edit.jpg" },
    { title: "Budget Guide to Kampot Province", category: "Travel Budget", image: "/jeyakumaran-mayooresan-hxQ6jA1RV3s-unsplash-scaled-e1700055246433-1024x607.jpg" },
    { title: "Riverside Night Market Food Guide", category: "Culture", image: "/Riverside Night Market.jpeg" },
    { title: "Angkor Temple Complex Guide", category: "History", image: "/The-6-Best-Things-to-do-in-Phnom-Penh-Royal-Palace.jpg" },
  ];

  return (
    <div className="w-full bg-[#FFFAF0] min-h-screen text-gray-900">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 pt-8 pb-20">
        <HeroCollage />
      </section>

      {/* Explore Section (Replacing Top Destinations) */}
      <ExploreSection />

      {/* Latest Stories */}
      <section className="bg-white py-16 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-4">
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold font-serif">Latest Stories</h2>
              <Button variant="outline" className="rounded-full">Read more articles</Button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured Main Story */}
              <div className="lg:col-span-1 group cursor-pointer">
                 <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-4 relative">
                    <Image src="/Emily-Lush-coffee-breakfast-phnom-penh-artillery-2.jpg" alt="Cambodian Restaurant" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                 </div>
                 <div className="text-orange-500 text-xs font-semibold mb-2">Food and Drink</div>
                 <h3 className="font-bold text-xl mb-2 group-hover:text-orange-600 transition-colors">Phnom Penh Food & Drink Guide: 10 Must-Try Dishes</h3>
                 <p className="text-gray-500 text-sm line-clamp-3">
                   Discover the best Cambodian cuisine from street food at the night markets to authentic Khmer restaurants along the Mekong riverside.
                 </p>
              </div>

              {/* List of other stories */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 {latestStories.map((story, i) => (
                    <div key={i} className="flex gap-4 items-start group cursor-pointer">
                       <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                          <Image src={story.image} alt={story.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                       </div>
                       <div>
                          <div className="text-blue-500 text-xs font-semibold mb-1">{story.category}</div>
                          <h4 className="font-bold text-sm mb-1 group-hover:text-blue-600 transition-colors leading-tight">{story.title}</h4>
                          <span className="text-xs text-gray-400">Aug 12, 2024 • 5 min read</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

       {/* Explorer's Highlights (Reviews) - Cambodia focused */}
       <section className="bg-white pb-16">
          <div className="max-w-7xl mx-auto px-4">
             <h2 className="text-3xl font-bold font-serif mb-8">Explorer&apos;s Highlights</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-3xl p-8">
                <div>
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-300 relative overflow-hidden">
                          <Image src="https://i.pravatar.cc/150?img=32" alt="Avatar" fill className="object-cover" />
                      </div>
                      <div>
                         <div className="font-bold">Sophea Chann</div>
                         <div className="text-xs text-orange-500">Cambodia Explorer</div>
                      </div>
                   </div>
                   <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                   </div>
                   <h3 className="font-bold text-lg mb-2">An Unforgettable Journey Through Cambodia</h3>
                   <p className="text-gray-600 text-sm leading-relaxed">
                      &quot;Local Explorer helped me discover the real Cambodia! From sunrise at Angkor Wat to hidden coffee shops in Phnom Penh, 
                      every recommendation was perfect. The riverside night markets were absolutely magical. Highly recommend!&quot;
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="rounded-2xl overflow-hidden aspect-square relative">
                      <Image src="/phnom-penh-temple-coffee.jpg" alt="Phnom Penh Temple Coffee" fill className="object-cover" />
                   </div>
                    <div className="rounded-2xl overflow-hidden aspect-square relative">
                      <Image src="/vietnamese-restaurant-in-phnom-penh-1.jpg" alt="Restaurant in Phnom Penh" fill className="object-cover" />
                   </div>
                </div>
             </div>
          </div>
       </section>

      {/* Newsletter Section - Full Width Image */}
      <section className="relative h-[400px] flex items-center justify-center text-center text-white">
         <Image src="/Phnom-Penh.jpeg" alt="Phnom Penh Cambodia" fill className="object-cover brightness-50" />
         <div className="relative z-10 max-w-2xl px-4">
            <h2 className="text-4xl font-serif font-bold mb-4">Discover Cambodia&apos;s Best Kept Secrets</h2>
            <p className="mb-8 text-gray-200">Join our community of Cambodia explorers and get exclusive tips on hidden gems and local experiences.</p>
            <div className="flex flex-col sm:flex-row gap-3 bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/20">
               <input type="email" placeholder="Enter your email address" className="bg-transparent border-none text-white placeholder-gray-300 focus:ring-0 px-4 py-2 flex-1 outline-none" />
               <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-full font-medium transition-colors">
                  Subscribe
               </button>
            </div>
         </div>
      </section>

    </div>
  );
}
