import { redirect } from "next/navigation";

export default function Page(
  { params, searchParams }: { params: { type: string; asset: string }; searchParams: { [k:string]:string|undefined } }
) {
  const t = decodeURIComponent(params.type);
  const a = params.asset;
  const q = searchParams?.quick === "1" ? "&quick=1" : "";
  const d = searchParams?.direction ? `&direction=${encodeURIComponent(searchParams.direction)}` : "";
  redirect(`/equipment/move?type=${encodeURIComponent(t)}&asset=${encodeURIComponent(a)}${q}${d}`);
}
