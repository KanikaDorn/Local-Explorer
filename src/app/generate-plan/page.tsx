"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, MapPin, DollarSign, Calendar, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { createItinerary } from "@/lib/itineraries";
import { getCurrentUser, getUserProfile } from "@/lib/auth";
import { toast } from "@/hooks/use-toast"; // Assuming you have a toast hook

export default function GeneratePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    theme: "",
    budget: "",
    duration: 2,
    interests: [] as string[],
    party_size: "couple"
  });

  // Check authentication on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          // Redirect to login with a 'next' param to return here after login
          router.push("/login?next=/generate-plan");
          return;
        }
        setUser(currentUser);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login?next=/generate-plan");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const moodOptions = [
    { id: "relaxed", label: "Relaxed", emoji: "🧘" },
    { id: "adventure", label: "Adventure", emoji: "🧗" },
    { id: "cultural", label: "Cultural", emoji: "🏛️" },
    { id: "party", label: "Party", emoji: "🎉" },
    { id: "foodie", label: "Foodie", emoji: "🍜" },
    { id: "romantic", label: "Romantic", emoji: "💑" },
  ];

  const interestOptions = [
    "History", "Art", "Nature", "Shopping", "Photography", "Local Food", "Coffee", "Nightlife"
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const generateMockStops = (data: {
    theme: string;
    budget: string;
    duration: number;
    interests: string[];
  }) => {
    // Theme-specific activities database
    const themeActivities: Record<string, { titles: string[]; descriptions: string[] }> = {
      relaxed: {
        titles: [
          "Morning Yoga by the River",
          "Spa & Wellness Retreat",
          "Leisurely Café Brunch",
          "Sunset River Cruise",
          "Meditation at Wat Phnom",
          "Quiet Garden Walk"
        ],
        descriptions: [
          "Start your day with peaceful riverside yoga",
          "Pamper yourself at a luxury Cambodian spa",
          "Enjoy a slow-paced brunch at a local café",
          "Watch the sunset from a traditional boat",
          "Find inner peace at this historic temple",
          "Stroll through serene botanical gardens"
        ]
      },
      adventure: {
        titles: [
          "Cycling Tour of Hidden Streets",
          "Kayaking on Tonle Sap",
          "Rock Climbing Experience",
          "Motorbike City Explorer",
          "Zip-lining Adventure",
          "Night Safari Tour"
        ],
        descriptions: [
          "Discover secret alleyways and local neighborhoods",
          "Paddle through floating villages",
          "Challenge yourself on indoor climbing walls",
          "Feel the city breeze on a guided motorbike tour",
          "Soar through the jungle canopy",
          "Experience wildlife after dark"
        ]
      },
      cultural: {
        titles: [
          "Royal Palace Grand Tour",
          "National Museum Visit",
          "Traditional Apsara Dance Show",
          "Khmer Cooking Class",
          "Silk Weaving Workshop",
          "Temple Trail Walking Tour"
        ],
        descriptions: [
          "Explore the stunning royal residence and Silver Pagoda",
          "Discover ancient Khmer artifacts and sculptures",
          "Watch mesmerizing classical Cambodian dance",
          "Learn to prepare authentic Khmer dishes",
          "Create your own traditional silk piece",
          "Visit historic Buddhist temples and pagodas"
        ]
      },
      party: {
        titles: [
          "Rooftop Bar Hopping",
          "Live Music at Pontoon",
          "Riverside Night Market",
          "Cocktail Masterclass",
          "Pub Street Experience",
          "DJ Night at Epic Club"
        ],
        descriptions: [
          "Experience the best rooftop views with cocktails",
          "Dance to live bands at the famous floating club",
          "Food, drinks, and entertainment by the river",
          "Learn to craft Cambodian-inspired cocktails",
          "Enjoy the vibrant nightlife scene",
          "Party till dawn with international DJs"
        ]
      },
      foodie: {
        titles: [
          "Street Food Walking Tour",
          "Russian Market Food Hunt",
          "Fish Amok Cooking Class",
          "Coffee Plantation Visit",
          "Fine Dining at Malis",
          "Night Market Feast"
        ],
        descriptions: [
          "Taste authentic street food with a local guide",
          "Discover hidden food gems in the famous market",
          "Master Cambodia's signature dish",
          "Learn about Cambodian coffee culture",
          "Experience haute Cambodian cuisine",
          "Sample dozens of local delicacies"
        ]
      },
      romantic: {
        titles: [
          "Sunset Champagne Cruise",
          "Couples Spa Experience",
          "Candlelit Riverside Dinner",
          "Private Temple Tour",
          "Rooftop Stargazing",
          "Couples Cooking Class"
        ],
        descriptions: [
          "Float down the Mekong with champagne at sunset",
          "Relax together with traditional treatments",
          "Dine under the stars by the water",
          "Explore ancient temples with just the two of you",
          "Enjoy the night sky from a luxury rooftop",
          "Create a romantic meal together"
        ]
      }
    };

    // Budget-based price ranges
    const priceRanges: Record<string, string[]> = {
      low: ["Free", "$5-10", "$10-15", "Budget-friendly"],
      medium: ["$15-25", "$25-40", "$30-50", "Mid-range"],
      high: ["$50-80", "$80-120", "$100+", "Premium"]
    };

    // Interest-based enhancements
    const interestDescriptions: Record<string, string> = {
      "History": "with rich historical context",
      "Art": "featuring local artistic expressions",
      "Nature": "surrounded by natural beauty",
      "Shopping": "with opportunities to find unique souvenirs",
      "Photography": "at the most photogenic spots",
      "Local Food": "including authentic local cuisine",
      "Coffee": "paired with artisan coffee",
      "Nightlife": "extending into the evening hours"
    };

    const activities = themeActivities[data.theme] || themeActivities.cultural;
    const prices = priceRanges[data.budget] || priceRanges.medium;
    
    // Calculate stops based on duration (3-5 stops per day)
    const stopsPerDay = data.budget === "high" ? 3 : data.budget === "low" ? 5 : 4;
    const totalStops = Math.min(data.duration * stopsPerDay, activities.titles.length);
    
    const stops = [];
    const startHour = 8;
    
    for (let i = 0; i < totalStops; i++) {
      const dayNumber = Math.floor(i / stopsPerDay) + 1;
      const stopInDay = i % stopsPerDay;
      const hour = startHour + (stopInDay * 3);
      
      // Add interest-based enhancement to description
      let description = activities.descriptions[i % activities.descriptions.length];
      if (data.interests.length > 0) {
        const randomInterest = data.interests[i % data.interests.length];
        description += ` ${interestDescriptions[randomInterest] || ""}`;
      }
      
      stops.push({
        order: i + 1,
        spot_id: `spot_${data.theme}_${i}`,
        title: activities.titles[i % activities.titles.length],
        description: description.trim(),
        start_time: `${hour.toString().padStart(2, '0')}:00`,
        duration_minutes: data.budget === "high" ? 120 : data.budget === "low" ? 60 : 90,
        category: data.theme,
        address: "Phnom Penh City Center",
        day: dayNumber,
        estimated_cost: prices[i % prices.length]
      });
    }
    
    return stops;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const user = await getCurrentUser();
        if (!user) {
            router.push("/login");
            return;
        }

        const profile = await getUserProfile(user.id);
        const profileId = profile?.id || user.id;

        // Call the AI generation API
        const response = await fetch("/api/itineraries/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile_id: profileId,
            preferences: {
              theme: formData.theme,
              budget: formData.budget,
              duration: formData.duration,
              interests: formData.interests,
              party_size: formData.party_size
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate plan");
        }

        const result = await response.json();
        const newItinerary = result.itinerary;
        
        if (newItinerary?.id) {
             toast({
              title: "🎉 AI Plan Generated!",
              description: newItinerary.itinerary?.ai_generated 
                ? "Your personalized itinerary is ready!" 
                : "Your weekend is sorted. Redirecting...",
            });
            router.push(`/plans/${newItinerary.id}`);
        } else {
            // Fallback: save locally if API returns plan without DB save
            const localPlan = await createItinerary(
                profileId,
                result.title || `My ${formData.theme} Weekend`,
                result.description || `A ${formData.duration}-day ${formData.budget} budget itinerary.`,
                result
            );
            
            if (localPlan) {
              toast({
                title: "Plan Generated!",
                description: "Your weekend is sorted. Redirecting...",
              });
              router.push(`/plans/${localPlan.id}`);
            } else {
              toast({
                title: "Error",
                description: "Could not save plan. Please try again.",
                variant: "destructive"
              });
            }
        }

    } catch (error) {
        console.error("Generation error:", error);
         toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
            variant: "destructive"
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
             <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Plan your perfect weekend
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Tell us what you like, and our AI will curate a personalized itinerary for you.
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <CardContent className="p-8">
             <div className="space-y-8">
                
                {/* Theme/Mood */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-blue-500" /> What&apos;s your vibe?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {moodOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, theme: option.id })}
                        className={cn(
                          "flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all",
                          formData.theme === option.id
                            ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 ring-1 ring-blue-600"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        )}
                      >
                        <span>{option.emoji}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration & Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" /> Duration (Days)
                      </label>
                      <Input 
                        type="number" 
                        min={1} 
                        max={7}
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                        className="h-12 text-lg" 
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-500" /> Budget
                      </label>
                      <div className="flex rounded-lg shadow-sm">
                        {['Low', 'Medium', 'High'].map((lvl) => (
                           <button
                             key={lvl}
                             type="button"
                             onClick={() => setFormData({ ...formData, budget: lvl.toLowerCase() })}
                             className={cn(
                               "flex-1 py-3 text-sm font-medium border first:rounded-l-lg last:rounded-r-lg -ml-px first:ml-0 transition-colors focus:z-10",
                               formData.budget === lvl.toLowerCase()
                                ? "bg-blue-600 text-white border-blue-600 z-10"
                                 : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                             )}
                           >
                             {lvl}
                           </button>
                        ))}
                      </div>
                   </div>
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" /> Specific Interests
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleInterestToggle(item)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                          formData.interests.includes(item)
                            ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800"
                            : "bg-transparent text-gray-600 border-gray-200 hover:border-blue-300 dark:text-gray-400 dark:border-gray-700"
                        )}
                      >
                       {item}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !formData.theme || !formData.budget}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" /> Generate Weekend Plan
                    </>
                  )}
                </Button>

             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
