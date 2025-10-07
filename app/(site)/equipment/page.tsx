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
  lastMovedBy?: string | null;
  createdAt?: string | Date | null;
  archived?: boolean | null;
};
type SortKey =
  | "type"
  | "assetNumber"
  | "status"
  | "project"
  | "lastMovedAt"
  | "lastMovedBy";
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

/** Elapsed accrues only while DEPLOYED and non-archived */
function fmtElapsedFor(e: EquipRow, nowMs?: number) {
  if (e.archived) return "0m";
  if (String(e.status).toUpperCase() !== "DEPLOYED") return "0m";
  return fmtElapsed(e.lastMovedAt, nowMs);
}

function daysSince(d?: string | Date | null) {
  if (!d) return null;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
}
function cmpStr(a?: string | null, b?: string | null) {
  return (a ?? "").localeCompare(b ?? "", undefined, {
    numeric: true,
    sensitivity: "base",
  });
}
function cmpNum(a?: number | null, b?: number | null) {
  const aa = a ?? -Infinity,
    bb = b ?? -Infinity;
  return aa === bb ? 0 : aa < bb ? -1 : 1;
}

/* ---------- Movements (slim) for last-OUT notes ---------- */

type MovementSlim = {
  id: string;
  direction: "IN" | "OUT";
  at: string;
  note?: string | null;
  projectCode?: string | null;
  equipment?: Pick<EquipmentDTO, "type" | "assetNumber">;
  // legacy fallback fields
  type?: string;
  assetNumber?: number;
};

const eqKeyFromParts = (type: string, asset: number) => `${type}#${asset}`;

/* ---------- Shared UI ---------- */

function Pagination({
  page,
  setPage,
  pageSize,
  total,
  className = "",
  compact = false,
}: {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  total: number;
  className?: string;
  compact?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div
      className={`mt-2 flex w-full flex-wrap items-center gap-2 md:gap-3 ${className}`}
    >
      <div className="text-xs text-gray-700 md:mr-auto md:text-sm">
        Showing <span className="font-semibold">{start}</span>–
        <span className="font-semibold">{end}</span> of{" "}
        <span className="font-semibold">{total}</span>
      </div>
      <div
        className={`flex items-center gap-1 md:gap-2 ${compact ? "text-xs" : "text-sm"}`}
      >
        <button
          className="rounded border px-2 py-1 disabled:opacity-50"
          onClick={() => setPage(1)}
          disabled={page <= 1}
          title="First page"
          aria-label="First page"
          type="button"
        >
          «
        </button>
        <button
          className="rounded border px-2 py-1 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          title="Previous page"
          aria-label="Previous page"
          type="button"
        >
          ‹
        </button>
        <span>
          Page <b>{page}</b> / <b>{totalPages}</b>
        </span>
        <button
          className="rounded border px-2 py-1 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          title="Next page"
          aria-label="Next page"
          type="button"
        >
          ›
        </button>
        <button
          className="rounded border px-2 py-1 disabled:opacity-50"
          onClick={() => setPage(totalPages)}
          disabled={page >= totalPages}
          title="Last page"
          aria-label="Last page"
          type="button"
        >
          »
        </button>
      </div>
    </div>
  );
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
      const dest =
        typeof window !== "undefined" ? window.location.href : "/equipment";
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
    }
  }, [status, router]);

  const [items, setItems] = useState<EquipRow[]>([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [q, setQ] = useState("");
  const [typeF, setTypeF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [showArchivedRows, setShowArchivedRows] = useState(false); // table toggle
  const [onlyBand, setOnlyBand] = useState<"" | "POTENTIAL" | "URGENT">(""); // ≥7 vs ≥14
  const [types, setTypes] = useState<string[]>([]);

  // sorting
  const [sortKey, setSortKey] = useState<SortKey>("lastMovedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // live ticker (updates elapsed every minute)
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await axios.get<{ status: 200; items: EquipRow[] }>(
        "/api/equipment",
        {
          params: {
            type: typeF || undefined,
            status: statusF || undefined,
            includeArchived: "1", // include archived in payload; UI filters them out where needed
          },
        },
      );
      const arr = (data.items ?? []).map((r) => r) as EquipRow[];
      setItems(arr);
      setTypes(Array.from(new Set(arr.map((a) => a.type))).filter(Boolean).sort());
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

  /* ---------- Movements to fetch latest deploy notes ---------- */

  const [lastOutNoteByEquip, setLastOutNoteByEquip] = useState<
    Record<string, { note: string; at: string }>
  >({});

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get<{ status: number; items: MovementSlim[] }>(
          "/api/equipment/movements",
          { params: { limit: 2000 } },
        );
        if (data?.status !== 200 || !Array.isArray(data.items)) return;

        const sorted = data.items
          .slice()
          .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

        const map: Record<string, { note: string; at: string }> = {};

        for (const mv of sorted) {
          const type = mv.equipment?.type ?? mv.type ?? "";
          const asset = mv.equipment?.assetNumber ?? mv.assetNumber ?? 0;
          if (!type || !Number.isInteger(asset)) continue;

          if (mv.direction === "OUT" && (mv.note ?? "").trim()) {
            map[eqKeyFromParts(type, asset)] = {
              note: (mv.note || "").trim(),
              at: mv.at,
            };
          }
        }
        setLastOutNoteByEquip(map);
      } catch {
        // non-fatal
      }
    })();
  }, []);

  const latestOutNoteFor = (e: EquipRow) => {
    const k = eqKeyFromParts(e.type, e.assetNumber);
    return lastOutNoteByEquip[k]?.note ?? "";
  };

  /* ---------- Filter + sort (main table) ---------- */

  const filtered = useMemo(() => {
    const raw = q.trim().toLowerCase();

    let list: EquipRow[] = items;

    if (!showArchivedRows) {
      list = list.filter((e) => !e.archived);
    }

    if (raw) {
      // EXACT asset-number mode
      const digitsOnly = raw.replace(/^\s*#/, "");
      if (/^\d+$/.test(digitsOnly)) {
        const n = parseInt(digitsOnly, 10);
        list = list.filter((e) => e.assetNumber === n);
      } else {
        // fallback: broad text search
        const s = raw;
        list = list.filter((e) =>
          `${e.type} ${e.assetNumber} ${e.status} ${e.currentProjectCode ?? ""} ${e.lastMovedBy ?? ""}`
            .toLowerCase()
            .includes(s),
        );
      }
    }

    if (onlyBand) {
      list = list.filter((e) => {
        if (e.archived) return false;
        if (String(e.status).toUpperCase() !== "DEPLOYED") return false;
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
          base = cmpNum(
            a.lastMovedAt ? new Date(a.lastMovedAt).getTime() : 0,
            b.lastMovedAt ? new Date(b.lastMovedAt).getTime() : 0,
          );
          break;
      }
      return sortDir === "asc" ? base : -base;
    });

    return list;
  }, [items, q, onlyBand, sortKey, sortDir, showArchivedRows]);

  // page slice
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ---------- Stats & Derived Reports ---------- */

  const stats = useMemo(() => {
    // split by archived flag
    const archived = items.filter((i) => !!i.archived);
    const nonArchived = items.filter((i) => !i.archived);

    // status buckets (exclude archived)
    const deployed = nonArchived.filter(
      (i) => String(i.status).toUpperCase() === "DEPLOYED",
    );
    const warehouse = nonArchived.filter(
      (i) => String(i.status).toUpperCase() === "WAREHOUSE",
    );
    const maintenance = nonArchived.filter(
      (i) => String(i.status).toUpperCase() === "MAINTENANCE",
    );
    const lost = nonArchived.filter(
      (i) => String(i.status).toUpperCase() === "LOST",
    );

    const countByType = (arr: EquipRow[]) => {
      const m = new Map<string, number>();
      for (const r of arr) m.set(r.type, (m.get(r.type) ?? 0) + 1);
      return Array.from(m.entries()).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
      );
    };

    // Ready-to-pull lists
    const urgentList = deployed
      .filter((i) => {
        const d = daysSince(i.lastMovedAt);
        return d != null && d >= 14;
      })
      .sort((a, b) => (daysSince(b.lastMovedAt) ?? 0) - (daysSince(a.lastMovedAt) ?? 0));

    const potentialList = deployed
      .filter((i) => {
        const d = daysSince(i.lastMovedAt);
        return d != null && d >= 7 && d < 14;
      })
      .sort((a, b) => (daysSince(b.lastMovedAt) ?? 0) - (daysSince(a.lastMovedAt) ?? 0));

    // By-type quick lists for KPI cards
    const byType = {
      totalNonArchived: countByType(nonArchived),
      deployed: countByType(deployed),
      warehouse: countByType(warehouse),
      maintenance: countByType(maintenance),
      lost: countByType(lost),
      archived: countByType(archived),
    };

    const utilOverall =
      nonArchived.length > 0
        ? Math.round((deployed.length / nonArchived.length) * 100)
        : 0;

    // Utilization per type
    const nonArchMap = new Map<string, number>();
    for (const r of nonArchived)
      nonArchMap.set(r.type, (nonArchMap.get(r.type) ?? 0) + 1);
    const depMap = new Map<string, number>();
    for (const r of deployed) depMap.set(r.type, (depMap.get(r.type) ?? 0) + 1);
    const utilByType: Array<{ type: string; pct: number; d: number; n: number }> =
      [];
    Array.from(nonArchMap.entries()).forEach(([t, n]) => {
      const d = depMap.get(t) ?? 0;
      const pct = n > 0 ? Math.round((d / n) * 100) : 0;
      utilByType.push({ type: t, pct, d, n });
    });
    utilByType.sort((a, b) => b.d - a.d || a.type.localeCompare(b.type));

    // top N oldest (kept for the optional section)
    const oldest = [...deployed]
      .map((r) => ({ r, d: daysSince(r.lastMovedAt) ?? -1 }))
      .sort((a, b) => b.d - a.d)
      .slice(0, 10)
      .map((x) => x.r);

    return {
      totalNonArchived: nonArchived.length,
      deployed: deployed.length,
      warehouse: warehouse.length,
      maintenance: maintenance.length,
      lost: lost.length,
      archived: archived.length,
      potential: potentialList.length,
      urgent: urgentList.length,
      utilizationOverall: utilOverall,
      byType,
      utilByType,
      urgentList,
      potentialList,
      oldest,
    };
  }, [items]);

  // per-project breakdown (only non-archived deployed items)
  type ProjectInfo = {
    total: number;
    byType: Map<string, number>;
    items: EquipRow[];
    oldestAge: number;
  };

  const projectMap = useMemo(() => {
    const map = new Map<string, ProjectInfo>();
    for (const e of items) {
      if (e.archived) continue;
      if (String(e.status).toUpperCase() !== "DEPLOYED") continue;
      const proj = e.currentProjectCode ?? "—";
      if (!map.has(proj))
        map.set(proj, { total: 0, byType: new Map(), items: [], oldestAge: 0 });
      const bucket = map.get(proj)!;
      bucket.total += 1;
      bucket.items.push(e);
      bucket.byType.set(e.type, (bucket.byType.get(e.type) ?? 0) + 1);
    }
    map.forEach((info) => {
      info.oldestAge = info.items.reduce(
        (max, r) => Math.max(max, daysSince(r.lastMovedAt) ?? 0),
        0,
      );
    });
    return map;
  }, [items]);

  /* -------------------- Controls for project list -------------------- */

  const [projQuery, setProjQuery] = useState("");
  const [minProjTotal, setMinProjTotal] = useState<number>(0);
  const [typeMulti, setTypeMulti] = useState<string[]>([
    "Air Scrubber",
    "Blower",
    "Dehumidifier",
  ]);
  const [projBand, setProjBand] = useState<"" | "POTENTIAL" | "URGENT">("");
  const [projSort, setProjSort] = useState<
    "TOTAL_DESC" | "NAME_ASC" | "OLDEST_DESC"
  >("TOTAL_DESC");

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpand = (k: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  const expandAll = () =>
    setExpanded(new Set(filteredProjects.map(([k]) => k)));
  const collapseAll = () => setExpanded(new Set());

  const filteredProjects = useMemo(() => {
    let entries = Array.from(projectMap.entries());

    if (projQuery.trim()) {
      const ql = projQuery.trim().toLowerCase();
      entries = entries.filter(([name]) => name.toLowerCase().includes(ql));
    }

    if (minProjTotal > 0) entries = entries.filter(([, info]) => info.total >= minProjTotal);

    if (typeMulti.length > 0) {
      entries = entries.filter(([, info]) =>
        typeMulti.some((t) => (info.byType.get(t) ?? 0) > 0),
      );
    }

    if (projBand) {
      entries = entries.filter(([, info]) =>
        info.items.some((e) => {
          const d = daysSince(e.lastMovedAt);
          if (d == null) return false;
          return projBand === "POTENTIAL" ? d >= 7 && d < 14 : d >= 14;
        }),
      );
    }

    entries.sort((a, b) => {
      if (projSort === "TOTAL_DESC") return b[1].total - a[1].total;
      if (projSort === "NAME_ASC") return a[0].localeCompare(b[0]);
      return b[1].oldestAge - a[1].oldestAge; // OLDEST_DESC
    });

    return entries;
  }, [projectMap, projQuery, minProjTotal, typeMulti, projBand, projSort]);

  const allTypes = types;

  const bandBadge = (e: EquipRow) => {
    if (e.archived) return null;
    if (String(e.status).toUpperCase() !== "DEPLOYED") return null;
    const d = daysSince(e.lastMovedAt);
    if (d == null) return null;
    if (d >= 14)
      return (
        <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
          ≥ 14 days
        </span>
      );
    if (d >= 7)
      return (
        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
          ≥ 7 days
        </span>
      );
    return null;
  };

  const onSort = (key: SortKey) => {
    setPage(1);
    setSortDir((prev) =>
      key === sortKey ? (prev === "asc" ? "desc" : "asc") : "asc",
    );
    setSortKey(key);
  };

  const sortCaret = (key: SortKey) =>
    sortKey === key ? (
      <span className="ml-1 text-xs">{sortDir === "asc" ? "▲" : "▼"}</span>
    ) : (
      <span className="ml-1 text-xs text-gray-300">↕</span>
    );

  /* ---------- Small UI: by-type pill list ---------- */
  const TypePills = ({
    entries,
    emptyText = "No items.",
  }: {
    entries: Array<[string, number]>;
    emptyText?: string;
  }) =>
    entries.length === 0 ? (
      <div className="text-xs text-gray-500">{emptyText}</div>
    ) : (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {entries.map(([t, n]) => (
          <span
            key={`${t}`}
            className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-800"
          >
            {t}: <b>{n}</b>
          </span>
        ))}
      </div>
    );

  /* ---------- Top Aging visibility (remember per session) ---------- */
  const STORAGE_KEY_AGING = "equipment_show_top_aging";
  const [showTopAging, setShowTopAging] = useState(false);
  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY_AGING);
      if (v === "1") setShowTopAging(true);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (showTopAging) localStorage.setItem(STORAGE_KEY_AGING, "1");
      else localStorage.removeItem(STORAGE_KEY_AGING);
    } catch {}
  }, [showTopAging]);

  /* ---------- Top Aging notes (fixed: no hooks in loops) ---------- */
  const [agingNoteOpen, setAgingNoteOpen] = useState<Record<string, boolean>>({});
  const toggleAgingNote = (id: string) =>
    setAgingNoteOpen((m) => ({ ...m, [id]: !m[id] }));

  /* ---------- NEW: Project table note toggles ---------- */
  const [projNoteOpen, setProjNoteOpen] = useState<Record<string, boolean>>({});
  const toggleProjNote = (id: string) =>
    setProjNoteOpen((m) => ({ ...m, [id]: !m[id] }));

  /* ---------- Ready-to-Pull controls (filters + pagination) ---------- */
  const [pullTab, setPullTab] = useState<"URGENT" | "POTENTIAL">("URGENT");
  const [rpTypeF, setRpTypeF] = useState<string>(""); // filter by type
  const [rpQuery, setRpQuery] = useState<string>(""); // project/code search
  const [rpPage, setRpPage] = useState<number>(1);
  const rpPageSize = 15;

  useEffect(() => {
    // reset to first page when filters/tab change
    setRpPage(1);
  }, [pullTab, rpTypeF, rpQuery]);

  const readyListFiltered = useMemo(() => {
    const base =
      pullTab === "URGENT" ? stats.urgentList : stats.potentialList;

    let list = base;

    if (rpTypeF) list = list.filter((e) => e.type === rpTypeF);

    if (rpQuery.trim()) {
      const ql = rpQuery.trim().toLowerCase();
      list = list.filter((e) =>
        `${e.currentProjectCode ?? ""} ${e.type} ${e.assetNumber}`
          .toLowerCase()
          .includes(ql),
      );
    }

    // Sort by days desc (older first)
    list = [...list].sort(
      (a, b) =>
        (daysSince(b.lastMovedAt) ?? 0) - (daysSince(a.lastMovedAt) ?? 0),
    );

    return list;
  }, [pullTab, stats.urgentList, stats.potentialList, rpTypeF, rpQuery]);

  const rpTotal = readyListFiltered.length;
  const rpTotalPages = Math.max(1, Math.ceil(rpTotal / rpPageSize));
  const rpPageItems = readyListFiltered.slice(
    (rpPage - 1) * rpPageSize,
    rpPage * rpPageSize,
  );

  /* ---------- NEW: Ready-to-Pull visibility (hidden by default + persisted) ---------- */
  const STORAGE_KEY_READY = "equipment_show_ready_to_pull";
  const [showReadyToPull, setShowReadyToPull] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY_READY);
      if (v === "1") setShowReadyToPull(true);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (showReadyToPull) localStorage.setItem(STORAGE_KEY_READY, "1");
      else localStorage.removeItem(STORAGE_KEY_READY);
    } catch {}
  }, [showReadyToPull]);

  /* -------------------- Render -------------------- */

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-100 pt-24 md:pt-28 lg:pt-32">
      <Navbar />
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <h1 className="mb-5 text-2xl font-bold md:mb-6">Equipment Tracking</h1>

        {/* KPI Summary + By-type breakdowns */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-7">
          {/* Total (non-archived) */}
          <div className="rounded bg-white p-3 text-sm shadow">
            <div className="text-gray-500">Total (non-archived)</div>
            <div className="text-xl font-semibold">
              {stats.totalNonArchived}
            </div>
            <TypePills entries={stats.byType.totalNonArchived} />
          </div>

          {/* Deployed (non-archived) */}
          <div className="rounded bg-blue-50 p-3 text-sm shadow">
            <div className="text-blue-700">Deployed</div>
            <div className="text-xl font-semibold text-blue-900">
              {stats.deployed}
            </div>
            <TypePills
              entries={stats.byType.deployed}
              emptyText="No deployed equipment."
            />
          </div>

          {/* Warehouse (non-archived) */}
          <div className="rounded bg-green-50 p-3 text-sm shadow">
            <div className="text-green-700">Warehouse</div>
            <div className="text-xl font-semibold text-green-900">
              {stats.warehouse}
            </div>
            <TypePills
              entries={stats.byType.warehouse}
              emptyText="No items in warehouse."
            />
          </div>

          {/* Maintenance (non-archived) */}
          <div className="rounded bg-amber-50 p-3 text-sm shadow">
            <div className="text-amber-700">Maintenance</div>
            <div className="text-xl font-semibold text-amber-900">
              {stats.maintenance}
            </div>
            <TypePills
              entries={stats.byType.maintenance}
              emptyText="No items in maintenance."
            />
          </div>

          {/* Lost (non-archived) */}
          <div className="rounded bg-gray-50 p-3 text-sm shadow">
            <div className="text-gray-700">Lost</div>
            <div className="text-xl font-semibold text-gray-900">
              {stats.lost}
            </div>
            <TypePills entries={stats.byType.lost} emptyText="No lost items." />
          </div>

          {/* Archived (archived === true) */}
          <div className="rounded bg-slate-50 p-3 text-sm shadow">
            <div className="text-slate-700">Archived</div>
            <div className="text-xl font-semibold text-slate-900">
              {stats.archived}
            </div>
            <TypePills
              entries={stats.byType.archived}
              emptyText="No archived items."
            />
          </div>

          {/* Utilization: deployed / non-archived */}
          <div className="rounded bg-indigo-50 p-3 text-sm shadow">
            <div className="text-indigo-700">Utilization</div>
            <div className="text-xl font-semibold text-indigo-900">
              {stats.utilizationOverall}%
            </div>
            {stats.utilByType.length === 0 ? (
              <div className="mt-2 text-xs text-indigo-800/70">
                No non-archived inventory.
              </div>
            ) : (
              <ul className="mt-2 space-y-1">
                {stats.utilByType.map(({ type, pct, d, n }) => (
                  <li key={type} className="text-[11px] text-indigo-900">
                    <span className="font-semibold">{type}</span>: {pct}%{" "}
                    <span className="text-indigo-800/80">({d}/{n})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ======= Deployed — Breakdown by Project (non-archived only) ======= */}
        <div className="mb-6 rounded bg-white p-4 shadow md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Deployed — Breakdown by Project</h2>
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <button
                onClick={expandAll}
                className="rounded border px-2 py-1 hover:bg-gray-50"
                title="Expand all projects"
                type="button"
              >
                Expand all
              </button>
              <button
                onClick={collapseAll}
                className="rounded border px-2 py-1 hover:bg-gray-50"
                title="Collapse all projects"
                type="button"
              >
                Collapse all
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="sticky top-16 z-10 mb-3 grid grid-cols-1 gap-2 rounded border bg-white/95 p-2 md:grid-cols-12">
            <input
              className="rounded border p-2 md:col-span-4"
              placeholder="Search project code/name…"
              value={projQuery}
              onChange={(e) => setProjQuery(e.target.value)}
            />
            <div className="flex flex-col gap-1 md:col-span-3">
              <label className="text-xs text-gray-500">Filter Types</label>
              <div className="flex flex-wrap gap-1">
                {allTypes.map((t) => {
                  const active = typeMulti.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() =>
                        setTypeMulti((prev) =>
                          active ? prev.filter((x) => x !== t) : [...prev, t],
                        )
                      }
                      className={`rounded border px-2 py-1 text-xs ${
                        active
                          ? "bg-gray-800 text-white"
                          : "bg-white hover:bg-gray-50"
                      }`}
                      type="button"
                    >
                      {t}
                    </button>
                  );
                })}
                {typeMulti.length > 0 && (
                  <button
                    onClick={() => setTypeMulti([])}
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                    type="button"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="text-[10px] text-gray-500">
                Default active: Air Scrubber, Blower, Dehumidifier
              </div>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs text-gray-500">Min total</label>
              <input
                type="number"
                min={0}
                className="rounded border p-2"
                value={minProjTotal}
                onChange={(e) => setMinProjTotal(Number(e.target.value) || 0)}
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs text-gray-500">Age band</label>
              <select
                className="rounded border p-2"
                value={projBand}
                onChange={(e) =>
                  setProjBand(e.target.value as "" | "POTENTIAL" | "URGENT")
                }
              >
                <option value="">All</option>
                <option value="POTENTIAL">≥ 7 days</option>
                <option value="URGENT">≥ 14 days</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-xs text-gray-500">Sort</label>
              <select
                className="rounded border p-2"
                value={projSort}
                onChange={(e) =>
                  setProjSort(
                    e.target.value as
                      | "TOTAL_DESC"
                      | "NAME_ASC"
                      | "OLDEST_DESC",
                  )
                }
              >
                <option value="TOTAL_DESC">Total ↓</option>
                <option value="NAME_ASC">Project A→Z</option>
                <option value="OLDEST_DESC">Oldest age ↓</option>
              </select>
            </div>
          </div>

          {/* List */}
          {filteredProjects.length === 0 ? (
            <div className="text-sm text-gray-500">No deployed equipment.</div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map(([proj, info]) => {
                const isOpen = expanded.has(proj);
                const peek = [...info.items]
                  .map((r) => ({ r, d: daysSince(r.lastMovedAt) ?? -1 }))
                  .sort((a, b) => b.d - a.d)
                  .slice(0, 3)
                  .map((x) => x.r);

                return (
                  <div
                    key={proj}
                    className="rounded border border-gray-100 bg-white p-3 text-sm shadow-sm"
                  >
                    {/* Header */}
                    <button
                      className="flex w-full items-center justify-between gap-2"
                      onClick={() => toggleExpand(proj)}
                      aria-expanded={isOpen}
                      aria-controls={`proj-${proj}`}
                      type="button"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                            isOpen
                              ? "bg-gray-800 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {isOpen ? "−" : "+"}
                        </span>
                        <span className="truncate font-semibold">{proj}</span>
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-800">
                          Total: {info.total}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {Array.from(info.byType.entries())
                          .sort((a, b) => a[0].localeCompare(b[0]))
                          .map(([t, n]) => (
                            <span
                              key={t}
                              className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-800"
                              title={`${t}: ${n}`}
                            >
                              {t}: {n}
                            </span>
                          ))}
                      </div>
                    </button>

                    {/* Peek row (oldest 3) */}
                    {!isOpen && peek.length > 0 && (
                      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                        {peek.map((e) => {
                          const hasNote = !!latestOutNoteFor(e);
                          return (
                            <div
                              key={e.id}
                              className="flex items-center justify-between rounded bg-gray-50 px-2 py-1"
                            >
                              <span className="truncate">
                                {e.type} #{e.assetNumber}
                              </span>
                              <div className="flex items-center gap-2">
                                {hasNote && (
                                  <span
                                    className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800"
                                    title="Has note"
                                  >
                                    note
                                  </span>
                                )}
                                <span className="text-xs text-gray-600">
                                  {fmtElapsedFor(e)}
                                </span>
                                {bandBadge(e)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Expanded table */}
                    {isOpen && (
                      <div id={`proj-${proj}`} className="mt-3 overflow-x-auto">
                        <table className="min-w-full text-xs md:text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="p-2 text-left">Type</th>
                              <th className="p-2 text-left">#</th>
                              <th className="p-2 text-left">Last moved by</th>
                              <th className="p-2 text-left">Last moved at</th>
                              <th className="p-2 text-left">Elapsed</th>
                              <th className="p-2 text-left">Flag</th>
                              {/* NEW: Note column */}
                              <th className="p-2 text-left">Note</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...info.items]
                              .sort(
                                (a, b) =>
                                  (daysSince(b.lastMovedAt) ?? 0) -
                                  (daysSince(a.lastMovedAt) ?? 0),
                              )
                              .map((e) => {
                                const note = latestOutNoteFor(e);
                                const open = !!projNoteOpen[e.id];
                                return (
                                  <tr key={e.id} className="border-t align-top">
                                    <td className="p-2">{e.type}</td>
                                    <td className="p-2 font-semibold">
                                      {e.assetNumber}
                                    </td>
                                    <td className="p-2">
                                      {e.lastMovedBy ?? "—"}
                                    </td>
                                    <td className="p-2">
                                      {e.lastMovedAt
                                        ? new Date(
                                            e.lastMovedAt as any,
                                          ).toLocaleString()
                                        : "—"}
                                    </td>
                                    <td className="p-2">{fmtElapsedFor(e)}</td>
                                    <td className="p-2">{bandBadge(e)}</td>
                                    {/* NEW: Note cell */}
                                    <td className="p-2">
                                      {note ? (
                                        <div className="space-y-1">
                                          <button
                                            type="button"
                                            onClick={() => toggleProjNote(e.id)}
                                            className="rounded border px-2 py-0.5 text-[11px] hover:bg-gray-50"
                                            title={
                                              open ? "Hide note" : "Show note"
                                            }
                                          >
                                            {open ? "Hide" : "Show"} note
                                          </button>
                                          {open && (
                                            <div className="max-w-xs rounded bg-amber-50 p-2 text-[11px] ring-1 ring-amber-200 md:max-w-md lg:max-w-lg">
                                              <div className="mb-1 font-semibold text-amber-800">
                                                Note (latest deploy)
                                              </div>
                                              <div className="whitespace-pre-wrap break-words text-amber-900">
                                                {note}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-[11px] text-gray-400">
                                          —
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======= Ready-to-Pull (action list) — now collapsible & hidden by default ======= */}
        <div className="mb-6 rounded bg-white p-4 shadow md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold md:text-lg">Ready to Pull</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReadyToPull((v) => !v)}
                className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
              >
                {showReadyToPull ? "Hide" : "Show"} Ready to Pull
              </button>
            </div>
          </div>

          {!showReadyToPull ? (
            <div className="text-sm text-gray-500">
              Hidden. Click “Show Ready to Pull” to view suggested pickups.
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPullTab("URGENT")}
                    className={`rounded border px-3 py-1 ${
                      pullTab === "URGENT" ? "bg-red-600 text-white" : "bg-white"
                    }`}
                  >
                    Urgent ≥14 ({stats.urgent})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPullTab("POTENTIAL")}
                    className={`rounded border px-3 py-1 ${
                      pullTab === "POTENTIAL" ? "bg-amber-500 text-white" : "bg-white"
                    }`}
                  >
                    Potential ≥7 ({stats.potential})
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-5">
                <select
                  className="rounded border p-2"
                  value={rpTypeF}
                  onChange={(e) => setRpTypeF(e.target.value)}
                >
                  <option value="">All Types</option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded border p-2 md:col-span-2"
                  placeholder="Search by project / type / #"
                  value={rpQuery}
                  onChange={(e) => setRpQuery(e.target.value)}
                />
                <div className="md:col-span-2">
                  <Pagination
                    page={rpPage}
                    setPage={setRpPage}
                    pageSize={rpPageSize}
                    total={rpTotal}
                    compact
                  />
                </div>
              </div>

              {/* Table */}
              {rpTotal === 0 ? (
                <div className="text-sm text-gray-500">
                  {pullTab === "URGENT"
                    ? "No items at or beyond 14 days."
                    : "No items between 7–13 days."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs md:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Type • #</th>
                        <th className="p-2 text-left">Project</th>
                        <th className="p-2 text-left">Last moved by</th>
                        <th className="p-2 text-left">Last moved at</th>
                        <th className="p-2 text-left">Days</th>
                        <th className="p-2 text-left">Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rpPageItems.map((e) => {
                        const d = daysSince(e.lastMovedAt) ?? 0;
                        return (
                          <tr key={e.id} className="border-t">
                            <td className="p-2 font-medium">
                              {e.type}{" "}
                              <span className="text-gray-500">#{e.assetNumber}</span>
                            </td>
                            <td className="p-2">{e.currentProjectCode ?? "—"}</td>
                            <td className="p-2">{e.lastMovedBy ?? "—"}</td>
                            <td className="p-2">
                              {e.lastMovedAt
                                ? new Date(e.lastMovedAt as any).toLocaleString()
                                : "—"}
                            </td>
                            <td className="p-2">{d}d</td>
                            <td className="p-2">{bandBadge(e)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom pagination */}
              {rpTotal > 0 && (
                <Pagination
                  page={rpPage}
                  setPage={setRpPage}
                  pageSize={rpPageSize}
                  total={rpTotal}
                  className="mt-3"
                  compact
                />
              )}
            </>
          )}
        </div>

        {/* ======= Top Aging (Global) — collapsed by default + fixed hooks ======= */}
        <div className="mb-6 rounded bg-white p-4 shadow md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold md:text-lg">Top Aging (Global)</h3>
            <button
              type="button"
              onClick={() => setShowTopAging((v) => !v)}
              className="rounded border px-3 py-1 text-xs hover:bg-gray-50"
            >
              {showTopAging ? "Hide Top Aging" : "Show Top Aging"}
            </button>
          </div>

          {!showTopAging ? (
            <div className="text-sm text-gray-500">
              Hidden. Click “Show Top Aging” to view the oldest deployed items.
            </div>
          ) : stats.oldest.length === 0 ? (
            <div className="text-sm text-gray-500">No deployed equipment.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="p-2 text-left">Type • #</th>
                    <th className="p-2 text-left">Project</th>
                    <th className="p-2 text-left">Last moved by</th>
                    <th className="p-2 text-left">Last moved at</th>
                    <th className="p-2 text-left">Elapsed</th>
                    <th className="p-2 text-left">Days</th>
                    <th className="p-2 text-left">Flag</th>
                    <th className="p-2 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.oldest.map((e) => {
                    const d = daysSince(e.lastMovedAt) ?? 0;
                    const note = latestOutNoteFor(e);
                    const open = !!agingNoteOpen[e.id];
                    return (
                      <tr key={e.id} className="border-t">
                        <td className="p-2 font-medium">
                          {e.type}{" "}
                          <span className="text-gray-500">#{e.assetNumber}</span>
                        </td>
                        <td className="p-2">{e.currentProjectCode ?? "—"}</td>
                        <td className="p-2">{e.lastMovedBy ?? "—"}</td>
                        <td className="p-2">
                          {e.lastMovedAt
                            ? new Date(e.lastMovedAt as any).toLocaleString()
                            : "—"}
                        </td>
                        <td className="p-2">{fmtElapsedFor(e)}</td>
                        <td className="p-2">{d}d</td>
                        <td className="p-2">{bandBadge(e)}</td>
                        <td className="p-2">
                          {note ? (
                            <div className="space-y-1">
                              <button
                                type="button"
                                onClick={() => toggleAgingNote(e.id)}
                                className="rounded border px-2 py-0.5 text-[11px] hover:bg-gray-50"
                                title={open ? "Hide note" : "Show note"}
                              >
                                {open ? "Hide" : "Show"} note
                              </button>
                              {open && (
                                <div className="rounded bg-amber-50 p-2 text-[11px] ring-1 ring-amber-200">
                                  <div className="mb-1 font-semibold text-amber-800">
                                    Note (latest deploy)
                                  </div>
                                  <div className="whitespace-pre-wrap text-amber-900">
                                    {note}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ---------- Filters (main table) ---------- */}
        <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-6">
          <input
            placeholder="Search (type, #, project, last moved by…) — tip: type 01 for #1"
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

          {/* Show archived rows toggle (only affects the table) */}
          <label className="flex items-center gap-2 rounded border p-2 text-sm">
            <input
              type="checkbox"
              checked={showArchivedRows}
              onChange={(e) => setShowArchivedRows(e.target.checked)}
            />
            <span>Show archived rows in table</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyBand("")}
              className={`rounded px-3 py-2 text-sm ${
                onlyBand === "" ? "bg-gray-800 text-white" : "border bg-white"
              }`}
              type="button"
            >
              All
            </button>
            <button
              onClick={() => setOnlyBand("POTENTIAL")}
              className={`rounded px-3 py-2 text-sm ${
                onlyBand === "POTENTIAL"
                  ? "bg-amber-600 text-white"
                  : "border bg-white"
              }`}
              type="button"
            >
              Potential ≥7
            </button>
            <button
              onClick={() => setOnlyBand("URGENT")}
              className={`rounded px-3 py-2 text-sm ${
                onlyBand === "URGENT"
                  ? "bg-red-600 text-white"
                  : "border bg-white"
              }`}
              type="button"
            >
              Urgent ≥14
            </button>
          </div>
        </div>

        {/* Pagination (TOP) */}
        <div className="hidden md:block">
          <Pagination
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            total={filtered.length}
          />
        </div>

        {/* TABLE (md+) */}
        <div className="hidden overflow-x-auto rounded bg-white shadow md:block">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="cursor-pointer p-3 text-left"
                  onClick={() => onSort("type")}
                >
                  Type {sortCaret("type")}
                </th>
                <th
                  className="cursor-pointer p-3 text-left"
                  onClick={() => onSort("assetNumber")}
                >
                  #{sortCaret("assetNumber")}
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
                pageItems.map((e) => {
                  const archivedBadge = e.archived ? (
                    <span className="ml-2 rounded bg-slate-200 px-2 py-0.5 text-[10px] text-slate-700">
                      Archived
                    </span>
                  ) : null;
                  return (
                    <tr
                      key={e.id}
                      className={`border-t ${e.archived ? "opacity-70" : ""}`}
                    >
                      <td className="p-3">{e.type}</td>
                      <td className="p-3 font-semibold">{e.assetNumber}</td>
                      <td className="p-3">
                        {String(e.status)}
                        {archivedBadge}
                      </td>
                      <td className="p-3">{e.currentProjectCode ?? "—"}</td>
                      <td className="p-3">{e.lastMovedBy ?? "—"}</td>
                      <td className="p-3">
                        {e.lastMovedAt
                          ? new Date(e.lastMovedAt as any).toLocaleString()
                          : "—"}
                      </td>
                      <td className="p-3">{fmtElapsedFor(e)}</td>
                      <td className="p-3">
                        {String(e.status).toUpperCase() === "DEPLOYED" &&
                        !e.archived
                          ? bandBadge(e)
                          : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (BOTTOM desktop) */}
        <div className="hidden md:block">
          <Pagination
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            total={filtered.length}
          />
        </div>

        {/* CARDS (mobile) */}
        <div className="md:hidden">
          {/* Pagination (TOP mobile) */}
          <Pagination
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            total={filtered.length}
            compact
          />

          {loading ? (
            <div className="rounded bg-white p-4 text-sm shadow">Loading…</div>
          ) : pageItems.length === 0 ? (
            <div className="rounded bg-white p-4 text-sm shadow">No results</div>
          ) : (
            <div className="space-y-3">
              {pageItems.map((e) => {
                const d = daysSince(e.lastMovedAt);
                const statusClass =
                  String(e.status).toUpperCase() === "DEPLOYED"
                    ? "bg-blue-100 text-blue-800"
                    : String(e.status).toUpperCase() === "WAREHOUSE"
                    ? "bg-green-100 text-green-800"
                    : String(e.status).toUpperCase() === "MAINTENANCE"
                    ? "bg-amber-100 text-amber-800"
                    : String(e.status).toUpperCase() === "LOST"
                    ? "bg-gray-200 text-gray-800"
                    : "bg-gray-200 text-gray-800";
                return (
                  <div
                    key={e.id}
                    className={`rounded bg-white p-4 shadow ${e.archived ? "opacity-70" : ""}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-base font-semibold">
                        {e.type} #{e.assetNumber}
                      </div>
                      <div className="flex items-center gap-2">
                        {e.archived && (
                          <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] text-slate-700">
                            Archived
                          </span>
                        )}
                        <span className={`rounded px-2 py-0.5 text-xs ${statusClass}`}>
                          {String(e.status)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Project</span>
                        <span className="font-medium">
                          {e.currentProjectCode ?? "—"}
                        </span>
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
                        <span className="font-medium">{fmtElapsedFor(e)}</span>
                      </div>

                      {!e.archived &&
                        String(e.status).toUpperCase() === "DEPLOYED" &&
                        d != null && (
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

          {/* Pagination (BOTTOM mobile) */}
          <Pagination
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            total={filtered.length}
            compact
          />
        </div>
        {/* /mobile */}
      </div>
    </div>
  );
}
