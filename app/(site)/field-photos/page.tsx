// app/(site)/employee-portal/field-photos/page.tsx

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Navbar from "@/app/components/navBar";

/* ─────────────────────────────
   Safety / performance settings
───────────────────────────── */

const MAX_QUEUE_ITEMS = 100;
const QUEUE_WARNING_THRESHOLD = 75;
const CAPTURE_COOLDOWN_MS = 1000;
const DEFAULT_IMAGE_QUALITY = 0.75;
const PROJECT_TEMPLATE_PATH = "/FOLDER STRUCTURE";
const PROJECT_FOLDER_REGEX = /^\d{4}-\d{3,4}-\d{2}-[A-Za-z0-9-]+$/;

/* ─────────────────────────────
   IndexedDB settings
───────────────────────────── */

const DB_NAME = "actfast-field-photos-db";
const STORE_NAME = "photo-upload-queue";
const DB_VERSION = 1;

/* ─────────────────────────────
   File naming helpers
───────────────────────────── */

const cleanFileNamePart = (value: string) => {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

  return cleaned || "unknown";
};

const getCurrentYearAndMonth = () => {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: String(now.getMonth() + 1).padStart(2, "0"),
  };
};

const cleanProjectNamePart = (value: string) => {
  const cleaned = value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-")
    .replace(/[^A-Z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned;
};

const isProjectFolderName = (folderName: string) =>
  PROJECT_FOLDER_REGEX.test(folderName);

const getProjectNumberFromFolderName = (folderName: string) => {
  if (!isProjectFolderName(folderName)) return null;

  const parts = folderName.split("-");
  const projectNumber = Number(parts[1]);

  return Number.isFinite(projectNumber) ? projectNumber : null;
};

const getLocalTimestampForFile = () => {
  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const sec = String(now.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}_${hh}-${min}-${sec}`;
};

/* ─────────────────────────────
   Types
───────────────────────────── */

type DropboxFolder = {
  name: string;
  path: string;
};

type QueueStatus = "pending" | "uploading" | "uploaded" | "failed";

type PhotoQueueItem = {
  id: string;
  fileName: string;
  folderPath: string;
  blob: Blob;
  status: QueueStatus;
  createdAt: number;
  uploadedAt?: number;
  attempts: number;
  error?: string;
};

/* ─────────────────────────────
   IndexedDB helpers
───────────────────────────── */

function openQueueDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveQueueItem(item: PhotoQueueItem) {
  const db = await openQueueDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function deleteQueueItem(id: string) {
  const db = await openQueueDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearAllQueueItems() {
  const db = await openQueueDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadQueueItems(): Promise<PhotoQueueItem[]> {
  const db = await openQueueDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/* ─────────────────────────────
   API response helper
───────────────────────────── */

async function readApiResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response: ${text.slice(0, 500)}`);
    }
  }

  throw new Error(
    `Server returned non-JSON response. Status: ${res.status}. Preview: ${text.slice(
      0,
      300,
    )}`,
  );
}

export default function FieldPhotosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  /* ─────────────────────────────
     Camera refs
  ───────────────────────────── */

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Prevent duplicate upload processors.
  const isProcessingRef = useRef(false);

  // Keeps the latest queue available inside async functions.
  const queueRef = useRef<PhotoQueueItem[]>([]);

  // Prevents users from spam-clicking capture.
  const lastCaptureAtRef = useRef(0);

  /* ─────────────────────────────
     Folder states
  ───────────────────────────── */

  const [projectFolders, setProjectFolders] = useState<DropboxFolder[]>([]);
  const [childFolders, setChildFolders] = useState<DropboxFolder[]>([]);

  const [selectedProjectPath, setSelectedProjectPath] = useState("");
  const [currentBrowsePath, setCurrentBrowsePath] = useState("");
  const [selectedUploadPath, setSelectedUploadPath] = useState("");

  const [newProjectName, setNewProjectName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  /* ─────────────────────────────
     UI / upload states
  ───────────────────────────── */

  const [cameraActive, setCameraActive] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [debugError, setDebugError] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  const [queue, setQueue] = useState<PhotoQueueItem[]>([]);
  const [imageQuality, setImageQuality] = useState(DEFAULT_IMAGE_QUALITY);
  const [photoTakerName, setPhotoTakerName] = useState("unknown");

  // Admin/template project folder states.
  const [isAdmin, setIsAdmin] = useState(false);
  const [showOnlyProjectFolders, setShowOnlyProjectFolders] = useState(true);
  const [templateProjectName, setTemplateProjectName] = useState("");
  const [isCreatingTemplateProject, setIsCreatingTemplateProject] =
    useState(false);

  /* ─────────────────────────────
     Queue counters
  ───────────────────────────── */

  const totalCaptured = queue.length;
  const pendingCount = queue.filter((i) => i.status === "pending").length;
  const uploadingCount = queue.filter((i) => i.status === "uploading").length;
  const uploadedCount = queue.filter((i) => i.status === "uploaded").length;
  const failedCount = queue.filter((i) => i.status === "failed").length;

  const activeQueueCount = queue.filter((i) => i.status !== "uploaded").length;
  const isQueueFull = activeQueueCount >= MAX_QUEUE_ITEMS;
  const isQueueNearLimit = activeQueueCount >= QUEUE_WARNING_THRESHOLD;

  /* ─────────────────────────────
     Project folder helpers
  ───────────────────────────── */

  const visibleProjectFolders = useMemo(() => {
    const folders = [...projectFolders].sort((a, b) =>
      b.name.localeCompare(a.name, undefined, { numeric: true }),
    );

    if (!showOnlyProjectFolders) return folders;

    return folders.filter((folder) => isProjectFolderName(folder.name));
  }, [projectFolders, showOnlyProjectFolders]);

  const nextProjectNumber = useMemo(() => {
    const highestProjectNumber = projectFolders.reduce((highest, folder) => {
      const projectNumber = getProjectNumberFromFolderName(folder.name);
      return projectNumber && projectNumber > highest ? projectNumber : highest;
    }, 0);

    return highestProjectNumber > 0 ? highestProjectNumber + 1 : 1001;
  }, [projectFolders]);

  const nextProjectFolderName = useMemo(() => {
    const { year, month } = getCurrentYearAndMonth();
    const cleanedProjectName = cleanProjectNamePart(templateProjectName);

    if (!cleanedProjectName) return "";

    return `${year}-${nextProjectNumber}-${month}-${cleanedProjectName}`;
  }, [templateProjectName, nextProjectNumber]);

  /* ─────────────────────────────
     Queue state helpers
  ───────────────────────────── */

  const syncQueueState = (items: PhotoQueueItem[]) => {
    queueRef.current = items;
    setQueue([...items]);
  };

  const updateQueueItem = async (
    id: string,
    patch: Partial<PhotoQueueItem>,
  ) => {
    const updated = queueRef.current.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    );

    syncQueueState(updated);

    const changedItem = updated.find((item) => item.id === id);
    if (changedItem) await saveQueueItem(changedItem);
  };

  /* ─────────────────────────────
     Auth guard
  ───────────────────────────── */

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  /* ─────────────────────────────
     Load photo taker name
  ───────────────────────────── */

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchPhotoTakerName = async () => {
      try {
        const res = await fetch(`/api/user/profile/${session.user.email}`);
        const data = await res.json();

        const name =
          data?.nickname ||
          data?.firstName ||
          session.user?.name ||
          session.user?.email ||
          "unknown";

        const role = String(data?.role || "").toLowerCase();
        setIsAdmin(role === "admin");
        setPhotoTakerName(cleanFileNamePart(name));
      } catch {
        const fallback = session.user?.name || session.user?.email || "unknown";

        setPhotoTakerName(cleanFileNamePart(fallback));
      }
    };

    fetchPhotoTakerName();
  }, [session?.user?.email, session?.user?.name]);

  /* ─────────────────────────────
     Online / offline detection
  ───────────────────────────── */

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored. Uploads will continue.");
      processUploadQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline. Photos will stay queued.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /* ─────────────────────────────
     Initial load: folders + saved queue
  ───────────────────────────── */

  useEffect(() => {
    if (!session) return;

    fetchProjectFolders();

    loadQueueItems()
      .then((items) => {
        const restored = items
          .map((item) => ({
            ...item,
            status: item.status === "uploading" ? "pending" : item.status,
          }))
          .sort((a, b) => a.createdAt - b.createdAt);

        syncQueueState(restored);
        setTimeout(() => processUploadQueue(), 500);
      })
      .catch((error) => {
        console.error("Failed to load local upload queue", error);
      });

    return () => {
      stopCamera();
    };
  }, [session]);

  /* ─────────────────────────────
     When project changes, browse inside it
  ───────────────────────────── */

  useEffect(() => {
    if (selectedProjectPath) {
      setCurrentBrowsePath(selectedProjectPath);
      setSelectedUploadPath(selectedProjectPath);
      fetchChildFolders(selectedProjectPath);
    } else {
      setCurrentBrowsePath("");
      setSelectedUploadPath("");
      setChildFolders([]);
    }
  }, [selectedProjectPath]);

  const handleError = (error: unknown, fallback: string) => {
    const message = error instanceof Error ? error.message : fallback;
    console.error(fallback, error);
    setDebugError(message);
    toast.error(message);
  };

  /* ─────────────────────────────
     Dropbox folder actions
  ───────────────────────────── */

  const fetchProjectFolders = async () => {
    try {
      setDebugError("");

      const res = await fetch("/api/dropbox/list-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to load projects",
        );
      }

      setProjectFolders(data.folders || []);
    } catch (error) {
      handleError(error, "Failed to load project folders");
    }
  };

  const fetchChildFolders = async (path: string) => {
    setLoadingFolders(true);

    try {
      setDebugError("");

      const res = await fetch("/api/dropbox/list-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to load folders",
        );
      }

      setChildFolders(data.folders || []);
    } catch (error) {
      handleError(error, "Failed to load folders");
    } finally {
      setLoadingFolders(false);
    }
  };

  const createProjectFolder = async () => {
    if (!newProjectName.trim()) {
      toast.error("Enter a project folder name");
      return;
    }

    try {
      setDebugError("");

      const res = await fetch("/api/dropbox/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName: newProjectName }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to create project",
        );
      }

      setNewProjectName("");
      await fetchProjectFolders();

      setSelectedProjectPath(data.folder.path);
      setCurrentBrowsePath(data.folder.path);
      setSelectedUploadPath(data.folder.path);

      toast.success("Project folder created");
    } catch (error) {
      handleError(error, "Failed to create project folder");
    }
  };

  const createProjectFolderFromTemplate = async () => {
    if (!isAdmin) {
      toast.error("Only admin users can create project folders from template");
      return;
    }

    const cleanedProjectName = cleanProjectNamePart(templateProjectName);

    if (!cleanedProjectName) {
      toast.error("Enter a valid project name");
      return;
    }

    if (
      projectFolders.some((folder) => folder.name === nextProjectFolderName)
    ) {
      toast.error("That project folder already exists. Nothing was copied.");
      return;
    }

    setIsCreatingTemplateProject(true);

    try {
      setDebugError("");

      const res = await fetch("/api/dropbox/copy-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePath: PROJECT_TEMPLATE_PATH,
          destinationFolderName: nextProjectFolderName,
        }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(
          data.detail ||
            data.message ||
            "Failed to create project folder from template",
        );
      }

      setTemplateProjectName("");
      await fetchProjectFolders();

      setSelectedProjectPath(data.folder.path);
      setCurrentBrowsePath(data.folder.path);
      setSelectedUploadPath(data.folder.path);
      await fetchChildFolders(data.folder.path);

      toast.success(`Project folder created: ${data.folder.name}`);
    } catch (error) {
      handleError(error, "Failed to create project folder from template");
    } finally {
      setIsCreatingTemplateProject(false);
    }
  };

  const createFolderHere = async () => {
    if (!selectedProjectPath || !currentBrowsePath) {
      toast.error("Select a project folder first");
      return;
    }

    if (!newFolderName.trim()) {
      toast.error("Enter a folder name");
      return;
    }

    try {
      setDebugError("");

      const res = await fetch("/api/dropbox/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentPath: currentBrowsePath,
          folderName: newFolderName,
        }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to create folder",
        );
      }

      setNewFolderName("");
      await fetchChildFolders(currentBrowsePath);

      setSelectedUploadPath(data.folder.path);
      toast.success("Folder created and selected");
    } catch (error) {
      handleError(error, "Failed to create folder");
    }
  };

  const openFolder = async (folder: DropboxFolder) => {
    setCurrentBrowsePath(folder.path);
    setSelectedUploadPath(folder.path);
    await fetchChildFolders(folder.path);
  };

  const goUpOneLevel = async () => {
    if (!selectedProjectPath || !currentBrowsePath) return;

    if (currentBrowsePath.toLowerCase() === selectedProjectPath.toLowerCase()) {
      toast("Already at the project folder");
      return;
    }

    const parentPath = currentBrowsePath.split("/").slice(0, -1).join("/");

    if (
      !parentPath ||
      !parentPath.toLowerCase().startsWith(selectedProjectPath.toLowerCase())
    ) {
      setCurrentBrowsePath(selectedProjectPath);
      setSelectedUploadPath(selectedProjectPath);
      await fetchChildFolders(selectedProjectPath);
      return;
    }

    setCurrentBrowsePath(parentPath);
    setSelectedUploadPath(parentPath);
    await fetchChildFolders(parentPath);
  };

  const selectCurrentFolderForUpload = () => {
    if (!currentBrowsePath) {
      toast.error("Select a project folder first");
      return;
    }

    setSelectedUploadPath(currentBrowsePath);
    toast.success("Current folder selected for upload");
  };

  /* ─────────────────────────────
     Camera actions
  ───────────────────────────── */

  const startCamera = async () => {
    if (!selectedUploadPath) {
      toast.error("Select an upload folder first");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);
    } catch {
      toast.error("Camera access denied or unavailable");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhotoToQueue = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedUploadPath) {
      toast.error("Open camera and select an upload folder first");
      return;
    }

    if (isQueueFull) {
      toast.error(
        `Upload queue is full. Clear uploaded items or wait for uploads to finish. Limit: ${MAX_QUEUE_ITEMS}`,
      );
      return;
    }

    const now = Date.now();
    const timeSinceLastCapture = now - lastCaptureAtRef.current;

    if (timeSinceLastCapture < CAPTURE_COOLDOWN_MS) {
      toast.error("Please wait a moment before taking another photo.");
      return;
    }

    lastCaptureAtRef.current = now;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", imageQuality),
      );

      if (!blob) throw new Error("Failed to capture photo");

      const id = crypto.randomUUID();
      const fileName = `${photoTakerName}_${getLocalTimestampForFile()}.jpg`;

      const item: PhotoQueueItem = {
        id,
        fileName,
        folderPath: selectedUploadPath,
        blob,
        status: "pending",
        createdAt: Date.now(),
        attempts: 0,
      };

      const nextQueue = [...queueRef.current, item];
      syncQueueState(nextQueue);
      await saveQueueItem(item);

      if (
        nextQueue.filter((i) => i.status !== "uploaded").length >=
        QUEUE_WARNING_THRESHOLD
      ) {
        toast.error(
          "Queue is getting large. Consider waiting for uploads to catch up.",
        );
      } else {
        toast.success("Photo captured and queued");
      }

      processUploadQueue();
    } catch (error) {
      handleError(error, "Failed to capture photo");
    }
  };

  /* ─────────────────────────────
     Background upload queue
  ───────────────────────────── */

  const uploadQueueItem = async (item: PhotoQueueItem) => {
    await updateQueueItem(item.id, {
      status: "uploading",
      attempts: item.attempts + 1,
      error: undefined,
    });

    const formData = new FormData();
    formData.append("photo", item.blob, item.fileName);
    formData.append("fileName", item.fileName);
    formData.append("folderPath", item.folderPath);

    const res = await fetch("/api/dropbox/upload-photo", {
      method: "POST",
      body: formData,
    });

    const data = await readApiResponse(res);

    if (!res.ok) {
      throw new Error(data.detail || data.message || "Upload failed");
    }

    await updateQueueItem(item.id, {
      status: "uploaded",
      uploadedAt: Date.now(),
      error: undefined,
    });
  };

  const processUploadQueue = async () => {
    if (isProcessingRef.current) return;
    if (!navigator.onLine) return;

    isProcessingRef.current = true;

    try {
      let keepProcessing = true;

      while (keepProcessing) {
        const nextItem = queueRef.current.find(
          (item) => item.status === "pending" || item.status === "failed",
        );

        if (!nextItem) {
          keepProcessing = false;
          break;
        }

        try {
          await uploadQueueItem(nextItem);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Upload failed";

          await updateQueueItem(nextItem.id, {
            status: "failed",
            error: message,
          });

          if (!navigator.onLine) {
            setIsOnline(false);
            keepProcessing = false;
          } else {
            keepProcessing = false;
            setTimeout(() => processUploadQueue(), 5000);
          }
        }
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  const retryFailedUploads = () => {
    const updated = queueRef.current.map((item) =>
      item.status === "failed"
        ? { ...item, status: "pending" as QueueStatus, error: undefined }
        : item,
    );

    syncQueueState(updated);
    updated.forEach((item) => saveQueueItem(item));
    processUploadQueue();
  };

  const clearUploadedItems = async () => {
    const uploadedItems = queueRef.current.filter(
      (item) => item.status === "uploaded",
    );

    for (const item of uploadedItems) {
      await deleteQueueItem(item.id);
    }

    syncQueueState(
      queueRef.current.filter((item) => item.status !== "uploaded"),
    );
    toast.success("Uploaded items cleared from local log");
  };

  const clearQueueHistory = async () => {
    await clearAllQueueItems();
    syncQueueState([]);
    toast.success("Queue history cleared");
  };

  const getRelativeBrowsePath = () => {
    if (!selectedProjectPath || !currentBrowsePath) return "";
    return currentBrowsePath.replace(selectedProjectPath, "") || "/";
  };

  if (status === "loading") {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-20">
      <Navbar />

      <div className="mx-auto max-w-5xl mt-8">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-slate-900">
            Field Photo Upload
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Select a Dropbox folder, capture photos quickly, and let uploads run
            in the background.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Photo taker: <span className="font-medium">{photoTakerName}</span>
          </p>
        </div>

        {debugError && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <div className="font-bold">Debug Error:</div>
            <div className="mt-1 whitespace-pre-wrap break-words">
              {debugError}
            </div>
          </div>
        )}

        {isQueueNearLimit && (
          <div className="mb-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
            Queue warning: {activeQueueCount}/{MAX_QUEUE_ITEMS} active photos
            are stored locally. Let uploads catch up or clear uploaded items
            soon.
          </div>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-5">
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-xs text-slate-500">Connection</div>
            <div
              className={
                isOnline ? "font-bold text-green-600" : "font-bold text-red-600"
              }
            >
              {isOnline ? "Online" : "Offline"}
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-xs text-slate-500">Captured</div>
            <div className="text-xl font-bold">{totalCaptured}</div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-xs text-slate-500">Pending</div>
            <div className="text-xl font-bold text-yellow-600">
              {pendingCount}
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-xs text-slate-500">Uploading</div>
            <div className="text-xl font-bold text-blue-600">
              {uploadingCount}
            </div>
          </div>

          <div className="rounded-xl bg-white p-4 shadow">
            <div className="text-xs text-slate-500">Uploaded</div>
            <div className="text-xl font-bold text-green-600">
              {uploadedCount}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-3 text-lg font-semibold">Photo Quality</h2>
          <p className="mb-3 text-sm text-slate-600">
            Lower quality uploads faster and uses less Dropbox/browser storage.
          </p>

          <select
            value={imageQuality}
            onChange={(e) => setImageQuality(Number(e.target.value))}
            className="w-full rounded-lg border p-3 sm:w-80"
          >
            <option value={0.6}>Fast Upload / Smaller File</option>
            <option value={0.75}>Balanced</option>
            <option value={0.9}>Higher Quality</option>
          </select>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">1. Project Folder</h2>

            <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={showOnlyProjectFolders}
                onChange={(e) => setShowOnlyProjectFolders(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Show Only Project Folders
            </label>

            <select
              value={selectedProjectPath}
              onChange={(e) => setSelectedProjectPath(e.target.value)}
              className="mb-3 w-full rounded-lg border p-3"
            >
              <option value="">Select project folder</option>
              {visibleProjectFolders.map((folder) => (
                <option key={folder.path} value={folder.path}>
                  {folder.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Create project folder"
                className="w-full rounded-lg border p-3"
              />
              <button
                type="button"
                onClick={createProjectFolder}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </section>

          {isAdmin && (
            <section className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
              <h2 className="mb-2 text-lg font-semibold">
                ➕ Create Project Folder (from Template)
              </h2>

              <p className="mb-4 text-sm text-slate-600">
                Enter only the project name. The system will copy
                <span className="font-medium">
                  {" "}
                  {PROJECT_TEMPLATE_PATH}
                </span>{" "}
                and create the full folder structure using the next available
                project number.
              </p>

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  value={templateProjectName}
                  onChange={(e) => setTemplateProjectName(e.target.value)}
                  placeholder="Project name only, example: SMITH"
                  className="w-full rounded-lg border p-3"
                />

                <button
                  type="button"
                  onClick={createProjectFolderFromTemplate}
                  disabled={!nextProjectFolderName || isCreatingTemplateProject}
                  className="rounded-lg bg-purple-600 px-5 py-3 font-medium text-white hover:bg-purple-700 disabled:bg-slate-400"
                >
                  {isCreatingTemplateProject ? "Creating..." : "Create Project"}
                </button>
              </div>

              <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                <div className="text-slate-500">Generated folder name:</div>
                <div className="break-all font-semibold text-slate-900">
                  {nextProjectFolderName || "Enter a project name to preview"}
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Duplicate protection is enforced before copying, and Dropbox
                autorename is disabled in the backend.
              </p>
            </section>
          )}
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">
              2. Folder Browser / Upload Destination
            </h2>

            {!selectedProjectPath ? (
              <p className="text-sm text-slate-500">
                Select a project folder first.
              </p>
            ) : (
              <>
                <div className="mb-4 rounded-lg bg-slate-100 p-3 text-sm">
                  <div className="text-slate-500">Currently browsing:</div>
                  <div className="break-all font-medium text-slate-900">
                    {getRelativeBrowsePath()}
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={goUpOneLevel}
                    disabled={
                      currentBrowsePath.toLowerCase() ===
                      selectedProjectPath.toLowerCase()
                    }
                    className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800 disabled:bg-slate-400"
                  >
                    Go Up
                  </button>

                  <button
                    type="button"
                    onClick={selectCurrentFolderForUpload}
                    className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  >
                    Use Current Folder
                  </button>
                </div>

                <div className="mb-4 flex gap-2">
                  <input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Create folder here"
                    className="w-full rounded-lg border p-3"
                  />
                  <button
                    type="button"
                    onClick={createFolderHere}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>

                <div className="rounded-lg border">
                  <div className="border-b bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                    Folders inside this level
                  </div>

                  {loadingFolders ? (
                    <div className="p-3 text-sm text-slate-500">
                      Loading folders...
                    </div>
                  ) : childFolders.length === 0 ? (
                    <div className="p-3 text-sm text-slate-500">
                      No folders inside this level.
                    </div>
                  ) : (
                    <div className="max-h-72 divide-y overflow-auto">
                      {childFolders.map((folder) => (
                        <button
                          key={folder.path}
                          type="button"
                          onClick={() => openFolder(folder)}
                          className="flex w-full items-center justify-between px-3 py-3 text-left hover:bg-slate-50"
                        >
                          <span className="font-medium text-slate-800">
                            📁 {folder.name}
                          </span>
                          <span className="text-sm text-slate-400">Open</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedUploadPath && (
                  <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
                    <div className="font-medium text-green-800">
                      Selected upload folder:
                    </div>
                    <div className="break-all text-green-700">
                      {selectedUploadPath}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">3. Camera</h2>

          <div className="overflow-hidden rounded-2xl bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-[420px] w-full object-contain"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {!cameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                disabled={!selectedUploadPath}
                className="rounded-lg bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700 disabled:bg-slate-400"
              >
                Open Camera
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="rounded-lg bg-slate-700 px-5 py-3 font-medium text-white hover:bg-slate-800"
              >
                Stop Camera
              </button>
            )}

            <button
              type="button"
              onClick={capturePhotoToQueue}
              disabled={!cameraActive || isQueueFull}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              {isQueueFull ? "Queue Full" : "Take Photo"}
            </button>

            <button
              type="button"
              onClick={retryFailedUploads}
              disabled={failedCount === 0}
              className="rounded-lg bg-yellow-600 px-5 py-3 font-medium text-white hover:bg-yellow-700 disabled:bg-slate-400"
            >
              Retry Failed ({failedCount})
            </button>

            <button
              type="button"
              onClick={clearUploadedItems}
              disabled={uploadedCount === 0}
              className="rounded-lg bg-slate-600 px-5 py-3 font-medium text-white hover:bg-slate-700 disabled:bg-slate-400"
            >
              Clear Uploaded
            </button>

            <button
              type="button"
              onClick={clearQueueHistory}
              disabled={queue.length === 0}
              className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700 disabled:bg-slate-400"
            >
              Clear History
            </button>
          </div>

          {selectedUploadPath && (
            <p className="mt-3 text-sm text-slate-600">
              Uploading to:{" "}
              <span className="font-medium">{selectedUploadPath}</span>
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-2 text-lg font-semibold">Upload Queue</h2>

          <p className="mb-4 text-sm text-slate-600">
            Failed photos retry automatically when possible. You can also
            manually press Retry Failed.
          </p>

          {queue.length === 0 ? (
            <p className="text-sm text-slate-500">No photos captured yet.</p>
          ) : (
            <div className="max-h-96 space-y-2 overflow-auto">
              {[...queue].reverse().map((item) => {
                const thumbnailUrl = URL.createObjectURL(item.blob);

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-lg border p-3 text-sm"
                  >
                    <img
                      src={thumbnailUrl}
                      alt={item.fileName}
                      className="h-20 w-20 rounded-lg border object-cover"
                      onLoad={() => URL.revokeObjectURL(thumbnailUrl)}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{item.fileName}</div>

                      <div className="break-all text-xs text-slate-500">
                        {item.folderPath}
                      </div>

                      <div className="mt-1">
                        Status:{" "}
                        <span
                          className={
                            item.status === "uploaded"
                              ? "font-bold text-green-600"
                              : item.status === "failed"
                                ? "font-bold text-red-600"
                                : item.status === "uploading"
                                  ? "font-bold text-blue-600"
                                  : "font-bold text-yellow-600"
                          }
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500">
                        Attempts: {item.attempts}
                      </div>

                      {item.uploadedAt && (
                        <div className="text-xs text-slate-500">
                          Uploaded: {new Date(item.uploadedAt).toLocaleString()}
                        </div>
                      )}

                      {item.error && (
                        <div className="mt-1 text-xs text-red-600">
                          {item.error}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
