import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spot } from "@/lib/types";
import { Heart, MapPin } from "lucide-react";

interface SpotCardProps {
  spot: Spot;
  onAddToList?: (spotId: string) => void;
  isInList?: boolean;
}

export function SpotCard({ spot, onAddToList, isInList }: SpotCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {spot.cover_url ? (
          <img
            src={spot.cover_url}
            alt={spot.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blue-200 to-blue-100 flex items-center justify-center">
            <MapPin className="text-blue-600" size={40} />
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold line-clamp-2">{spot.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{spot.category}</p>
          </div>
          {onAddToList && (
            <button
              onClick={() => onAddToList(spot.id)}
              className={`transition-colors ${
                isInList ? "text-red-600" : "text-gray-300 hover:text-red-600"
              }`}
            >
              <Heart size={20} fill={isInList ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-2">{spot.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <MapPin size={16} className="text-gray-400" />
          <p className="text-xs text-gray-500">{spot.address}</p>
        </div>
        {spot.tags && spot.tags.length > 0 && (
          <div className="flex gap-1 mt-3 flex-wrap">
            {spot.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        <Link href={`/explore/${spot.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
