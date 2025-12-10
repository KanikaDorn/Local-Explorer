"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";

type Spot = {
  id: string;
  title: string;
  slug?: string;
  category?: string;
  address?: string;
  cover_url?: string;
};

export default function ExplorePage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/example");
      const json = await res.json();
      setSpots(json.spots || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl p-4">
        <h1 className="text-2xl font-semibold mb-4">Explore</h1>
        {loading && <p>Loading...</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {spots.map((s) => (
            <article key={s.id} className="rounded border p-3">
              {s.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.cover_url}
                  alt={s.title}
                  className="w-full h-40 object-cover rounded"
                />
              )}
              <h2 className="mt-2 font-medium">{s.title}</h2>
              <p className="text-sm text-slate-600">
                {s.category} — {s.address}
              </p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
