// app\api\images\route.tsx

import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder"); // e.g. “About”

  if (!folder) {
    return NextResponse.json(
      { error: "folder query is required" },
      { status: 400 }
    );
  }

  const dir = path.join(process.cwd(), "public", "images", folder);

  try {
    const files = await fs.readdir(dir);
    const images = files
      .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((f) => `/images/${folder}/${f}`);

    return new NextResponse(JSON.stringify(images), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, must-revalidate", // disable caching
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "folder not found" },
      { status: 404 }
    );
  }
}

