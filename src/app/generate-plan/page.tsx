"use client";

import { useState } from "react";
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
  const [formData, setFormData] = useState({
    theme: "",
    budget: "",
    duration: 2,
    interests: [] as string[],
    party_size: "couple"
  });

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

  const generateMockStops = (theme: string) => {
      // Simple mock generator
      const stops = [];
      const titles = [
          "Morning Coffee at The Corner", 
          "Visit National Museum", 
          "Lunch at Khmer Kitchen", 
          "Royal Palace Tour", 
          "Sunset Cruise", 
          "Dinner at Malis"
      ];
      
      for (let i = 0; i < 4; i++) {
          stops.push({
              order: i + 1,
              spot_id: `mock_spot_${i}`,
              title: titles[i] || `Activity ${i+1}`,
              description: `Enjoy a ${theme} experience here.`,
              start_time: `${8 + (i*3)}:00`,
              duration_minutes: 90,
              category: theme,
              address: "Phnom Penh City Center"
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

        // Mock AI Generation - In real app, call API here
        await new Promise(resolve => setTimeout(resolve, 2000));

        const mockPlan = {
            title: `My ${formData.theme.charAt(0).toUpperCase() + formData.theme.slice(1)} Weekend`,
            description: `A perfectly curated ${formData.duration}-day itinerary for a ${formData.budget} budget.`,
            theme: formData.theme,
            budget: formData.budget,
            stops: generateMockStops(formData.theme),
            created_at: new Date().toISOString()
        };

        // Save to DB
        const profile = await getUserProfile(user.id);

        // Save to DB
        const newItinerary = await createItinerary(
            profile?.id || user.id,
            mockPlan.title,
            mockPlan.description,
            mockPlan
        );
        
        if (newItinerary) {
             toast({
              title: "Plan Generated!",
              description: "Your weekend is sorted. Redirecting...",
            });
            router.push(`/plans/${newItinerary.id}`);
        } else {
            // Fallback if DB insert fails (e.g. RLS issues or no DB)
            // Just redirect to a demo ID if strictly frontend
             toast({
              title: "Error",
              description: "Could not save plan. Showing demo.",
               variant: "destructive"
            });
            router.push(`/plans/demo_plan`);
        }

    } catch (error) {
        console.error("Generation error:", error);
         toast({
            title: "Error",
            description: "Something went wrong. Please try again.",
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
