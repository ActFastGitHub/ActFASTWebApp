"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/app/components/navBar";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Combobox } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
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

const mkId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

function normalizeRows(raw: unknown): MoveRow[] {
  const arr: any[] = Array.isArray(raw) ? raw : [];
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

const toDateKey = (isoTs: string) => {
  const d = new Date(isoTs);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
const prettyDate = (isoDate: string) =>
  new Date(isoDate + "T00:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/* ---------- Inline Edit: helpers & types ---------- */
type MovementUpdate = {
  at?: string;
  note?: string | null;
  projectCode?: string | null;
  equipment?: {
    typeCode?: string; // aligns to PATCH API
    assetNumber?: number;
  };
  byId?: string | null;
};

type EditState = {
  atLocal: string; // yyyy-MM-ddTHH:mm
  note: string;
  projectCode: string;
  type: string; // UI shows friendly name; backend maps to typeCode
  assetNumber: string; // keep as string for input; validate to number on save
  byId: string;
};

const isoToLocalInput = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => `${n}`.padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const localInputToISO = (local: string) => {
  if (!local) return undefined;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

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
          await (videoRef.current as HTMLVideoElement).play();
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
      } catch {
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
  at: string; // ISO
  projectCode?: string | null; // set for OUT
  note?: string | null;
};

type ReportMode = "today" | "custom" | "project" | "warehouse";

function WhatsAppReportModal({
  open,
  onClose,
  movements,
  projects,
}: {
  open: boolean;
  onClose: () => void;
  movements: MovementForReport[];
  projects: Project[];
}) {
  // stable hooks
  const [mode, setMode] = useState<ReportMode>("today");
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [project, setProject] = useState("");
  const [projQuery, setProjQuery] = useState("");

  // ensure PNC exists as an option
  const projectOptions = useMemo(() => {
    const hasPNC = projects.some((p) => p.code === "POSSIBLE NEW CLAIM");
    const list = hasPNC
      ? projects
      : [{ id: "PNC", code: "POSSIBLE NEW CLAIM" }, ...projects];
    return list;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = projQuery.toLowerCase();
    if (!q) return projectOptions;
    return projectOptions.filter((p) => p.code.toLowerCase().includes(q));
  }, [projectOptions, projQuery]);

  useEffect(() => {
    if (!open) {
      setMode("today");
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = `${d.getMonth() + 1}`.padStart(2, "0");
      const dd = `${d.getDate()}`.padStart(2, "0");
      setDate(`${yyyy}-${mm}-${dd}`);
      setProject("");
      setProjQuery("");
    }
  }, [open]);

  if (!open) return null;

  const titleDate = (isoDate: string) => prettyDate(isoDate);

  /** Pair each IN with the last OUT (by type+asset) to learn its source project. */
  const buildLastOutMap = (rows: MovementForReport[]) => {
    const sorted = rows
      .slice()
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    const lastOut: Record<string, string | undefined> = {};
    sorted.forEach((r) => {
      const key = `${r.type}#${r.assetNumber}`;
      if (r.direction === "OUT") {
        lastOut[key] = (r.projectCode || undefined) as string | undefined;
      } else {
        // keep last OUT
      }
    });
    return lastOut;
  };

  const generate = async () => {
    const today = new Date();
    const targetDay =
      mode === "today" || mode === "warehouse"
        ? today
        : new Date(date + "T00:00:00");

    const y = targetDay.getFullYear();
    const m = `${targetDay.getMonth() + 1}`.padStart(2, "0");
    const d = `${targetDay.getDate()}`.padStart(2, "0");
    const start = new Date(`${y}-${m}-${d}T00:00:00`);
    const end = new Date(`${y}-${m}-${d}T23:59:59`);

    const lines: string[] = [];

    if (mode === "project") {
      const projCode = project.trim();
      if (!projCode) {
        toast.error("Please select a project.");
        return;
      }

      const sorted = movements
        .slice()
        .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

      const onSite = new Map<string, Set<number>>();
      const dateDeploy: Record<string, Map<string, number[]>> = {};
      const datePull: Record<string, Map<string, number[]>> = {};
      const lastOutByEquip = new Map<string, string | undefined>();
      const eqKey = (r: MovementForReport) => `${r.type}#${r.assetNumber}`;

      sorted.forEach((r) => {
        const key = eqKey(r);
        if (r.direction === "OUT") {
          lastOutByEquip.set(
            key,
            (r.projectCode || undefined) as string | undefined,
          );

          if (r.projectCode === projCode) {
            const dk = toDateKey(r.at);
            dateDeploy[dk] = dateDeploy[dk] || new Map<string, number[]>();
            const tmap = dateDeploy[dk];
            tmap.set(r.type, [...(tmap.get(r.type) || []), r.assetNumber]);

            if (!onSite.has(r.type)) onSite.set(r.type, new Set());
            onSite.get(r.type)!.add(r.assetNumber);
          }
        } else {
          const origin = lastOutByEquip.get(key);
          if (origin === projCode) {
            const dk = toDateKey(r.at);
            datePull[dk] = datePull[dk] ?? (new Map() as Map<string, number[]>);
            const tmap = datePull[dk];
            tmap.set(r.type, [...(tmap.get(r.type) || []), r.assetNumber]);

            if (!onSite.has(r.type)) onSite.set(r.type, new Set());
            onSite.get(r.type)!.delete(r.assetNumber);
          }
        }
      });

      lines.push(`${projCode}`);
      lines.push("");

      const allDates = new Set<string>([
        ...Object.keys(dateDeploy),
        ...Object.keys(datePull),
      ]);
      const sortedDates = Array.from(allDates).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      );

      sortedDates.forEach((dk) => {
        lines.push(`${prettyDate(dk)}`);
        const dep = dateDeploy[dk];
        if (dep && dep.size) {
          lines.push("DEPLOYED");
          Array.from(dep.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([type, nums]) => {
              nums.sort((aa, bb) => aa - bb);
              lines.push(`${type}: ${nums.join(", ")}`);
            });
        }
        const pull = datePull[dk];
        if (pull && pull.size) {
          if (dep && dep.size) lines.push("");
          lines.push("PULLED-OUT");
          Array.from(pull.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([type, nums]) => {
              nums.sort((aa, bb) => aa - bb);
              lines.push(`${type}: ${nums.join(", ")}`);
            });
        }
        lines.push("");
      });

      const remaining: Array<[string, number[]]> = Array.from(onSite.entries())
        .map(
          ([type, set]) =>
            [type, Array.from(set.values()).sort((a, b) => a - b)] as [
              string,
              number[],
            ],
        )
        .filter(([, nums]) => nums.length > 0)
        .sort(([a], [b]) => a.localeCompare(b));

      if (remaining.length) {
        lines.push("Equipments Left On-Site:");
        remaining.forEach(([type, nums]) => {
          lines.push(`${type}: ${nums.join(", ")}`);
        });
      }

      const text = lines.join("\n").trim();
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Project report copied to clipboard");
      } catch {
        toast.error("Failed to copy to clipboard");
      }
      return;
    }

    const rowsForDay = movements.filter((r) => {
      const t = new Date(r.at).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });

    const warehouseOnly = mode === "warehouse";

    const lastOutRef = buildLastOutMap(movements);

    const byProject = new Map<string, Map<string, number[]>>();
    const notesByProject = new Map<string, string[]>();

    const inByOriginProject = new Map<string, Map<string, number[]>>();
    const notesWarehouse = new Map<string, Set<string>>();

    rowsForDay.forEach((r) => {
      const note = (r.note || "").trim();

      if (r.direction === "OUT" && (!warehouseOnly || !!r.projectCode)) {
        const proj = r.projectCode || "Unknown Project";
        if (!byProject.has(proj)) byProject.set(proj, new Map());
        if (!notesByProject.has(proj)) notesByProject.set(proj, []);
        const mapTypes = byProject.get(proj)!;
        if (!mapTypes.has(r.type)) mapTypes.set(r.type, []);
        mapTypes.get(r.type)!.push(r.assetNumber);
        if (note) notesByProject.get(proj)!.push(note);
      } else if (r.direction === "IN") {
        const key = `${r.type}#${r.assetNumber}`;
        const origin = lastOutRef[key] || "Unknown Project";
        if (!inByOriginProject.has(origin))
          inByOriginProject.set(origin, new Map());
        const tmap = inByOriginProject.get(origin)!;
        if (!tmap.has(r.type)) tmap.set(r.type, []);
        tmap.get(r.type)!.push(r.assetNumber);
        if (note) {
          if (!notesWarehouse.has(origin))
            notesWarehouse.set(origin, new Set());
          notesWarehouse.get(origin)!.add(note);
        }
      }
    });

    const titleDateStr = `${y}-${m}-${d}`;
    lines.push(`Date: ${titleDate(titleDateStr)}`);
    lines.push("");

    byProject.forEach((mapTypes, proj) => {
      lines.push(`Project: ${proj}`);
      mapTypes.forEach((nums, type) => {
        nums.sort((a, b) => a - b);
        lines.push(`${type}: ${nums.join(", ")}`);
      });

      const uniqNotes = Array.from(
        new Set((notesByProject.get(proj) || []).filter(Boolean)),
      );
      if (uniqNotes.length) lines.push(`Notes: ${uniqNotes.join("; ")}`);
      lines.push("");
    });

    if (inByOriginProject.size) {
      inByOriginProject.forEach((typesMap, originProj) => {
        lines.push(`Returned to Warehouse (from ${originProj}):`);
        Array.from(typesMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([type, nums]) => {
            nums.sort((a, b) => a - b);
            lines.push(`${type}: ${nums.join(", ")}`);
          });
        const nset = notesWarehouse.get(originProj);
        if (nset && nset.size) {
          lines.push(`Notes: ${Array.from(nset.values()).join("; ")}`);
        }
        lines.push("");
      });
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
          <button
            onClick={onClose}
            className="rounded bg-gray-200 px-2 py-1 text-sm"
          >
            Close
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMode("today")}
              className={`rounded px-3 py-1 ${
                mode === "today" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
              aria-pressed={mode === "today"}
            >
              Today
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`rounded px-3 py-1 ${
                mode === "custom" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
              aria-pressed={mode === "custom"}
            >
              Custom Date
            </button>
            <button
              onClick={() => setMode("project")}
              className={`rounded px-3 py-1 ${
                mode === "project" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
              aria-pressed={mode === "project"}
            >
              Specific Project
            </button>
            <button
              onClick={() => setMode("warehouse")}
              className={`rounded px-3 py-1 ${
                mode === "warehouse" ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
              aria-pressed={mode === "warehouse"}
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
              <label className="block text-xs text-gray-600">
                Project Code
              </label>
              <Combobox
                value={project}
                onChange={(v: string) => setProject(v ?? "")}
              >
                <div className="relative mt-1">
                  <Combobox.Input
                    className="w-full rounded border p-2"
                    displayValue={(v: string) => v}
                    onChange={(e) => {
                      setProject(e.target.value);
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
                              active
                                ? "bg-blue-600 text-white"
                                : "text-gray-900"
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
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={generate}
            className="rounded bg-emerald-600 px-3 py-2 text-white"
          >
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
  /* Hydration-safe: guard render until mounted */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* Session & routing hooks (always called) */
  const { status, data: session } = useSession();
  const role = (session?.user?.role || "").toLowerCase();
  const isAdmin = role === "admin" || role === "owner";

  const router = useRouter();
  const params = useSearchParams();

  /* ---------- Auth redirect ---------- */
  useEffect(() => {
    if (status === "unauthenticated") {
      const dest =
        typeof window !== "undefined"
          ? window.location.href
          : "/equipment/move";
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

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/projects");
        if (res.data?.projects) {
          const sorted: Project[] = res.data.projects
            .map((p: any) => ({ id: p.id, code: p.code }))
            .sort((a: Project, b: Project) => b.code.localeCompare(a.code));

          const hasPNC = sorted.some((p) => p.code === "POSSIBLE NEW CLAIM");
          const withPNC = hasPNC
            ? sorted
            : [{ id: "PNC", code: "POSSIBLE NEW CLAIM" }, ...sorted];

          setProjects(withPNC);
        }
      } catch {
        setProjects([{ id: "PNC", code: "POSSIBLE NEW CLAIM" }]);
      }
    })();
  }, []);

  const filteredProjects = useMemo(() => {
    const q = projQuery.toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.code.toLowerCase().includes(q));
  }, [projects, projQuery]);

  /* ---------- Batch rows (QR adds here) ---------- */
  const [rows, setRows] = useState<MoveRow[]>([]);

  // Initialize from localStorage & handle direct param add
  useEffect(() => {
    const existing = loadQueue();
    let next = existing;

    if (initialType && initialAsset) {
      const item: MoveRow = {
        id: mkId(),
        type: initialType,
        assetNumber: initialAsset,
      };
      const key = `${item.type}#${item.assetNumber}`;
      const set = new Set(existing.map((r) => `${r.type}#${r.assetNumber}`));
      if (!set.has(key)) {
        next = [...existing, item];
        saveQueue(next);
        if (!quickMode)
          toast.success(`Added ${item.type} #${item.assetNumber} to batch`);
      }
    }

    setRows(next.length ? next : [{ id: mkId(), type: "", assetNumber: "" }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  useEffect(() => {
    if (quickMode) {
      toast.success("Quick Mode: scan multiple, then Save once", {
        duration: 3000,
      });
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
      const next = r.map((row, idx) =>
        idx === i ? { ...row, ...patch } : row,
      );
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

    const whenUtc = useNow
      ? undefined
      : manualIso
        ? new Date(manualIso).toISOString()
        : undefined;

    return {
      direction,
      projectCode: direction === "OUT" ? projectCode.trim() : undefined,
      when: whenUtc,
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
    if (
      payload.direction === "OUT" &&
      payload.projectCode === "POSSIBLE NEW CLAIM" &&
      !(note && note.trim())
    ) {
      return "Please enter Notes (temporary project name) for POSSIBLE NEW CLAIM.";
    }
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
        toast.success(
          `Recorded ${direction === "OUT" ? "DEPLOY" : "PULL OUT"} for ${data.moved} item(s)`,
        );
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
    byId?: string | null; // nickname / user identifier
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

  // NEW: per-entry "show mover" map
  const [showMoverMap, setShowMoverMap] = useState<Record<string, boolean>>({});
  // Per-entry notes toggle
  const [notesOpen, setNotesOpen] = useState<Record<string, boolean>>({});
  const toggleNotes = (id: string) =>
    setNotesOpen((m) => ({ ...m, [id]: !m[id] }));

  const toggleMover = (id: string) =>
    setShowMoverMap((m) => ({ ...m, [id]: !m[id] }));

  // auto-archive (>30 days old)
  const [showArchived, setShowArchived] = useState(false);
  const cutoffMs = useMemo(() => Date.now() - 30 * 24 * 60 * 60 * 1000, []);

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

  /* ---------- NEW: Compute origin project for each IN row ---------- */
  const originProjectById = useMemo(() => {
    const sorted = recent
      .slice()
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

    const lastOut: Record<string, string | undefined> = {};
    const map = new Map<string, string | undefined>();

    sorted.forEach((r) => {
      const key = `${getType(r)}#${getAsset(r)}`;
      if (r.direction === "OUT") {
        lastOut[key] = (r.projectCode || undefined) as string | undefined;
      } else {
        map.set(r.id, lastOut[key]);
      }
    });

    return map;
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
      arr = arr.filter((r) => {
        const origin = originProjectById.get(r.id) ?? "";
        return `${getType(r)} ${getAsset(r)} ${r.direction} ${r.projectCode ?? ""} ${
          r.byId ?? ""
        } ${r.note ?? ""} ${origin}`
          .toLowerCase()
          .includes(s);
      });
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
    originProjectById,
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
      if (resp && isDeleteError(resp))
        toast.error(resp.error || "Delete failed");
      else toast.error("Delete failed");
    }
  }

  /* ---------- NEW: Inline edit state & actions ---------- */
  const [editMap, setEditMap] = useState<Record<string, EditState>>({});
  const isEditing = (id: string) => !!editMap[id];

  function startEdit(m: Recent) {
    const state: EditState = {
      atLocal: isoToLocalInput(m.at),
      note: m.note ?? "",
      projectCode: m.projectCode ?? "",
      type: getType(m),
      assetNumber: String(getAsset(m) || ""),
      byId: m.byId ?? "",
    };
    setEditMap((s) => ({ ...s, [m.id]: state }));
  }
  function cancelEdit(id: string) {
    setEditMap((s) => {
      const { [id]: _, ...rest } = s;
      return rest;
    });
  }

  async function saveEdit(id: string) {
    const draft = editMap[id];
    if (!draft) return;

    const current = recent.find((r) => r.id === id);
    if (!current) {
      toast.error("Movement not found");
      return;
    }

    const update: MovementUpdate = {
      at: localInputToISO(draft.atLocal),
      note: draft.note.trim() || null,
      byId: draft.byId.trim() || null,
    };

    if (!update.at) {
      toast.error("Please provide a valid date/time.");
      return;
    }

    if (current.direction === "OUT") {
      update.projectCode = draft.projectCode.trim() || null;
      if (!update.projectCode) {
        toast.error("Project code is required for DEPLOY (OUT).");
        return;
      }
    }

    const assetNum =
      draft.assetNumber.trim().length > 0
        ? Number(draft.assetNumber.trim())
        : undefined;

    if (draft.type.trim() || assetNum) {
      if (
        assetNum !== undefined &&
        (!Number.isInteger(assetNum) || assetNum <= 0)
      ) {
        toast.error("Asset # must be a positive integer.");
        return;
      }
      update.equipment = {
        typeCode: draft.type.trim() || undefined, // <-- align with PATCH route
        assetNumber: assetNum,
      };
    }

    try {
      const { data } = await axios.patch<{
        status: number;
        updated?: unknown;
        error?: string;
      }>(`/api/equipment/movements/${id}`, {
        data: update,
        touchEquipment: true,
      });

      if (data?.status === 200) {
        toast.success("Movement updated");
        cancelEdit(id);
        await refreshRecent();
      } else {
        toast.error(data?.error || "Update failed");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Update failed");
    }
  }

  /* ---------- Duration per entry ---------- */
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

    const map = new Map<
      string,
      { durationMs?: number; pending?: boolean; label?: string }
    >();

    byEquip.forEach((arr) => {
      for (let i = 0; i < arr.length; i++) {
        const cur = arr[i].rec;
        const next = arr[i + 1]?.rec;
        const curAt = new Date(cur.at).getTime();

        if (cur.direction === "OUT") {
          if (next) {
            const nextAt = new Date(next.at).getTime();
            const ms = Math.max(0, nextAt - curAt);
            map.set(cur.id, {
              durationMs: ms,
              pending: false,
              label: formatDDHHMM(ms),
            });
          } else {
            map.set(cur.id, { pending: true, label: "Pending" });
          }
        } else if (cur.direction === "IN") {
          const prev = arr[i - 1]?.rec;
          if (prev && prev.direction === "OUT") {
            const prevAt = new Date(prev.at).getTime();
            const ms = Math.max(0, curAt - prevAt);
            map.set(cur.id, {
              durationMs: ms,
              pending: false,
              label: formatDDHHMM(ms),
            });
          } else {
            map.set(cur.id, { pending: false, label: "-" });
          }
        }
      }
    });

    return map;
  }, [recent]);

  const friendlyDir = (d: "IN" | "OUT") =>
    d === "OUT" ? "DEPLOY" : "PULL OUT";

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

  /* Guard render until mounted to avoid hydration mismatch */
  if (!mounted) {
    return <div className="min-h-screen bg-gray-100" />;
  }

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
        <div className="mb-4 flex flex-wrap gap-2">
          {(["OUT", "IN"] as MovementDirection[]).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`rounded px-3 py-2 text-sm ${
                direction === d ? "bg-blue-600 text-white" : "border bg-white"
              }`}
              aria-pressed={direction === d}
            >
              {d === "OUT" ? "DEPLOY" : "PULL OUT"}
            </button>
          ))}
        </div>

        {/* Project (DEPLOY only) — searchable, includes PNC */}
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
            {projectCode === "POSSIBLE NEW CLAIM" && (
              <p className="mt-1 text-xs text-red-600">
                Notes are required for POSSIBLE NEW CLAIM (enter the temporary
                project name).
              </p>
            )}
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
            Tip: <b>QR Quick Mode</b> lets you scan multiple items first
            (they’ll appear here), then save once.
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
                <div className="flex items-end sm:col-span-1">
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
            Notes{" "}
            {direction === "OUT" && projectCode === "POSSIBLE NEW CLAIM" ? (
              <span className="text-red-600">*</span>
            ) : null}
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
          {/* Top filter row – fully responsive */}
          <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-8 md:items-end">
            <h2 className="text-base font-semibold md:col-span-2">
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

          {/* Secondary filter row */}
          <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-5">
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

          {/* List */}
          <div className="space-y-2">
            {pageItems.length === 0 ? (
              <div className="text-sm text-gray-600">No entries</div>
            ) : (
              pageItems.map((m) => {
                const isArchived = new Date(m.at).getTime() < cutoffMs;
                const dur = durationById.get(m.id);
                const moverShown = !!showMoverMap[m.id];
                const originProj =
                  m.direction === "IN"
                    ? originProjectById.get(m.id)
                    : undefined;

                return (
                  <div
                    key={m.id}
                    className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow md:p-4"
                  >
                    {/* Make the header responsive: vertical on mobile, horizontal on md+ */}
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      {/* Left cluster */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase ${
                              m.direction === "OUT"
                                ? "bg-blue-600 text-white"
                                : "bg-amber-600 text-white"
                            }`}
                          >
                            {friendlyDir(m.direction)}
                          </span>
                          <span className="inline-flex max-w-full items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                            <span className="truncate">
                              {getType(m)} #{getAsset(m)}
                            </span>
                          </span>

                          {/* Project tag logic */}
                          {m.direction === "OUT" && m.projectCode ? (
                            <span className="inline-flex max-w-full items-center rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-200">
                              <span className="truncate">
                                Project: {m.projectCode}
                              </span>
                            </span>
                          ) : null}

                          {m.direction === "IN" ? (
                            <span className="inline-flex max-w-full items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
                              <span className="truncate">
                                From: {originProj || "Unknown Project"}
                              </span>
                            </span>
                          ) : null}

                          {isArchived ? (
                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                              Archived
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 text-xs text-gray-600">
                          <span className="block sm:inline">
                            {new Date(m.at).toLocaleString()}
                          </span>
                          {dur?.label ? (
                            <span className="ml-0 block sm:ml-2 sm:inline">
                              · Duration: {dur.label}
                            </span>
                          ) : null}
                        </div>

                        {/* Mover (per-entry toggle) */}
                        {moverShown && (
                          <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-800 ring-1 ring-gray-200">
                            <UserIcon className="h-4 w-4" />
                            <span>
                              By: <b>{m.byId || "Unknown"}</b>
                            </span>
                          </div>
                        )}

                        {/* Notes (per-entry toggle; colorful panel) */}
                        {showNotes && notesOpen[m.id] && m.note ? (
                          <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm ring-1 ring-amber-200">
                            <div className="text-xs font-semibold text-amber-800">
                              Notes
                            </div>
                            <div className="mt-0.5 whitespace-pre-wrap break-words text-amber-900">
                              {m.note}
                            </div>
                          </div>
                        ) : null}

                        {/* Inline edit form (1-col on mobile, 6-col on md) */}
                        {isAdmin && isEditing(m.id) && (
                          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-6">
                            <div className="md:col-span-3">
                              <label className="block text-xs text-gray-600">
                                Date/Time
                              </label>
                              <input
                                type="datetime-local"
                                className="mt-1 w-full rounded border p-2 text-sm"
                                value={editMap[m.id].atLocal}
                                onChange={(e) =>
                                  setEditMap((s) => ({
                                    ...s,
                                    [m.id]: {
                                      ...s[m.id],
                                      atLocal: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-xs text-gray-600">
                                By (Nickname/User)
                              </label>
                              <input
                                className="mt-1 w-full rounded border p-2 text-sm"
                                value={editMap[m.id].byId}
                                onChange={(e) =>
                                  setEditMap((s) => ({
                                    ...s,
                                    [m.id]: {
                                      ...s[m.id],
                                      byId: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="e.g. ANGELO"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <label className="block text-xs text-gray-600">
                                Project (OUT only)
                              </label>
                              <Combobox
                                value={editMap[m.id].projectCode}
                                onChange={(v: string) =>
                                  setEditMap((s) => ({
                                    ...s,
                                    [m.id]: {
                                      ...s[m.id],
                                      projectCode: v ?? "",
                                    },
                                  }))
                                }
                                as="div"
                              >
                                <div className="relative">
                                  <Combobox.Input
                                    disabled={m.direction !== "OUT"}
                                    className="w-full rounded border p-2 text-sm disabled:opacity-60"
                                    displayValue={(v: string) => v}
                                    onChange={(e) =>
                                      setEditMap((s) => ({
                                        ...s,
                                        [m.id]: {
                                          ...s[m.id],
                                          projectCode: e.target.value,
                                        },
                                      }))
                                    }
                                    placeholder={
                                      m.direction === "OUT"
                                        ? "Search/select project"
                                        : "N/A for PULL OUT"
                                    }
                                  />
                                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                                  </Combobox.Button>
                                  {m.direction === "OUT" &&
                                    filteredProjects.length > 0 && (
                                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        {filteredProjects.map((p) => (
                                          <Combobox.Option
                                            key={p.id}
                                            value={p.code}
                                            className={({ active }) =>
                                              `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                                                active
                                                  ? "bg-blue-600 text-white"
                                                  : "text-gray-900"
                                              }`
                                            }
                                          >
                                            {({ selected, active }) => (
                                              <>
                                                <span
                                                  className={`block truncate ${selected ? "font-semibold" : ""}`}
                                                >
                                                  {p.code}
                                                </span>
                                                {selected && (
                                                  <span
                                                    className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                                      active
                                                        ? "text-white"
                                                        : "text-blue-600"
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

                            <div>
                              <label className="block text-xs text-gray-600">
                                Type
                              </label>
                              <input
                                className="mt-1 w-full rounded border p-2 text-sm"
                                value={editMap[m.id].type}
                                onChange={(e) =>
                                  setEditMap((s) => ({
                                    ...s,
                                    [m.id]: {
                                      ...s[m.id],
                                      type: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Dehumidifier / Blower / ..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600">
                                Asset #
                              </label>
                              <input
                                className="mt-1 w-full rounded border p-2 text-sm"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={editMap[m.id].assetNumber}
                                onChange={(e) =>
                                  setEditMap((s) => ({
                                    ...s,
                                    [m.id]: {
                                      ...s[m.id],
                                      assetNumber: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="e.g. 33"
                              />
                            </div>

                            <div className="md:col-span-6">
                              <label className="block text-xs text-gray-600">
                                Notes
                              </label>
                              <textarea
                                className="mt-1 w-full rounded border p-2 text-sm"
                                rows={2}
                                value={editMap[m.id].note}
                                onChange={(e) =>
                                  setEditMap((s) => ({
                                    ...s,
                                    [m.id]: {
                                      ...s[m.id],
                                      note: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Context / corrections…"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right cluster: actions (column on mobile, row on md+) */}
                      <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:flex-wrap md:items-center">
                        {/* Toggle mover */}
                        <div className="flex flex-row flex-wrap gap-2">
                          <button
                            onClick={() =>
                              setShowMoverMap((s) => ({
                                ...s,
                                [m.id]: !s[m.id],
                              }))
                            }
                            className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs"
                            title={
                              showMoverMap[m.id] ? "Hide name" : "Show name"
                            }
                          >
                            {showMoverMap[m.id] ? (
                              <>
                                <EyeSlashIcon className="h-4 w-4" />
                                Hide name
                              </>
                            ) : (
                              <>
                                <EyeIcon className="h-4 w-4" />
                                Show name
                              </>
                            )}
                          </button>

                          {/* Toggle notes */}
                          {showNotes && m.note ? (
                            <button
                              onClick={() =>
                                setNotesOpen((o) => ({
                                  ...o,
                                  [m.id]: !o[m.id],
                                }))
                              }
                              className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs"
                              title={
                                notesOpen[m.id] ? "Hide notes" : "Show notes"
                              }
                            >
                              {notesOpen[m.id] ? (
                                <>
                                  <EyeSlashIcon className="h-4 w-4" />
                                  Hide notes
                                </>
                              ) : (
                                <>
                                  <EyeIcon className="h-4 w-4" />
                                  Show notes
                                </>
                              )}
                            </button>
                          ) : null}

                          {/* Edit / Save / Cancel (admin only) */}
                          {isAdmin && !isEditing(m.id) && (
                            <button
                              onClick={() => startEdit(m)}
                              className="rounded bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200"
                            >
                              Edit
                            </button>
                          )}
                          {isAdmin && isEditing(m.id) && (
                            <>
                              <button
                                onClick={() => saveEdit(m.id)}
                                className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => cancelEdit(m.id)}
                                className="rounded border px-3 py-1.5 text-xs"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {/* Delete (admin) */}
                          {isAdmin ? (
                            confirmDeleteId === m.id ? (
                              <>
                                <button
                                  onClick={() => deleteMovement(m.id)}
                                  className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => {
                                    setConfirmDeleteId(null);
                                    toast("Delete cancelled");
                                  }}
                                  className="rounded border px-3 py-1.5 text-xs"
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
                                className="rounded bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-200"
                              >
                                Delete
                              </button>
                            )
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* pagination controls */}
          <div className="mt-3 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div className="text-xs text-gray-500">
              Page {recPage} / {totalPages} · {recentFilteredSorted.length}{" "}
              items
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
      <ScannerOverlay
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />

      {/* WhatsApp Report */}
      <WhatsAppReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        movements={movementsForReport}
        projects={projects}
      />
    </div>
  );
}
