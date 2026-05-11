"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/app/components/navBar";
import {
  FaDownload,
  FaDatabase,
  FaHistory,
  FaShieldAlt,
  FaSyncAlt,
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

export default function SuperAdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [lastSuccessfulBackup, setLastSuccessfulBackup] =
    useState<BackupLog | null>(null);

  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [loadingBackups, setLoadingBackups] = useState(false);

  const [auditEntityFilter, setAuditEntityFilter] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("");
  const [auditProjectFilter, setAuditProjectFilter] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchAuditLogs();
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

  const buildAuditQuery = () => {
    const params = new URLSearchParams();

    params.set("take", "100");

    if (auditEntityFilter.trim()) {
      params.set("entity", auditEntityFilter.trim());
    }

    if (auditActionFilter.trim()) {
      params.set("action", auditActionFilter.trim());
    }

    if (auditProjectFilter.trim()) {
      params.set("projectCode", auditProjectFilter.trim());
    }

    return params.toString();
  };

  const fetchAuditLogs = async () => {
    try {
      setLoadingAuditLogs(true);

      const query = buildAuditQuery();
      const res = await fetch(`/api/super-admin/audit-logs?${query}`);
      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to load audit logs");
      }

      setAuditLogs(data.logs || []);
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

  const downloadAuditCsv = () => {
    const params = new URLSearchParams();

    if (auditEntityFilter.trim()) {
      params.set("entity", auditEntityFilter.trim());
    }

    if (auditActionFilter.trim()) {
      params.set("action", auditActionFilter.trim());
    }

    if (auditProjectFilter.trim()) {
      params.set("projectCode", auditProjectFilter.trim());
    }

    window.location.href = `/api/super-admin/audit-logs/export?${params.toString()}`;
  };

  const downloadJsonBackup = () => {
    window.location.href = "/api/super-admin/backups/export";
    setTimeout(fetchBackupLogs, 2000);
  };

  if (status === "loading") {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-100 pt-16 text-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
                <FaShieldAlt /> Super Admin
              </p>
              <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                Audit Logs & Backups
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                View system activity, export audit logs, and create app-level
                JSON backups.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                fetchAuditLogs();
                fetchBackupLogs();
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              <FaSyncAlt /> Refresh All
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
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
            <p className="text-sm font-bold text-slate-700">Audit Logs</p>
            <p className="mt-3 text-xl font-black">{auditLogs.length}</p>
            <p className="mt-2 text-sm text-slate-500">
              Showing latest matching records.
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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-black">Audit Logs</h2>
              <p className="mt-1 text-sm text-slate-600">
                Only Super Admin can view this section.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-4">
              <input
                value={auditEntityFilter}
                onChange={(event) => setAuditEntityFilter(event.target.value)}
                placeholder="Entity"
                className="rounded-xl border border-slate-300 p-2 text-sm"
              />

              <input
                value={auditActionFilter}
                onChange={(event) => setAuditActionFilter(event.target.value)}
                placeholder="Action"
                className="rounded-xl border border-slate-300 p-2 text-sm"
              />

              <input
                value={auditProjectFilter}
                onChange={(event) => setAuditProjectFilter(event.target.value)}
                placeholder="Project Code"
                className="rounded-xl border border-slate-300 p-2 text-sm"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={fetchAuditLogs}
                  disabled={loadingAuditLogs}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-400"
                >
                  Filter
                </button>

                <button
                  type="button"
                  onClick={downloadAuditCsv}
                  className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  CSV
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
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
                        <p className="text-xs text-slate-500">
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
                          {log.entityId}
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
