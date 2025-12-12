import { 
  Coffee, 
  Trees, 
  Landmark, 
  Armchair, 
  Utensils, 
  Ship, 
  Palette, 
  Music
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const CATEGORIES = [
  { name: "Cafés", icon: Coffee },
  { name: "Relaxing Spots", icon: Armchair }, // or Sunrise/Sunset icon
  { name: "Cultural", icon: Landmark },
  { name: "Nature", icon: Trees },
  { name: "Local Food", icon: Utensils },
  { name: "Riverside", icon: Ship },
  { name: "Art Spaces", icon: Palette },
  { name: "Nightlife", icon: Music },
];

interface CategoryBarProps {
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryBar({ selectedCategory = "All", onSelectCategory }: CategoryBarProps) {
  return (
    <div className="w-full flex items-center justify-between gap-4 py-8 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-8 min-w-max mx-auto px-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className={cn(
                "flex flex-col items-center gap-2 group transition-all",
                isSelected ? "text-gray-900 border-b-2 border-gray-900 pb-2" : "text-gray-500 hover:text-gray-900 pb-2 border-b-2 border-transparent hover:border-gray-300"
              )}
            >
              <Icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", isSelected && "scale-110")} strokeWidth={1.5} />
              <span className="text-xs font-semibold whitespace-nowrap">{cat.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* Filter Button (Desktop) */}
      <div className="hidden md:block pl-4 border-l">
         <Button variant="outline" className="gap-2 rounded-xl border-gray-300 text-xs font-semibold h-10 px-4">
           <span className="text-base">⚙️</span> Filters
         </Button>
      </div>
    </div>
  );
}
