"use client";

import { Coffee, Leaf, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "All", icon: null, value: "all" },
  { name: "Cafe", icon: Coffee, value: "cafe" },
  { name: "Relax", icon: Leaf, value: "relax" },
  { name: "Culture", icon: Landmark, value: "culture" },
];

interface CategoryBarProps {
  selectedCategory?: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryBar({ selectedCategory = "all", onSelectCategory }: CategoryBarProps) {
  return (
    <div className="w-full flex items-center justify-center gap-2 py-6 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 md:gap-4 min-w-max px-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => onSelectCategory(cat.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 font-medium text-sm",
                isSelected 
                  ? "bg-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/30" 
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-[#D4AF37]/50 hover:text-gray-900"
              )}
            >
              {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
