"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "@/app/components/navBar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { EquipmentDTO } from "@/app/types/equipment";

/* ---------- Helpers ---------- */

type EquipRow = EquipmentDTO & {
  // tolerate optional fields coming from API
  lastMovedBy?: string | null;
  createdAt?: string | Date | null;
};
type SortKey = "type" | "assetNumber" | "status" | "project" | "lastMovedAt" | "lastMovedBy";
type SortDir = "asc" | "desc";

function fmtElapsed(from?: string | Date | null, nowMs?: number) {
  if (!from) return "—";
  const t = new Date(from).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = Math.max(0, (nowMs ?? Date.now()) - t);
  const mins = Math.floor(diff / 60000);
  const d = Math.floor(mins / (60 * 24));
  const h = Math.floor((mins % (60 * 24)) / 60);
  const m = mins % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
function daysSince(d?: string | Date | null) {
  if (!d) return null;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
}
function cmpStr(a?: string | null, b?: string | null) {
  return (a ?? "").localeCompare(b ?? "", undefined, { numeric: true, sensitivity: "base" });
}
function cmpNum(a?: number | null, b?: number | null) {
  const aa = a ?? -Infinity, bb = b ?? -Infinity;
  return aa === bb ? 0 : aa < bb ? -1 : 1;
}

/* ====================================================== */
/*                     Component                          */
/* ====================================================== */

export default function EquipmentTrackingPage() {
  const { status } = useSession();
  const router = useRouter();

  // auth redirect
  useEffect(() => {
    if (status === "unauthenticated") {
      const dest = typeof window !== "undefined" ? window.location.href : "/equipment";
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
    }
  }, [status, router]);

  const [items, setItems] = useState<EquipRow[]>([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [q, setQ] = useState("");
  const [typeF, setTypeF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [onlyBand, setOnlyBand] = useState<"" | "POTENTIAL" | "URGENT">(""); // ≥7 vs ≥14
  const [types, setTypes] = useState<string[]>([]);

  // sorting
  const [sortKey, setSortKey] = useState<SortKey>("lastMovedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // live ticker
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await axios.get<{ status: 200; items: EquipRow[] }>("/api/equipment", {
        params: { type: typeF || undefined, status: statusF || undefined },
      });
      const arr = (data.items ?? []).map((r) => r) as EquipRow[];
      setItems(arr);
      setTypes(Array.from(new Set(arr.map((a) => a.type))).sort());
      setPage(1); // reset to first page on filter change
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      toast.error(err?.response?.data?.error ?? "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeF, statusF]);

  /* ---------- Filter + sort ---------- */

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    let list = items.filter((e) =>
      `${e.type} ${e.assetNumber} ${e.status} ${e.currentProjectCode ?? ""} ${e.lastMovedBy ?? ""}`
        .toLowerCase()
        .includes(s)
    );

    if (onlyBand) {
      list = list.filter((e) => {
        if (e.status !== "DEPLOYED") return false;
        const d = daysSince(e.lastMovedAt);
        if (d == null) return false;
        if (onlyBand === "POTENTIAL") return d >= 7 && d < 14;
        if (onlyBand === "URGENT") return d >= 14;
        return true;
      });
    }

    // sort
    list.sort((a, b) => {
      let base = 0;
      switch (sortKey) {
        case "type":
          base = cmpStr(a.type, b.type);
          break;
        case "assetNumber":
          base = cmpNum(a.assetNumber, b.assetNumber);
          break;
        case "status":
          base = cmpStr(a.status, b.status);
          break;
        case "project":
          base = cmpStr(a.currentProjectCode ?? "", b.currentProjectCode ?? "");
          break;
        case "lastMovedBy":
          base = cmpStr(a.lastMovedBy ?? "", b.lastMovedBy ?? "");
          break;
        case "lastMovedAt":
        default:
          // newest first default
          base = cmpNum(
            a.lastMovedAt ? new Date(a.lastMovedAt).getTime() : 0,
            b.lastMovedAt ? new Date(b.lastMovedAt).getTime() : 0
          );
          break;
      }
      return sortDir === "asc" ? base : -base;
    });

    return list;
  }, [items, q, onlyBand, sortKey, sortDir]);

  // page slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  // stats
  const stats = useMemo(() => {
    const deployed = items.filter((i) => i.status === "DEPLOYED");
    const pot = deployed.filter((i) => {
      const d = daysSince(i.lastMovedAt);
      return d != null && d >= 7 && d < 14;
    });
    const urg = deployed.filter((i) => {
      const d = daysSince(i.lastMovedAt);
      return d != null && d >= 14;
    });
    return { deployed: deployed.length, potential: pot.length, urgent: urg.length };
  }, [items]);

  // per-project breakdown (only deployed items)
  const projectBreakdown = useMemo(() => {
    const map = new Map<
      string, // project code
      { total: number; byType: Map<string, number> }
    >();
    for (const e of items) {
      if (e.status !== "DEPLOYED") continue;
      const proj = e.currentProjectCode ?? "—";
      if (!map.has(proj)) map.set(proj, { total: 0, byType: new Map() });
      const bucket = map.get(proj)!;
      bucket.total += 1;
      bucket.byType.set(e.type, (bucket.byType.get(e.type) ?? 0) + 1);
    }
    // sort projects desc by code
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [items]);

  const bandBadge = (e: EquipRow) => {
    if (e.status !== "DEPLOYED") return null;
    const d = daysSince(e.lastMovedAt);
    if (d == null) return null;
    if (d >= 14)
      return (
        <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
          ≥ 14 days
        </span>
      );
    if (d >= 7)
      return (
        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
          ≥ 7 days
        </span>
      );
    return null;
  };

  const onSort = (key: SortKey) => {
    setPage(1);
    setSortDir((prev) => (key === sortKey ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortKey(key);
  };

  const sortCaret = (key: SortKey) =>
    sortKey === key ? (
      <span className="ml-1 text-xs">{sortDir === "asc" ? "▲" : "▼"}</span>
    ) : (
      <span className="ml-1 text-xs text-gray-300">↕</span>
    );

  return (
    <div className="min-h-screen bg-gray-100 pt-24 md:pt-28 lg:pt-32">
      <Navbar />
      <div className="mx-auto max-w-6xl p-4">
        <h1 className="mb-4 text-2xl font-bold">Equipment Tracking</h1>

        {/* Summary */}
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
            Deployed: {stats.deployed}
          </span>
          <span className="rounded bg-amber-100 px-2 py-1 text-amber-800">
            Potential pull-out (≥7): {stats.potential}
          </span>
          <span className="rounded bg-red-100 px-2 py-1 text-red-800">
            Needs pull-out (≥14): {stats.urgent}
          </span>
        </div>

        {/* Breakdown per project (deployed only) */}
        <div className="mb-6 rounded bg-white p-4 shadow">
          <h2 className="mb-2 text-lg font-semibold">Deployed — Breakdown by Project</h2>
          {projectBreakdown.length === 0 ? (
            <div className="text-sm text-gray-500">No deployed equipment.</div>
          ) : (
            <div className="space-y-2">
              {projectBreakdown.map(([proj, info]) => (
                <div
                  key={proj}
                  className="rounded border border-gray-100 p-3 text-sm hover:bg-gray-50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">{proj}</div>
                    <div className="text-gray-600">Total: {info.total}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.from(info.byType.entries())
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .map(([t, n]) => (
                        <span
                          key={t}
                          className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
                        >
                          {t}: {n}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-6">
          <input
            placeholder="Search (type, #, status, project, last moved by…)"
            className="rounded border p-2"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="rounded border p-2"
            value={typeF}
            onChange={(e) => setTypeF(e.target.value)}
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="rounded border p-2"
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
          >
            <option value="">All Status</option>
            <option>WAREHOUSE</option>
            <option>DEPLOYED</option>
            <option>MAINTENANCE</option>
            <option>LOST</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyBand("")}
              className={`rounded px-3 py-2 text-sm ${
                onlyBand === "" ? "bg-gray-800 text-white" : "border bg-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setOnlyBand("POTENTIAL")}
              className={`rounded px-3 py-2 text-sm ${
                onlyBand === "POTENTIAL" ? "bg-amber-600 text-white" : "border bg-white"
              }`}
            >
              Potential ≥7
            </button>
            <button
              onClick={() => setOnlyBand("URGENT")}
              className={`rounded px-3 py-2 text-sm ${
                onlyBand === "URGENT" ? "bg-red-600 text-white" : "border bg-white"
              }`}
            >
              Urgent ≥14
            </button>
          </div>
          <div />
        </div>

        {/* TABLE (md+) */}
        <div className="hidden overflow-x-auto rounded bg-white shadow md:block">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="cursor-pointer p-3 text-left" onClick={() => onSort("type")}>
                  Type {sortCaret("type")}
                </th>
                <th
                  className="cursor-pointer p-3 text-left"
                  onClick={() => onSort("assetNumber")}
                >
                  #
                  {sortCaret("assetNumber")}
                </th>
                <th
                  className="cursor-pointer p-3 text-left"
                  onClick={() => onSort("status")}
                >
                  Status {sortCaret("status")}
                </th>
                <th
                  className="cursor-pointer p-3 text-left"
                  onClick={() => onSort("project")}
                >
                  Project {sortCaret("project")}
                </th>
                <th
                  className="cursor-pointer p-3 text-left"
                  onClick={() => onSort("lastMovedBy")}
                >
                  Last moved by {sortCaret("lastMovedBy")}
                </th>
                <th
                  className="cursor-pointer p-3 text-left"
                  onClick={() => onSort("lastMovedAt")}
                >
                  Last moved at {sortCaret("lastMovedAt")}
                </th>
                <th className="p-3 text-left">Elapsed</th>
                <th className="p-3 text-left">Flag</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-4">
                    Loading…
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4">
                    No results
                  </td>
                </tr>
              ) : (
                pageItems.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="p-3">{e.type}</td>
                    <td className="p-3 font-semibold">{e.assetNumber}</td>
                    <td className="p-3">{e.status}</td>
                    <td className="p-3">{e.currentProjectCode ?? "—"}</td>
                    <td className="p-3">{e.lastMovedBy ?? "—"}</td>
                    <td className="p-3">
                      {e.lastMovedAt
                        ? new Date(e.lastMovedAt as any).toLocaleString()
                        : "—"}
                    </td>
                    <td className="p-3">{fmtElapsed(e.lastMovedAt)}</td>
                    <td className="p-3">{bandBadge(e)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (desktop) */}
        <div className="mt-3 hidden items-center justify-between md:flex">
          <div className="text-xs text-gray-600">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of{" "}
            {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded border px-2 py-1 text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <div className="text-sm">
              Page {page} / {totalPages}
            </div>
            <button
              className="rounded border px-2 py-1 text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* CARDS (mobile) */}
        <div className="md:hidden">
          {loading ? (
            <div className="rounded bg-white p-4 text-sm shadow">Loading…</div>
          ) : pageItems.length === 0 ? (
            <div className="rounded bg-white p-4 text-sm shadow">No results</div>
          ) : (
            <div className="space-y-3">
              {pageItems.map((e) => {
                const d = daysSince(e.lastMovedAt);
                return (
                  <div key={e.id} className="rounded bg-white p-4 shadow">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-base font-semibold">
                        {e.type} #{e.assetNumber}
                      </div>
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          e.status === "DEPLOYED"
                            ? "bg-blue-100 text-blue-800"
                            : e.status === "WAREHOUSE"
                            ? "bg-green-100 text-green-800"
                            : e.status === "MAINTENANCE"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {e.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Project</span>
                        <span className="font-medium">{e.currentProjectCode ?? "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last moved by</span>
                        <span>{e.lastMovedBy ?? "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last moved at</span>
                        <span>
                          {e.lastMovedAt
                            ? new Date(e.lastMovedAt as any).toLocaleString()
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Elapsed</span>
                        <span className="font-medium">{fmtElapsed(e.lastMovedAt)}</span>
                      </div>

                      {e.status === "DEPLOYED" && d != null && (
                        <div className="pt-1">
                          {d >= 14 ? (
                            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                              ≥ 14 days
                            </span>
                          ) : d >= 7 ? (
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                              ≥ 7 days
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination (mobile) */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              {filtered.length} total • Page {page}/{totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded border px-2 py-1 text-sm disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <button
                className="rounded border px-2 py-1 text-sm disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        {/* /mobile */}
      </div>
    </div>
  );
}
