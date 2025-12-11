import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Itinerary } from "@/lib/types";
import { Calendar, MapPin, Users } from "lucide-react";

interface ItineraryCardProps {
  itinerary: Itinerary;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

export function ItineraryCard({
  itinerary,
  onDelete,
  onDuplicate,
}: ItineraryCardProps) {
  const stopsCount = itinerary.itinerary?.stops?.length || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-semibold line-clamp-2">
          {itinerary.title}
        </h3>
        {itinerary.itinerary?.theme && (
          <Badge variant="secondary" className="w-fit mt-2">
            {itinerary.itinerary.theme}
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {itinerary.description}
        </p>

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{stopsCount} stops</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{new Date(itinerary.created_at).toLocaleDateString()}</span>
          </div>
          {itinerary.itinerary?.budget && (
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>Budget: {itinerary.itinerary.budget}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Link href={`/plans/${itinerary.id}`} className="flex-1">
          <Button className="w-full">View</Button>
        </Link>
        {onDuplicate && (
          <Button variant="outline" onClick={() => onDuplicate(itinerary.id)}>
            Copy
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            onClick={() => onDelete(itinerary.id)}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
