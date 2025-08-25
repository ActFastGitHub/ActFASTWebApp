"use client";

import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/app/components/navBar";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import type {
  MovementDirection,
  MoveRequest,
  MoveResponse,
  DeleteResponse,
} from "@/app/types/equipment";
import { isMoveOK, isMoveError } from "@/app/types/equipment";
import { isDeleteOK, isDeleteError } from "@/app/types/equipment";
import type { AxiosError } from "axios";

type Project = { id: string; code: string };
type MoveRow = { type: string; assetNumber: string };

export default function MoveClient(): JSX.Element {
  const { status } = useSession();
  const router = useRouter();
  const params = useSearchParams();

  // Redirect to login if unauthenticated (keeps return)
  useEffect(() => {
    if (status === "unauthenticated") {
      const dest =
        typeof window !== "undefined"
          ? window.location.href
          : "/equipment/move";
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
    }
  }, [status, router]);

  /* ---------- Quick-mode from QR ---------- */
  const initialType = params.get("type") || "";
  const initialAsset = params.get("asset") || "";
  const initialDirection = (params.get("direction") || "").toUpperCase();
  const quickMode = params.get("quick") === "1";

  /* ---------- Movement Form State ---------- */
  const [direction, setDirection] = useState<MovementDirection>(
    initialDirection === "IN" || initialDirection === "OUT"
      ? (initialDirection as MovementDirection)
      : "OUT",
  );
  const [useNow, setUseNow] = useState(true);
  const [manualIso, setManualIso] = useState<string>("");
  const [note, setNote] = useState<string>("");

  /* ---------- Project Combobox (for OUT) ---------- */
  const [projects, setProjects] = useState<Project[]>([]);
  const [projQuery, setProjQuery] = useState("");
  const [projectCode, setProjectCode] = useState<string>("");

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
          setProjects(
            res.data.projects.map((p: any) => ({ id: p.id, code: p.code })),
          );
        }
      } catch {
        /* noop */
      }
    })();
  }, []);

  /* ---------- Rows (Type + Asset #) ---------- */
  const [rows, setRows] = useState<MoveRow[]>([
    { type: initialType, assetNumber: initialAsset },
  ]);

  function addRow() {
    setRows((r) => [...r, { type: "", assetNumber: "" }]);
  }
  function removeRow(i: number) {
    setRows((r) => (r.length <= 1 ? r : r.filter((_, idx) => idx !== i)));
  }
  function updateRow(i: number, patch: Partial<MoveRow>) {
    setRows((r) =>
      r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)),
    );
  }

  /* ---------- Build Payload ---------- */
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

  /* ---------- Client-side validation ---------- */
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

  /* ---------- Submit ---------- */
  async function submitMove(stayAfter = false) {
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

        // Quick mode / Stay to scan next
        if (stayAfter || quickMode) {
          setRows([{ type: "", assetNumber: "" }]);
          setNote("");
          setUseNow(true);
          setManualIso("");
        } else {
          // reset but no navigation
          setRows([{ type: "", assetNumber: "" }]);
          setNote("");
          setUseNow(true);
          setManualIso("");
        }
        refreshRecent();
      } else {
        // data is MoveResponseError
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

  /* ---------- Recent Movements (for delete) ---------- */
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

  async function refreshRecent() {
    try {
      const { data } = await axios.get<{ status: number; items: Recent[] }>(
        "/api/equipment/movements",
        { params: { limit: 50 } },
      );
      if (data.status === 200) setRecent(data.items);
    } catch {
      /* noop */
    }
  }
  useEffect(() => {
    refreshRecent();
  }, []);

  async function deleteMovement(id: string) {
    try {
      const res = await axios.delete<DeleteResponse>(
        `/api/equipment/movements/${id}`,
      );
      const data = res.data;

      if (isDeleteOK(data)) {
        toast.success("Movement deleted");
        setConfirmDeleteId(null);
        refreshRecent();
      } else {
        // data is DeleteResponseError here
        toast.error(data.error || "Delete failed");
      }
    } catch (e) {
      const ax = e as AxiosError<DeleteResponse>;
      const data = ax.response?.data;

      if (data && isDeleteError(data)) {
        // safely access .error
        toast.error(data.error || "Delete failed");
      } else {
        toast.error("Delete failed");
      }
    }
  }

  /* ---------- Render ---------- */
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
                direction === d ? "bg-blue-600 text-white" : "border bg-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Project (only OUT) */}
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

        {/* Items */}
        <div className="mb-4 rounded bg-white p-4 shadow">
          <h2 className="mb-2 font-semibold">Items</h2>
          <div className="space-y-3">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-7">
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
            <button
              onClick={() => {
                setRows([{ type: "", assetNumber: "" }]);
                toast("Cleared");
              }}
              className="rounded border px-3 py-2"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Notes (large textarea) */}
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

        {/* Submit */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => submitMove(false)}
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white"
          >
            Save Movement
          </button>
          <button
            onClick={() => submitMove(true)}
            className="rounded bg-emerald-600 px-4 py-2 font-medium text-white"
          >
            Save & Stay (Scan Next)
          </button>
        </div>

        {/* Recent Movements */}
        <div className="rounded bg-white p-4 shadow">
          <h2 className="mb-2 font-semibold">Recent Movements</h2>
          <div className="space-y-2">
            {recent.length === 0 ? (
              <div className="text-sm text-gray-600">No recent entries</div>
            ) : (
              recent.map((m) => (
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
                  </div>
                  <div className="mt-2 flex gap-2 sm:mt-0">
                    {confirmDeleteId === m.id ? (
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
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
