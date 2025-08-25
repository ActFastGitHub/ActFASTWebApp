"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "@/app/components/navBar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import type { EquipmentDTO, EquipmentStatus } from "@/app/types/equipment";
import { STATUSES } from "@/app/types/equipment";

type TypeItem = { code: string };
type Project = { id: string; code: string };

export default function EquipmentManagePage() {
  const { status } = useSession();
  const router = useRouter();

  // auth redirect
  useEffect(() => {
    if (status === "unauthenticated") {
      const dest = typeof window !== "undefined" ? window.location.href : "/equipment/admin/manage";
      router.push(`/login?callbackUrl=${encodeURIComponent(dest)}`);
    }
  }, [status, router]);

  // Add form
  const [assetNumber, setAssetNumber] = useState<number | "">("");
  const [type, setType] = useState("");
  const [typeQuery, setTypeQuery] = useState("");
  const [types, setTypes] = useState<TypeItem[]>([]);
  const filteredTypes = typeQuery === "" ? types : types.filter(t => t.code.toLowerCase().includes(typeQuery.toLowerCase()));
  const [model, setModel] = useState("");
  const [serial, setSerial] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // List + filters
  const [items, setItems] = useState<EquipmentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeF, setTypeF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [q, setQ] = useState("");

  // Projects (for Project column editing) — sorted DESC
  const [projects, setProjects] = useState<Project[]>([]);
  const [projQueryEdit, setProjQueryEdit] = useState("");
  const filteredProjects = useMemo(() => {
    const s = projQueryEdit.toLowerCase();
    return s ? projects.filter(p => p.code.toLowerCase().includes(s)) : projects;
  }, [projects, projQueryEdit]);

  // edit
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    id: string; type: string; assetNumber: string; status: EquipmentStatus;
    currentProjectCode: string; model: string; serial: string;
  } | null>(null);

  // Load list (and keep type options in sync) + projects
  async function load() {
    setLoading(true);
    try {
      const { data } = await axios.get<{ status: 200; items: EquipmentDTO[] }>("/api/equipment", {
        params: { type: typeF || undefined, status: statusF || undefined, includeArchived: includeArchived ? "1" : undefined },
      });
      const list = data.items ?? [];
      setItems(list);

      // real-time type list
      const next = Array.from(new Set(list.map(i => i.type))).sort().map(code => ({ code }));
      setTypes(next);
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to load equipment");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [typeF, statusF, includeArchived]); // eslint-disable-line

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
      } catch {/* ignore */}
    })();
  }, []);

  // initial types (if list empty)
  useEffect(() => { (async () => {
    try {
      const { data } = await axios.get<{ status: 200; items: TypeItem[] }>("/api/equipment/types");
      if (data.items?.length) setTypes(data.items.sort((a,b) => a.code.localeCompare(b.code)));
    } catch {}
  })(); }, []);

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
    });
  }
  function cancelEdit() { setEditingId(null); setDraft(null); toast("Edit cancelled"); }

  function validateDraft(d: NonNullable<typeof draft>): { ok: boolean; msg?: string } {
    const t = d.type.trim();
    if (!t) return { ok: false, msg: "Type is required" };
    const nStr = d.assetNumber.trim();
    if (!/^\d+$/.test(nStr)) return { ok: false, msg: "Asset # must be a positive whole number" };
    const n = Number(nStr);
    if (!Number.isInteger(n) || n <= 0) return { ok: false, msg: "Asset # must be a positive integer" };
    return { ok: true };
  }

  async function saveEdit() {
    if (!draft || !editingId) return;
    const v = validateDraft(draft);
    if (!v.ok) { toast.error(v.msg || "Please fix the form"); return; }
    try {
      const { data } = await axios.patch<{ status: number; error?: string }>(`/api/equipment/${editingId}`, {
        type: draft.type.trim(),
        assetNumber: Number(draft.assetNumber.trim()),
        status: draft.status,
        currentProjectCode: draft.currentProjectCode.trim() || null,
        model: draft.model.trim(),
        serial: draft.serial.trim(),
      });
      if (data?.status === 200) {
        toast.success("Equipment updated");
        setEditingId(null); setDraft(null);
        await load();
      } else {
        toast.error(data?.error ?? "Update failed");
      }
    } catch (e: any) {
      const msg = e?.response?.status === 409 ? "That Type + Asset # already exists" : (e?.response?.data?.error ?? "Update failed");
      toast.error(msg);
    }
  }

  async function toggleArchive(row: EquipmentDTO) {
    try {
      const { data } = await axios.patch<{ status: number; error?: string }>(`/api/equipment/${row.id}`, { archived: !row.archived });
      if (data.status === 200) { toast.success(`${row.type} #${row.assetNumber} ${row.archived ? "unarchived" : "archived"}`); await load(); }
      else { toast.error(data.error ?? "Action failed"); }
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Action failed");
    }
  }

  async function removeRow(id: string) {
    try {
      const { data } = await axios.delete<{ status: number; error?: string }>(`/api/equipment/${id}`);
      if (data.status === 200) { toast.success("Deleted"); setConfirmDeleteId(null); await load(); }
      else { toast.error(data.error ?? "Delete failed"); }
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Delete failed");
    }
  }

  async function addEquipment(saveAndQr = false) {
    if (assetNumber === "" || !type.trim()) { toast.error("Asset # and Type are required"); return; }
    try {
      const num = Number(assetNumber);
      const { data } = await axios.post<{ status: number; id?: string; created?: boolean; error?: string }>(
        "/api/equipment/upsert", { assetNumber: num, type: type.trim(), model: model || undefined, serial: serial || undefined }
      );
      if (data.status !== 200) { toast.error(data.error ?? "Failed to save"); return; }
      toast.success(data.created ? "Equipment created" : "Equipment updated");

      // real-time type list
      setTypes(prev => prev.some(t => t.code === type.trim()) ? prev : [...prev, { code: type.trim() }].sort((a,b)=>a.code.localeCompare(b.code)));

      setAssetNumber(""); setModel(""); setSerial("");
      await load();

      if (saveAndQr) {
        const base = window.location.origin;
        const url = `${base}/e/${encodeURIComponent(type.trim())}/${num}?quick=1&direction=OUT`;
        setQrDataUrl(await QRCode.toDataURL(url, { errorCorrectionLevel: "Q", margin: 1, scale: 6 }));
        toast.success("QR generated (Quick Mode)");
      } else {
        setQrDataUrl(null);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to save");
    }
  }

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    if (!s) return items;
    return items.filter(e =>
      `${e.type} ${e.assetNumber} ${e.status} ${e.currentProjectCode ?? ""} ${e.model ?? ""} ${e.serial ?? ""}`.toLowerCase().includes(s)
    );
  }, [items, q]);
  const isEditing = (id: string) => editingId === id;

  return (
    <div className="min-h-screen bg-gray-100 pt-24 md:pt-28 lg:pt-32">
      <Navbar />
      <div className="mx-auto max-w-6xl p-4">
        <h1 className="mb-4 text-2xl font-bold">Equipment Management</h1>

        {/* Add */}
        <div className="mb-6 rounded bg-white p-4 shadow">
          <h2 className="mb-2 text-lg font-semibold">Add Equipment</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <div>
              <label className="block text-sm font-medium">Asset #</label>
              <input type="number" className="mt-1 w-full rounded border p-2"
                value={assetNumber} onChange={(e)=>setAssetNumber(e.target.value? Number(e.target.value):"")} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Type</label>
              <Combobox as="div" value={type} onChange={(v:string)=>setType(v ?? "")}>
                <div className="relative mt-1">
                  <Combobox.Input className="w-full rounded border p-2"
                    displayValue={(v:string)=>v}
                    onChange={(e)=>{ setType(e.target.value); setTypeQuery(e.target.value); }}
                    placeholder="Dehumidifier, Blower, Air Scrubber, Vehicle…" />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                  </Combobox.Button>
                  {filteredTypes.length>0 && (
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {filteredTypes.map((t)=>(
                        <Combobox.Option key={t.code} value={t.code}
                          className={({active})=>`relative cursor-pointer select-none py-2 pl-3 pr-9 ${active?"bg-blue-600 text-white":"text-gray-900"}`}>
                          {({active, selected})=>(
                            <>
                              <span className={`block truncate ${selected?"font-semibold":""}`}>{t.code}</span>
                              {selected && (
                                <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active?"text-white":"text-blue-600"}`}>
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
              <input className="mt-1 w-full rounded border p-2" value={model} onChange={(e)=>setModel(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Serial</label>
              <input className="mt-1 w-full rounded border p-2" value={serial} onChange={(e)=>setSerial(e.target.value)} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={()=>addEquipment(false)} className="rounded bg-blue-600 px-3 py-2 text-white">Save</button>
            <button onClick={()=>addEquipment(true)} className="rounded bg-emerald-600 px-3 py-2 text-white">Save & Generate QR</button>
          </div>
          {qrDataUrl && (
            <div className="mt-4 flex items-center gap-4">
              <img src={qrDataUrl} alt="QR" className="h-32 w-32" />
              <a href={qrDataUrl} download="asset-qr.png" className="rounded bg-gray-800 px-3 py-2 text-white">Download PNG</a>
              <div className="text-sm text-gray-600">QR opens Move page in <b>Quick Mode</b>. Scan multiple, then save once.</div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-6">
          <input placeholder="Search (type, #, status, project, model, serial…)" className="rounded border p-2" value={q} onChange={(e)=>setQ(e.target.value)} />
          <select className="rounded border p-2" value={typeF} onChange={(e)=>setTypeF(e.target.value)}>
            <option value="">All Types</option>
            {types.map((t)=> <option key={t.code} value={t.code}>{t.code}</option>)}
          </select>
          <select className="rounded border p-2" value={statusF} onChange={(e)=>setStatusF(e.target.value)}>
            <option value="">All Status</option>
            {STATUSES.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-2 rounded border p-2">
            <input type="checkbox" checked={includeArchived} onChange={(e)=>setIncludeArchived(e.target.checked)} />
            <span className="text-sm">Include Archived</span>
          </label>
          <div />
        </div>

        {/* Table (md+) */}
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
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-4">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-4">No results</td></tr>
              ) : filtered.map(row => {
                const editing = isEditing(row.id);
                return (
                  <tr key={row.id} className={`border-t ${row.archived ? "bg-gray-100 text-gray-500" : ""}`}>
                    <td className="p-3">
                      <input list="eq-types" className={`w-40 rounded border p-1 ${!editing ? "bg-gray-50" : ""}`}
                        value={editing ? (draft?.type ?? row.type) : row.type}
                        onChange={(ev)=> editing && setDraft(d => d ? { ...d, type: ev.target.value } : d)} readOnly={!editing} />
                      <datalist id="eq-types">{types.map(t=> <option key={t.code} value={t.code} />)}</datalist>
                    </td>
                    <td className="p-3">
                      <input type="text" inputMode="numeric" pattern="[0-9]*"
                        className={`w-24 rounded border p-1 ${!editing ? "bg-gray-50" : ""}`}
                        value={editing ? (draft?.assetNumber ?? String(row.assetNumber)) : String(row.assetNumber)}
                        onChange={(ev)=> editing && setDraft(d => d ? { ...d, assetNumber: ev.target.value } : d)} readOnly={!editing} />
                    </td>
                    <td className="p-3">
                      <select className={`rounded border p-1 ${!editing ? "bg-gray-50" : ""}`}
                        value={editing ? (draft?.status ?? row.status) : row.status}
                        onChange={(ev)=> editing && setDraft(d => d ? { ...d, status: ev.target.value as EquipmentStatus } : d)}
                        disabled={!editing}>
                        {STATUSES.map(s=> <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      {/* Project combobox */}
                      <Combobox as="div"
                        value={editing ? (draft?.currentProjectCode ?? row.currentProjectCode ?? "") : (row.currentProjectCode ?? "")}
                        onChange={(v:string)=> editing && setDraft(d => d ? ({ ...d, currentProjectCode: v ?? "" }) : d)}>
                        <div className="relative">
                          <Combobox.Input
                            className={`w-40 rounded border p-1 ${!editing ? "bg-gray-50" : ""}`}
                            displayValue={(v:string)=>v}
                            onChange={(e)=> editing && setProjQueryEdit(e.target.value)}
                            readOnly={!editing}
                            placeholder="ACTF-2025-001"
                          />
                          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />
                          </Combobox.Button>
                          {editing && filteredProjects.length>0 && (
                            <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-56 overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              {filteredProjects.map((p)=>(
                                <Combobox.Option key={p.id} value={p.code}
                                  className={({active})=>`relative cursor-pointer select-none py-1.5 pl-3 pr-6 ${active?"bg-blue-600 text-white":"text-gray-900"}`}>
                                  {({active, selected})=>(
                                    <>
                                      <span className={`block truncate ${selected?"font-semibold":""}`}>{p.code}</span>
                                      {selected && (
                                        <span className={`absolute inset-y-0 right-0 flex items-center pr-3 ${active?"text-white":"text-blue-600"}`}>
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
                    <td className="p-3">
                      <input className={`w-36 rounded border p-1 ${!editing ? "bg-gray-50" : ""}`}
                        value={editing ? (draft?.model ?? row.model ?? "") : (row.model ?? "")}
                        onChange={(ev)=> editing && setDraft(d => d ? { ...d, model: ev.target.value } : d)} readOnly={!editing} />
                    </td>
                    <td className="p-3">
                      <input className={`w-36 rounded border p-1 ${!editing ? "bg-gray-50" : ""}`}
                        value={editing ? (draft?.serial ?? row.serial ?? "") : (row.serial ?? "")}
                        onChange={(ev)=> editing && setDraft(d => d ? { ...d, serial: ev.target.value } : d)} readOnly={!editing} />
                    </td>
                    <td className="p-3">{row.lastMovedAt ? new Date(row.lastMovedAt as any).toLocaleString() : "—"}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {editing ? (
                          <>
                            <button onClick={saveEdit} className="rounded bg-emerald-600 px-2 py-1 text-white">Update</button>
                            <button onClick={cancelEdit} className="rounded bg-gray-300 px-2 py-1">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={()=>beginEdit(row)} className="rounded bg-blue-600 px-2 py-1 text-white">Edit</button>
                            <button onClick={()=>toggleArchive(row)} className={`rounded px-2 py-1 text-white ${row.archived?"bg-amber-600":"bg-gray-700"}`}>
                              {row.archived ? "Unarchive" : "Archive"}
                            </button>
                            {confirmDeleteId === row.id ? (
                              <>
                                <button onClick={()=>removeRow(row.id)} className="rounded bg-red-600 px-2 py-1 text-white">Confirm Delete</button>
                                <button onClick={()=>{ setConfirmDeleteId(null); toast("Delete cancelled"); }} className="rounded bg-gray-300 px-2 py-1">Cancel</button>
                              </>
                            ) : (
                              <button onClick={()=>{ setConfirmDeleteId(row.id); toast("Click again to confirm delete", { icon: "⚠️" }); }} className="rounded bg-red-600 px-2 py-1 text-white">Delete</button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden">
          {loading ? (
            <div className="rounded bg-white p-4 text-sm shadow">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded bg-white p-4 text-sm shadow">No results</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((row) => {
                const editing = editingId === row.id;
                return (
                  <div key={row.id} className={`rounded bg-white p-4 shadow ${row.archived ? "opacity-70" : ""}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-base font-semibold">{row.type} #{row.assetNumber}</div>
                      {/* show status badge when not editing */}
                      {!editing && (
                        <span className={`rounded px-2 py-0.5 text-xs ${row.status==="DEPLOYED"?"bg-blue-100 text-blue-800":row.status==="WAREHOUSE"?"bg-green-100 text-green-800":row.status==="MAINTENANCE"?"bg-amber-100 text-amber-800":"bg-gray-200 text-gray-800"}`}>
                          {row.status}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Status</div>
                        <select
                          className={`mt-1 w-full rounded border p-2 ${!editing ? "bg-gray-50" : ""}`}
                          value={editing ? (draft?.status ?? row.status) : row.status}
                          onChange={(ev)=> editing && setDraft(d => d ? { ...d, status: ev.target.value as EquipmentStatus } : d)}
                          disabled={!editing}
                        >
                          {STATUSES.map(s=> <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Type</div>
                        <input
                          list="eq-types"
                          className={`mt-1 w-full rounded border p-2 ${!editing ? "bg-gray-50" : ""}`}
                          value={editing ? (draft?.type ?? row.type) : row.type}
                          onChange={(ev)=> editing && setDraft(d => d ? ({ ...d, type: ev.target.value }) : d)}
                          readOnly={!editing}
                        />
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Asset #</div>
                        <input
                          type="text" inputMode="numeric" pattern="[0-9]*"
                          className={`mt-1 w-full rounded border p-2 ${!editing ? "bg-gray-50" : ""}`}
                          value={editing ? (draft?.assetNumber ?? String(row.assetNumber)) : String(row.assetNumber)}
                          onChange={(ev)=> editing && setDraft(d => d ? ({ ...d, assetNumber: ev.target.value }) : d)}
                          readOnly={!editing}
                        />
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Project</div>
                        {/* mobile project combobox */}
                        <Combobox as="div"
                          value={editing ? (draft?.currentProjectCode ?? row.currentProjectCode ?? "") : (row.currentProjectCode ?? "")}
                          onChange={(v:string)=> editing && setDraft(d => d ? ({ ...d, currentProjectCode: v ?? "" }) : d)}>
                          <div className="relative">
                            <Combobox.Input
                              className={`mt-1 w-full rounded border p-2 ${!editing ? "bg-gray-50" : ""}`}
                              displayValue={(v:string)=>v}
                              onChange={(e)=> editing && setProjQueryEdit(e.target.value)}
                              readOnly={!editing}
                              placeholder="ACTF-2025-001"
                            />
                            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                            </Combobox.Button>
                            {editing && filteredProjects.length>0 && (
                              <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {filteredProjects.map((p)=>(
                                  <Combobox.Option key={p.id} value={p.code}
                                    className={({active})=>`relative cursor-pointer select-none py-2 pl-3 pr-9 ${active?"bg-blue-600 text-white":"text-gray-900"}`}>
                                    {({active, selected})=>(
                                      <>
                                        <span className={`block truncate ${selected?"font-semibold":""}`}>{p.code}</span>
                                        {selected && (
                                          <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active?"text-white":"text-blue-600"}`}>
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

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                          <div className="text-xs text-gray-500">Model</div>
                          <input
                            className={`mt-1 w-full rounded border p-2 ${!editing ? "bg-gray-50" : ""}`}
                            value={editing ? (draft?.model ?? row.model ?? "") : (row.model ?? "")}
                            onChange={(ev)=> editing && setDraft(d => d ? ({ ...d, model: ev.target.value }) : d)}
                            readOnly={!editing}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Serial</div>
                          <input
                            className={`mt-1 w-full rounded border p-2 ${!editing ? "bg-gray-50" : ""}`}
                            value={editing ? (draft?.serial ?? row.serial ?? "") : (row.serial ?? "")}
                            onChange={(ev)=> editing && setDraft(d => d ? ({ ...d, serial: ev.target.value }) : d)}
                            readOnly={!editing}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">Last Moved</div>
                      <div>{row.lastMovedAt ? new Date(row.lastMovedAt as any).toLocaleString() : "—"}</div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {editing ? (
                        <>
                          <button onClick={saveEdit} className="rounded bg-emerald-600 px-3 py-2 text-white">Update</button>
                          <button onClick={cancelEdit} className="rounded bg-gray-300 px-3 py-2">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={()=>beginEdit(row)} className="rounded bg-blue-600 px-3 py-2 text-white">Edit</button>
                          <button onClick={()=>toggleArchive(row)} className={`rounded px-3 py-2 text-white ${row.archived?"bg-amber-600":"bg-gray-700"}`}>{row.archived ? "Unarchive" : "Archive"}</button>
                          {confirmDeleteId === row.id ? (
                            <>
                              <button onClick={()=>removeRow(row.id)} className="rounded bg-red-600 px-3 py-2 text-white">Confirm Delete</button>
                              <button onClick={()=>{ setConfirmDeleteId(null); toast("Delete cancelled"); }} className="rounded bg-gray-300 px-3 py-2">Cancel</button>
                            </>
                          ) : (
                            <button onClick={()=>{ setConfirmDeleteId(row.id); toast("Click again to confirm delete", { icon: "⚠️" }); }} className="rounded bg-red-600 px-3 py-2 text-white">Delete</button>
                          )}
                        </>
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
