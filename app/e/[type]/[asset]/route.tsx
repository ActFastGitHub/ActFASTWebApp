import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { type: string; asset: string } }) {
  const url = new URL(req.url);
  const t = decodeURIComponent(params.type);
  const n = params.asset;
  const target = new URL(`/equipment/move?type=${encodeURIComponent(t)}&asset=${encodeURIComponent(n)}`, url.origin);
  return NextResponse.redirect(target, 307);
}
