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
  EquipmentDTO,
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

function formatDDHHMM(ms: number): string {
  let mins = Math.floor(ms / 60000);
  const days = Math.floor(mins / (60 * 24));
  mins -= days * 60 * 24;
  const hours = Math.floor(mins / 60);
  mins -= hours * 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${days}d ${pad(hours)}h ${pad(mins)}m`;
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
                if (rafRef.current) cancelAnimationFrame(rafRef.current);
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach((t) => t.stop());
                }
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
/*  WhatsApp Report Modal                                       */
/* ──────────────────────────────────────────────────────────── */
type MovementForReport = {
  id: string;
  type: string;
  assetNumber: number;
  direction: "IN" | "OUT";
  at: string;
  projectCode?: string | null;
  note?: string | null;
};

function WhatsAppReportModal({
  open,
  onClose,
  movements,
}: {
  open: boolean;
  onClose: () => void;
  movements: MovementForReport[];
}) {
  const [mode, setMode] = useState<"today" | "custom" | "project" | "warehouse">(
    "today",
  );
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [project, setProject] = useState("");

  useEffect(() => {
    if (!open) {
      setMode("today");
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = `${d.getMonth() + 1}`.padStart(2, "0");
      const dd = `${d.getDate()}`.padStart(2, "0");
      setDate(`${yyyy}-${mm}-${dd}`);
      setProject("");
    }
  }, [open]);

  if (!open) return null;

  const titleDate = (isoDate: string) => {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generate = async () => {
    const targetDay =
      mode === "today" || mode === "warehouse" || mode === "project"
        ? new Date()
        : new Date(date + "T00:00:00");
    const y = targetDay.getFullYear();
    const m = `${targetDay.getMonth() + 1}`.padStart(2, "0");
    const d = `${targetDay.getDate()}`.padStart(2, "0");
    const start = new Date(`${y}-${m}-${d}T00:00:00`);
    const end = new Date(`${y}-${m}-${d}T23:59:59`);

    // filter movements for that day
    let rows = movements.filter((r) => {
      const t = new Date(r.at).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });

    const projOnly = mode === "project" && project.trim();
    if (projOnly) {
      rows = rows.filter((r) => (r.projectCode || "") === project.trim());
    }
    const warehouseOnly = mode === "warehouse";

    const byProject = new Map<string, Map<string, number[]>>();
    const byTypeIn = new Map<string, number[]>();

    rows.forEach((r) => {
      if (r.direction === "OUT" && (!warehouseOnly || !!r.projectCode)) {
        const proj = r.projectCode || "Unknown Project";
        if (!byProject.has(proj)) byProject.set(proj, new Map());
        const mapTypes = byProject.get(proj)!;
        if (!mapTypes.has(r.type)) mapTypes.set(r.type, []);
        mapTypes.get(r.type)!.push(r.assetNumber);
      } else if (r.direction === "IN" && (!projOnly || warehouseOnly)) {
        if (!byTypeIn.has(r.type)) byTypeIn.set(r.type, []);
        byTypeIn.get(r.type)!.push(r.assetNumber);
      }
    });

    const lines: string[] = [];
    lines.push(`Date: ${titleDate(`${y}-${m}-${d}`)}`);
    lines.push("");

    byProject.forEach((mapTypes, proj) => {
      lines.push(`Project: ${proj}`);
      mapTypes.forEach((nums, type) => {
        nums.sort((a, b) => a - b);
        lines.push(`${type} #: ${nums.join(", ")}`);
      });
      lines.push("");
    });

    if (byTypeIn.size && (!projOnly || warehouseOnly)) {
      lines.push("Returned to Warehouse:");
      byTypeIn.forEach((nums, type) => {
        nums.sort((a, b) => a - b);
        lines.push(`${type}: ${nums.join(", ")}`);
      });
      lines.push("");
    }

    const text = lines.join("\n").trim();
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Report copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Generate WhatsApp Report</h3>
          <button onClick={onClose} className="rounded bg-gray-200 px-2 py-1 text-sm">
            Close
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMode("today")}
              className={`rounded px-3 py-1 ${mode === "today" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              Today
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`rounded px-3 py-1 ${mode === "custom" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              Custom Date
            </button>
            <button
              onClick={() => setMode("project")}
              className={`rounded px-3 py-1 ${mode === "project" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              Specific Project
            </button>
            <button
              onClick={() => setMode("warehouse")}
              className={`rounded px-3 py-1 ${mode === "warehouse" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              Warehouse Returns
            </button>
          </div>

          {mode === "custom" && (
            <div>
              <label className="block text-xs text-gray-600">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
          )}

          {mode === "project" && (
            <div>
              <label className="block text-xs text-gray-600">Project Code</label>
              <input
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="mt-1 w-full rounded border p-2"
                placeholder="ACTF-2025-001"
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={generate} className="rounded bg-emerald-600 px-3 py-2 text-white">
            Copy Report
          </button>
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
        if (!quickMode) toast.success(`Added ${item.type} #${item.assetNumber} to batch`);
      }
    }

    setRows(next.length ? next : [{ id: mkId(), type: "", assetNumber: "" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  useEffect(() => {
    if (quickMode) {
      toast.success("Quick Mode: scan multiple, then Save once", { duration: 3000 });
    }
  }, [quickMode]);

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
      return "Project code is required when deploying.";
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
        toast.success(`Recorded ${direction === "OUT" ? "DEPLOY" : "PULL OUT"} for ${data.moved} item(s)`);
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
    direction: "IN" | "OUT";
    at: string;
    projectCode?: string | null;
    note?: string | null;
    byId?: string | null;
    equipment?: Pick<EquipmentDTO, "type" | "assetNumber">;
    // legacy flat shape fallback
    type?: string;
    assetNumber?: number;
  };
  const [recent, setRecent] = useState<Recent[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // safe accessors (handle legacy rows with flat fields)
  const getType = (r: Recent) => r.equipment?.type ?? r.type ?? "";
  const getAsset = (r: Recent) =>
    r.equipment?.assetNumber ?? r.assetNumber ?? 0;

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
  const [filterProject, setFilterProject] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showNotes, setShowNotes] = useState(true);

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
        { params: { limit: 1000 } },
      );
      if (data.status === 200) setRecent(data.items);
    } catch {
      /* noop */
    }
  }
  useEffect(() => {
    refreshRecent();
  }, []);

  const projectsInRecent = useMemo(() => {
    const set = new Set<string>();
    recent.forEach((r) => {
      if (r.projectCode) set.add(r.projectCode);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [recent]);

  const typesInRecent = useMemo(() => {
    const set = new Set<string>();
    recent.forEach((r) => {
      const t = getType(r);
      if (t) set.add(t);
    });
    return Array.from(set).sort();
  }, [recent]);

  const recentFilteredSorted = useMemo(() => {
    let arr = [...recent];

    if (dateFrom) {
      const from = new Date(dateFrom + "T00:00:00");
      arr = arr.filter((r) => new Date(r.at) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo + "T23:59:59");
      arr = arr.filter((r) => new Date(r.at) <= to);
    }

    if (!showArchived) {
      arr = arr.filter((r) => new Date(r.at).getTime() >= cutoffMs);
    }

    if (filterProject.trim()) {
      arr = arr.filter((r) => (r.projectCode || "") === filterProject.trim());
    }
    if (filterType.trim()) {
      arr = arr.filter((r) => getType(r) === filterType.trim());
    }

    const s = recQuery.toLowerCase().trim();
    if (s) {
      arr = arr.filter((r) =>
        `${getType(r)} ${getAsset(r)} ${r.direction} ${r.projectCode ?? ""} ${
          r.byId ?? ""
        } ${r.note ?? ""}`
          .toLowerCase()
          .includes(s),
      );
    }

    arr.sort((a, b) => {
      let cmp = 0;
      if (recSort === "at")
        cmp = new Date(a.at).getTime() - new Date(b.at).getTime();
      else if (recSort === "type") cmp = getType(a).localeCompare(getType(b));
      else if (recSort === "direction")
        cmp = a.direction.localeCompare(b.direction);
      else cmp = getAsset(a) - getAsset(b);
      return recDir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [
    recent,
    recQuery,
    recSort,
    recDir,
    dateFrom,
    dateTo,
    showArchived,
    cutoffMs,
    filterProject,
    filterType,
  ]);

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

  /* ---------- Duration per entry (downlevel-safe Map iteration) ---------- */
  const durationById = useMemo(() => {
    const byEquip = new Map<string, { idx: number; rec: Recent }[]>();
    const key = (r: Recent) => `${getType(r)}#${getAsset(r)}`;

    recent
      .slice()
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
      .forEach((rec, idx) => {
        const k = key(rec);
        if (!byEquip.has(k)) byEquip.set(k, []);
        byEquip.get(k)!.push({ idx, rec });
      });

    const map = new Map<string, { durationMs?: number; pending?: boolean; label?: string }>();

    byEquip.forEach((arr) => {
      for (let i = 0; i < arr.length; i++) {
        const cur = arr[i].rec;
        const next = arr[i + 1]?.rec;
        const curAt = new Date(cur.at).getTime();

        if (cur.direction === "OUT") {
          if (next) {
            const nextAt = new Date(next.at).getTime();
            const ms = Math.max(0, nextAt - curAt);
            map.set(cur.id, { durationMs: ms, pending: false, label: formatDDHHMM(ms) });
          } else {
            map.set(cur.id, { pending: true, label: "Pending" });
          }
        } else if (cur.direction === "IN") {
          const prev = arr[i - 1]?.rec;
          if (prev && prev.direction === "OUT") {
            const prevAt = new Date(prev.at).getTime();
            const ms = Math.max(0, curAt - prevAt);
            map.set(cur.id, { durationMs: ms, pending: false, label: formatDDHHMM(ms) });
          } else {
            map.set(cur.id, { pending: false, label: "-" });
          }
        }
      }
    });

    return map;
  }, [recent]);

  const friendlyDir = (d: "IN" | "OUT") => (d === "OUT" ? "DEPLOY" : "PULL OUT");

  /* ---------- Scanner control & Report modal ---------- */
  const [scannerOpen, setScannerOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const movementsForReport: MovementForReport[] = useMemo(
    () =>
      recent.map((r) => ({
        id: r.id,
        type: getType(r),
        assetNumber: getAsset(r),
        direction: r.direction,
        at: r.at,
        projectCode: r.projectCode,
        note: r.note,
      })),
    [recent],
  );

  /* ──────────────────────────────────────────────────────────── */
  /*  Render                                                      */
  /* ──────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-100 pt-24 md:pt-28 lg:pt-32">
      <Navbar />
      <div className="mx-auto max-w-4xl p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Equipment Movement</h1>
          <button
            onClick={() => setReportOpen(true)}
            className="rounded bg-emerald-600 px-3 py-2 text-white"
          >
            Generate WhatsApp Report
          </button>
        </div>

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
              {d === "OUT" ? "DEPLOY" : "PULL OUT"}
            </button>
          ))}
        </div>

        {/* Project (DEPLOY only) — sorted DESC */}
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
                key={row.id}
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

        {/* Recent Movements */}
        <div className="rounded bg-white p-4 shadow">
          <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-8 md:items-end">
            <h2 className="col-span-2 text-base font-semibold md:col-span-2">
              Recent Movements
            </h2>

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
              value={filterProject}
              onChange={(e) => {
                setFilterProject(e.target.value);
                setRecPage(1);
              }}
            >
              <option value="">All Projects</option>
              {projectsInRecent.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              className="rounded border p-2 text-sm"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setRecPage(1);
              }}
            >
              <option value="">All Types</option>
              {typesInRecent.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
            <label className="flex items-center gap-2 rounded border p-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={showNotes}
                onChange={(e) => setShowNotes(e.target.checked)}
              />
              Show notes
            </label>
          </div>

          <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-5">
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
            <label className="flex items-center gap-2 rounded border p-2 text-xs text-gray-700">
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

          <div className="space-y-2">
            {pageItems.length === 0 ? (
              <div className="text-sm text-gray-600">No entries</div>
            ) : (
              pageItems.map((m) => {
                const isArchived = new Date(m.at).getTime() < cutoffMs;
                const dur = durationById.get(m.id);
                return (
                  <div
                    key={m.id}
                    className="flex flex-col gap-1 rounded border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="text-sm">
                      <span className="font-semibold">
                        {getType(m)} #{getAsset(m)}
                      </span>{" "}
                      <span className="uppercase">{m.direction === "OUT" ? "DEPLOY" : "PULL OUT"}</span>{" "}
                      <span>— {new Date(m.at).toLocaleString()}</span>{" "}
                      {m.projectCode ? (
                        <span>
                          {" "}
                          | Project:{" "}
                          <span className="font-medium">{m.projectCode}</span>
                        </span>
                      ) : null}
                      {dur?.label ? <span> | Duration: {dur.label}</span> : null}
                      {showNotes && m.note ? <span> | Note: {m.note}</span> : null}
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
              Page {recPage} / {totalPages} · {recentFilteredSorted.length} items
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

      {/* WhatsApp Report */}
      <WhatsAppReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        movements={movementsForReport}
      />
    </div>
  );
}
