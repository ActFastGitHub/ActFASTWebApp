"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "@/app/components/navBar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { EquipmentDTO } from "@/app/types/equipment";

function daysSince(d?: string | Date | null) {
  if (!d) return null;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
}

export default function EquipmentTrackingPage() {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      const dest = typeof window !== "undefined" ? window.location.href : "/equipment";
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
    }
  }, [status, router]);

  const [items, setItems] = useState<EquipmentDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [typeF, setTypeF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [onlyBand, setOnlyBand] = useState<""|"POTENTIAL"|"URGENT">(""); // >=7 vs >=14
  const [types, setTypes] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    try {
      const { data } = await axios.get<{ status: 200; items: EquipmentDTO[] }>("/api/equipment", {
        params: {
          type: typeF || undefined,
          status: statusF || undefined,
        },
      });
      const arr = data.items ?? [];
      setItems(arr);
      setTypes(Array.from(new Set(arr.map(a => a.type))).sort());
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error ?? "Failed to load equipment");
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [typeF, statusF]); // eslint-disable-line

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    let list = items.filter(e =>
      `${e.type} ${e.assetNumber} ${e.status} ${e.currentProjectCode ?? ""} ${e.model ?? ""} ${e.serial ?? ""}`
        .toLowerCase().includes(s)
    );

    if (onlyBand) {
      list = list.filter(e => {
        if (e.status !== "DEPLOYED") return false;
        const d = daysSince(e.lastMovedAt);
        if (d == null) return false;
        if (onlyBand === "POTENTIAL") return d >= 7 && d < 14;
        if (onlyBand === "URGENT") return d >= 14;
        return true;
      });
    }

    // deployed first, longest deployed first
    list = list.sort((a,b) => {
      const da = a.status === "DEPLOYED" ? (daysSince(a.lastMovedAt) ?? -1) : -2;
      const db = b.status === "DEPLOYED" ? (daysSince(b.lastMovedAt) ?? -1) : -2;
      return db - da;
    });
    return list;
  }, [items, q, onlyBand]);

  const stats = useMemo(() => {
    const deployed = items.filter(i => i.status === "DEPLOYED");
    const pot = deployed.filter(i => {
      const d = daysSince(i.lastMovedAt); return d != null && d >= 7 && d < 14;
    });
    const urg = deployed.filter(i => {
      const d = daysSince(i.lastMovedAt); return d != null && d >= 14;
    });
    return { deployed: deployed.length, potential: pot.length, urgent: urg.length };
  }, [items]);

  const bandBadge = (e: EquipmentDTO) => {
    if (e.status !== "DEPLOYED") return null;
    const d = daysSince(e.lastMovedAt);
    if (d == null) return null;
    if (d >= 14) return <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">≥ 14 days</span>;
    if (d >= 7)  return <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">≥ 7 days</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-24 md:pt-28 lg:pt-32">
      <Navbar />
      <div className="mx-auto max-w-6xl p-4">
        <h1 className="mb-4 text-2xl font-bold">Equipment Tracking</h1>

        {/* Summary */}
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">Deployed: {stats.deployed}</span>
          <span className="rounded bg-amber-100 px-2 py-1 text-amber-800">Potential pull-out (≥7): {stats.potential}</span>
          <span className="rounded bg-red-100 px-2 py-1 text-red-800">Needs pull-out (≥14): {stats.urgent}</span>
        </div>

        {/* Filters */}
        <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-6">
          <input placeholder="Search (type, #, status, project, model, serial…)" className="rounded border p-2" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="rounded border p-2" value={typeF} onChange={(e)=>setTypeF(e.target.value)}>
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="rounded border p-2" value={statusF} onChange={(e)=>setStatusF(e.target.value)}>
            <option value="">All Status</option>
            <option>WAREHOUSE</option><option>DEPLOYED</option><option>MAINTENANCE</option><option>LOST</option>
          </select>
          <div className="flex items-center gap-2">
            <button onClick={()=>setOnlyBand("")} className={`rounded px-3 py-2 text-sm ${onlyBand===""?"bg-gray-800 text-white":"bg-white border"}`}>All</button>
            <button onClick={()=>setOnlyBand("POTENTIAL")} className={`rounded px-3 py-2 text-sm ${onlyBand==="POTENTIAL"?"bg-amber-600 text-white":"bg-white border"}`}>Potential ≥7</button>
            <button onClick={()=>setOnlyBand("URGENT")} className={`rounded px-3 py-2 text-sm ${onlyBand==="URGENT"?"bg-red-600 text-white":"bg-white border"}`}>Urgent ≥14</button>
          </div>
          <div />
        </div>

        {/* TABLE (md+) */}
        <div className="hidden overflow-x-auto rounded bg-white shadow md:block">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Project</th>
                <th className="p-3 text-left">Model</th>
                <th className="p-3 text-left">Serial</th>
                <th className="p-3 text-left">Date/Time</th>
                <th className="p-3 text-left">Flag</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-4">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-4">No results</td></tr>
              ) : (
                filtered.map(e => (
                  <tr key={e.id} className="border-t">
                    <td className="p-3">{e.type}</td>
                    <td className="p-3 font-semibold">{e.assetNumber}</td>
                    <td className="p-3">{e.status}</td>
                    <td className="p-3">{e.currentProjectCode ?? "—"}</td>
                    <td className="p-3">{e.model ?? "—"}</td>
                    <td className="p-3">{e.serial ?? "—"}</td>
                    <td className="p-3">{e.lastMovedAt ? new Date(e.lastMovedAt as any).toLocaleString() : "—"}</td>
                    <td className="p-3">
                      {e.status === "DEPLOYED" ? (
                        daysSince(e.lastMovedAt) != null && (
                          daysSince(e.lastMovedAt)! >= 14
                            ? <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">≥ 14 days</span>
                            : daysSince(e.lastMovedAt)! >= 7
                              ? <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">≥ 7 days</span>
                              : null
                        )
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* CARDS (mobile) */}
        <div className="md:hidden">
          {loading ? (
            <div className="rounded bg-white p-4 text-sm shadow">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded bg-white p-4 text-sm shadow">No results</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((e) => {
                const d = daysSince(e.lastMovedAt);
                return (
                  <div key={e.id} className="rounded bg-white p-4 shadow">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-base font-semibold">{e.type} #{e.assetNumber}</div>
                      <span className={`rounded px-2 py-0.5 text-xs ${e.status==="DEPLOYED"?"bg-blue-100 text-blue-800":e.status==="WAREHOUSE"?"bg-green-100 text-green-800":e.status==="MAINTENANCE"?"bg-amber-100 text-amber-800":"bg-gray-200 text-gray-800"}`}>
                        {e.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Project</span><span className="font-medium">{e.currentProjectCode ?? "—"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Model</span><span>{e.model ?? "—"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Serial</span><span>{e.serial ?? "—"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Date/Time</span><span>{e.lastMovedAt ? new Date(e.lastMovedAt as any).toLocaleString() : "—"}</span></div>
                      {e.status === "DEPLOYED" && d != null && (
                        <div className="pt-1">
                          {d >= 14 ? (
                            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">≥ 14 days</span>
                          ) : d >= 7 ? (
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">≥ 7 days</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
