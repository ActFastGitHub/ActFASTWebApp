"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/app/components/navBar";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import jsQR from "jsqr";
import type {
  MovementDirection,
  MoveRequest,
  MoveResponse,
  DeleteResponse,
} from "@/app/types/equipment";
import {
  isMoveOK,
  isMoveError,
  isDeleteOK,
  isDeleteError,
} from "@/app/types/equipment";

/* ──────────────────────────────────────────────────────────── */
/*  LocalStorage keys                                           */
/* ──────────────────────────────────────────────────────────── */
const LS_QUEUE = "eqmove:queue";
const LS_DIR = "eqmove:direction";
const LS_PROJ = "eqmove:project";

/* ──────────────────────────────────────────────────────────── */
/*  Helpers                                                     */
/* ──────────────────────────────────────────────────────────── */
type Project = { id: string; code: string };
type MoveRow = { id: string; type: string; assetNumber: string };

const mkId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function normalizeRows(raw: any): MoveRow[] {
  const arr: MoveRow[] = Array.isArray(raw) ? raw : [];
  return arr.map((r, idx) => ({
    id: typeof r.id === "string" ? r.id : mkId() + "_" + idx,
    type: String(r.type ?? ""),
    assetNumber: String(r.assetNumber ?? ""),
  }));
}

function loadQueue(): MoveRow[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_QUEUE) || "[]");
    return normalizeRows(raw);
  } catch {
    return [];
  }
}
function saveQueue(q: MoveRow[]) {
  localStorage.setItem(
    LS_QUEUE,
    JSON.stringify(q.map(({ id, ...rest }) => ({ id, ...rest }))),
  );
}
function loadString(key: string, def = ""): string {
  try {
    return localStorage.getItem(key) || def;
  } catch {
    return def;
  }
}
function saveString(key: string, val: string) {
  localStorage.setItem(key, val);
}

/* ──────────────────────────────────────────────────────────── */
/*  Scanner Overlay (in-browser camera QR scan)                 */
/* ──────────────────────────────────────────────────────────── */
function ScannerOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const tick = () => {
          const v = videoRef.current;
          const c = canvasRef.current;
          if (v && c) {
            c.width = v.videoWidth;
            c.height = v.videoHeight;
            const ctx = c.getContext("2d");
            if (ctx && c.width && c.height) {
              ctx.drawImage(v, 0, 0, c.width, c.height);
              const imgData = ctx.getImageData(0, 0, c.width, c.height);
              const code = jsQR(imgData.data, c.width, c.height, {
                inversionAttempts: "dontInvert",
              });
              if (code?.data) {
                // stop everything first
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach((t) => t.stop());
                }
                // navigate to the QR URL (e.g. /e/Dehumidifier/1?...), which adds to batch
                window.location.href = code.data;
                return;
              }
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        toast.error("Camera permission denied or unavailable");
        onClose();
      }
    })();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-black shadow-lg">
        <video
          ref={videoRef}
          playsInline
          className="block h-[60vh] w-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded bg-white/90 px-3 py-1 text-sm"
        >
          Close
        </button>
        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-center text-xs text-white">
          Point the camera at a printed QR label.
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Component                                                   */
/* ──────────────────────────────────────────────────────────── */
export default function MoveClient(): JSX.Element {
  const { status, data: session } = useSession();
  const role = (session?.user?.role || "").toLowerCase();
  const isAdmin = role === "admin" || role === "owner";

  const router = useRouter();
  const params = useSearchParams();

  /* ---------- Auth redirect ---------- */
  useEffect(() => {
    if (status === "unauthenticated") {
      const dest =
        typeof window !== "undefined" ? window.location.href : "/equipment/move";
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
    }
  }, [status, router]);

  /* ---------- QR / URL params ---------- */
  const initialType = params.get("type") || "";
  const initialAsset = params.get("asset") || "";
  const initialDirection = (params.get("direction") || "").toUpperCase();
  const quickMode = params.get("quick") === "1";

  /* ---------- Movement Form State ---------- */
  const [direction, setDirection] = useState<MovementDirection>(
    (loadString(LS_DIR) as MovementDirection) ||
      (initialDirection === "IN" || initialDirection === "OUT"
        ? (initialDirection as MovementDirection)
        : "OUT"),
  );
  const [useNow, setUseNow] = useState(true);
  const [manualIso, setManualIso] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    saveString(LS_DIR, direction);
  }, [direction]);

  /* ---------- Project combobox (sorted DESC) ---------- */
  const [projects, setProjects] = useState<Project[]>([]);
  const [projQuery, setProjQuery] = useState("");
  const [projectCode, setProjectCode] = useState<string>(loadString(LS_PROJ));

  useEffect(() => {
    saveString(LS_PROJ, projectCode);
  }, [projectCode]);

  const filteredProjects = useMemo(() => {
    const q = projQuery.toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.code.toLowerCase().includes(q));
  }, [projects, projQuery]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/projects");
        if (res.data?.projects) {
          const sorted = res.data.projects
            .map((p: any) => ({ id: p.id, code: p.code }))
            .sort((a: Project, b: Project) => b.code.localeCompare(a.code));
          setProjects(sorted);
        }
      } catch {
        /* noop */
      }
    })();
  }, []);

  /* ---------- Batch rows (QR adds here) ---------- */
  const [rows, setRows] = useState<MoveRow[]>([]);

  // Initialize from localStorage & handle direct param add
  useEffect(() => {
    const existing = loadQueue();
    let next = existing;

    if (initialType && initialAsset) {
      const item: MoveRow = { id: mkId(), type: initialType, assetNumber: initialAsset };
      const key = `${item.type}#${item.assetNumber}`;
      const set = new Set(existing.map((r) => `${r.type}#${r.assetNumber}`));
      if (!set.has(key)) {
        next = [...existing, item];
        saveQueue(next);
        toast.success(`Added ${item.type} #${item.assetNumber} to batch`);
      }
    }

    setRows(next.length ? next : [{ id: mkId(), type: "", assetNumber: "" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  function addRow() {
    setRows((r) => {
      const next = [...r, { id: mkId(), type: "", assetNumber: "" }];
      saveQueue(next);
      return next;
    });
  }
  function removeRow(i: number) {
    setRows((r) => {
      if (r.length <= 1) return r;
      const next = r.filter((_, idx) => idx !== i);
      saveQueue(next);
      return next;
    });
  }
  function updateRow(i: number, patch: Partial<MoveRow>) {
    setRows((r) => {
      const next = r.map((row, idx) => (idx === i ? { ...row, ...patch } : row));
      saveQueue(next);
      return next;
    });
  }
  function clearBatch() {
    setRows([{ id: mkId(), type: "", assetNumber: "" }]);
    saveQueue([]);
    toast("Batch cleared");
  }

  /* ---------- Build Payload + Validate ---------- */
  function buildPayload(): MoveRequest {
    const items = rows
      .map((r) => ({
        type: r.type.trim(),
        assetNumber: Number(r.assetNumber),
      }))
      .filter(
        (i) => i.type && Number.isInteger(i.assetNumber) && i.assetNumber > 0,
      );

    return {
      direction,
      projectCode: direction === "OUT" ? projectCode.trim() : undefined,
      when: useNow ? undefined : manualIso || undefined,
      note: note || undefined,
      rawMessage: undefined,
      items,
    };
  }

  function validateBeforeSubmit(): string | null {
    const payload = buildPayload();
    if (!payload.items.length) return "Please add at least one valid item.";
    if (payload.direction === "OUT" && !payload.projectCode)
      return "Project code is required when moving OUT.";
    if (!useNow) {
      if (!payload.when) return "Please select a manual date/time.";
      const dt = new Date(payload.when);
      if (Number.isNaN(dt.getTime())) return "Invalid manual date/time.";
    }
    return null;
  }

  /* ---------- Submit All ---------- */
  async function submitAll() {
    const validation = validateBeforeSubmit();
    if (validation) {
      toast.error(validation);
      return;
    }

    try {
      const payload = buildPayload();
      const { data } = await axios.post<MoveResponse>(
        "/api/equipment/move",
        payload,
      );

      if (isMoveOK(data)) {
        toast.success(`Recorded ${direction} for ${data.moved} item(s)`);
        // keep project & direction sticky, but clear batch + note/time
        clearBatch();
        setNote("");
        setUseNow(true);
        setManualIso("");
        refreshRecent();
      } else {
        if (Array.isArray(data.missing)) {
          toast.error(`Missing: ${data.missing.join(", ")}`, {
            duration: 6000,
          });
        } else {
          toast.error(data.error || "Failed to record movement");
        }
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: MoveResponse } };
      const res = err.response?.data;

      if (res && isMoveError(res) && Array.isArray(res.missing)) {
        toast.error(`Missing: ${res.missing.join(", ")}`, { duration: 6000 });
      } else if (res && isMoveError(res)) {
        toast.error(res.error || "Failed to record movement");
      } else {
        toast.error("Failed to record movement");
      }
    }
  }

  /* ---------- Recent Movements (sortable, filter, paginate + auto-archive) ---------- */
  type Recent = {
    id: string;
    type: string;
    assetNumber: number;
    direction: string;
    at: string;
    projectCode?: string | null;
    note?: string | null;
    byId?: string | null;
  };
  const [recent, setRecent] = useState<Recent[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // controls
  const [recQuery, setRecQuery] = useState("");
  const [recSort, setRecSort] = useState<
    "at" | "type" | "assetNumber" | "direction"
  >("at");
  const [recDir, setRecDir] = useState<"asc" | "desc">("desc");
  const [recPage, setRecPage] = useState(1);
  const [recPageSize, setRecPageSize] = useState(20);
  const [dateFrom, setDateFrom] = useState<string>(""); // yyyy-mm-dd
  const [dateTo, setDateTo] = useState<string>("");

  // auto-archive (>30 days old)
  const [showArchived, setShowArchived] = useState(false);
  const cutoffMs = useMemo(
    () => Date.now() - 30 * 24 * 60 * 60 * 1000,
    [],
  );

  async function refreshRecent() {
    try {
      const { data } = await axios.get<{ status: number; items: Recent[] }>(
        "/api/equipment/movements",
        { params: { limit: 800 } },
      );
      if (data.status === 200) setRecent(data.items);
    } catch {
      /* noop */
    }
  }
  useEffect(() => {
    refreshRecent();
  }, []);

  const recentFilteredSorted = useMemo(() => {
    let arr = [...recent];

    // date range
    if (dateFrom) {
      const from = new Date(dateFrom + "T00:00:00");
      arr = arr.filter((r) => new Date(r.at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo + "T23:59:59");
      arr = arr.filter((r) => new Date(r.at) <= to);
    }

    // auto-archive filter
    if (!showArchived) {
      arr = arr.filter((r) => new Date(r.at).getTime() >= cutoffMs);
    }

    // text filter
    const s = recQuery.toLowerCase().trim();
    if (s) {
      arr = arr.filter((r) =>
        `${r.type} ${r.assetNumber} ${r.direction} ${r.projectCode ?? ""} ${
          r.byId ?? ""
        } ${r.note ?? ""}`
          .toLowerCase()
          .includes(s),
      );
    }

    // sort
    arr.sort((a, b) => {
      let cmp = 0;
      if (recSort === "at")
        cmp = new Date(a.at).getTime() - new Date(b.at).getTime();
      else if (recSort === "type") cmp = a.type.localeCompare(b.type);
      else if (recSort === "direction")
        cmp = a.direction.localeCompare(b.direction);
      else cmp = a.assetNumber - b.assetNumber;
      return recDir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [recent, recQuery, recSort, recDir, dateFrom, dateTo, showArchived, cutoffMs]);

  const totalPages = Math.max(
    1,
    Math.ceil(recentFilteredSorted.length / recPageSize),
  );
  const pageItems = useMemo(() => {
    const start = (recPage - 1) * recPageSize;
    return recentFilteredSorted.slice(start, start + recPageSize);
  }, [recentFilteredSorted, recPage, recPageSize]);

  async function deleteMovement(id: string) {
    try {
      const { data } = await axios.delete<DeleteResponse>(
        `/api/equipment/movements/${id}`,
      );
      if (isDeleteOK(data)) {
        toast.success("Movement deleted");
        setConfirmDeleteId(null);
        refreshRecent();
      } else if (isDeleteError(data)) {
        toast.error(data.error || "Delete failed");
      } else {
        toast.error("Delete failed");
      }
    } catch (e: unknown) {
      const resp = (e as any)?.response?.data as DeleteResponse | undefined;
      if (resp && isDeleteError(resp)) toast.error(resp.error || "Delete failed");
      else toast.error("Delete failed");
    }
  }

  /* ---------- Scanner control ---------- */
  const [scannerOpen, setScannerOpen] = useState(false);

  /* ──────────────────────────────────────────────────────────── */
  /*  Render                                                      */
  /* ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-100 pt-24 md:pt-28 lg:pt-32">
      <Navbar />
      <div className="mx-auto max-w-4xl p-4">
        <h1 className="mb-4 text-2xl font-bold">Equipment Movement</h1>

        {/* Direction */}
        <div className="mb-4 flex gap-2">
          {(["OUT", "IN"] as MovementDirection[]).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`rounded px-3 py-2 text-sm ${
                direction === d ? "bg-blue-600 text-white" : "bg-white border"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Project (OUT only) — sorted DESC */}
        {direction === "OUT" && (
          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Project
            </label>
            <Combobox
              as="div"
              value={projectCode}
              onChange={(v: string) => setProjectCode(v ?? "")}
            >
              <div className="relative">
                <Combobox.Input
                  className="w-full rounded border p-2"
                  displayValue={(v: string) => v}
                  onChange={(e) => {
                    setProjectCode(e.target.value);
                    setProjQuery(e.target.value);
                  }}
                  placeholder="Search or select project code"
                />
                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                </Combobox.Button>
                {filteredProjects.length > 0 && (
                  <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {filteredProjects.map((p) => (
                      <Combobox.Option
                        key={p.id}
                        value={p.code}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                            active ? "bg-blue-600 text-white" : "text-gray-900"
                          }`
                        }
                      >
                        {({ active, selected }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? "font-semibold" : ""
                              }`}
                            >
                              {p.code}
                            </span>
                            {selected && (
                              <span
                                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                  active ? "text-white" : "text-blue-600"
                                }`}
                              >
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
          </div>
        )}

        {/* Date / Time */}
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useNow}
              onChange={(e) => setUseNow(e.target.checked)}
            />
            <span className="text-sm">Use current date/time</span>
          </label>
          {!useNow && (
            <div>
              <label className="block text-sm font-medium">
                Specify date/time
              </label>
              <input
                type="datetime-local"
                value={manualIso}
                onChange={(e) => setManualIso(e.target.value)}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
          )}
        </div>

        {/* Batch Items (QR adds here) */}
        <div className="mb-4 rounded bg-white p-4 shadow">
          <h2 className="mb-2 font-semibold">Batch Items</h2>
          <p className="mb-3 text-xs text-gray-500">
            Tip: <b>QR Quick Mode</b> lets you scan multiple items first (they’ll
            appear here), then save once.
          </p>
          <div className="space-y-3">
            {rows.map((row, i) => (
              <div
                key={row.id} // ← stable key fixes "one character" typing bug
                className="grid grid-cols-1 gap-2 sm:grid-cols-7"
              >
                <div className="sm:col-span-4">
                  <label className="block text-xs text-gray-600">Type</label>
                  <input
                    className="mt-1 w-full rounded border p-2"
                    value={row.type}
                    onChange={(e) => updateRow(i, { type: e.target.value })}
                    placeholder="Dehumidifier, Blower, Air Scrubber…"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-600">Asset #</label>
                  <input
                    className="mt-1 w-full rounded border p-2"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={row.assetNumber}
                    onChange={(e) =>
                      updateRow(i, { assetNumber: e.target.value })
                    }
                    placeholder="e.g. 33"
                  />
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <button
                    onClick={() => removeRow(i)}
                    className="w-full rounded border px-3 py-2 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={addRow}
              className="rounded bg-gray-800 px-3 py-2 text-white"
            >
              + Add Row
            </button>
            <button onClick={clearBatch} className="rounded border px-3 py-2">
              Clear Batch
            </button>

            {/* Next Scan → open camera scanner overlay */}
            <button
              onClick={() => setScannerOpen(true)}
              className="rounded bg-amber-600 px-3 py-2 text-white"
            >
              Next Scan
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Notes
          </label>
          <textarea
            className="min-h-32 w-full rounded border p-3"
            placeholder="Optional context... (who, where onsite, reason for delayed entry, etc.)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Save All */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={submitAll}
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white"
          >
            Save All
          </button>
        </div>

        {/* Recent Movements (sortable, filter, paginate + auto-archive) */}
        <div className="rounded bg-white p-4 shadow">
          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="font-semibold">Recent Movements</h2>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
              <input
                className="rounded border p-2 text-sm"
                placeholder="Filter text…"
                value={recQuery}
                onChange={(e) => {
                  setRecQuery(e.target.value);
                  setRecPage(1);
                }}
              />
              <select
                className="rounded border p-2 text-sm"
                value={recSort}
                onChange={(e) => setRecSort(e.target.value as any)}
              >
                <option value="at">Date/Time</option>
                <option value="type">Type</option>
                <option value="assetNumber">Asset #</option>
                <option value="direction">Direction</option>
              </select>
              <select
                className="rounded border p-2 text-sm"
                value={recDir}
                onChange={(e) => setRecDir(e.target.value as any)}
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
              <input
                type="date"
                className="rounded border p-2 text-sm"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setRecPage(1);
                }}
              />
              <input
                type="date"
                className="rounded border p-2 text-sm"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setRecPage(1);
                }}
              />
              <select
                className="rounded border p-2 text-sm"
                value={recPageSize}
                onChange={(e) => {
                  setRecPageSize(Number(e.target.value));
                  setRecPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <label className="flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => {
                    setShowArchived(e.target.checked);
                    setRecPage(1);
                  }}
                />
                Show archived (&gt; 30 days)
              </label>
            </div>
          </div>

          <div className="space-y-2">
            {pageItems.length === 0 ? (
              <div className="text-sm text-gray-600">No entries</div>
            ) : (
              pageItems.map((m) => {
                const isArchived = new Date(m.at).getTime() < cutoffMs;
                return (
                  <div
                    key={m.id}
                    className="flex flex-col gap-1 rounded border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="text-sm">
                      <span className="font-semibold">
                        {m.type} #{m.assetNumber}
                      </span>{" "}
                      <span className="uppercase">{m.direction}</span>{" "}
                      <span>— {new Date(m.at).toLocaleString()}</span>{" "}
                      {m.projectCode ? (
                        <span>
                          {" "}
                          | Project:{" "}
                          <span className="font-medium">{m.projectCode}</span>
                        </span>
                      ) : null}
                      {m.note ? <span> | Note: {m.note}</span> : null}
                      {isArchived ? (
                        <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                          Archived
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex gap-2 sm:mt-0">
                      {isAdmin ? (
                        confirmDeleteId === m.id ? (
                          <>
                            <button
                              onClick={() => deleteMovement(m.id)}
                              className="rounded bg-red-600 px-3 py-2 text-white"
                            >
                              Confirm Delete
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDeleteId(null);
                                toast("Delete cancelled");
                              }}
                              className="rounded bg-gray-300 px-3 py-2"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setConfirmDeleteId(m.id);
                              toast("Click again to confirm delete", {
                                icon: "⚠️",
                              });
                            }}
                            className="rounded bg-red-600 px-3 py-2 text-white"
                          >
                            Delete
                          </button>
                        )
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* pagination controls */}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Page {recPage} / {totalPages} &middot;{" "}
              {recentFilteredSorted.length} items
            </div>
            <div className="flex gap-2">
              <button
                disabled={recPage <= 1}
                onClick={() => setRecPage((p) => Math.max(1, p - 1))}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={recPage >= totalPages}
                onClick={() => setRecPage((p) => Math.min(totalPages, p + 1))}
                className="rounded border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera scanner overlay */}
      <ScannerOverlay open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
}
