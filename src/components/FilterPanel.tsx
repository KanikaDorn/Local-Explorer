"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterProps {
  categories: string[];
  onFilterChange: (filters: { category?: string; tags?: string[] }) => void;
}

const COMMON_TAGS = [
  "cafe",
  "restaurant",
  "bar",
  "nightlife",
  "museum",
  "temple",
  "shopping",
  "outdoor",
  "adventure",
  "culture",
];

export function FilterPanel({ categories, onFilterChange }: FilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleCategoryChange = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    onFilterChange({
      category: newCategory || undefined,
      tags: selectedTags,
    });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onFilterChange({
      category: selectedCategory || undefined,
      tags: newTags,
    });
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedTags([]);
    onFilterChange({});
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {COMMON_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {(selectedCategory || selectedTags.length > 0) && (
        <Button variant="outline" onClick={handleReset} className="w-full">
          Clear Filters
        </Button>
      )}
    </div>
  );
}
