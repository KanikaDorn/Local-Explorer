"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value?: number;
  max?: number;
  readonly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function Rating({ 
  value = 0, 
  max = 5, 
  readonly = false, 
  onChange,
  className 
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const ratingValue = i + 1;
        const isFilled = (hoverValue ?? value) >= ratingValue;
        
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            className={cn(
              "transition-colors",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            )}
            onClick={() => !readonly && onChange?.(ratingValue)}
            onMouseEnter={() => !readonly && setHoverValue(ratingValue)}
            onMouseLeave={() => !readonly && setHoverValue(null)}
          >
            <Star
              className={cn(
                "h-5 w-5",
                isFilled 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "fill-transparent text-gray-300 dark:text-gray-600"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
