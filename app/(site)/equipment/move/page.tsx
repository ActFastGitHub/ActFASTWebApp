"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "@/app/components/navBar";
import { useSession } from "next-auth/react";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

type Project = { id: string; code: string };
type TypeItem = { code: string };

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

export default function MovePage() {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      const dest = typeof window !== "undefined" ? window.location.href : "/equipment/move";
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
    }
  }, [status, router]);

  const sp = useSearchParams();
  const preAsset = sp.get("asset") ?? "";
  const preType = sp.get("type") ?? "";

  const [direction, setDirection] = useState<"OUT"|"IN">("OUT");
  const [projectCode, setProjectCode] = useState("");
  const [type, setType] = useState(preType || "");
  const [assets, setAssets] = useState(preAsset);
  const [note, setNote] = useState("");

  // time controls
  const [useNow, setUseNow] = useState(true);
  const [manualAt, setManualAt] = useState<string>(""); // yyyy-MM-ddTHH:mm

  const list = useMemo(() => expandAssets(assets), [assets]);

  /* Projects (Combobox) */
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState("");
  const filteredProjects =
    query === "" ? projects : projects.filter((p) => p.code.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/projects");
        const list: Project[] = res.data?.projects ?? [];
        setProjects(list.sort((a, b) => b.code.localeCompare(a.code)));
      } catch {
        toast.error("Failed to load projects");
        setProjects([]);
      }
    })();
  }, []);

  /* Types (dynamic) */
  const [types, setTypes] = useState<TypeItem[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/equipment/types");
        setTypes((data.items ?? []).map((x:any)=>({ code: x.code })));
        if (!preType && data.items?.length && !type) setType(data.items[0].code);
      } catch {}
    })();
  }, [preType, type]);

  async function submit() {
    if (list.length === 0) { toast.error("Enter at least one asset #"); return; }
    if (!type.trim()) { toast.error("Select a type"); return; }
    if (direction === "OUT" && !projectCode) { toast.error("Project code required for OUT"); return; }

    let at: string | undefined = undefined;
    if (!useNow) {
      if (!manualAt) { toast.error("Pick a date & time or switch to Now"); return; }
      const local = new Date(manualAt);
      if (isNaN(local.getTime())) { toast.error("Invalid date-time"); return; }
      at = local.toISOString();
    }

    try {
      const { data } = await axios.post("/api/equipment/move", {
        direction,
        projectCode: projectCode || undefined,
        assetNumbers: assets,
        type: type.trim(),
        note,
        source: "QR",
        at,
      });

      const failed = data.results.filter((r: any) => !r.ok);
      const success = data.results.filter((r: any) => r.ok);

      if (success.length) {
        toast.success(`${success.length} ${type}${success.length>1?" items":""} recorded`);
      }
      if (failed.length) {
        const msg = failed.slice(0,3).map((f:any)=>`#${f.assetNumber}: ${f.msg}`).join(" • ");
        toast.error(`Failed ${failed.length}: ${msg}${failed.length>3?" …":""}`);
      }
      setNote("");
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Error submitting move");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 md:pt-28 lg:pt-32">
      <Navbar />
      <div className="mx-auto max-w-xl p-4">
        <h1 className="mb-4 text-2xl font-bold">Equipment Move</h1>

        <div className="rounded bg-white p-4 shadow">
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button onClick={()=>setDirection("OUT")} className={`rounded px-3 py-2 ${direction==="OUT"?"bg-blue-600 text-white":"bg-gray-200"}`}>OUT (to site)</button>
            <button onClick={()=>setDirection("IN")} className={`rounded px-3 py-2 ${direction==="IN"?"bg-blue-600 text-white":"bg-gray-200"}`}>IN (to warehouse)</button>
          </div>

          {/* Type */}
          <label className="block text-sm font-medium">Type</label>
          <select className="mb-3 mt-1 w-full rounded border p-2" value={type} onChange={(e)=>setType(e.target.value)}>
            <option value="">Select type…</option>
            {types.map((t)=> <option key={t.code} value={t.code}>{t.code}</option>)}
          </select>

          {/* Project Combobox (OUT only) */}
          {direction==="OUT" && (
            <div className="mb-3">
              <label htmlFor="searchProject" className="mb-1 block text-sm font-semibold text-gray-700">Project Code</label>
              <Combobox as="div" value={projectCode} onChange={(val:string)=> setProjectCode(val ?? "")}>
                <div className="relative mt-1">
                  <Combobox.Input
                    id="searchProject"
                    className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm leading-5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    displayValue={(selectedCode: string) => selectedCode}
                    onChange={(event) => {
                      const v = event.target.value.toUpperCase();
                      setQuery(v);
                      setProjectCode(v);
                    }}
                    placeholder="Type to filter..."
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </Combobox.Button>
                  {filteredProjects.length > 0 && (
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {filteredProjects.map((project) => (
                        <Combobox.Option key={project.id} value={project.code}
                          className={({ active }) => `relative cursor-pointer select-none py-2 pl-3 pr-9 ${active ? "bg-blue-600 text-white" : "text-gray-900"}`}>
                          {({ active, selected }) => (
                            <>
                              <span className={`block truncate ${selected ? "font-semibold" : ""}`}>{project.code}</span>
                              {selected && (
                                <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? "text-white" : "text-blue-600"}`}>
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
            </div>
          )}

          <label className="block text-sm font-medium">Asset # (single, lists, or ranges)</label>
          <input className="mb-1 mt-1 w-full rounded border p-2" placeholder="1, 2-5, 55" value={assets} onChange={(e)=>setAssets(e.target.value)} />
          <div className="mb-3 text-xs text-gray-500">Parsed: {list.join(", ") || "—"}</div>

          {/* Time controls */}
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium">Move Time</label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="movetime" checked={useNow} onChange={()=>setUseNow(true)} />
                <span>Now (device time)</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="radio" name="movetime" checked={!useNow} onChange={()=>setUseNow(false)} />
                <span>Manual</span>
              </label>
            </div>
            {!useNow && (
              <input
                type="datetime-local"
                className="mt-2 w-full rounded border p-2"
                value={manualAt}
                onChange={(e)=>setManualAt(e.target.value)}
              />
            )}
          </div>

          {/* Notes textarea */}
          <label className="block text-sm font-medium">Notes (optional)</label>
          <textarea
            rows={3}
            className="mb-3 mt-1 w-full rounded border p-2"
            placeholder="Add any context (room, area, reason, unusual circumstances)…"
            value={note}
            onChange={(e)=>setNote(e.target.value)}
          />

          <button onClick={submit} className="w-full rounded bg-emerald-600 px-3 py-2 font-semibold text-white">Submit</button>
        </div>
      </div>
    </div>
  );
}
