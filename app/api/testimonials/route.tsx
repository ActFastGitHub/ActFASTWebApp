// import { NextResponse } from "next/server";

// /** A single Google Place review object (new Places API shape). */
// interface PlaceReview {
//   /** Internal resource name: "places/xxx/reviews/yyy" */
//   name?: string;
//   rating?: number;
//   publishTime?: string;
//   text?: {
//     text: string;
//     languageCode?: string;
//   };
//   authorAttribution?: {
//     displayName?: string;
//     photoUri?: string;
//     uri?: string;
//   };
// }

// /** The top-level object the new Places API returns. */
// interface PlaceDetails {
//   /** Resource name like "places/ChIJVRq4RobXhVQRXka36Lg-0mY" */
//   name?: string;
//   /** User-facing name in "displayName.text" instead of the legacy "name" field. */
//   displayName?: {
//     text: string;
//     languageCode?: string;
//   };
//   formattedAddress?: string;
//   rating?: number;
//   userRatingCount?: number;
//   reviews?: PlaceReview[];
//   /** ... Add any other fields you plan to use. */
// }

// /** This is what we'll send back to the client for each review. */
// interface MappedReview {
//   author: string;
//   text: string;
//   rating: number;
//   photoUrl: string;
//   publishedAt: string;
// }

// // Replace these with your real Place ID and API key.
// const placeId = "ChIJVRq4RobXhVQRXka36Lg-0mY";
// const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

// // We choose a subset of fields to request. You can use `fields=*` in development, but
// // keep in mind that can return a LOT of data (and can cost more on the new API).
// const fields = "displayName,formattedAddress,rating,userRatingCount,reviews";

// export async function GET() {
//   try {
//     // Build the endpoint. Note: The new endpoint is "v1/places/{PLACE_ID}"
//     // (Plural "places"), then pass your field mask via `fields=...`.
//     const endpoint = `https://places.googleapis.com/v1/places/${placeId}?key=${apiKey}&fields=${fields}`;

//     // Make the fetch call
//     const response = await fetch(endpoint);
//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(
//         `Google returned status ${response.status}:\n${errorText}`,
//       );
//     }

//     // Parse JSON as `PlaceDetails`
//     const data: PlaceDetails = await response.json();

//     // Build up our typed response
//     const reviews: MappedReview[] = [];

//     if (Array.isArray(data.reviews)) {
//       // Map each raw review into our typed 'MappedReview'
//       for (const r of data.reviews) {
//         reviews.push({
//           author: r.authorAttribution?.displayName ?? "Anonymous",
//           text: r.text?.text ?? "",
//           rating: r.rating ?? 0,
//           photoUrl: r.authorAttribution?.photoUri ?? "",
//           publishedAt: r.publishTime ?? "",
//         });
//       }
//     }

//     // Example final object we’ll return to the frontend
//     const result = {
//       resourceName: data.name ?? "",
//       name: data.displayName?.text ?? "",
//       address: data.formattedAddress ?? "",
//       rating: data.rating ?? 0,
//       totalRatings: data.userRatingCount ?? 0,
//       reviews,
//     };

//     // Set optional CORS headers, if needed
//     const headers = new Headers({
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type",
//     });

//     // Return a JSON response
//     return new NextResponse(JSON.stringify(result), { headers, status: 200 });
//   } catch (error) {
//     const headers = new Headers({
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type",
//     });

//     return new NextResponse(
//       JSON.stringify({
//         error: "Error fetching place details.",
//         details: (error as Error).message,
//       }),
//       { headers, status: 500 },
//     );
//   }
// }

// /**
//  * OPTIONS handler for CORS preflight.
//  */
// export async function OPTIONS() {
//   const headers = new Headers({
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type",
//   });

//   return new NextResponse(null, { headers });
// }

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
