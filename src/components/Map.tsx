"use client";

import { useEffect, useRef } from "react";
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Spot } from "@/lib/types";

interface MapProps {
  spots: Spot[];
  center?: [number, number];
  zoom?: number;
  onSpotClick?: (spot: Spot) => void;
}

export function Map({
  spots,
  center = [104.8855, 11.5564], // Phnom Penh center
  zoom = 12,
  onSpotClick,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibre.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibre.Map({
      container: mapContainer.current,
      style:
        process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
        "https://demotiles.maplibre.org/style.json",
      center: center as [number, number],
      zoom: zoom,
    });

    // Add markers for each spot
    spots.forEach((spot) => {
      if (!spot.location?.coordinates) return;

      const [lng, lat] = spot.location.coordinates;

      const el = document.createElement("div");
      el.className =
        "w-8 h-8 bg-blue-600 rounded-full border-2 border-white cursor-pointer hover:bg-blue-700 shadow-lg";

      new maplibre.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map.current!);

      el.addEventListener("click", () => {
        onSpotClick?.(spot);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [spots, center, zoom, onSpotClick]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg overflow-hidden"
    />
  );
}
