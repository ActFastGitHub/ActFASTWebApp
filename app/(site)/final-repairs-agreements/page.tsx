"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/app/components/navBar";
import {
  FaEdit,
  FaFileSignature,
  FaPlus,
  FaSave,
  FaSyncAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

type DropboxFolder = {
  name: string;
  path: string;
};

type CatalogItem = {
  id: string;
  category: string;
  itemName: string;
  description?: string | null;
  supplierName?: string | null;
  modelNumber?: string | null;
  colorName?: string | null;
  size?: string | null;
  unit?: string | null;
  defaultCost?: number | null;
  notes?: string | null;
};

type Selection = {
  id: string;
  category: string;
  itemName: string;
  description?: string | null;
  supplierName?: string | null;
  modelNumber?: string | null;
  colorName?: string | null;
  size?: string | null;
  unit?: string | null;
  quantity?: number | null;
  unitCost?: number | null;
  totalCost: number;
  allowanceAmount?: number | null;
  notes?: string | null;
  sortOrder: number;
};

type Agreement = {
  id: string;
  projectCode: string;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  status: string;
  generalNotes?: string | null;
  createdAt: string;
  selections: Selection[];
};

type SelectionForm = {
  category: string;
  itemName: string;
  description: string;
  supplierName: string;
  modelNumber: string;
  colorName: string;
  size: string;
  unit: string;
  quantity: string;
  unitCost: string;
  allowanceAmount: string;
  notes: string;
  sortOrder: string;
};

const PROJECT_FOLDER_REGEX = /^\d{4}-\d{3,4}-\d{2}-[A-Za-z0-9-]+$/;

const emptySelectionForm: SelectionForm = {
  category: "FLOORING",
  itemName: "",
  description: "",
  supplierName: "",
  modelNumber: "",
  colorName: "",
  size: "",
  unit: "",
  quantity: "",
  unitCost: "",
  allowanceAmount: "",
  notes: "",
  sortOrder: "0",
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
  "OTHER",
];

function money(value?: number | null) {
  return Number(value || 0).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
  });
}

function toFormValue(value?: string | number | null) {
  return value === null || value === undefined ? "" : String(value);
}

export default function FinalRepairsAgreementsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [projectFolders, setProjectFolders] = useState<DropboxFolder[]>([]);
  const [selectedProjectCode, setSelectedProjectCode] = useState("");
  const [projectSearch, setProjectSearch] = useState("");

  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [selectedAgreementId, setSelectedAgreementId] = useState("");

  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState("");

  const [loading, setLoading] = useState(false);
  const [savingAgreement, setSavingAgreement] = useState(false);
  const [savingSelection, setSavingSelection] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");

  const [selectionForm, setSelectionForm] =
    useState<SelectionForm>(emptySelectionForm);
  const [editingSelectionId, setEditingSelectionId] = useState("");

  const selectedAgreement = agreements.find(
    (agreement) => agreement.id === selectedAgreementId,
  );

  const visibleProjects = useMemo(() => {
    const search = projectSearch.toLowerCase().trim();

    return projectFolders
      .filter((folder) => PROJECT_FOLDER_REGEX.test(folder.name))
      .filter((folder) => folder.name.toLowerCase().includes(search))
      .sort((a, b) =>
        b.name.localeCompare(a.name, undefined, { numeric: true }),
      );
  }, [projectFolders, projectSearch]);

  const filteredCatalogItems = useMemo(() => {
    const search = catalogSearch.trim().toLowerCase();

    if (!search) return catalogItems.slice(0, 25);

    return catalogItems
      .filter((item) =>
        [
          item.category,
          item.itemName,
          item.description,
          item.supplierName,
          item.modelNumber,
          item.colorName,
          item.size,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search),
      )
      .slice(0, 25);
  }, [catalogItems, catalogSearch]);

  const selectedAgreementTotal = useMemo(() => {
    return (
      selectedAgreement?.selections?.reduce(
        (sum, item) => sum + Number(item.totalCost || 0),
        0,
      ) || 0
    );
  }, [selectedAgreement]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProjects();
      fetchAgreements();
      fetchCatalogItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function readJson(res: Response) {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(text || "Invalid server response");
    }
  }

  async function fetchProjects() {
    try {
      const res = await fetch("/api/dropbox/list-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await readJson(res);

      if (!res.ok)
        throw new Error(
          data.detail || data.message || "Failed to load projects",
        );

      setProjectFolders(data.folders || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load projects");
    }
  }

  async function fetchCatalogItems() {
    try {
      const res = await fetch("/api/final-repairs-agreements/catalog");
      const data = await readJson(res);

      if (!res.ok)
        throw new Error(
          data.detail || data.message || "Failed to load catalog",
        );

      setCatalogItems(data.catalogItems || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load material catalog");
    }
  }

  async function fetchAgreements(projectCode?: string) {
    try {
      setLoading(true);

      const query = projectCode
        ? `?projectCode=${encodeURIComponent(projectCode)}`
        : "";

      const res = await fetch(`/api/final-repairs-agreements${query}`);
      const data = await readJson(res);

      if (!res.ok)
        throw new Error(
          data.detail || data.message || "Failed to load agreements",
        );

      setAgreements(data.agreements || []);

      if (selectedAgreementId) {
        const stillExists = data.agreements?.some(
          (agreement: Agreement) => agreement.id === selectedAgreementId,
        );

        if (!stillExists) setSelectedAgreementId("");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load agreements");
    } finally {
      setLoading(false);
    }
  }

  function applyCatalogItem(item: CatalogItem) {
    setSelectedCatalogItemId(item.id);

    setSelectionForm((prev) => ({
      ...prev,
      category: item.category || prev.category,
      itemName: item.itemName || "",
      description: item.description || "",
      supplierName: item.supplierName || "",
      modelNumber: item.modelNumber || "",
      colorName: item.colorName || "",
      size: item.size || "",
      unit: item.unit || "",
      unitCost: item.defaultCost ? String(item.defaultCost) : "",
      notes: item.notes || prev.notes,
    }));

    setCatalogSearch(item.itemName);
    toast.success("Catalog item applied");
  }

  async function createAgreement() {
    if (!selectedProjectCode) {
      toast.error("Please select a project first");
      return;
    }

    try {
      setSavingAgreement(true);

      const res = await fetch("/api/final-repairs-agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectCode: selectedProjectCode,
          customerName,
          customerEmail,
          customerPhone,
          generalNotes,
          status: "DRAFT",
        }),
      });

      const data = await readJson(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to create agreement",
        );
      }

      toast.success("Agreement created");

      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setGeneralNotes("");

      await fetchAgreements(selectedProjectCode);
      setSelectedAgreementId(data.agreement?.id || "");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create agreement");
    } finally {
      setSavingAgreement(false);
    }
  }

  async function deleteAgreement(agreementId: string) {
    const confirmed = window.confirm(
      "Delete this agreement? This is a soft delete.",
    );

    if (!confirmed) return;

    try {
      const res = await fetch("/api/final-repairs-agreements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agreementId }),
      });

      const data = await readJson(res);

      if (!res.ok)
        throw new Error(
          data.detail || data.message || "Failed to delete agreement",
        );

      toast.success("Agreement deleted");
      setSelectedAgreementId("");
      await fetchAgreements(selectedProjectCode);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete agreement");
    }
  }

  function updateSelectionField(field: keyof SelectionForm, value: string) {
    setSelectionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetSelectionForm() {
    setSelectionForm(emptySelectionForm);
    setEditingSelectionId("");
    setCatalogSearch("");
    setSelectedCatalogItemId("");
  }

  function startEditSelection(selection: Selection) {
    setSelectedCatalogItemId((selection as any).catalogItemId || "");
    setEditingSelectionId(selection.id);
    setCatalogSearch("");
    setSelectionForm({
      category: toFormValue(selection.category),
      itemName: toFormValue(selection.itemName),
      description: toFormValue(selection.description),
      supplierName: toFormValue(selection.supplierName),
      modelNumber: toFormValue(selection.modelNumber),
      colorName: toFormValue(selection.colorName),
      size: toFormValue(selection.size),
      unit: toFormValue(selection.unit),
      quantity: toFormValue(selection.quantity),
      unitCost: toFormValue(selection.unitCost),
      allowanceAmount: toFormValue(selection.allowanceAmount),
      notes: toFormValue(selection.notes),
      sortOrder: toFormValue(selection.sortOrder),
    });
  }

  async function saveSelection() {
    if (!selectedAgreementId) {
      toast.error("Please select an agreement first");
      return;
    }

    if (!selectionForm.category.trim()) {
      toast.error("Category is required");
      return;
    }

    if (!selectionForm.itemName.trim()) {
      toast.error("Item name is required");
      return;
    }

    try {
      setSavingSelection(true);

      const endpoint = "/api/final-repairs-agreements/selections";
      const method = editingSelectionId ? "PATCH" : "POST";

      const payload = {
        ...(editingSelectionId
          ? { selectionId: editingSelectionId }
          : { agreementId: selectedAgreementId }),

        catalogItemId: selectedCatalogItemId,

        category: selectionForm.category,
        itemName: selectionForm.itemName,
        description: selectionForm.description,
        supplierName: selectionForm.supplierName,
        modelNumber: selectionForm.modelNumber,
        colorName: selectionForm.colorName,
        size: selectionForm.size,
        unit: selectionForm.unit,
        quantity: selectionForm.quantity,
        unitCost: selectionForm.unitCost,
        allowanceAmount: selectionForm.allowanceAmount,
        notes: selectionForm.notes,
        sortOrder: selectionForm.sortOrder,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await readJson(res);

      if (!res.ok)
        throw new Error(
          data.detail || data.message || "Failed to save selection",
        );

      toast.success(
        editingSelectionId ? "Selection updated" : "Selection added",
      );
      resetSelectionForm();
      await fetchAgreements(selectedProjectCode);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save selection");
    } finally {
      setSavingSelection(false);
    }
  }

  async function deleteSelection(selectionId: string) {
    const confirmed = window.confirm("Delete this material selection?");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/final-repairs-agreements/selections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectionId }),
      });

      const data = await readJson(res);

      if (!res.ok)
        throw new Error(
          data.detail || data.message || "Failed to delete selection",
        );

      toast.success("Selection deleted");
      await fetchAgreements(selectedProjectCode);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete selection");
    }
  }

  if (status === "loading") {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-100 pt-16 text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-blue-600">
            <FaFileSignature /> Final Repairs
          </p>
          <h1 className="mt-2 text-3xl font-black">Final Repairs Agreements</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create customer agreement records and track selected materials.
          </p>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-black">Create Agreement</h2>

              <label className="mt-4 block text-xs font-bold uppercase text-slate-500">
                Search Project
              </label>
              <input
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Type project code..."
                className="mt-1 w-full rounded-2xl border border-slate-300 p-3 text-sm"
              />

              <div className="mt-3 max-h-64 overflow-auto rounded-2xl border border-slate-200">
                {visibleProjects.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500">
                    No matching project folders.
                  </div>
                ) : (
                  visibleProjects.map((folder) => (
                    <button
                      key={folder.path}
                      type="button"
                      onClick={() => {
                        setSelectedProjectCode(folder.name);
                        setProjectSearch(folder.name);
                        fetchAgreements(folder.name);
                      }}
                      className={
                        "block w-full border-b px-3 py-3 text-left text-sm hover:bg-blue-50 " +
                        (selectedProjectCode === folder.name
                          ? "bg-blue-100 font-bold text-blue-900"
                          : "")
                      }
                    >
                      {folder.name}
                    </button>
                  ))
                )}
              </div>

              <label className="mt-4 block text-xs font-bold uppercase text-slate-500">
                Customer Name
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-300 p-3 text-sm"
                placeholder="Optional"
              />

              <label className="mt-4 block text-xs font-bold uppercase text-slate-500">
                Customer Email
              </label>
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-300 p-3 text-sm"
                placeholder="Optional"
              />

              <label className="mt-4 block text-xs font-bold uppercase text-slate-500">
                Customer Phone
              </label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-300 p-3 text-sm"
                placeholder="Optional"
              />

              <label className="mt-4 block text-xs font-bold uppercase text-slate-500">
                Notes
              </label>
              <textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-2xl border border-slate-300 p-3 text-sm"
                placeholder="Optional agreement notes..."
              />

              <button
                type="button"
                onClick={createAgreement}
                disabled={savingAgreement}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-slate-400"
              >
                <FaPlus />{" "}
                {savingAgreement ? "Creating..." : "Create Agreement"}
              </button>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">Agreements</h2>
                <button
                  type="button"
                  onClick={() => fetchAgreements(selectedProjectCode)}
                  disabled={loading}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
                >
                  <FaSyncAlt className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {agreements.length === 0 ? (
                  <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">
                    No agreements found.
                  </p>
                ) : (
                  agreements.map((agreement) => (
                    <button
                      key={agreement.id}
                      type="button"
                      onClick={() => {
                        setSelectedAgreementId(agreement.id);
                        resetSelectionForm();
                      }}
                      className={
                        "block w-full rounded-2xl p-4 text-left ring-1 transition " +
                        (selectedAgreementId === agreement.id
                          ? "bg-blue-50 ring-blue-400"
                          : "bg-slate-50 ring-slate-200 hover:bg-slate-100")
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{agreement.projectCode}</p>
                          <p className="text-sm text-slate-600">
                            Customer: {agreement.customerName || "Not entered"}
                          </p>
                          <p className="text-xs text-slate-500">
                            Created:{" "}
                            {new Date(agreement.createdAt).toLocaleString()}
                          </p>
                          <p className="mt-2 text-xs font-bold uppercase text-blue-700">
                            {agreement.status}
                          </p>
                        </div>

                        <span
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            deleteAgreement(agreement.id);
                          }}
                          className="rounded-xl bg-red-100 p-3 text-red-700 hover:bg-red-200"
                        >
                          <FaTrash />
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-slate-600">
                        Material selections: {agreement.selections?.length || 0}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-black">Material Selections</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedAgreement
                    ? `Selected agreement: ${selectedAgreement.projectCode}`
                    : "Select an agreement first."}
                </p>
              </div>

              {selectedAgreement && (
                <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white">
                  <p className="text-xs uppercase text-slate-300">Total</p>
                  <p className="text-lg font-black">
                    {money(selectedAgreementTotal)}
                  </p>
                </div>
              )}
            </div>

            {!selectedAgreement ? (
              <p className="mt-5 rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">
                Select or create an agreement to manage materials.
              </p>
            ) : (
              <>
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <h3 className="font-black">
                    {editingSelectionId
                      ? "Edit Material Selection"
                      : "Add Material Selection"}
                  </h3>

                  <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                    <h4 className="font-black">Pick From Material Catalog</h4>
                    <p className="mt-1 text-xs text-slate-500">
                      Search saved materials and auto-fill the form.
                    </p>

                    <input
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Search flooring, tile, cabinet, supplier, model..."
                      className="mt-3 w-full rounded-xl border border-slate-300 p-3 text-sm"
                    />

                    <div className="mt-3 max-h-56 overflow-auto rounded-xl border border-slate-200">
                      {filteredCatalogItems.length === 0 ? (
                        <div className="p-3 text-sm text-slate-500">
                          No catalog items found.
                        </div>
                      ) : (
                        filteredCatalogItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => applyCatalogItem(item)}
                            className="block w-full border-b px-3 py-3 text-left text-sm hover:bg-blue-50"
                          >
                            <p className="font-bold">{item.itemName}</p>
                            <p className="text-xs text-slate-500">
                              {[
                                item.category,
                                item.supplierName,
                                item.modelNumber,
                                item.colorName,
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        Category
                      </label>
                      <select
                        value={selectionForm.category}
                        onChange={(e) =>
                          updateSelectionField("category", e.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                      >
                        {categoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        Item Name
                      </label>
                      <input
                        value={selectionForm.itemName}
                        onChange={(e) =>
                          updateSelectionField("itemName", e.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        Supplier
                      </label>
                      <input
                        value={selectionForm.supplierName}
                        onChange={(e) =>
                          updateSelectionField("supplierName", e.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        Model Number
                      </label>
                      <input
                        value={selectionForm.modelNumber}
                        onChange={(e) =>
                          updateSelectionField("modelNumber", e.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        Color
                      </label>
                      <input
                        value={selectionForm.colorName}
                        onChange={(e) =>
                          updateSelectionField("colorName", e.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        Size
                      </label>
                      <input
                        value={selectionForm.size}
                        onChange={(e) =>
                          updateSelectionField("size", e.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        Unit
                      </label>
                      <input
                        value={selectionForm.unit}
                        onChange={(e) =>
                          updateSelectionField("unit", e.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                        placeholder="sq ft, each, box, linear ft..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={selectionForm.quantity}
                        onChange={(e) =>
                          updateSelectionField("quantity", e.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        Unit Cost
                      </label>
                      <input
                        type="number"
                        value={selectionForm.unitCost}
                        onChange={(e) =>
                          updateSelectionField("unitCost", e.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500">
                        Allowance Amount
                      </label>
                      <input
                        type="number"
                        value={selectionForm.allowanceAmount}
                        onChange={(e) =>
                          updateSelectionField(
                            "allowanceAmount",
                            e.target.value,
                          )
                        }
                        className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-bold uppercase text-slate-500">
                      Description
                    </label>
                    <textarea
                      value={selectionForm.description}
                      onChange={(e) =>
                        updateSelectionField("description", e.target.value)
                      }
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-bold uppercase text-slate-500">
                      Notes
                    </label>
                    <textarea
                      value={selectionForm.notes}
                      onChange={(e) =>
                        updateSelectionField("notes", e.target.value)
                      }
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm"
                    />
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={saveSelection}
                      disabled={savingSelection}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 disabled:bg-slate-400"
                    >
                      <FaSave />{" "}
                      {savingSelection
                        ? "Saving..."
                        : editingSelectionId
                          ? "Save Changes"
                          : "Add Selection"}
                    </button>

                    {editingSelectionId && (
                      <button
                        type="button"
                        onClick={resetSelectionForm}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-slate-200 px-4 py-3 font-bold text-slate-700 hover:bg-slate-300"
                      >
                        <FaTimes /> Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {selectedAgreement.selections.length === 0 ? (
                    <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-slate-500">
                      No materials selected yet.
                    </p>
                  ) : (
                    selectedAgreement.selections.map((selection) => (
                      <div
                        key={selection.id}
                        className="rounded-2xl bg-white p-4 ring-1 ring-slate-200"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-black uppercase text-blue-700">
                              {selection.category}
                            </p>
                            <h3 className="text-lg font-black">
                              {selection.itemName}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {[
                                selection.supplierName,
                                selection.modelNumber,
                                selection.colorName,
                                selection.size,
                              ]
                                .filter(Boolean)
                                .join(" • ") || "No supplier/model details"}
                            </p>
                            {selection.description && (
                              <p className="mt-2 text-sm text-slate-600">
                                {selection.description}
                              </p>
                            )}
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-lg font-black">
                              {money(selection.totalCost)}
                            </p>
                            <p className="text-xs text-slate-500">
                              Qty: {selection.quantity ?? "N/A"}{" "}
                              {selection.unit || ""}
                            </p>
                            <p className="text-xs text-slate-500">
                              Unit Cost: {money(selection.unitCost)}
                            </p>
                          </div>
                        </div>

                        {selection.notes && (
                          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                            {selection.notes}
                          </p>
                        )}

                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditSelection(selection)}
                            className="flex items-center gap-2 rounded-xl bg-blue-100 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-200"
                          >
                            <FaEdit /> Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteSelection(selection.id)}
                            className="flex items-center gap-2 rounded-xl bg-red-100 px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-200"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
