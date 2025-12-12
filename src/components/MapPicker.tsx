"use client";

import { useEffect, useRef } from "react";
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapPickerProps {
  initial?: [number, number]; // [lng, lat]
  zoom?: number;
  onChange?: (
    coords: { type: string; coordinates: [number, number] } | null
  ) => void;
}

export default function MapPicker({
  initial = [104.8855, 11.5564],
  zoom = 12,
  onChange,
}: MapPickerProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibre.Map | null>(null);
  const markerRef = useRef<maplibre.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapRef.current = new maplibre.Map({
      container: mapContainer.current,
      style:
        process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
        "https://demotiles.maplibre.org/style.json",
      center: initial as [number, number],
      zoom,
    });

    // Add click handler to set marker
    mapRef.current.on("click", (e: any) => {
      const lng = e.lngLat.lng;
      const lat = e.lngLat.lat;

      // place or move marker
      if (!markerRef.current) {
        const el = document.createElement("div");
        el.className =
          "w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow";
        markerRef.current = new maplibre.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(mapRef.current!);
      } else {
        markerRef.current.setLngLat([lng, lat]);
      }

      onChange && onChange({ type: "Point", coordinates: [lng, lat] });
    });

    // If initial provided, render marker
    if (initial && markerRef.current == null) {
      const el = document.createElement("div");
      el.className =
        "w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow";
      markerRef.current = new maplibre.Marker({ element: el })
        .setLngLat(initial)
        .addTo(mapRef.current!);
    }

    return () => {
      mapRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mapContainer}
      className="w-full h-64 rounded-lg overflow-hidden"
    />
  );
}
