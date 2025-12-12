import { Button } from "@/components/ui/button";
import { HeroCollage } from "@/components/HeroCollage";
import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import { ExploreSection } from "@/components/ExploreSection";

export default function Home() {
  /* Removed topDestinations */

  const latestStories = [
    { title: "10 Hidden Cafes in Phnom Penh", category: "Food & Drink", image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800" },
    { title: "Best Hotels with Points", category: "Hotels", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800" },
    { title: "Budget Guide to Kampot", category: "Travel Budget", image: "https://images.unsplash.com/photo-1534008897995-27a23e859048?auto=format&fit=crop&w=800" },
    { title: "Night Market Street Food", category: "Culture", image: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800" },
    { title: "Temple Guide 101", category: "History", image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800" },
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
                    <Image src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800" alt="Food" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                 </div>
                 <div className="text-orange-500 text-xs font-semibold mb-2">Food and Drink</div>
                 <h3 className="font-bold text-xl mb-2 group-hover:text-orange-600 transition-colors">Los Angeles food & drink guide: 10 things to try</h3>
                 <p className="text-gray-500 text-sm line-clamp-3">
                   Discover the best foodie spots in LA, from street tacos to high-end dining experiences that will leave you wanting more.
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

       {/* Trekker's Highlights (Reviews) - Minimal version based on image */}
       <section className="bg-white pb-16">
          <div className="max-w-7xl mx-auto px-4">
             <h2 className="text-3xl font-bold font-serif mb-8">Trekker&apos;s Highlights</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-50 rounded-3xl p-8">
                <div>
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-300 relative overflow-hidden">
                          <Image src="https://i.pravatar.cc/150?img=32" alt="Avatar" fill className="object-cover" />
                      </div>
                      <div>
                         <div className="font-bold">Maria Angelica</div>
                         <div className="text-xs text-orange-500">Travel Enthusiast</div>
                      </div>
                   </div>
                   <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                   </div>
                   <h3 className="font-bold text-lg mb-2">An Unforgettable Journey Through Turkey</h3>
                   <p className="text-gray-600 text-sm leading-relaxed">
                      &quot;Absolutely loved the experience! The guide was knowledgeable and the spots we visited were breathtaking. 
                      Cappadocia hot air balloon ride was the highlight of my year. Highly recommend using Globe Trekker for planning.&quot;
                   </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="rounded-2xl overflow-hidden aspect-square relative">
                      <Image src="https://images.unsplash.com/photo-1545152846-5baae6748530?auto=format&fit=crop&w=500" alt="Turkey 1" fill className="object-cover" />
                   </div>
                    <div className="rounded-2xl overflow-hidden aspect-square relative">
                      <Image src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=500" alt="Turkey 2" fill className="object-cover" />
                   </div>
                </div>
             </div>
          </div>
       </section>

      {/* Newsletter Section - Full Width Image */}
      <section className="relative h-[400px] flex items-center justify-center text-center text-white">
         <Image src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000" alt="Newsletter" fill className="object-cover brightness-50" />
         <div className="relative z-10 max-w-2xl px-4">
            <h2 className="text-4xl font-serif font-bold mb-4">Get Your Travel Inspiration Straight to Your Inbox</h2>
            <p className="mb-8 text-gray-200">Join our community of over 50,000 travelers and get exclusive tips and deals.</p>
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
