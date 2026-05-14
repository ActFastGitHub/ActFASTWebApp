// app\(site)\super-admin\page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/app/components/navBar";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDatabase,
  FaDownload,
  FaFilter,
  FaHistory,
  FaSearch,
  FaShieldAlt,
  FaSyncAlt,
  FaTimes,
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

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [lastSuccessfulBackup, setLastSuccessfulBackup] =
    useState<BackupLog | null>(null);

  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [loadingBackups, setLoadingBackups] = useState(false);

  const [auditFilters, setAuditFilters] =
    useState<AuditFilters>(emptyAuditFilters);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(25);

  const activeFilterCount = useMemo(
    () => getActiveFilterCount(auditFilters),
    [auditFilters],
  );

  const totalPages = Math.max(Math.ceil(auditTotal / auditPageSize), 1);
  const firstRecordNumber =
    auditTotal === 0 ? 0 : (auditPage - 1) * auditPageSize + 1;
  const lastRecordNumber = Math.min(auditPage * auditPageSize, auditTotal);

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
    window.location.href = "/api/super-admin/backups/export";
    setTimeout(fetchBackupLogs, 2000);
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchAuditLogs(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditPageSize]);

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
                Audit Logs & Backups
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                View system activity, filter audit history, export CSV records,
                and create app-level JSON backups.
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
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              <FaDownload /> Download JSON Backup
            </button>
          </div>
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
