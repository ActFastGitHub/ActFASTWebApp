"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/app/components/navBar";
import {
  FaEdit,
  FaPlus,
  FaSave,
  FaSearch,
  FaSyncAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

type CatalogItem = {
  id: string;
  category: string;
  defaultSection?: string | null;
  recommendedRooms?: string[];
  tags?: string[];
  itemName: string;
  description?: string | null;
  supplierName?: string | null;
  modelNumber?: string | null;
  colorName?: string | null;
  size?: string | null;
  unit?: string | null;
  defaultCost?: number | null;
  notes?: string | null;
  active: boolean;
  usageCount?: number | null;
  lastUsedAt?: string | null;
  source?: string | null;
};

type CatalogForm = {
  category: string;
  defaultSection: string;
  recommendedRooms: string;
  tags: string;
  itemName: string;
  description: string;
  supplierName: string;
  modelNumber: string;
  colorName: string;
  size: string;
  unit: string;
  defaultCost: string;
  notes: string;
  active: boolean;
  source: string;
};

const emptyForm: CatalogForm = {
  category: "FLOORING",
  defaultSection: "",
  recommendedRooms: "",
  tags: "",
  itemName: "",
  description: "",
  supplierName: "",
  modelNumber: "",
  colorName: "",
  size: "",
  unit: "",
  defaultCost: "",
  notes: "",
  active: true,
  source: "MANUAL",
};

const categoryOptions = [
  "FLOORING",
  "TILE",
  "CABINET",
  "BASEBOARD",
  "DOOR_CASING",
  "STAIR_NOSING",
  "STAIR_RAILING",
  "PAINT",
  "PLUMBING",
  "ELECTRICAL",
  "EXTERIOR",
  "OTHER",
];

const sectionOptions = [
  "Flooring",
  "Baseboard",
  "Door Casing",
  "Stair Nosing",
  "Stair Railing",
  "Drywall Patching",
  "Painting",
  "Kitchen",
  "Bathroom",
  "Exterior",
  "Other",
];

function money(value?: number | null) {
  return Number(value || 0).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
  });
}

function formatDate(value?: string | null) {
  if (!value) return "Never used";
  return new Date(value).toLocaleString();
}

export default function MaterialCatalogPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [form, setForm] = useState<CatalogForm>(emptyForm);
  const [editingId, setEditingId] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredItems = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return items
      .filter((item) => (showInactive ? true : item.active))
      .filter((item) =>
        categoryFilter ? item.category === categoryFilter : true,
      )
      .filter((item) =>
        sectionFilter ? item.defaultSection === sectionFilter : true,
      )
      .filter((item) => {
        if (!searchText) return true;

        return [
          item.category,
          item.defaultSection,
          item.itemName,
          item.description,
          item.supplierName,
          item.modelNumber,
          item.colorName,
          item.size,
          item.unit,
          item.notes,
          item.source,
          ...(item.recommendedRooms || []),
          ...(item.tags || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchText);
      })
      .sort((a, b) => {
        const usageDiff = Number(b.usageCount || 0) - Number(a.usageCount || 0);
        if (usageDiff !== 0) return usageDiff;
        return a.itemName.localeCompare(b.itemName);
      });
  }, [items, search, categoryFilter, sectionFilter, showInactive]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") fetchCatalogItems();
  }, [status]);

  async function readJson(res: Response) {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(text || "Invalid server response");
    }
  }

  async function fetchCatalogItems() {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("includeInactive", "1");

      const res = await fetch(
        `/api/final-repairs-agreements/catalog?${params.toString()}`,
      );

      const data = await readJson(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to load catalog",
        );
      }

      setItems(data.catalogItems || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  }

  function updateForm(field: keyof CatalogForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
  }

  function startEdit(item: CatalogItem) {
    setEditingId(item.id);

    setForm({
      category: item.category || "OTHER",
      defaultSection: item.defaultSection || "",
      recommendedRooms: item.recommendedRooms?.join(", ") || "",
      tags: item.tags?.join(", ") || "",
      itemName: item.itemName || "",
      description: item.description || "",
      supplierName: item.supplierName || "",
      modelNumber: item.modelNumber || "",
      colorName: item.colorName || "",
      size: item.size || "",
      unit: item.unit || "",
      defaultCost:
        item.defaultCost === null || item.defaultCost === undefined
          ? ""
          : String(item.defaultCost),
      notes: item.notes || "",
      active: item.active,
      source: item.source || "MANUAL",
    });
  }

  async function saveCatalogItem() {
    if (!form.category.trim()) {
      toast.error("Category is required");
      return;
    }

    if (!form.itemName.trim()) {
      toast.error("Item name is required");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/final-repairs-agreements/catalog", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { catalogItemId: editingId } : {}),
          category: form.category,
          defaultSection: form.defaultSection,
          recommendedRooms: form.recommendedRooms,
          tags: form.tags,
          itemName: form.itemName,
          description: form.description,
          supplierName: form.supplierName,
          modelNumber: form.modelNumber,
          colorName: form.colorName,
          size: form.size,
          unit: form.unit,
          defaultCost: form.defaultCost,
          notes: form.notes,
          active: form.active,
          source: form.source,
        }),
      });

      const data = await readJson(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to save catalog item",
        );
      }

      toast.success(
        editingId ? "Catalog item updated" : "Catalog item created",
      );
      resetForm();
      fetchCatalogItems();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save catalog item");
    } finally {
      setSaving(false);
    }
  }

  async function disableCatalogItem(item: CatalogItem) {
    const confirmed = window.confirm(
      `Disable this catalog item?\n\n${item.itemName}`,
    );

    if (!confirmed) return;

    try {
      const res = await fetch("/api/final-repairs-agreements/catalog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalogItemId: item.id }),
      });

      const data = await readJson(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to disable item",
        );
      }

      toast.success("Catalog item disabled");
      fetchCatalogItems();
    } catch (error: any) {
      toast.error(error?.message || "Failed to disable item");
    }
  }

  if (status === "loading") {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-100 pt-16 text-slate-900">
      <Navbar />

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-black">Material Catalog</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage reusable company-standard materials for Final Repairs
            Agreements.
          </p>

          <div className="mt-5 grid gap-3">
            <label className="text-xs font-bold uppercase text-slate-500">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => updateForm("category", e.target.value)}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            >
              {categoryOptions.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>

            <label className="text-xs font-bold uppercase text-slate-500">
              Default Section
            </label>
            <select
              value={form.defaultSection}
              onChange={(e) => updateForm("defaultSection", e.target.value)}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            >
              <option value="">Not set</option>
              {sectionOptions.map((section) => (
                <option key={section}>{section}</option>
              ))}
            </select>

            <label className="text-xs font-bold uppercase text-slate-500">
              Recommended Rooms / Areas
            </label>
            <input
              value={form.recommendedRooms}
              onChange={(e) => updateForm("recommendedRooms", e.target.value)}
              placeholder="Living Room, Kitchen, Bathroom 1"
              className="rounded-xl border border-slate-300 p-3 text-sm"
            />

            <label className="text-xs font-bold uppercase text-slate-500">
              Tags
            </label>
            <input
              value={form.tags}
              onChange={(e) => updateForm("tags", e.target.value)}
              placeholder="waterproof, laminate, exterior, tile"
              className="rounded-xl border border-slate-300 p-3 text-sm"
            />

            <label className="text-xs font-bold uppercase text-slate-500">
              Item Name
            </label>
            <input
              value={form.itemName}
              onChange={(e) => updateForm("itemName", e.target.value)}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            />

            <label className="text-xs font-bold uppercase text-slate-500">
              Supplier
            </label>
            <input
              value={form.supplierName}
              onChange={(e) => updateForm("supplierName", e.target.value)}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">
                  Model
                </label>
                <input
                  value={form.modelNumber}
                  onChange={(e) => updateForm("modelNumber", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">
                  Color
                </label>
                <input
                  value={form.colorName}
                  onChange={(e) => updateForm("colorName", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">
                  Size
                </label>
                <input
                  value={form.size}
                  onChange={(e) => updateForm("size", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500">
                  Unit
                </label>
                <input
                  value={form.unit}
                  onChange={(e) => updateForm("unit", e.target.value)}
                  placeholder="sq ft, each, box..."
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                />
              </div>
            </div>

            <label className="text-xs font-bold uppercase text-slate-500">
              Default Cost
            </label>
            <input
              type="number"
              value={form.defaultCost}
              onChange={(e) => updateForm("defaultCost", e.target.value)}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            />

            <label className="text-xs font-bold uppercase text-slate-500">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              rows={3}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            />

            <label className="text-xs font-bold uppercase text-slate-500">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
              rows={3}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            />

            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => updateForm("active", e.target.checked)}
              />
              Active catalog item
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveCatalogItem}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-slate-400"
              >
                {editingId ? <FaSave /> : <FaPlus />}
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Item"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl bg-slate-200 px-4 py-3 font-bold text-slate-700"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">Catalog Items</h2>
              <p className="text-sm text-slate-600">
                {filteredItems.length} item(s) shown
              </p>
            </div>

            <button
              type="button"
              onClick={fetchCatalogItems}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:bg-slate-400"
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <FaSearch className="absolute left-3 top-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search item, supplier, model..."
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-sm"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>

            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="rounded-xl border border-slate-300 p-3 text-sm"
            >
              <option value="">All sections</option>
              {sectionOptions.map((section) => (
                <option key={section}>{section}</option>
              ))}
            </select>
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show inactive items
          </label>

          <div className="mt-5 space-y-3">
            {filteredItems.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">
                No catalog items found.
              </p>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase text-blue-700">
                        {item.category}
                      </p>
                      <h3 className="text-lg font-black">{item.itemName}</h3>
                      <p className="text-sm text-slate-600">
                        {[
                          item.supplierName,
                          item.modelNumber,
                          item.colorName,
                          item.size,
                        ]
                          .filter(Boolean)
                          .join(" • ") || "No supplier/model details"}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Section: {item.defaultSection || "Not set"}
                      </p>

                      {item.recommendedRooms?.length ? (
                        <p className="text-xs text-slate-500">
                          Rooms: {item.recommendedRooms.join(", ")}
                        </p>
                      ) : null}

                      {item.tags?.length ? (
                        <p className="text-xs text-slate-500">
                          Tags: {item.tags.join(", ")}
                        </p>
                      ) : null}

                      <p className="mt-2 text-xs text-slate-500">
                        Used {item.usageCount || 0} time(s) • Last used:{" "}
                        {formatDate(item.lastUsedAt)}
                      </p>

                      {!item.active && (
                        <p className="mt-2 text-xs font-bold text-red-600">
                          Inactive
                        </p>
                      )}
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-lg font-black">
                        {money(item.defaultCost)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.unit || "No unit"}
                      </p>
                    </div>
                  </div>

                  {item.description && (
                    <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-600">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="flex items-center gap-2 rounded-xl bg-blue-100 px-3 py-2 text-sm font-bold text-blue-700"
                    >
                      <FaEdit /> Edit
                    </button>

                    {item.active && (
                      <button
                        type="button"
                        onClick={() => disableCatalogItem(item)}
                        className="flex items-center gap-2 rounded-xl bg-red-100 px-3 py-2 text-sm font-bold text-red-700"
                      >
                        <FaTrash /> Disable
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
