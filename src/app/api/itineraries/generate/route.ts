import { NextResponse } from "next/server";
import { generateItinerary } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // expected: { profile_id, preferences, date_range, spots_to_include }
    const result = await generateItinerary(body);
    return NextResponse.json({ itinerary: result }, { status: 201 });
  } catch (err: any) {
    console.error("generate error", err);
    return NextResponse.json(
      { error: err.message || "failed" },
      { status: 500 }
    );
  }
}
