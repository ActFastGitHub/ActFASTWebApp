import { NextResponse } from "next/server";

const placeId = "ChIJVRq4RobXhVQRXka36Lg-0mY";
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

// READ
export async function GET(request: Request) {
	try {
		const response = await fetch(
			`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${apiKey}`
		);

		const data = await response.json();
		const reviews = data.result.reviews.map(
			(review: { author_name: any; text: any; profile_photo_url: any; rating: any }) => ({
				name: review.author_name,
				feedback: review.text,
				image: review.profile_photo_url,
				rating: review.rating
			})
		);

		// Set CORS headers
		const headers = new Headers();
		headers.set("Access-Control-Allow-Origin", "*");
		headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
		headers.set("Access-Control-Allow-Headers", "Content-Type");

		return new NextResponse(JSON.stringify(reviews), {
			headers,
			status: 200
		});
	} catch (error) {
		const headers = new Headers();
		headers.set("Access-Control-Allow-Origin", "*");
		headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
		headers.set("Access-Control-Allow-Headers", "Content-Type");

		return new NextResponse(JSON.stringify({ error: "Error fetching reviews" }), {
			headers,
			status: 500
		});
	}
}

export async function OPTIONS() {
	const headers = new Headers();
	headers.set("Access-Control-Allow-Origin", "*");
	headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
	headers.set("Access-Control-Allow-Headers", "Content-Type");

	return new NextResponse(null, { headers });
}
