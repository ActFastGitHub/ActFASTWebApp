"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "@/app/components/navBar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Combobox } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  PencilSquareIcon,
  ArchiveBoxArrowDownIcon,
  ArchiveBoxXMarkIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import type { EquipmentDTO, EquipmentStatus } from "@/app/types/equipment";
import { STATUSES } from "@/app/types/equipment";

type TypeItem = { code: string };
type Project = { id: string; code: string };

type SortKey =
  | "type"
  | "assetNumber"
  | "status"
  | "currentProjectCode"
  | "model"
  | "serial"
  | "lastMovedAt"
  | "createdAt";

export default function EquipmentManagePage() {
  const { status } = useSession();
  const router = useRouter();

  /* ───── auth redirect ───── */
  useEffect(() => {
    if (status === "unauthenticated") {
      const dest =
        typeof window !== "undefined"
          ? window.location.href
          : "/equipment/admin/manage";
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
    }
  }, [status, router]);

  /* ───── Add form ───── */
  const [assetNumber, setAssetNumber] = useState<number | "">("");
  const [type, setType] = useState("");
  const [typeQuery, setTypeQuery] = useState("");
  const [types, setTypes] = useState<TypeItem[]>([]);
  const filteredTypes =
    typeQuery === ""
      ? types
      : types.filter((t) =>
          t.code.toLowerCase().includes(typeQuery.toLowerCase()),
        );
  const [model, setModel] = useState("");
  const [serial, setSerial] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  /* ───── List + filters ───── */
  const [items, setItems] = useState<EquipmentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeF, setTypeF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [q, setQ] = useState("");

  /* show/hide less-used columns */
  const [showModelSerial, setShowModelSerial] = useState(false);

  /* sorting */
  const [sortKey, setSortKey] = useState<SortKey>("assetNumber");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  /* Projects (for Project column editing) — sorted DESC */
  const [projects, setProjects] = useState<Project[]>([]);
  const [projQueryEdit, setProjQueryEdit] = useState("");
  const filteredProjects = useMemo(() => {
    const s = projQueryEdit.toLowerCase();
    return s
      ? projects.filter((p) => p.code.toLowerCase().includes(s))
      : projects;
  }, [projects, projQueryEdit]);

  /* ───── edit state ───── */
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    id: string;
    type: string;
    assetNumber: string;
    status: EquipmentStatus;
    currentProjectCode: string;
    model: string;
    serial: string;
    lastMovedAt: string; // datetime-local controlled value
  } | null>(null);

  /* ───── pagination ───── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const pageSizeOptions = [10, 25, 50, 100];

  /* reset page when filters or search change */
  useEffect(() => {
    setPage(1);
  }, [q, typeF, statusF, includeArchived]);

  /* clamp page when filtered list changes */
  function clampPage(nextTotal: number) {
    const totalPages = Math.max(1, Math.ceil(nextTotal / pageSize));
    if (page > totalPages) setPage(totalPages);
  }

  /* ───── load list + projects ───── */
  async function load() {
    setLoading(true);
    try {
      const { data } = await axios.get<{ status: 200; items: EquipmentDTO[] }>(
        "/api/equipment",
        {
          params: {
            type: typeF || undefined,
            status: statusF || undefined,
            includeArchived: includeArchived ? "1" : undefined,
          },
        },
      );
      const list = data.items ?? [];
      setItems(list);

      // keep type list in sync (for Add + edit datalist)
      const next = Array.from(new Set(list.map((i) => i.type)))
        .sort()
        .map((code) => ({ code }));
      setTypes(next);

      clampPage(list.length);
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeF, statusF, includeArchived]);

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
        /* ignore */
      }
    })();
  }, []);

  // initial types if list empty initially
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get<{ status: 200; items: TypeItem[] }>(
          "/api/equipment/types",
        );
        if (data.items?.length)
          setTypes(data.items.sort((a, b) => a.code.localeCompare(b.code)));
      } catch {
        /* ignore */
      }
    })();
  }, []);

  /* ───── edit helpers ───── */
  function beginEdit(row: EquipmentDTO) {
    setEditingId(row.id);
    setDraft({
      id: row.id,
      type: row.type,
      assetNumber: String(row.assetNumber),
      status: row.status,
      currentProjectCode: row.currentProjectCode ?? "",
      model: row.model ?? "",
      serial: row.serial ?? "",
      // prefill lastMovedAt for datetime-local control (ISO without seconds Z)
      lastMovedAt: row.lastMovedAt ? toDatetimeLocal(row.lastMovedAt as any) : "",
    });
  }
  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    toast("Edit cancelled");
  }

  function validateDraft(d: NonNullable<typeof draft>): {
    ok: boolean;
    msg?: string;
  } {
    const t = d.type.trim();
    if (!t) return { ok: false, msg: "Type is required" };
    const nStr = d.assetNumber.trim();
    if (!/^\d+$/.test(nStr))
      return { ok: false, msg: "Asset # must be a positive whole number" };
    const n = Number(nStr);
    if (!Number.isInteger(n) || n <= 0)
      return { ok: false, msg: "Asset # must be a positive integer" };
    if (d.lastMovedAt) {
      const dt = new Date(d.lastMovedAt);
      if (Number.isNaN(dt.getTime()))
        return { ok: false, msg: "Invalid 'Last Moved' date/time" };
    }
    return { ok: true };
  }

  async function saveEdit() {
    if (!draft || !editingId) return;
    const v = validateDraft(draft);
    if (!v.ok) {
      toast.error(v.msg || "Please fix the form");
      return;
    }
    try {
      const payload: any = {
        type: draft.type.trim(),
        assetNumber: Number(draft.assetNumber.trim()),
        status: draft.status,
        currentProjectCode: draft.currentProjectCode.trim() || null,
        model: draft.model.trim(),
        serial: draft.serial.trim(),
      };
      // include lastMovedAt when provided (convert local -> UTC ISO)
      if (draft.lastMovedAt) {
        payload.lastMovedAt = new Date(draft.lastMovedAt).toISOString();
      }

      const { data } = await axios.patch<{ status: number; error?: string }>(
        `/api/equipment/${editingId}`,
        payload,
      );
      if (data?.status === 200) {
        toast.success("Equipment updated");
        setEditingId(null);
        setDraft(null);
        await load();
      } else {
        toast.error(data?.error ?? "Update failed");
      }
    } catch (e: any) {
      const msg =
        e?.response?.status === 409
          ? "That Type + Asset # already exists"
          : e?.response?.data?.error ?? "Update failed";
      toast.error(msg);
    }
  }

  async function toggleArchive(row: EquipmentDTO) {
    try {
      const { data } = await axios.patch<{ status: number; error?: string }>(
        `/api/equipment/${row.id}`,
        { archived: !row.archived },
      );
      if (data.status === 200) {
        toast.success(
          `${row.type} #${row.assetNumber} ${row.archived ? "unarchived" : "archived"}`,
        );
        await load();
      } else {
        toast.error(data.error ?? "Action failed");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Action failed");
    }
  }

  async function removeRow(id: string) {
    try {
      const { data } = await axios.delete<{ status: number; error?: string }>(
        `/api/equipment/${id}`,
      );
      if (data.status === 200) {
        toast.success("Deleted");
        setConfirmDeleteId(null);
        await load();
      } else {
        toast.error(data.error ?? "Delete failed");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Delete failed");
    }
  }

  async function addEquipment(saveAndQr = false) {
    if (assetNumber === "" || !type.trim()) {
      toast.error("Asset # and Type are required");
      return;
    }
    try {
      const num = Number(assetNumber);
      const { data } = await axios.post<{
        status: number;
        id?: string;
        created?: boolean;
        error?: string;
      }>("/api/equipment/upsert", {
        assetNumber: num,
        type: type.trim(),
        model: model || undefined,
        serial: serial || undefined,
      });
      if (data.status !== 200) {
        toast.error(data.error ?? "Failed to save");
        return;
      }
      toast.success(data.created ? "Equipment created" : "Equipment updated");

      // real-time type list update
      setTypes((prev) =>
        prev.some((t) => t.code === type.trim())
          ? prev
          : [...prev, { code: type.trim() }].sort((a, b) =>
              a.code.localeCompare(b.code),
            ),
      );

      setAssetNumber("");
      setModel("");
      setSerial("");
      await load();

      if (saveAndQr) {
        const base = window.location.origin;
        const url = `${base}/e/${encodeURIComponent(
          type.trim(),
        )}/${num}?quick=1&direction=OUT`;
        setQrDataUrl(
          await QRCode.toDataURL(url, {
            errorCorrectionLevel: "Q",
            margin: 1,
            scale: 6,
          }),
        );
        toast.success("QR generated (Quick Mode)");
      } else {
        setQrDataUrl(null);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to save");
    }
  }

  /* ───── filtering + sorting ───── */
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let list: EquipmentDTO[] = items;

    if (s) {
      // If purely numeric (leading zeros allowed), treat as exact assetNumber
      if (/^\d+$/.test(s)) {
        const n = parseInt(s, 10); // "01" => 1
        list = list.filter((e) => e.assetNumber === n);
      } else {
        // Otherwise, broad text search
        list = list.filter((e) =>
          `${e.type} ${e.assetNumber} ${e.status} ${e.currentProjectCode ?? ""} ${e.model ?? ""} ${e.serial ?? ""}`
            .toLowerCase()
            .includes(s),
        );
      }
    }

    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      const av = getValue(a, sortKey);
      const bv = getValue(b, sortKey);
      if (av == null && bv != null) return 1 * dir;
      if (av != null && bv == null) return -1 * dir;
      if (av == null && bv == null) return 0;

      if (sortKey === "assetNumber") {
        return ((av as number) - (bv as number)) * dir;
      }
      if (sortKey === "lastMovedAt" || sortKey === "createdAt") {
        const ta = new Date(av as string | Date).getTime();
        const tb = new Date(bv as string | Date).getTime();
        return (ta - tb) * dir;
      }
      // strings
      return String(av).localeCompare(String(bv)) * dir;
    });

    return list;
  }, [items, q, sortKey, sortDir]);

  // Slice for current page
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(total, startIndex + pageSize);
  const pageItems = filtered.slice(startIndex, endIndex);

  useEffect(() => {
    // keep page in bounds if pageSize or filtered changes
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  function getValue(row: EquipmentDTO, key: SortKey) {
    switch (key) {
      case "type":
        return row.type;
      case "assetNumber":
        return row.assetNumber;
      case "status":
        return row.status;
      case "currentProjectCode":
        return row.currentProjectCode ?? "";
      case "model":
        return row.model ?? "";
      case "serial":
        return row.serial ?? "";
      case "lastMovedAt":
        return row.lastMovedAt ?? null;
      case "createdAt":
        return row.createdAt ?? null;
    }
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const isEditing = (id: string) => editingId === id;

  /* ───── Summary Report (clipboard) ───── */
  function generateSummaryReport() {
    // Work off the full loaded dataset (items), ignore search box, but honor includeArchived filter param
    const lines: string[] = [];
    const byType = new Map<
      string,
      {
        warehouse: number[];
        deployed: number[];
        maintenance: number[];
        lost: number[];
        archived: number[];
      }
    >();

    // Bucketize
    for (const e of items) {
      const t = e.type || "Uncategorized";
      if (!byType.has(t)) {
        byType.set(t, {
          warehouse: [],
          deployed: [],
          maintenance: [],
          lost: [],
          archived: [],
        });
      }
      const bucket = byType.get(t)!;
      const n = e.assetNumber;

      if (e.archived) {
        bucket.archived.push(n);
        continue; // exclude archived from core stats
      }

      switch (e.status) {
        case "WAREHOUSE":
          bucket.warehouse.push(n);
          break;
        case "DEPLOYED":
          bucket.deployed.push(n);
          break;
        case "MAINTENANCE":
          bucket.maintenance.push(n);
          break;
        case "LOST":
          bucket.lost.push(n);
          break;
        default:
          // Treat unknown as neither active nor repair; they won’t show in active/repair
          break;
      }
    }

    const fmtNums = (arr: number[]) =>
      arr.length ? arr.sort((a, b) => a - b).map((n) => `#${n}`).join(", ") : "";

    // For each type, compute Active, Missing (gaps), For Repair, plus Warehouse/Deployed
    const typesSorted = Array.from(byType.keys()).sort((a, b) =>
      a.localeCompare(b),
    );

    for (const t of typesSorted) {
      const b = byType.get(t)!;
      const activeNums = [...b.warehouse, ...b.deployed].sort((a, b) => a - b);
      const repairNums = [...b.maintenance].sort((a, b) => a - b);

      const maxSeen = Math.max(
        0,
        ...(activeNums.length ? [activeNums[activeNums.length - 1]] : []),
        ...(repairNums.length ? [repairNums[repairNums.length - 1]] : []),
      );

      const present = new Set<number>([...activeNums, ...repairNums]);
      const missingNums: number[] = [];
      for (let i = 1; i <= maxSeen; i++) {
        if (!present.has(i)) missingNums.push(i);
      }

      // Header
      lines.push(t);
      lines.push("");

      // Active summary (as requested: Active = Warehouse + Deployed)
      lines.push(`Active Count: ${activeNums.length}`);
      lines.push(`Active Numbers: ${fmtNums(activeNums)}`);

      // Warehouse / Deployed
      lines.push(`Warehouse Count: ${b.warehouse.length}`);
      lines.push(`Warehouse Numbers: ${fmtNums(b.warehouse)}`);
      lines.push(`Deployed Count: ${b.deployed.length}`);
      lines.push(`Deployed Numbers: ${fmtNums(b.deployed)}`);

      // Missing (gaps vs 1..max across Active+Repair)
      lines.push(`Missing Count: ${missingNums.length}`);
      lines.push(`Missing Numbers: ${fmtNums(missingNums)}`);

      // For Repair
      lines.push(`For Repair Count: ${repairNums.length}`);
      lines.push(`For Repair Numbers: ${fmtNums(repairNums)}`);

      // Optional extra insights if available
      if (b.lost.length) {
        lines.push(`Lost Count: ${b.lost.length}`);
        lines.push(`Lost Numbers: ${fmtNums(b.lost)}`);
      }
      if (b.archived.length) {
        lines.push(`Archived (excluded) Count: ${b.archived.length}`);
      }

      lines.push(""); // spacer
    }

    const text = lines.join("\n").trim();

    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Summary report copied to clipboard"))
      .catch(() => toast.error("Failed to copy report"));
  }

  /* ───── UI helpers ───── */
  function SortHeader({
    label,
    col,
    hidden,
  }: {
    label: string;
    col: SortKey;
    hidden?: boolean;
  }) {
    if (hidden) return null;
    const active = sortKey === col;
    return (
      <button
        type="button"
        onClick={() => toggleSort(col)}
        className="group inline-flex items-center gap-1"
        title="Sort"
      >
        <span>{label}</span>
        {active ? (
          sortDir === "asc" ? (
            <ArrowUpIcon className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
          )
        ) : (
          <ArrowsUpDownIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
        )}
      </button>
    );
  }

  function PaginationControls({
    location,
  }: {
    location: "top" | "bottom";
  }) {
    return (
      <div
        className={`mt-2 w-full flex flex-wrap items-center gap-2 ${location === "bottom" ? "py-3" : "pb-3"} md:gap-3`}
      >
        {/* Left-aligned on md+ (mr-auto pushes the rest to the right) */}
        <div className="min-w-0 shrink text-xs text-gray-700 md:text-sm md:mr-auto">
          Showing <span className="font-semibold">{total === 0 ? 0 : startIndex + 1}</span>-
          <span className="font-semibold">{endIndex}</span> of{" "}
          <span className="font-semibold">{total}</span>
        </div>

        <div className="flex items-center gap-2 text-xs md:text-sm">
          <span className="text-gray-700">Rows per page</span>
          <select
            className="rounded border px-2 py-1"
            value={pageSize}
            onChange={(e) => {
              const next = Number(e.target.value);
              setPageSize(next);
              setPage(1);
            }}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 text-xs md:gap-2 md:text-sm">
          <button
            className="rounded border px-2 py-1 disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={page <= 1}
            title="First page"
            aria-label="First page"
          >
            «
          </button>
          <button
            className="rounded border px-2 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            title="Previous page"
            aria-label="Previous page"
          >
            ‹
          </button>
          <span className="px-1">
            Page <b>{page}</b> / <b>{totalPages}</b>
          </span>
          <button
            className="rounded border px-2 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            title="Next page"
            aria-label="Next page"
          >
            ›
          </button>
          <button
            className="rounded border px-2 py-1 disabled:opacity-50"
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
            title="Last page"
            aria-label="Last page"
          >
            »
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 md:pt-28 lg:pt-32 overflow-x-hidden">
      <Navbar />
      <div className="mx-auto max-w-7xl p-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Equipment Management</h1>
          <button
            onClick={generateSummaryReport}
            className="inline-flex items-center gap-2 rounded bg-emerald-600 px-3 py-2 text-white"
            title="Copy summary report to clipboard"
          >
            <ClipboardDocumentCheckIcon className="h-5 w-5" />
            Generate Summary Report
          </button>
        </div>

        {/* Add */}
        <div className="mb-6 rounded bg-white p-4 shadow">
          <h2 className="mb-2 text-lg font-semibold">Add Equipment</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <div>
              <label className="block text-sm font-medium">Asset #</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="mt-1 w-full rounded border p-2"
                value={assetNumber}
                onChange={(e) =>
                  setAssetNumber(
                    e.target.value
                      ? (e.target.value.replace(/\D/g, "") as unknown as number)
                      : "",
                  )
                }
                placeholder="e.g. 33"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Type</label>
              <Combobox
                as="div"
                value={type}
                onChange={(v: string) => setType(v ?? "")}
              >
                <div className="relative mt-1">
                  <Combobox.Input
                    className="w-full rounded border p-2"
                    displayValue={(v: string) => v}
                    onChange={(e) => {
                      setType(e.target.value);
                      setTypeQuery(e.target.value);
                    }}
                    placeholder="Dehumidifier, Blower, Air Scrubber, Vehicle…"
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                  </Combobox.Button>
                  {filteredTypes.length > 0 && (
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {filteredTypes.map((t) => (
                        <Combobox.Option
                          key={t.code}
                          value={t.code}
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
                                {t.code}
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
            <div>
              <label className="block text-sm font-medium">Model</label>
              <input
                className="mt-1 w-full rounded border p-2"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Serial</label>
              <input
                className="mt-1 w-full rounded border p-2"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => addEquipment(false)}
              className="rounded bg-blue-600 px-3 py-2 text-white"
            >
              Save
            </button>
            <button
              onClick={() => addEquipment(true)}
              className="rounded bg-emerald-600 px-3 py-2 text-white"
            >
              Save & Generate QR
            </button>
          </div>
          {qrDataUrl && (
            <div className="mt-4 flex items-center gap-4">
              <img src={qrDataUrl} alt="QR" className="h-32 w-32" />
              <a
                href={qrDataUrl}
                download="asset-qr.png"
                className="rounded bg-gray-800 px-3 py-2 text-white"
              >
                Download PNG
              </a>
              <div className="text-sm text-gray-600">
                QR opens Move page in <b>Quick Mode</b>. Scan multiple, then save once.
              </div>
            </div>
          )}
        </div>

        {/* Filters / Controls */}
        <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-7">
          {/* longer search bar */}
          <input
            placeholder="Search (type, #, status, project, model, serial…)"
            className="rounded border p-2 md:col-span-4"
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
              <option key={t.code} value={t.code}>
                {t.code}
              </option>
            ))}
          </select>
          <select
            className="rounded border p-2"
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
          >
            <option value="">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded border p-2">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
            />
            <span className="whitespace-nowrap text-sm">Include Archived</span>
          </label>
          <label className="flex items-center gap-2 rounded border p-2 md:col-span-2">
            <input
              type="checkbox"
              checked={showModelSerial}
              onChange={(e) => setShowModelSerial(e.target.checked)}
            />
            <span className="text-sm">Show Model/Serial columns</span>
          </label>
        </div>

        {/* Pagination (TOP) — desktop/tablet only to avoid mobile duplication */}
        <div className="hidden md:block">
          <PaginationControls location="top" />
        </div>

        {/* Table (md+) */}
        <div className="hidden overflow-x-auto rounded bg-white shadow md:block">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">
                  <SortHeader label="Type" col="type" />
                </th>
                <th className="p-3 text-left">
                  <SortHeader label="#" col="assetNumber" />
                </th>
                <th className="p-3 text-left">
                  <SortHeader label="Status" col="status" />
                </th>
                <th className="p-3 text-left">
                  <SortHeader label="Project" col="currentProjectCode" />
                </th>

                {/* optional columns */}
                <th className="p-3 text-left">
                  <SortHeader label="Model" col="model" hidden={!showModelSerial} />
                </th>
                <th className="p-3 text-left">
                  <SortHeader label="Serial" col="serial" hidden={!showModelSerial} />
                </th>

                <th className="p-3 text-left">
                  <SortHeader label="Last Moved" col="lastMovedAt" />
                </th>
                <th className="p-3 text-left">
                  <SortHeader label="Created" col="createdAt" />
                </th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-4">
                    Loading…
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4">
                    No results
                  </td>
                </tr>
              ) : (
                pageItems.map((row) => {
                  const editing = isEditing(row.id);
                  return (
                    <tr
                      key={row.id}
                      className={`border-t ${row.archived ? "bg-gray-100 text-gray-500" : ""}`}
                    >
                      {/* Type */}
                      <td className="p-3">
                        <input
                          list="eq-types"
                          className={`w-40 rounded border p-1 ${!editing ? "bg-gray-50" : ""}`}
                          value={editing ? draft?.type ?? row.type : row.type}
                          onChange={(ev) =>
                            editing &&
                            setDraft((d) => (d ? { ...d, type: ev.target.value } : d))
                          }
                          readOnly={!editing}
                        />
                        <datalist id="eq-types">
                          {types.map((t) => (
                            <option key={t.code} value={t.code} />
                          ))}
                        </datalist>
                      </td>

                      {/* # */}
                      <td className="p-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className={`w-24 rounded border p-1 ${!editing ? "bg-gray-50" : ""}`}
                          value={
                            editing
                              ? draft?.assetNumber ?? String(row.assetNumber)
                              : String(row.assetNumber)
                          }
                          onChange={(ev) =>
                            editing &&
                            setDraft((d) => (d ? { ...d, assetNumber: ev.target.value } : d))
                          }
                          readOnly={!editing}
                        />
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <select
                          className={`rounded border p-1 ${!editing ? "bg-gray-50" : ""}`}
                          value={editing ? draft?.status ?? row.status : row.status}
                          onChange={(ev) =>
                            editing &&
                            setDraft((d) =>
                              d
                                ? {
                                    ...d,
                                    status: ev.target.value as EquipmentStatus,
                                  }
                                : d,
                            )
                          }
                          disabled={!editing}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Project (edit via combobox) */}
                      <td className="p-3">
                        <Combobox
                          as="div"
                          value={
                            editing
                              ? draft?.currentProjectCode ?? row.currentProjectCode ?? ""
                              : row.currentProjectCode ?? ""
                          }
                          onChange={(v: string) =>
                            editing &&
                            setDraft((d) => (d ? { ...d, currentProjectCode: v ?? "" } : d))
                          }
                        >
                          <div className="relative">
                            <Combobox.Input
                              className={`w-40 rounded border p-1 ${!editing ? "bg-gray-50" : ""}`}
                              displayValue={(v: string) => v}
                              onChange={(e) => editing && setProjQueryEdit(e.target.value)}
                              readOnly={!editing}
                              placeholder="ACTF-2025-001"
                            />
                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />
                            </Combobox.Button>
                            {editing && filteredProjects.length > 0 && (
                              <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-56 overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {filteredProjects.map((p) => (
                                  <Combobox.Option
                                    key={p.id}
                                    value={p.code}
                                    className={({ active }) =>
                                      `relative cursor-pointer select-none py-1.5 pl-3 pr-6 ${
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
                                            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                                              active ? "text-white" : "text-blue-600"
                                            }`}
                                          >
                                            <CheckIcon className="h-4 w-4" />
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
                      </td>

                      {/* Model (optional) */}
                      <td className="p-3">
                        {showModelSerial ? (
                          <input
                            className={`w-36 rounded border p-1 ${!editing ? "bg-gray-50" : ""}`}
                            value={editing ? draft?.model ?? row.model ?? "" : row.model ?? ""}
                            onChange={(ev) =>
                              editing && setDraft((d) => (d ? { ...d, model: ev.target.value } : d))
                            }
                            readOnly={!editing}
                          />
                        ) : null}
                      </td>

                      {/* Serial (optional) */}
                      <td className="p-3">
                        {showModelSerial ? (
                          <input
                            className={`w-36 rounded border p-1 ${!editing ? "bg-gray-50" : ""}`}
                            value={editing ? draft?.serial ?? row.serial ?? "" : row.serial ?? ""}
                            onChange={(ev) =>
                              editing && setDraft((d) => (d ? { ...d, serial: ev.target.value } : d))
                            }
                            readOnly={!editing}
                          />
                        ) : null}
                      </td>

                      {/* Last Moved (editable) */}
                      <td className="p-3">
                        {editing ? (
                          <input
                            type="datetime-local"
                            className="w-56 rounded border p-1"
                            value={draft?.lastMovedAt ?? ""}
                            onChange={(e) =>
                              setDraft((d) => (d ? { ...d, lastMovedAt: e.target.value } : d))
                            }
                          />
                        ) : (
                          <span>
                            {row.lastMovedAt ? new Date(row.lastMovedAt as any).toLocaleString() : "—"}
                          </span>
                        )}
                      </td>

                      {/* Created (read-only) */}
                      <td className="p-3">
                        {row.createdAt ? new Date(row.createdAt as any).toLocaleString() : "—"}
                      </td>

                      {/* Actions (icons) */}
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {editing ? (
                            <>
                              <IconButton title="Save" onClick={saveEdit} className="bg-emerald-600 text-white">
                                <CheckCircleIcon className="h-5 w-5" />
                              </IconButton>
                              <IconButton title="Cancel" onClick={cancelEdit} className="bg-gray-300">
                                <XMarkIcon className="h-5 w-5" />
                              </IconButton>
                            </>
                          ) : (
                            <>
                              {/* Edit */}
                              <IconButton
                                title="Edit"
                                onClick={() => beginEdit(row)}
                                className="bg-blue-600 text-white"
                              >
                                <PencilSquareIcon className="h-5 w-5" />
                              </IconButton>

                              {/* Archive / Unarchive */}
                              <IconButton
                                title={row.archived ? "Unarchive" : "Archive"}
                                onClick={() => toggleArchive(row)}
                                className={`text-white ${row.archived ? "bg-amber-600" : "bg-gray-700"}`}
                              >
                                {row.archived ? (
                                  <ArchiveBoxArrowDownIcon className="h-5 w-5" />
                                ) : (
                                  <ArchiveBoxXMarkIcon className="h-5 w-5" />
                                )}
                              </IconButton>

                              {/* Delete with confirmation */}
                              {confirmDeleteId === row.id ? (
                                <>
                                  <IconButton
                                    title="Confirm Delete"
                                    onClick={() => removeRow(row.id)}
                                    className="bg-red-600 text-white"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </IconButton>
                                  <IconButton
                                    title="Cancel"
                                    onClick={() => {
                                      setConfirmDeleteId(null);
                                      toast("Delete cancelled");
                                    }}
                                    className="bg-gray-300"
                                  >
                                    <XMarkIcon className="h-5 w-5" />
                                  </IconButton>
                                </>
                              ) : (
                                <IconButton
                                  title="Delete"
                                  onClick={() => {
                                    setConfirmDeleteId(row.id);
                                    toast("Click again to confirm delete", { icon: "⚠️" });
                                  }}
                                  className="bg-red-600 text-white"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </IconButton>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (BOTTOM) */}
        <div className="hidden md:block">
          <PaginationControls location="bottom" />
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden">
          {loading ? (
            <div className="rounded bg-white p-4 text-sm shadow">Loading…</div>
          ) : pageItems.length === 0 ? (
            <div className="rounded bg-white p-4 text-sm shadow">No results</div>
          ) : (
            <>
              {/* Pagination on top for mobile (single instance) */}
              <PaginationControls location="top" />

              <div className="space-y-3">
                {pageItems.map((row) => {
                  const editing = editingId === row.id;
                  return (
                    <div
                      key={row.id}
                      className={`rounded bg-white p-4 shadow ${row.archived ? "opacity-70" : ""}`}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-base font-semibold">
                          {row.type} #{row.assetNumber}
                        </div>
                        {!editing && (
                          <span
                            className={`rounded px-2 py-0.5 text-xs ${
                              row.status === "DEPLOYED"
                                ? "bg-blue-100 text-blue-800"
                                : row.status === "WAREHOUSE"
                                  ? "bg-green-100 text-green-800"
                                  : row.status === "MAINTENANCE"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {row.status}
                          </span>
                        )}
                      </div>

                      <div className="space-y-3 text-sm">
                        {/* Status */}
                        <div>
                          <div className="text-xs text-gray-500">Status</div>
                          <select
                            className={`mt-1 w-full rounded border p-2 ${!editing ? "bg-gray-50" : ""}`}
                            value={editing ? draft?.status ?? row.status : row.status}
                            onChange={(ev) =>
                              editing &&
                              setDraft((d) =>
                                d
                                  ? {
                                      ...d,
                                      status: ev.target.value as EquipmentStatus,
                                    }
                                  : d,
                              )
                            }
                            disabled={!editing}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Type */}
                        <div>
                          <div className="text-xs text-gray-500">Type</div>
                          <input
                            list="eq-types"
                            className={`mt-1 w-full rounded border p-2 ${!editing ? "bg-gray-50" : ""}`}
                            value={editing ? draft?.type ?? row.type : row.type}
                            onChange={(ev) =>
                              editing && setDraft((d) => (d ? { ...d, type: ev.target.value } : d))
                            }
                            readOnly={!editing}
                          />
                        </div>

                        {/* Asset # */}
                        <div>
                          <div className="text-xs text-gray-500">Asset #</div>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className={`mt-1 w-full rounded border p-2 ${!editing ? "bg-gray-50" : ""}`}
                            value={
                              editing
                                ? draft?.assetNumber ?? String(row.assetNumber)
                                : String(row.assetNumber)
                            }
                            onChange={(ev) =>
                              editing &&
                              setDraft((d) => (d ? { ...d, assetNumber: ev.target.value } : d))
                            }
                            readOnly={!editing}
                          />
                        </div>

                        {/* Project */}
                        <div>
                          <div className="text-xs text-gray-500">Project</div>
                          <Combobox
                            as="div"
                            value={
                              editing
                                ? draft?.currentProjectCode ?? row.currentProjectCode ?? ""
                                : row.currentProjectCode ?? ""
                            }
                            onChange={(v: string) =>
                              editing &&
                              setDraft((d) => (d ? { ...d, currentProjectCode: v ?? "" } : d))
                            }
                          >
                            <div className="relative">
                              <Combobox.Input
                                className={`mt-1 w-full rounded border p-2 ${!editing ? "bg-gray-50" : ""}`}
                                displayValue={(v: string) => v}
                                onChange={(e) => editing && setProjQueryEdit(e.target.value)}
                                readOnly={!editing}
                                placeholder="ACTF-2025-001"
                              />
                              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                              </Combobox.Button>
                              {editing && filteredProjects.length > 0 && (
                                <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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

                        {/* Model / Serial (hidden on mobile when toggle is off) */}
                        {showModelSerial && (
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div>
                              <div className="text-xs text-gray-500">Model</div>
                              <input
                                className={`mt-1 w-full rounded border p-2 ${!editing ? "bg-gray-50" : ""}`}
                                value={editing ? draft?.model ?? row.model ?? "" : row.model ?? ""}
                                onChange={(ev) =>
                                  editing &&
                                  setDraft((d) => (d ? { ...d, model: ev.target.value } : d))
                                }
                                readOnly={!editing}
                              />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Serial</div>
                              <input
                                className={`mt-1 w-full rounded border p-2 ${!editing ? "bg-gray-50" : ""}`}
                                value={editing ? draft?.serial ?? row.serial ?? "" : row.serial ?? ""}
                                onChange={(ev) =>
                                  editing &&
                                  setDraft((d) => (d ? { ...d, serial: ev.target.value } : d))
                                }
                                readOnly={!editing}
                              />
                            </div>
                          </div>
                        )}

                        {/* Last Moved (editable) & Created (read-only) */}
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div>
                            <div className="text-xs text-gray-500">Last Moved</div>
                            {editing ? (
                              <input
                                type="datetime-local"
                                className="mt-1 w-full rounded border p-2"
                                value={draft?.lastMovedAt ?? ""}
                                onChange={(e) =>
                                  setDraft((d) => (d ? { ...d, lastMovedAt: e.target.value } : d))
                                }
                              />
                            ) : (
                              <div className="mt-1">
                                {row.lastMovedAt
                                  ? new Date(row.lastMovedAt as any).toLocaleString()
                                  : "—"}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Created</div>
                            <div className="mt-1">
                              {row.createdAt ? new Date(row.createdAt as any).toLocaleString() : "—"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {editing ? (
                          <>
                            <IconButton title="Save" onClick={saveEdit} className="bg-emerald-600 text-white">
                              <CheckCircleIcon className="h-5 w-5" />
                            </IconButton>
                            <IconButton title="Cancel" onClick={cancelEdit} className="bg-gray-300">
                              <XMarkIcon className="h-5 w-5" />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton title="Edit" onClick={() => beginEdit(row)} className="bg-blue-600 text-white">
                              <PencilSquareIcon className="h-5 w-5" />
                            </IconButton>
                            <IconButton
                              title={row.archived ? "Unarchive" : "Archive"}
                              onClick={() => toggleArchive(row)}
                              className={`text-white ${row.archived ? "bg-amber-600" : "bg-gray-700"}`}
                            >
                              {row.archived ? (
                                <ArchiveBoxArrowDownIcon className="h-5 w-5" />
                              ) : (
                                <ArchiveBoxXMarkIcon className="h-5 w-5" />
                              )}
                            </IconButton>
                            {confirmDeleteId === row.id ? (
                              <>
                                <IconButton
                                  title="Confirm Delete"
                                  onClick={() => removeRow(row.id)}
                                  className="bg-red-600 text-white"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </IconButton>
                                <IconButton
                                  title="Cancel"
                                  onClick={() => {
                                    setConfirmDeleteId(null);
                                    toast("Delete cancelled");
                                  }}
                                  className="bg-gray-300"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </IconButton>
                              </>
                            ) : (
                              <IconButton
                                title="Delete"
                                onClick={() => {
                                  setConfirmDeleteId(row.id);
                                  toast("Click again to confirm delete", { icon: "⚠️" });
                                }}
                                className="bg-red-600 text-white"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </IconButton>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination on bottom for mobile */}
              <PaginationControls location="bottom" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Small Icon Button                                           */
/* ──────────────────────────────────────────────────────────── */
function IconButton({
  title,
  onClick,
  className,
  children,
}: {
  title: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded px-2 py-1 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Helpers                                                     */
/* ──────────────────────────────────────────────────────────── */
// Convert Date | string to yyyy-MM-ddTHH:mm for <input type="datetime-local">
function toDatetimeLocal(d: string | Date) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = dt.getFullYear();
  const mm = pad(dt.getMonth() + 1);
  const dd = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mi = pad(dt.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
