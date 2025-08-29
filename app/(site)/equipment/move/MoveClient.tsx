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

const mkId = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

function normalizeRows(raw: unknown): MoveRow[] {
  const arr: unknown[] = Array.isArray(raw) ? raw : [];
  return arr.map((r, idx) => {
    const rec = r as Partial<MoveRow>;
    return {
      id: typeof rec?.id === "string" ? rec.id : `${mkId()}_${idx}`,
      type: String(rec?.type ?? ""),
      assetNumber: String(rec?.assetNumber ?? ""),
    };
  });
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
  projectCode?: string | null;
  note?: string | null;
};

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
  const [project, setProject] = useState<string>("");
  const [projQuery, setProjQuery] = useState<string>("");

  const projectOptions = useMemo<Project[]>(() => {
    const hasPNC = projects.some((p) => p.code === "POSSIBLE NEW CLAIM");
    const list = hasPNC
      ? projects
      : [{ id: "PNC", code: "POSSIBLE NEW CLAIM" }, ...projects];
    return list;
  }, [projects]);

  const filteredProjects = useMemo<Project[]>(() => {
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

  const titleDate = (isoDate: string) => {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const generate = async () => {
    // Helpers
    const fmtDateKey = (iso: string): string => {
      const d = new Date(iso);
      const yyyy = d.getFullYear();
      const mm = `${d.getMonth() + 1}`.padStart(2, "0");
      const dd = `${d.getDate()}`.padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };
    const longDate = (ymd: string): string => {
      const d = new Date(ymd + "T00:00:00");
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Project-wide history report
    if (mode === "project") {
      const targetProject = project.trim();
      if (!targetProject) {
        toast.error("Please pick a project code first.");
        return;
      }

      type EquipKey = string; // `${type}#${asset}`
      const keyOf = (r: MovementForReport): EquipKey =>
        `${r.type}#${r.assetNumber}`;

      const byEquip = new Map<EquipKey, MovementForReport[]>();
      movements
        .slice()
        .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
        .forEach((m) => {
          const k = keyOf(m);
          const arr = byEquip.get(k);
          if (arr) arr.push(m);
          else byEquip.set(k, [m]);
        });

      type DayBucket = { OUT: Map<string, number[]>; IN: Map<string, number[]> };
      const dayBuckets = new Map<string, DayBucket>();
      const ensureDay = (day: string): DayBucket => {
        const found = dayBuckets.get(day);
        if (found) return found;
        const created: DayBucket = { OUT: new Map(), IN: new Map() };
        dayBuckets.set(day, created);
        return created;
      };
      const pushTo = (
        bucket: Map<string, number[]>,
        type: string,
        asset: number,
      ) => {
        const list = bucket.get(type);
        if (list) list.push(asset);
        else bucket.set(type, [asset]);
      };

      const stillOut = new Map<string, Set<number>>();
      const addLeft = (type: string, n: number) => {
        const s = stillOut.get(type);
        if (s) s.add(n);
        else stillOut.set(type, new Set([n]));
      };
      const remLeft = (type: string, n: number) => {
        stillOut.get(type)?.delete(n);
      };

      const currentProjectFor = new Map<EquipKey, string | null>();

      byEquip.forEach((timeline, key) => {
        timeline.forEach((ev) => {
          const day = fmtDateKey(ev.at);
          if (ev.direction === "OUT") {
            const toProj = ev.projectCode || null;
            currentProjectFor.set(key, toProj);

            if (toProj === targetProject) {
              const b = ensureDay(day);
              pushTo(b.OUT, ev.type, ev.assetNumber);
              addLeft(ev.type, ev.assetNumber);
            } else {
              remLeft(ev.type, ev.assetNumber);
            }
          } else {
            const attached = currentProjectFor.get(key) ?? null;
            if (attached === targetProject) {
              const b = ensureDay(day);
              pushTo(b.IN, ev.type, ev.assetNumber);
              remLeft(ev.type, ev.assetNumber);
              currentProjectFor.set(key, null);
            } else {
              currentProjectFor.set(key, null);
            }
          }
        });
      });

      const lines: string[] = [];
      lines.push(targetProject, "");

      const days = Array.from(dayBuckets.keys()).sort(); // oldest → newest
      days.forEach((day) => {
        const b = dayBuckets.get(day)!;
        lines.push(longDate(day));

        if (b.OUT.size) {
          lines.push("DEPLOYED");
          Array.from(b.OUT.keys())
            .sort()
            .forEach((t) => {
              const nums = b.OUT.get(t)!.slice().sort((a, b) => a - b);
              lines.push(`${t}: ${nums.join(", ")}`);
            });
          lines.push("");
        }

        if (b.IN.size) {
          lines.push("PULLED-OUT");
          Array.from(b.IN.keys())
            .sort()
            .forEach((t) => {
              const nums = b.IN.get(t)!.slice().sort((a, b) => a - b);
              lines.push(`${t}: ${nums.join(", ")}`);
            });
          lines.push("");
        }
      });

      const leftTypes = Array.from(stillOut.keys()).filter(
        (t) => (stillOut.get(t)?.size ?? 0) > 0,
      );
      if (leftTypes.length) {
        lines.push("Equipments Left On-Site:");
        leftTypes.sort().forEach((t) => {
          const nums = Array.from(stillOut.get(t) ?? []).sort((a, b) => a - b);
          lines.push(`${t}: ${nums.join(", ")}`);
        });
      }

      const text = lines.join("\n").trim();
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Report copied to clipboard");
      } catch {
        toast.error("Failed to copy to clipboard");
      }
      return;
    }

    // Today / Custom Date / Warehouse Returns with Custom Date attribution
    const targetDay =
      mode === "today" || mode === "warehouse"
        ? new Date()
        : new Date(date + "T00:00:00");

    const y = targetDay.getFullYear();
    const m = `${targetDay.getMonth() + 1}`.padStart(2, "0");
    const d = `${targetDay.getDate()}`.padStart(2, "0");
    const start = new Date(`${y}-${m}-${d}T00:00:00`);
    const end = new Date(`${y}-${m}-${d}T23:59:59`);

    const globallySorted = movements
      .slice()
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

    const dayRows = globallySorted.filter((r) => {
      const t = new Date(r.at).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });

    const keyOf = (r: MovementForReport) => `${r.type}#${r.assetNumber}`;
    const currentProjectFor = new Map<string, string | null>();

    const byProjectOut = new Map<string, Map<string, number[]>>();
    const notesByProject = new Map<string, string[]>();
    const byInSourceProject = new Map<string, Map<string, number[]>>();
    const notesWarehouse: string[] = [];

    for (const ev of globallySorted) {
      const k = keyOf(ev);
      const inDay =
        new Date(ev.at).getTime() >= start.getTime() &&
        new Date(ev.at).getTime() <= end.getTime();

      if (inDay) {
        if (ev.direction === "OUT") {
          const proj = ev.projectCode || "Unknown Project";
          if (!byProjectOut.has(proj)) byProjectOut.set(proj, new Map());
          const typeMap = byProjectOut.get(proj)!;
          const arr = typeMap.get(ev.type);
          if (arr) arr.push(ev.assetNumber);
          else typeMap.set(ev.type, [ev.assetNumber]);

          const note = (ev.note || "").trim();
          if (note) {
            const n = notesByProject.get(proj);
            if (n) n.push(note);
            else notesByProject.set(proj, [note]);
          }
        } else {
          const sourceProj = currentProjectFor.get(k) || "Unknown Project";
          if (!byInSourceProject.has(sourceProj))
            byInSourceProject.set(sourceProj, new Map());
          const typeMap = byInSourceProject.get(sourceProj)!;
          const arr = typeMap.get(ev.type);
          if (arr) arr.push(ev.assetNumber);
          else typeMap.set(ev.type, [ev.assetNumber]);

          const note = (ev.note || "").trim();
          if (note) notesWarehouse.push(note);
        }
      }

      // Update global attachment state
      if (ev.direction === "OUT") {
        currentProjectFor.set(k, ev.projectCode || null);
      } else {
        currentProjectFor.set(k, null);
      }
    }

    const lines: string[] = [];
    lines.push(`Date: ${titleDate(`${y}-${m}-${d}`)}`, "");

    byProjectOut.forEach((typeMap, proj) => {
      lines.push(`Project: ${proj}`);
      Array.from(typeMap.keys())
        .sort()
        .forEach((type) => {
          const nums = typeMap.get(type)!.slice().sort((a, b) => a - b);
          lines.push(`${type} #: ${nums.join(", ")}`);
        });
      const uniqNotes = Array.from(
        new Set((notesByProject.get(proj) || []).filter(Boolean)),
      );
      if (uniqNotes.length) lines.push(`Notes: ${uniqNotes.join("; ")}`);
      lines.push("");
    });

    if (byInSourceProject.size) {
      lines.push("Returned to Warehouse (by source):");
      Array.from(byInSourceProject.keys())
        .sort()
        .forEach((src) => {
          lines.push(`From Project: ${src}`);
          const typeMap = byInSourceProject.get(src)!;
          Array.from(typeMap.keys())
            .sort()
            .forEach((type) => {
              const nums = typeMap.get(type)!.slice().sort((a, b) => a - b);
              lines.push(`${type}: ${nums.join(", ")}`);
            });
          lines.push("");
        });

      const uniqInNotes = Array.from(new Set(notesWarehouse.filter(Boolean)));
      if (uniqInNotes.length) {
        lines.push(`Notes: ${uniqInNotes.join("; ")}`);
        lines.push("");
      }
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
              <Combobox value={project} onChange={(v: string) => setProject(v ?? "")}>
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
                              active ? "bg-blue-600 text-white" : "text-gray-900"
                            }`
                          }
                        >
                          {({ active, selected }) => (
                            <>
                              <span
                                className={`block truncate ${selected ? "font-semibold" : ""}`}
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { status, data: session } = useSession();
  const role = (session?.user?.role || "").toLowerCase();
  const isAdmin = role === "admin" || role === "owner";

  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (status === "unauthenticated") {
      const dest =
        typeof window !== "undefined" ? window.location.href : "/equipment/move";
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
    }
  }, [status, router]);

  const initialType = params.get("type") || "";
  const initialAsset = params.get("asset") || "";
  const initialDirection = (params.get("direction") || "").toUpperCase();
  const quickMode = params.get("quick") === "1";

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

  const [projects, setProjects] = useState<Project[]>([]);
  const [projQuery, setProjQuery] = useState<string>("");
  const [projectCode, setProjectCode] = useState<string>(loadString(LS_PROJ));

  useEffect(() => {
    saveString(LS_PROJ, projectCode);
  }, [projectCode]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/projects");
        if (res.data?.projects) {
          const sorted: Project[] = (res.data.projects as Array<{ id: string; code: string }>)
            .map((p) => ({ id: p.id, code: p.code }))
            .sort((a, b) => b.code.localeCompare(a.code));

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

  const filteredProjects = useMemo<Project[]>(() => {
    const q = projQuery.toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.code.toLowerCase().includes(q));
  }, [projects, projQuery]);

  const [rows, setRows] = useState<MoveRow[]>([]);

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
  }, []);

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
          toast.error(`Missing: ${data.missing.join(", ")}`, { duration: 6000 });
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

  /* ---------- Recent Movements (improved UI) ---------- */
  type Recent = {
    id: string;
    direction: "IN" | "OUT";
    at: string;
    projectCode?: string | null;
    note?: string | null;
    byId?: string | null; // mover ID / email / uid (server-provided)
    equipment?: Pick<EquipmentDTO, "type" | "assetNumber">;
    // legacy
    type?: string;
    assetNumber?: number;
  };

  const [recent, setRecent] = useState<Recent[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getType = (r: Recent) => r.equipment?.type ?? r.type ?? "";
  const getAsset = (r: Recent) => r.equipment?.assetNumber ?? r.assetNumber ?? 0;

  // UI filters/controls
  const [recQuery, setRecQuery] = useState<string>("");
  const [recSort, setRecSort] = useState<"at" | "type" | "assetNumber" | "direction">(
    "at",
  );
  const [recDir, setRecDir] = useState<"asc" | "desc">("desc");
  const [recPage, setRecPage] = useState<number>(1);
  const [recPageSize, setRecPageSize] = useState<number>(20);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [filterProject, setFilterProject] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [showNotes, setShowNotes] = useState<boolean>(true);

  // NEW: per-entry details toggle (shows mover & notes)
  const [detailsOpen, setDetailsOpen] = useState<Record<string, boolean>>({});

  const toggleDetails = (id: string) =>
    setDetailsOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  // NEW: resolve byId -> display name cache
  type UserLite = { id: string; name?: string | null; email?: string | null };
  const [userNameCache, setUserNameCache] = useState<Record<string, string>>({});

  const nameFor = (byId?: string | null): string | undefined => {
    if (!byId) return undefined;
    return userNameCache[byId] || byId || undefined;
  };

  async function hydrateUserNames(items: Recent[]) {
    // collect unique byIds not yet in cache
    const ids = Array.from(
      new Set(items.map((r) => r.byId).filter((x): x is string => !!x)),
    ).filter((id) => !(id in userNameCache));

    if (!ids.length) return;
    try {
      // Try a batch endpoint first; fall back to a simple one if needed.
      let users: UserLite[] | null = null;
      try {
        const resp = await axios.get<{ users: UserLite[] }>(
          "/api/users/batch",
          { params: { ids: ids.join(",") } },
        );
        users = resp.data?.users ?? null;
      } catch {
        const resp = await axios.get<{ users: UserLite[] }>(
          "/api/users",
          { params: { ids: ids.join(",") } },
        );
        users = resp.data?.users ?? null;
      }

      if (users && Array.isArray(users)) {
        const add: Record<string, string> = {};
        users.forEach((u) => {
          const label =
            (u.name && u.name.trim()) ||
            (u.email && u.email.trim()) ||
            u.id;
          add[u.id] = label;
        });
        if (Object.keys(add).length) {
          setUserNameCache((prev) => ({ ...prev, ...add }));
        }
      }
    } catch {
      // fail gracefully; leave cache as-is (fallback shows raw byId)
    }
  }

  const [showArchived, setShowArchived] = useState<boolean>(false);
  const cutoffMs = useMemo(() => Date.now() - 30 * 24 * 60 * 60 * 1000, []);

  async function refreshRecent() {
    try {
      const { data } = await axios.get<{ status: number; items: Recent[] }>(
        "/api/equipment/movements",
        { params: { limit: 1000 } },
      );
      if (data.status === 200) {
        setRecent(data.items);
        void hydrateUserNames(data.items);
      }
    } catch {
      /* noop */
    }
  }
  useEffect(() => {
    refreshRecent();
  }, []);

  const projectsInRecent = useMemo<string[]>(() => {
    const set = new Set<string>();
    recent.forEach((r) => {
      if (r.projectCode) set.add(r.projectCode);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [recent]);

  const typesInRecent = useMemo<string[]>(() => {
    const set = new Set<string>();
    recent.forEach((r) => {
      const t = getType(r);
      if (t) set.add(t);
    });
    return Array.from(set).sort();
  }, [recent]);

  const recentFilteredSorted = useMemo<Recent[]>(() => {
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

  const totalPages = Math.max(1, Math.ceil(recentFilteredSorted.length / recPageSize));
  const pageItems = useMemo<Recent[]>(() => {
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
      const resp = (e as { response?: { data?: DeleteResponse } }).response?.data;
      if (resp && isDeleteError(resp)) toast.error(resp.error || "Delete failed");
      else toast.error("Delete failed");
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

  if (!mounted) {
    return <div className="min-h-screen bg-gray-100" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 md:pt-28 lg:pt-32">
      <Navbar />
      <div className="mx-auto max-w-6xl p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Equipment Movement</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setReportOpen(true)}
              className="rounded bg-emerald-600 px-3 py-2 text-white"
            >
              Generate WhatsApp Report
            </button>
            <button
              onClick={() => setScannerOpen(true)}
              className="rounded bg-amber-600 px-3 py-2 text-white"
            >
              Scan QR
            </button>
          </div>
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
            >
              {d === "OUT" ? "DEPLOY" : "PULL OUT"}
            </button>
          ))}
        </div>

        {/* Project (DEPLOY only) */}
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
                              className={`block truncate ${selected ? "font-semibold" : ""}`}
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
              <label className="block text-sm font-medium">Specify date/time</label>
              <input
                type="datetime-local"
                value={manualIso}
                onChange={(e) => setManualIso(e.target.value)}
                className="mt-1 w-full rounded border p-2"
              />
            </div>
          )}
        </div>

        {/* Batch Items */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
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
                    onChange={(e) => updateRow(i, { assetNumber: e.target.value })}
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
          </div>
        </div>

        {/* Recent Movements — improved UI */}
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-8 md:items-end">
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
            <div className="flex items-center justify-between gap-2 rounded border p-2 text-xs text-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showNotes}
                  onChange={(e) => setShowNotes(e.target.checked)}
                />
                Show notes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => {
                    setShowArchived(e.target.checked);
                    setRecPage(1);
                  }}
                />
                Archived (&gt; 30d)
              </label>
            </div>
          </div>

          {/* date / page size row */}
          <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-5">
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
            <div className="md:col-span-2" />
          </div>

          {/* ITEMS */}
          <div className="space-y-2">
            {pageItems.length === 0 ? (
              <div className="text-sm text-gray-600">No entries</div>
            ) : (
              pageItems.map((m) => {
                const isArchived = new Date(m.at).getTime() < cutoffMs;
                const dur = durationById.get(m.id);
                const dirBadge =
                  m.direction === "OUT"
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

                return (
                  <div
                    key={m.id}
                    className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow md:p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {/* Left cluster */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                            {getType(m)} #{getAsset(m)}
                          </span>
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase ${dirBadge}`}>
                            {m.direction === "OUT" ? "DEPLOYED" : "PULLED-OUT"}
                          </span>
                          {m.projectCode ? (
                            <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-200">
                              Project: {m.projectCode}
                            </span>
                          ) : null}
                          {isArchived ? (
                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                              Archived
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 text-xs text-gray-600">
                          {new Date(m.at).toLocaleString()}
                          {dur?.label ? <span className="ml-2">· Duration: {dur.label}</span> : null}
                        </div>
                      </div>

                      {/* Right cluster: actions */}
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => toggleDetails(m.id)}
                          className="rounded border px-3 py-1 text-xs"
                        >
                          {detailsOpen[m.id] ? "Hide Details" : "Show Details"}
                        </button>
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

                    {/* Collapsible details: mover + notes */}
                    {detailsOpen[m.id] && (
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div className="rounded-lg bg-gray-50 p-3 text-sm ring-1 ring-gray-100">
                          <div className="text-xs font-semibold text-gray-600">
                            Moved By
                          </div>
                          <div className="mt-0.5 text-gray-800">
                            {nameFor(m.byId) ?? "Unknown"}
                          </div>
                        </div>
                        {showNotes && m.note ? (
                          <div className="rounded-lg bg-gray-50 p-3 text-sm ring-1 ring-gray-100">
                            <div className="text-xs font-semibold text-gray-600">
                              Notes
                            </div>
                            <div className="mt-0.5 whitespace-pre-wrap text-gray-800">
                              {m.note}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* pagination */}
          <div className="mt-3 flex flex-col items-center justify-between gap-2 md:flex-row">
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
        projects={projects}
      />
    </div>
  );
}
