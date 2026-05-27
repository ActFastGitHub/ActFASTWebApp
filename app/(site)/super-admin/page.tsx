"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/app/components/navBar";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDatabase,
  FaDownload,
  FaExclamationTriangle,
  FaFilter,
  FaHistory,
  FaSearch,
  FaShieldAlt,
  FaSyncAlt,
  FaTimes,
  FaUpload,
} from "react-icons/fa";

type AuditLog = {
  id: string;
  actorEmail: string | null;
  actorNickname: string | null;
  actorRole: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  projectCode: string | null;
  summary: string | null;
  changes: any;
  createdAt: string;
};

type BackupLog = {
  id: string;
  requestedByEmail: string | null;
  requestedByNickname: string | null;
  backupType: string;
  status: string;
  fileName: string | null;
  fileSize: number | null;
  recordCount: number | null;
  notes: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

type AuditFilters = {
  search: string;
  action: string;
  entity: string;
  entityId: string;
  projectCode: string;
  actorEmail: string;
  from: string;
  to: string;
};

type RestoreMode = "INSERT_MISSING" | "UPSERT" | "REPLACE_SELECTED";

type RestorePreviewItem = {
  collectionKey: string;
  label?: string;
  supported: boolean;
  incoming: number;
  existing: number;
  missing: number;
  errors: string[];
};

type RestorePreview = {
  status: number;
  valid: boolean;
  dryRun: boolean;
  mode: RestoreMode;
  backupVersion: string | null;
  schemaVersion: string | null;
  exportedAt: string | null;
  exportedBy: {
    email?: string | null;
    nickname?: string | null;
    role?: string | null;
  } | null;
  warnings: string[];
  availableCollections: string[];
  selectedCollections: string[];
  preview: RestorePreviewItem[];
};

const emptyAuditFilters: AuditFilters = {
  search: "",
  action: "",
  entity: "",
  entityId: "",
  projectCode: "",
  actorEmail: "",
  from: "",
  to: "",
};

const actionOptions = [
  "",
  "CREATE",
  "UPDATE",
  "DELETE",
  "RESTORE",
  "EXPORT",
  "BACKUP",
];

const pageSizeOptions = [10, 25, 50, 100];

const restoreModeOptions: {
  value: RestoreMode;
  label: string;
  help: string;
}[] = [
  {
    value: "INSERT_MISSING",
    label: "Insert missing only",
    help: "Safest option. Existing records are skipped.",
  },
  {
    value: "UPSERT",
    label: "Upsert / update existing",
    help: "Creates missing records and updates existing matching IDs.",
  },
  {
    value: "REPLACE_SELECTED",
    label: "Replace selected collections",
    help: "Dangerous. Deletes selected collections first, then imports.",
  },
];

function formatDate(value?: string | null) {
  if (!value) return "N/A";

  return new Date(value).toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatFileSize(bytes?: number | null) {
  if (!bytes) return "N/A";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getActiveFilterCount(filters: AuditFilters) {
  return Object.values(filters).filter((value) => value.trim()).length;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const restoreFileInputRef = useRef<HTMLInputElement | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [lastSuccessfulBackup, setLastSuccessfulBackup] =
    useState<BackupLog | null>(null);

  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  const [auditFilters, setAuditFilters] =
    useState<AuditFilters>(emptyAuditFilters);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(25);

  const [restoreFileName, setRestoreFileName] = useState("");
  const [restoreBackupData, setRestoreBackupData] = useState<any>(null);
  const [restorePreview, setRestorePreview] = useState<RestorePreview | null>(
    null,
  );
  const [selectedRestoreCollections, setSelectedRestoreCollections] = useState<
    string[]
  >([]);
  const [restoreMode, setRestoreMode] = useState<RestoreMode>("INSERT_MISSING");
  const [restoreConfirmText, setRestoreConfirmText] = useState("");
  const [loadingRestorePreview, setLoadingRestorePreview] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);

  const activeFilterCount = useMemo(
    () => getActiveFilterCount(auditFilters),
    [auditFilters],
  );

  const totalPages = Math.max(Math.ceil(auditTotal / auditPageSize), 1);
  const firstRecordNumber =
    auditTotal === 0 ? 0 : (auditPage - 1) * auditPageSize + 1;
  const lastRecordNumber = Math.min(auditPage * auditPageSize, auditTotal);

  const selectedRestoreSummary = useMemo(() => {
    if (!restorePreview) return { records: 0, collections: 0 };

    const selected = new Set(selectedRestoreCollections);

    const records = restorePreview.preview
      .filter((item) => selected.has(item.collectionKey))
      .reduce((sum, item) => sum + item.incoming, 0);

    return {
      records,
      collections: selectedRestoreCollections.length,
    };
  }, [restorePreview, selectedRestoreCollections]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAuditLogs(1);
      fetchBackupLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAuditLogs(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditPageSize]);

  const readApiResponse = async (res: Response) => {
    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(text || "Invalid server response");
    }
  };

  const updateAuditFilter = (key: keyof AuditFilters, value: string) => {
    setAuditFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const buildAuditQuery = (page = auditPage) => {
    const params = new URLSearchParams();

    params.set("take", String(auditPageSize));
    params.set("skip", String((page - 1) * auditPageSize));

    Object.entries(auditFilters).forEach(([key, value]) => {
      if (value.trim()) {
        params.set(key, value.trim());
      }
    });

    return params.toString();
  };

  const fetchAuditLogs = async (page = auditPage) => {
    try {
      setLoadingAuditLogs(true);

      const query = buildAuditQuery(page);
      const res = await fetch(`/api/super-admin/audit-logs?${query}`);
      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to load audit logs");
      }

      setAuditLogs(data.logs || []);
      setAuditTotal(data.total || 0);
      setAuditPage(data.page || page);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load audit logs");
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  const fetchBackupLogs = async () => {
    try {
      setLoadingBackups(true);

      const res = await fetch("/api/super-admin/backups");
      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to load backup history");
      }

      setBackupLogs(data.backupLogs || []);
      setLastSuccessfulBackup(data.lastSuccessfulBackup || null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load backup history");
    } finally {
      setLoadingBackups(false);
    }
  };

  const applyAuditFilters = () => {
    fetchAuditLogs(1);
    setShowMobileFilters(false);
  };

  const resetAuditFilters = () => {
    setAuditFilters(emptyAuditFilters);
    setAuditPage(1);

    setTimeout(() => {
      fetchAuditLogs(1);
    }, 0);
  };

  const goToAuditPage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    fetchAuditLogs(safePage);
  };

  const downloadAuditCsv = () => {
    const params = new URLSearchParams();

    Object.entries(auditFilters).forEach(([key, value]) => {
      if (value.trim()) {
        params.set(key, value.trim());
      }
    });

    window.location.href = `/api/super-admin/audit-logs/export?${params.toString()}`;
  };

  const downloadJsonBackup = () => {
    setCreatingBackup(true);
    window.location.href = "/api/super-admin/backups/export";

    setTimeout(() => {
      fetchBackupLogs();
      setCreatingBackup(false);
    }, 2000);
  };

  const handleRestoreFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setRestoreFileName(file.name);
      setRestorePreview(null);
      setSelectedRestoreCollections([]);
      setRestoreBackupData(null);

      const text = await file.text();
      const parsed = JSON.parse(text);

      setRestoreBackupData(parsed);
      toast.success("Backup file loaded. Run dry-run validation next.");
    } catch (error: any) {
      toast.error(error?.message || "Invalid JSON backup file");
      setRestoreFileName("");
      setRestorePreview(null);
      setSelectedRestoreCollections([]);
      setRestoreBackupData(null);
    }
  };

  const runRestoreDryRun = async () => {
    if (!restoreBackupData) {
      toast.error("Please choose a JSON backup file first.");
      return;
    }

    try {
      setLoadingRestorePreview(true);

      const res = await fetch("/api/super-admin/backups/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          backupData: restoreBackupData,
          dryRun: true,
          mode: restoreMode,
          selectedCollections:
            selectedRestoreCollections.length > 0
              ? selectedRestoreCollections
              : undefined,
        }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Restore preview failed");
      }

      setRestorePreview(data);

      const supportedCollections = (data.preview || [])
        .filter((item: RestorePreviewItem) => item.supported)
        .map((item: RestorePreviewItem) => item.collectionKey);

      setSelectedRestoreCollections((current) =>
        current.length > 0 ? current : supportedCollections,
      );

      toast.success("Dry-run validation complete.");
    } catch (error: any) {
      toast.error(error?.message || "Restore preview failed");
    } finally {
      setLoadingRestorePreview(false);
    }
  };

  const toggleRestoreCollection = (collectionKey: string) => {
    setSelectedRestoreCollections((current) => {
      if (current.includes(collectionKey)) {
        return current.filter((item) => item !== collectionKey);
      }

      return [...current, collectionKey];
    });
  };

  const selectAllRestoreCollections = () => {
    if (!restorePreview) return;

    setSelectedRestoreCollections(
      restorePreview.preview
        .filter((item) => item.supported)
        .map((item) => item.collectionKey),
    );
  };

  const clearRestoreCollections = () => {
    setSelectedRestoreCollections([]);
  };

  const resetRestoreTool = () => {
    setRestoreFileName("");
    setRestoreBackupData(null);
    setRestorePreview(null);
    setSelectedRestoreCollections([]);
    setRestoreMode("INSERT_MISSING");
    setRestoreConfirmText("");

    if (restoreFileInputRef.current) {
      restoreFileInputRef.current.value = "";
    }
  };

  const runRestore = async () => {
    if (!restoreBackupData) {
      toast.error("Please choose a JSON backup file first.");
      return;
    }

    if (selectedRestoreCollections.length === 0) {
      toast.error("Please select at least one collection to restore.");
      return;
    }

    if (
      restoreMode === "REPLACE_SELECTED" &&
      restoreConfirmText !== "RESTORE"
    ) {
      toast.error("Type RESTORE to confirm replace mode.");
      return;
    }

    const confirmed = window.confirm(
      `Restore ${selectedRestoreSummary.records} record(s) into ${selectedRestoreSummary.collections} collection(s) using ${restoreMode}?`,
    );

    if (!confirmed) return;

    try {
      setRestoringBackup(true);

      const res = await fetch("/api/super-admin/backups/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          backupData: restoreBackupData,
          dryRun: false,
          mode: restoreMode,
          selectedCollections: selectedRestoreCollections,
          confirmText: restoreConfirmText,
        }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Restore failed");
      }

      toast.success("Restore completed.");
      fetchAuditLogs(1);
      fetchBackupLogs();

      console.log("RESTORE RESULT:", data);
    } catch (error: any) {
      toast.error(error?.message || "Restore failed");
    } finally {
      setRestoringBackup(false);
    }
  };

  if (status === "loading") {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!session) return null;

  const filterControls = (
    <div className="grid gap-3 lg:grid-cols-4">
      <label className="lg:col-span-2">
        <span className="text-xs font-bold text-slate-500">Search</span>
        <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
          <FaSearch className="text-slate-400" />
          <input
            value={auditFilters.search}
            onChange={(event) =>
              updateAuditFilter("search", event.target.value)
            }
            placeholder="Search actor, project, entity, summary..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </label>

      <label>
        <span className="text-xs font-bold text-slate-500">Action</span>
        <select
          value={auditFilters.action}
          onChange={(event) => updateAuditFilter("action", event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2 text-sm"
        >
          {actionOptions.map((action) => (
            <option key={action || "ALL"} value={action}>
              {action || "All actions"}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="text-xs font-bold text-slate-500">Entity</span>
        <input
          value={auditFilters.entity}
          onChange={(event) => updateAuditFilter("entity", event.target.value)}
          placeholder="MaterialCatalogItem"
          className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-sm"
        />
      </label>

      <label>
        <span className="text-xs font-bold text-slate-500">Project Code</span>
        <input
          value={auditFilters.projectCode}
          onChange={(event) =>
            updateAuditFilter("projectCode", event.target.value)
          }
          placeholder="2026-0000-05-SAMPLE"
          className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-sm"
        />
      </label>

      <label>
        <span className="text-xs font-bold text-slate-500">Actor Email</span>
        <input
          value={auditFilters.actorEmail}
          onChange={(event) =>
            updateAuditFilter("actorEmail", event.target.value)
          }
          placeholder="user@email.com"
          className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-sm"
        />
      </label>

      <label>
        <span className="text-xs font-bold text-slate-500">Entity ID</span>
        <input
          value={auditFilters.entityId}
          onChange={(event) =>
            updateAuditFilter("entityId", event.target.value)
          }
          placeholder="Database ID"
          className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-sm"
        />
      </label>

      <label>
        <span className="text-xs font-bold text-slate-500">From</span>
        <input
          type="date"
          value={auditFilters.from}
          onChange={(event) => updateAuditFilter("from", event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-sm"
        />
      </label>

      <label>
        <span className="text-xs font-bold text-slate-500">To</span>
        <input
          type="date"
          value={auditFilters.to}
          onChange={(event) => updateAuditFilter("to", event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-sm"
        />
      </label>

      <div className="flex flex-col gap-2 sm:flex-row lg:col-span-4">
        <button
          type="button"
          onClick={applyAuditFilters}
          disabled={loadingAuditLogs}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-400"
        >
          <FaFilter /> Apply Filters
        </button>

        <button
          type="button"
          onClick={resetAuditFilters}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
        >
          <FaTimes /> Reset
        </button>

        <button
          type="button"
          onClick={downloadAuditCsv}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          <FaDownload /> Export CSV
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 pt-16 text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
                <FaShieldAlt /> Super Admin
              </p>
              <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                Audit Logs, Backups & Restore
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                View system activity, export audit history, create app-level
                JSON backups, and safely preview selective restore operations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                fetchAuditLogs(auditPage);
                fetchBackupLogs();
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              <FaSyncAlt /> Refresh All
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <FaDatabase /> Last Successful Backup
            </p>
            <p className="mt-3 text-xl font-black">
              {lastSuccessfulBackup
                ? formatDate(lastSuccessfulBackup.completedAt)
                : "No successful backup yet"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Records: {lastSuccessfulBackup?.recordCount ?? "N/A"}
            </p>
            <p className="text-sm text-slate-500">
              Size: {formatFileSize(lastSuccessfulBackup?.fileSize)}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-bold text-slate-700">Audit Results</p>
            <p className="mt-3 text-xl font-black">{auditTotal}</p>
            <p className="mt-2 text-sm text-slate-500">
              {activeFilterCount} active filter
              {activeFilterCount === 1 ? "" : "s"}.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-bold text-slate-700">Backup Actions</p>
            <button
              type="button"
              onClick={downloadJsonBackup}
              disabled={creatingBackup}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              <FaDownload />{" "}
              {creatingBackup ? "Preparing Backup..." : "Download JSON Backup"}
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black">
                <FaUpload /> Restore JSON Backup
              </h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                Upload an app-level JSON backup, run a dry-run validation, then
                selectively restore only the collections you need.
              </p>
            </div>

            <button
              type="button"
              onClick={resetRestoreTool}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
            >
              <FaTimes /> Reset Restore Tool
            </button>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-sm font-black">1. Choose backup file</p>
              <input
                ref={restoreFileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleRestoreFileChange}
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white p-2 text-sm"
              />
              <p className="mt-2 break-all text-xs text-slate-500">
                {restoreFileName || "No file selected."}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-sm font-black">2. Restore mode</p>
              <select
                value={restoreMode}
                onChange={(event) =>
                  setRestoreMode(event.target.value as RestoreMode)
                }
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white p-2 text-sm"
              >
                {restoreModeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">
                {
                  restoreModeOptions.find(
                    (option) => option.value === restoreMode,
                  )?.help
                }
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-sm font-black">3. Dry-run first</p>
              <button
                type="button"
                onClick={runRestoreDryRun}
                disabled={!restoreBackupData || loadingRestorePreview}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-400"
              >
                <FaSearch />{" "}
                {loadingRestorePreview ? "Checking..." : "Run Dry-Run Check"}
              </button>
            </div>
          </div>

          {restorePreview && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-lg font-black">Restore Preview</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Backup Version:{" "}
                    <span className="font-bold">
                      {restorePreview.backupVersion || "Unknown"}
                    </span>{" "}
                    · Schema Version:{" "}
                    <span className="font-bold">
                      {restorePreview.schemaVersion || "Unknown"}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600">
                    Exported: {formatDate(restorePreview.exportedAt)}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-3 text-sm text-blue-800">
                  <p className="font-black">
                    Selected: {selectedRestoreSummary.collections} collection(s)
                  </p>
                  <p>{selectedRestoreSummary.records} incoming record(s)</p>
                </div>
              </div>

              {restorePreview.warnings?.length > 0 && (
                <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="mb-2 flex items-center gap-2 font-black">
                    <FaExclamationTriangle /> Warnings
                  </p>
                  <ul className="list-disc space-y-1 pl-5">
                    {restorePreview.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selectAllRestoreCollections}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Select All Supported
                </button>
                <button
                  type="button"
                  onClick={clearRestoreCollections}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  Clear Selection
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {restorePreview.preview.map((item) => {
                  const checked = selectedRestoreCollections.includes(
                    item.collectionKey,
                  );

                  return (
                    <label
                      key={item.collectionKey}
                      className={
                        "rounded-2xl p-4 ring-1 " +
                        (item.supported
                          ? checked
                            ? "bg-blue-50 ring-blue-300"
                            : "bg-slate-50 ring-slate-200"
                          : "bg-red-50 ring-red-200")
                      }
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          disabled={!item.supported}
                          checked={checked}
                          onChange={() =>
                            toggleRestoreCollection(item.collectionKey)
                          }
                          className="mt-1"
                        />

                        <div className="min-w-0">
                          <p className="font-black">
                            {item.label || item.collectionKey}
                          </p>
                          <p className="break-all text-xs text-slate-500">
                            {item.collectionKey}
                          </p>

                          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                            <div className="rounded-xl bg-white p-2">
                              <p className="font-bold">Incoming</p>
                              <p>{item.incoming}</p>
                            </div>
                            <div className="rounded-xl bg-white p-2">
                              <p className="font-bold">Existing</p>
                              <p>{item.existing}</p>
                            </div>
                            <div className="rounded-xl bg-white p-2">
                              <p className="font-bold">Missing</p>
                              <p>{item.missing}</p>
                            </div>
                          </div>

                          {item.errors?.length > 0 && (
                            <div className="mt-3 rounded-xl bg-red-100 p-2 text-xs text-red-700">
                              {item.errors.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {restoreMode === "REPLACE_SELECTED" && (
                <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-200">
                  <p className="flex items-center gap-2 font-black">
                    <FaExclamationTriangle /> Dangerous restore mode
                  </p>
                  <p className="mt-1">
                    This will delete the selected collections before importing
                    records from the backup.
                  </p>
                  <label className="mt-3 block">
                    <span className="text-xs font-bold">
                      Type RESTORE to confirm
                    </span>
                    <input
                      value={restoreConfirmText}
                      onChange={(event) =>
                        setRestoreConfirmText(event.target.value)
                      }
                      placeholder="RESTORE"
                      className="mt-1 w-full rounded-xl border border-red-300 bg-white p-2 text-sm"
                    />
                  </label>
                </div>
              )}

              <button
                type="button"
                onClick={runRestore}
                disabled={
                  restoringBackup ||
                  selectedRestoreCollections.length === 0 ||
                  (restoreMode === "REPLACE_SELECTED" &&
                    restoreConfirmText !== "RESTORE")
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700 disabled:bg-slate-400"
              >
                <FaUpload />{" "}
                {restoringBackup ? "Restoring..." : "Run Selected Restore"}
              </button>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black">Audit Logs</h2>
              <p className="mt-1 text-sm text-slate-600">
                Filter by search, action, entity, project, actor, ID, and date
                range.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilters((current) => !current)}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white lg:hidden"
            >
              <FaFilter /> Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="mt-5 hidden rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 lg:block">
            {filterControls}
          </div>

          {showMobileFilters && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 lg:hidden">
              {filterControls}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 border-y border-slate-200 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {firstRecordNumber}-{lastRecordNumber}
              </span>{" "}
              of <span className="font-bold text-slate-900">{auditTotal}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={auditPageSize}
                onChange={(event) => {
                  setAuditPageSize(Number(event.target.value));
                  setAuditPage(1);
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => goToAuditPage(auditPage - 1)}
                disabled={auditPage <= 1 || loadingAuditLogs}
                className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40"
              >
                <FaChevronLeft />
              </button>

              <span className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white">
                {auditPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => goToAuditPage(auditPage + 1)}
                disabled={auditPage >= totalPages || loadingAuditLogs}
                className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-40"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          <div className="mt-5 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <th className="p-3">Date</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Summary</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-5 text-center text-slate-500">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="border-b align-top">
                      <td className="p-3 text-xs text-slate-500">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="p-3">
                        <p className="font-bold">
                          {log.actorNickname || "Unknown"}
                        </p>
                        <p className="break-all text-xs text-slate-500">
                          {log.actorEmail || "No email"}
                        </p>
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold">{log.entity}</p>
                        <p className="break-all text-xs text-slate-400">
                          {log.entityId || "N/A"}
                        </p>
                      </td>
                      <td className="p-3 text-xs">
                        {log.projectCode || "N/A"}
                      </td>
                      <td className="p-3">
                        <p>{log.summary || "No summary"}</p>

                        {log.changes && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs font-bold text-blue-600">
                              View changes
                            </summary>
                            <pre className="mt-2 max-h-60 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
                              {JSON.stringify(log.changes, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3 lg:hidden">
            {auditLogs.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-5 text-center text-sm text-slate-500">
                No audit logs found.
              </p>
            ) : (
              auditLogs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        {formatDate(log.createdAt)}
                      </p>
                      <p className="mt-1 font-black">
                        {log.actorNickname || "Unknown"}
                      </p>
                      <p className="break-all text-xs text-slate-500">
                        {log.actorEmail || "No email"}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-bold text-white">
                      {log.action}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm">
                    <p>
                      <span className="font-bold">Entity:</span> {log.entity}
                    </p>
                    <p className="break-all text-xs text-slate-500">
                      <span className="font-bold">ID:</span>{" "}
                      {log.entityId || "N/A"}
                    </p>
                    <p>
                      <span className="font-bold">Project:</span>{" "}
                      {log.projectCode || "N/A"}
                    </p>
                    <p>{log.summary || "No summary"}</p>
                  </div>

                  {log.changes && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs font-bold text-blue-600">
                        View changes
                      </summary>
                      <pre className="mt-2 max-h-60 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    </details>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black">
                <FaHistory /> Backup History
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Shows previous app-level backup attempts.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchBackupLogs}
              disabled={loadingBackups}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-400"
            >
              Refresh
            </button>
          </div>

          <div className="mt-5 grid gap-3">
            {backupLogs.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-5 text-center text-sm text-slate-500">
                No backup history found.
              </p>
            ) : (
              backupLogs.map((backup) => (
                <div
                  key={backup.id}
                  className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold">{backup.backupType}</p>
                      <p className="text-xs text-slate-500">
                        Requested by{" "}
                        {backup.requestedByNickname ||
                          backup.requestedByEmail ||
                          "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Started: {formatDate(backup.createdAt)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Completed: {formatDate(backup.completedAt)}
                      </p>
                    </div>

                    <div className="text-sm sm:text-right">
                      <span
                        className={
                          "rounded-full px-3 py-1 text-xs font-black " +
                          (backup.status === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-700"
                            : backup.status === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700")
                        }
                      >
                        {backup.status}
                      </span>
                      <p className="mt-2 text-xs text-slate-500">
                        Records: {backup.recordCount ?? "N/A"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Size: {formatFileSize(backup.fileSize)}
                      </p>
                    </div>
                  </div>

                  {backup.errorMessage && (
                    <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                      {backup.errorMessage}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
