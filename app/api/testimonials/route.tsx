import { NextResponse } from "next/server";

/* ---------- type definitions (unchanged) ---------- */
interface PlaceReview {
  name?: string;
  rating?: number;
  publishTime?: string;
  text?: { text: string; languageCode?: string };
  authorAttribution?: { displayName?: string; photoUri?: string; uri?: string };
}
interface PlaceDetails {
  name?: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  reviews?: PlaceReview[];
}
interface MappedReview {
  author: string;
  text: string;
  rating: number;
  photoUrl: string;
  publishedAt: string;
}

/* ---------- config ---------- */
const placeId = "ChIJVRq4RobXhVQRXka36Lg-0mY";
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY!;
const fields = "displayName,formattedAddress,rating,userRatingCount,reviews";

/* ============================================================
   ⭐ NEW: simple process-local cache
   ============================================================ */
const TTL_MS = 24 * 60 * 60 * 1000; // 24 h
let inMemoryCache:
  | { at: number; payload: unknown } // payload will be `result`
  | null = null;

/* ---------- GET handler ---------- */
export async function GET() {
  /* ⭐ 1. Serve cached copy if still fresh */
  if (inMemoryCache && Date.now() - inMemoryCache.at < TTL_MS) {
    return new NextResponse(JSON.stringify(inMemoryCache.payload), {
      headers: { ...corsHeaders(), "X-Source": "cache" }, // 👈 add X-Source
      status: 200,
    });
  }

  /* ⭐ 2. Otherwise hit Google once, then refresh cache */
  try {
    const endpoint =
      `https://places.googleapis.com/v1/places/${placeId}` +
      `?key=${apiKey}&fields=${fields}`;
    console.log("⛳ Calling Google Places API at", new Date().toISOString()); // 👈 add me

    const response = await fetch(endpoint);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Google returned status ${response.status}:\n${errorText}`,
      );
    }

    const data: PlaceDetails = await response.json();
    const reviews: MappedReview[] = Array.isArray(data.reviews)
      ? data.reviews.map((r) => ({
          author: r.authorAttribution?.displayName ?? "Anonymous",
          text: r.text?.text ?? "",
          rating: r.rating ?? 0,
          photoUrl: r.authorAttribution?.photoUri ?? "",
          publishedAt: r.publishTime ?? "",
        }))
      : [];

    const result = {
      resourceName: data.name ?? "",
      name: data.displayName?.text ?? "",
      address: data.formattedAddress ?? "",
      rating: data.rating ?? 0,
      totalRatings: data.userRatingCount ?? 0,
      reviews,
    };

    /* ⭐ 3. Save to cache for next visitors */
    inMemoryCache = { at: Date.now(), payload: result };

    return new NextResponse(JSON.stringify(result), {
      headers: { ...corsHeaders(), "X-Source": "google" },
      status: 200,
    });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        error: "Error fetching place details.",
        details: error.message,
      }),
      { headers: corsHeaders(), status: 500 },
    );
  }
}

/* ---------- OPTIONS handler ---------- */
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders() });
}

/* ---------- shared CORS headers helper ---------- */
function corsHeaders() {
  return new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
}
