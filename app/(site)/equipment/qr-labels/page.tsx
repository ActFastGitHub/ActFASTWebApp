"use client";

import React, { useMemo, useState, useEffect } from "react";
import QRCode from "qrcode";
import Navbar from "@/app/components/navBar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

type TypeItem = { code: string; description?: string };

function expandAssets(input: string): number[] {
  const parts = `${input}`.split(/[,\s]+/).filter(Boolean);
  const out: number[] = [];
  for (const part of parts) {
    const m = part.match(/^(\d+)-(\d+)$/);
    if (m) {
      const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
      const [start, end] = a <= b ? [a, b] : [b, a];
      for (let n = start; n <= end; n++) out.push(n);
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n)) out.push(n);
    }
  }
  return Array.from(new Set(out));
}

export default function QRLabelsPage() {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      const dest = typeof window !== "undefined" ? window.location.href : "/equipment/qr-labels";
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
    }
  }, [status, router]);

  const [type, setType] = useState("");
  const [types, setTypes] = useState<TypeItem[]>([]);
  const [typeQuery, setTypeQuery] = useState("");
  const filteredTypes = typeQuery === "" ? types : types.filter(t => t.code.toLowerCase().includes(typeQuery.toLowerCase()));

  const [input, setInput] = useState("21, 35-40, 55");
  const list = useMemo(()=>expandAssets(input), [input]);
  const [images, setImages] = useState<{n:number, url:string}[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/equipment/types");
        setTypes(data.items ?? []);
      } catch {}
    })();
  }, []);

  async function generate() {
    if (!type.trim()) { toast.error("Pick a type first"); return; }
    if (list.length === 0) { toast.error("Enter at least one asset number"); return; }
    setGenerating(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const urls = await Promise.all(list.map(async (n) => {
        const dl = `${origin}/e/${encodeURIComponent(type.trim())}/${n}`;
        const dataUrl = await QRCode.toDataURL(dl, { errorCorrectionLevel: "Q", margin: 1, scale: 5 });
        return { n, url: dataUrl };
      }));
      setImages(urls);
      toast.success(`Generated ${urls.length} QR${urls.length>1?"s":""}`);
    } catch (e:any) {
      toast.error("Failed to generate QR codes");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 md:pt-28 lg:pt-32">
      <Navbar />
      <div className="mx-auto max-w-5xl p-4">
        <h1 className="mb-4 text-2xl font-bold">QR Labels</h1>

        <div className="mb-4 rounded bg-white p-4 shadow">
          <label className="block text-sm font-medium">Type</label>
          <Combobox as="div" value={type} onChange={(val:string)=>setType(val ?? "")}>
            <div className="relative mt-1">
              <Combobox.Input className="w-full rounded border p-2"
                displayValue={(v:string)=>v}
                onChange={(e)=>{ setType(e.target.value); setTypeQuery(e.target.value); }}
                placeholder="Select a type"/>
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
              </Combobox.Button>
              {filteredTypes.length>0 && (
                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {filteredTypes.map((t)=>(
                    <Combobox.Option key={t.code} value={t.code}
                      className={({active})=>`relative cursor-pointer select-none py-2 pl-3 pr-9 ${active?"bg-blue-600 text-white":"text-gray-900"}`}>
                      {({active, selected})=>(
                        <>
                          <span className={`block truncate ${selected?"font-semibold":""}`}>{t.code}</span>
                          {selected && (
                            <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active?"text-white":"text-blue-600"}`}>
                              <CheckIcon className="h-5 w-5" />
                            </span>
                          )}
                        </>
                      )}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              )}
            </div>
          </Combobox>

          <label className="mt-3 block text-sm font-medium">Assets (lists or ranges)</label>
          <input value={input} onChange={(e)=>setInput(e.target.value)} className="mt-1 w-full rounded border p-2" />
          <div className="mt-1 text-xs text-gray-500">Parsed: {list.join(", ") || "—"}</div>
          <button disabled={generating} onClick={generate} className="mt-3 rounded bg-blue-600 px-3 py-2 text-white">
            {generating ? "Generating…" : "Generate"}
          </button>
          <button onClick={()=>window.print()} className="ml-2 rounded bg-gray-800 px-3 py-2 text-white">Print</button>
        </div>

        {images.length>0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map(({n, url})=>(
              <div key={n} className="flex flex-col items-center justify-center rounded bg-white p-3 shadow print:shadow-none">
                <img src={url} alt={`QR ${n}`} className="h-32 w-32" />
                <div className="mt-2 text-lg font-extrabold tracking-wide">{type} #{n}</div>
                <a className="mt-1 text-xs text-blue-700 underline" href={url} download={`asset-${type}-${n}.png`}>Download</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
