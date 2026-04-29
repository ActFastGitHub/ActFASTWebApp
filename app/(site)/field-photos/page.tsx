// app/(site)/field-photos/page.tsx

"use client";

import {
  ChangeEvent,
  TouchEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Navbar from "@/app/components/navBar";

/* ─────────────────────────────
   Safety / performance settings
───────────────────────────── */

const MAX_QUEUE_ITEMS = 100;
const QUEUE_PAGE_SIZE = 8;
const GALLERY_PAGE_SIZE = 12;
const QUEUE_WARNING_THRESHOLD = 75;
const CAPTURE_COOLDOWN_MS = 1000;
const SMART_IMAGE_QUALITY = 0.85;
const SMART_IMAGE_MAX_EDGE_PX = 2560;
const PROJECT_TEMPLATE_PATH = "/FOLDER STRUCTURE";
const PROJECT_FOLDER_REGEX = /^\d{4}-\d{3,4}-\d{2}-[A-Za-z0-9-]+$/;
const NO_CLAIMS_FOLDER_REGEX = /^\d{4}-NO CLAIMS$/i;

// LOCAL BACKUP FALLBACK TIMER
// Change this value anytime you want the local backup reminder to appear sooner/later.
// Current setting: 30 minutes after the oldest active queued photo was created.
const LOCAL_BACKUP_REMINDER_AFTER_MS = 30 * 60 * 1000;

// ZIP backup label. This is only used for the downloaded local backup file name.
const LOCAL_BACKUP_BATCH_PREFIX = "ACTFAST_FIELD_PHOTOS_BACKUP";

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
  PROJECT_FOLDER_REGEX.test(folderName) ||
  NO_CLAIMS_FOLDER_REGEX.test(folderName);

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

const getLocalTimestampForBatch = () => getLocalTimestampForFile();

const getSafeBackupNamePart = (value: string) => {
  const cleaned = value
    .trim()
    .replace(/^\/+/, "")
    .replace(/\//g, "_")
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-_]/g, "")
    .replace(/_+/g, "_")
    .replace(/-+/g, "-")
    .replace(/^[-_]|[-_]$/g, "");

  return cleaned || "selected-folder";
};

const getFileExtensionFromName = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && extension.length <= 5 ? extension : "jpg";
};

/* ─────────────────────────────
   Types
───────────────────────────── */

type DropboxFolder = {
  name: string;
  path: string;
};

type QueueStatus = "pending" | "uploading" | "uploaded" | "failed";
type PhotoSource = "camera" | "gallery";

type CameraFacingDevice = {
  deviceId: string;
  label: string;
  isBackCamera: boolean;
  isUltraWide: boolean;
};

type DropboxImageFile = {
  name: string;
  path: string;
  previewUrl: string;
  size: number;
  modifiedAt: string | null;
  owner: string;
  source: PhotoSource;
  canDelete: boolean;
};

type PhotoQueueItem = {
  id: string;
  fileName: string;
  folderPath: string;
  blob: Blob;
  status: QueueStatus;
  createdAt: number;
  uploadedAt?: number;
  dropboxPath?: string;
  attempts: number;
  error?: string;
  source?: PhotoSource;
  originalFileName?: string;
  localBackupSavedAt?: number;
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
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Prevent duplicate upload processors.
  const isProcessingRef = useRef(false);

  // Keeps the latest queue available inside async functions.
  const queueRef = useRef<PhotoQueueItem[]>([]);

  // Prevents users from spam-clicking capture.
  const lastCaptureAtRef = useRef(0);
  const pinchDistanceRef = useRef<number | null>(null);

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
  const [cameraZoom, setCameraZoom] = useState(1);
  const [cameraZoomOptions, setCameraZoomOptions] = useState<number[]>([]);
  const [cameraDevices, setCameraDevices] = useState<CameraFacingDevice[]>([]);
  const [activeCameraDeviceId, setActiveCameraDeviceId] = useState("");
  const [ultraWideCameraDeviceId, setUltraWideCameraDeviceId] = useState("");
  const [standardBackCameraDeviceId, setStandardBackCameraDeviceId] =
    useState("");
  const [cameraLensLabel, setCameraLensLabel] = useState("Rear camera");
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [debugError, setDebugError] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  const [queue, setQueue] = useState<PhotoQueueItem[]>([]);
  const [photoTakerName, setPhotoTakerName] = useState("unknown");
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<DropboxImageFile[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] =
    useState<DropboxImageFile | null>(null);
  const [queuePage, setQueuePage] = useState(1);
  const [galleryPage, setGalleryPage] = useState(1);
  const [templateSectionOpen, setTemplateSectionOpen] = useState(false);

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

  const activeQueueItems = queue.filter((item) => item.status !== "uploaded");
  const activeItemsWithoutLocalBackup = activeQueueItems.filter(
    (item) => !item.localBackupSavedAt,
  );

  const oldestActiveQueueAgeMs = activeQueueItems.length
    ? Date.now() - Math.min(...activeQueueItems.map((item) => item.createdAt))
    : 0;

  const shouldShowLocalBackupReminder =
    activeItemsWithoutLocalBackup.length > 0 &&
    oldestActiveQueueAgeMs >= LOCAL_BACKUP_REMINDER_AFTER_MS;

  const newestFirstQueue = useMemo(
    () => [...queue].sort((a, b) => b.createdAt - a.createdAt),
    [queue],
  );

  const queueTotalPages = Math.max(
    1,
    Math.ceil(newestFirstQueue.length / QUEUE_PAGE_SIZE),
  );

  const pagedQueueItems = newestFirstQueue.slice(
    (queuePage - 1) * QUEUE_PAGE_SIZE,
    queuePage * QUEUE_PAGE_SIZE,
  );

  const galleryTotalPages = Math.max(
    1,
    Math.ceil(galleryFiles.length / GALLERY_PAGE_SIZE),
  );

  const pagedGalleryFiles = galleryFiles.slice(
    (galleryPage - 1) * GALLERY_PAGE_SIZE,
    galleryPage * GALLERY_PAGE_SIZE,
  );

  /* ─────────────────────────────
     Project folder helpers
  ───────────────────────────── */

  const visibleProjectFolders = useMemo(() => {
    const folders = [...projectFolders].sort((a, b) =>
      b.name.localeCompare(a.name, undefined, { numeric: true }),
    );

    const roleFilteredFolders =
      !isAdmin && showOnlyProjectFolders
        ? folders.filter((folder) => isProjectFolderName(folder.name))
        : showOnlyProjectFolders
          ? folders.filter((folder) => isProjectFolderName(folder.name))
          : folders;

    const search = projectSearchTerm.trim().toLowerCase();
    if (!search) return roleFilteredFolders;

    return roleFilteredFolders.filter((folder) =>
      folder.name.toLowerCase().includes(search),
    );
  }, [projectFolders, showOnlyProjectFolders, projectSearchTerm, isAdmin]);

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

  useEffect(() => {
    if (queuePage > queueTotalPages) setQueuePage(queueTotalPages);
  }, [queuePage, queueTotalPages]);

  /* ─────────────────────────────
     Camera modal scroll lock

     When the camera is open, the page behaves like a real phone camera app.
     Users cannot scroll away from the camera controls until they close it.
  ───────────────────────────── */

  useEffect(() => {
    if (!cameraActive) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") stopCamera();
    };

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [cameraActive]);

  useEffect(() => {
    if (galleryPage > galleryTotalPages) setGalleryPage(galleryTotalPages);
  }, [galleryPage, galleryTotalPages]);

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
      setGalleryFiles([]);
      setGalleryPage(1);
    } else {
      setCurrentBrowsePath("");
      setSelectedUploadPath("");
      setChildFolders([]);
      setGalleryFiles([]);
    }
  }, [selectedProjectPath]);

  useEffect(() => {
    if (!currentBrowsePath || !session) return;
    fetchGalleryFiles(currentBrowsePath);
  }, [currentBrowsePath, session]);

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
    if (!navigator.onLine) {
      setIsOnline(false);
      toast.error("You are offline. Project folders cannot refresh right now.");
      return;
    }

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
    if (!navigator.onLine) {
      setIsOnline(false);
      toast.error("You are offline. Folder browsing is paused.");
      return;
    }

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

  const fetchGalleryFiles = async (path: string) => {
    if (!navigator.onLine) {
      setIsOnline(false);
      return;
    }

    setLoadingGallery(true);

    try {
      const res = await fetch("/api/dropbox/list-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to load gallery",
        );
      }

      setGalleryFiles(data.files || []);
      setGalleryPage(1);
    } catch (error) {
      console.error("Failed to load gallery", error);
      setGalleryFiles([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  const createProjectFolder = async () => {
    if (!isOnline) {
      toast.error(
        "You are offline. Creating Dropbox folders is disabled for now.",
      );
      return;
    }

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
    if (!isOnline) {
      toast.error(
        "You are offline. Creating Dropbox folders is disabled for now.",
      );
      return;
    }

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
    if (!isOnline) {
      toast.error(
        "You are offline. Creating Dropbox folders is disabled for now.",
      );
      return;
    }

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
    if (!isOnline) {
      toast.error("You are offline. Folder browsing is paused.");
      return;
    }

    setCurrentBrowsePath(folder.path);
    setSelectedUploadPath(folder.path);
    await fetchChildFolders(folder.path);
  };

  const goUpOneLevel = async () => {
    if (!isOnline) {
      toast.error("You are offline. Folder browsing is paused.");
      return;
    }

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

  const getCameraLensPriority = (label: string, index: number) => {
    const lowerLabel = label.toLowerCase();

    // Phone browsers do not use one universal name for lenses.
    // Pixel/Samsung/Chrome may expose ultra-wide as "camera 0", "back 0",
    // "rear 0", "wide", "macro", or just another generic rear camera.
    if (
      /ultra|ultrawide|ultra wide|wide angle|wide-angle|0\.5|0,5|0\.6|0,6|macro/.test(
        lowerLabel,
      )
    ) {
      return 0;
    }

    if (
      /\b(camera|back|rear|environment|lens)\s*0\b|\b0\s*(camera|back|rear|lens)\b/.test(
        lowerLabel,
      )
    ) {
      return 1;
    }

    if (/wide/.test(lowerLabel) && !/tele/.test(lowerLabel)) {
      return 2;
    }

    if (
      /\b(camera|back|rear|environment|lens)\s*1\b|\b1\s*(camera|back|rear|lens)\b/.test(
        lowerLabel,
      )
    ) {
      return 3;
    }

    return 10 + index;
  };

  const getAvailableBackCameras = async (): Promise<CameraFacingDevice[]> => {
    if (!navigator.mediaDevices?.enumerateDevices) return [];

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter(
      (device) => device.kind === "videoinput",
    );

    return videoInputs
      .map((device, index) => {
        const label = device.label || `Camera ${index + 1}`;
        const lowerLabel = label.toLowerCase();

        const looksFrontFacing = /front|user|facetime|selfie/.test(lowerLabel);
        const looksBackFacing =
          /back|rear|environment|wide|ultra|tele|macro/.test(lowerLabel) ||
          (!looksFrontFacing && videoInputs.length <= 2
            ? index > 0
            : !looksFrontFacing);
        const looksUltraWideOrMacro = getCameraLensPriority(label, index) <= 2;

        return {
          deviceId: device.deviceId,
          label,
          isBackCamera: looksBackFacing,
          isUltraWide: looksUltraWideOrMacro,
        };
      })
      .filter(
        (device) =>
          device.isBackCamera ||
          !/front|user|facetime|selfie/i.test(device.label),
      );
  };

  const getWideCameraCandidates = (
    devices: CameraFacingDevice[],
    activeDeviceId: string,
    standardDeviceId: string,
  ) => {
    return devices
      .filter(
        (device) =>
          device.deviceId &&
          device.deviceId !== activeDeviceId &&
          device.deviceId !== standardDeviceId,
      )
      .sort((a, b) => {
        const aIndex = devices.findIndex(
          (device) => device.deviceId === a.deviceId,
        );
        const bIndex = devices.findIndex(
          (device) => device.deviceId === b.deviceId,
        );
        return (
          getCameraLensPriority(a.label, aIndex) -
          getCameraLensPriority(b.label, bIndex)
        );
      });
  };

  const getFallbackWideCameraDevice = (
    devices: CameraFacingDevice[],
    activeDeviceId: string,
    standardDeviceId: string,
  ) =>
    getWideCameraCandidates(devices, activeDeviceId, standardDeviceId)[0] ||
    null;

  const getVideoTrackCapabilities = (track?: MediaStreamTrack) => {
    return track?.getCapabilities?.() as MediaTrackCapabilities & {
      zoom?: { min?: number; max?: number; step?: number };
      torch?: boolean;
    };
  };

  const refreshCameraDeviceInfo = async (
    activeDeviceId: string,
    track?: MediaStreamTrack,
  ) => {
    const devices = await getAvailableBackCameras();
    const standardBackDevice =
      devices.find((device) => !device.isUltraWide && device.isBackCamera) ||
      devices.find((device) => !device.isUltraWide) ||
      devices[0];
    const wideOrAlternateDevice = getFallbackWideCameraDevice(
      devices,
      activeDeviceId,
      standardBackDevice?.deviceId || "",
    );

    setCameraDevices(devices);
    setUltraWideCameraDeviceId(wideOrAlternateDevice?.deviceId || "");
    setStandardBackCameraDeviceId(standardBackDevice?.deviceId || "");
    setActiveCameraDeviceId(activeDeviceId);

    const activeDevice = devices.find(
      (device) => device.deviceId === activeDeviceId,
    );
    setCameraLensLabel(
      activeDevice?.isUltraWide ? "0.6x wide/macro lens" : "Rear camera",
    );

    const capabilities = getVideoTrackCapabilities(track);
    const zoomOptions = new Set<number>();

    // Always show 0.6x. If the browser cannot expose that lens, applyCameraZoom
    // will try every safe fallback and then show a clear message instead of hiding it.
    zoomOptions.add(0.6);
    zoomOptions.add(1);

    const maxZoom = capabilities?.zoom?.max ?? 1;
    [2, 3].forEach((zoom) => {
      if (zoom <= maxZoom) {
        zoomOptions.add(zoom);
      }
    });

    setCameraZoomOptions(Array.from(zoomOptions).sort((a, b) => a - b));
    setTorchSupported(Boolean(capabilities?.torch));
  };

  const startCamera = async (
    preferredDeviceId?: string,
    preferredZoom = 1,
  ): Promise<boolean> => {
    if (!selectedUploadPath) {
      toast.error("Select an upload folder first");
      return false;
    }

    try {
      // Stop the existing stream before switching lenses. This is required on many phones.
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      const videoConstraints: MediaTrackConstraints = preferredDeviceId
        ? {
            deviceId: { exact: preferredDeviceId },
            width: { ideal: SMART_IMAGE_MAX_EDGE_PX },
            height: { ideal: SMART_IMAGE_MAX_EDGE_PX },
          }
        : {
            facingMode: { ideal: "environment" },
            width: { ideal: SMART_IMAGE_MAX_EDGE_PX },
            height: { ideal: SMART_IMAGE_MAX_EDGE_PX },
          };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const [videoTrack] = stream.getVideoTracks();
      const settings = videoTrack?.getSettings?.();
      const activeDeviceId = settings?.deviceId || preferredDeviceId || "";

      await refreshCameraDeviceInfo(activeDeviceId, videoTrack);

      setTorchOn(false);
      setCameraActive(true);

      if (preferredZoom >= 1) {
        const capabilities = getVideoTrackCapabilities(videoTrack);
        if (capabilities?.zoom?.max && preferredZoom <= capabilities.zoom.max) {
          await videoTrack.applyConstraints({
            advanced: [{ zoom: preferredZoom } as MediaTrackConstraintSet],
          });
        }
      }

      setCameraZoom(preferredZoom);
      return true;
    } catch {
      toast.error("Camera access denied or unavailable");
      return false;
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
    setCameraZoom(1);
    setCameraZoomOptions([]);
    setCameraDevices([]);
    setActiveCameraDeviceId("");
    setUltraWideCameraDeviceId("");
    setStandardBackCameraDeviceId("");
    setCameraLensLabel("Rear camera");
    setTorchSupported(false);
    setTorchOn(false);
  };

  const applyCameraZoom = async (zoom: number) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    const capabilities = getVideoTrackCapabilities(track);

    if (zoom < 1) {
      // Some browsers support below-1 zoom directly. Try that first.
      if ((capabilities?.zoom?.min ?? 1) <= zoom) {
        try {
          await track.applyConstraints({
            advanced: [{ zoom } as MediaTrackConstraintSet],
          });
          setCameraZoom(zoom);
          setCameraLensLabel("0.6x wide/macro lens");
          return;
        } catch {
          // Continue to physical-lens switching below.
        }
      }

      // Most phones expose 0.6x as a separate physical camera. The hard part is
      // that browsers often label it generically, so we try every safe rear-lens
      // candidate instead of depending on the name containing "0.6" or "ultra".
      const devices = await getAvailableBackCameras();
      const candidates = getWideCameraCandidates(
        devices,
        activeCameraDeviceId,
        standardBackCameraDeviceId,
      );

      const orderedCandidates = [
        ...candidates.filter(
          (device) => device.deviceId === ultraWideCameraDeviceId,
        ),
        ...candidates.filter(
          (device) => device.deviceId !== ultraWideCameraDeviceId,
        ),
      ];

      for (const candidate of orderedCandidates) {
        const switched = await startCamera(candidate.deviceId, 0.6);
        if (switched) {
          setCameraLensLabel(
            candidate.isUltraWide
              ? "0.6x wide/macro lens"
              : `Alternate rear lens: ${candidate.label}`,
          );
          setCameraZoom(0.6);
          return;
        }
      }

      toast.error(
        "This browser is not exposing a separate 0.6x/ultra-wide lens. I tried the available rear camera devices, but only the normal rear camera is available to the web app.",
      );
      return;
    }

    if (
      Math.abs(zoom - 1) < 0.05 &&
      standardBackCameraDeviceId &&
      activeCameraDeviceId !== standardBackCameraDeviceId
    ) {
      await startCamera(standardBackCameraDeviceId, 1);
      setCameraLensLabel("Rear camera");
      return;
    }

    try {
      await track.applyConstraints({
        advanced: [{ zoom } as MediaTrackConstraintSet],
      });
      setCameraZoom(zoom);
      setCameraLensLabel("Rear camera");
    } catch {
      toast.error("Zoom is not supported on this selected camera/browser");
    }
  };

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as MediaTrackConstraintSet],
      });
      setTorchOn((prev) => !prev);
    } catch {
      toast.error(
        "Flash/torch is not supported on this selected camera/browser",
      );
    }
  };

  const queuePhotoBlob = async ({
    blob,
    source,
    originalFileName,
  }: {
    blob: Blob;
    source: PhotoSource;
    originalFileName?: string;
  }) => {
    if (!selectedUploadPath) {
      toast.error("Select an upload folder first");
      return;
    }

    if (isQueueFull) {
      toast.error(
        `Upload queue is full. Clear uploaded items or wait for uploads to finish. Limit: ${MAX_QUEUE_ITEMS}`,
      );
      return;
    }

    const id = crypto.randomUUID();
    const extension =
      source === "gallery" && originalFileName
        ? getFileExtensionFromName(originalFileName)
        : "jpg";

    const fileName = `${getLocalTimestampForFile()}__${photoTakerName}__${source}.${extension}`;

    const item: PhotoQueueItem = {
      id,
      fileName,
      folderPath: selectedUploadPath,
      blob,
      status: "pending",
      createdAt: Date.now(),
      attempts: 0,
      source,
      originalFileName,
    };

    const nextQueue = [...queueRef.current, item];
    syncQueueState(nextQueue);
    await saveQueueItem(item);

    if (
      nextQueue.filter((i) => i.status !== "uploaded").length >=
      QUEUE_WARNING_THRESHOLD
    ) {
      toast.error(
        "Queue is getting large. Consider waiting for uploads to catch up or saving a local backup.",
      );
    }

    processUploadQueue();
  };

  const compressImageBlob = async (fileOrBlob: File | Blob) => {
    const inputType =
      fileOrBlob instanceof File ? fileOrBlob.type : fileOrBlob.type;

    if (fileOrBlob instanceof File && !inputType.startsWith("image/")) {
      throw new Error(`${fileOrBlob.name} is not an image file`);
    }

    const imageUrl = URL.createObjectURL(fileOrBlob);

    try {
      const image = new Image();
      image.src = imageUrl;
      await image.decode();

      const originalWidth = image.naturalWidth;
      const originalHeight = image.naturalHeight;
      const largestSide = Math.max(originalWidth, originalHeight);
      const scale =
        largestSide > SMART_IMAGE_MAX_EDGE_PX
          ? SMART_IMAGE_MAX_EDGE_PX / largestSide
          : 1;

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(originalWidth * scale);
      canvas.height = Math.round(originalHeight * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not supported");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const compressedBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", SMART_IMAGE_QUALITY),
      );

      return compressedBlob || fileOrBlob;
    } catch {
      return fileOrBlob;
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  };

  const compressGalleryImage = async (file: File) => compressImageBlob(file);

  const handleGallerySelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (!selectedUploadPath) {
      toast.error("Select an upload folder first");
      event.target.value = "";
      return;
    }

    if (files.length === 0) return;

    const availableSlots = MAX_QUEUE_ITEMS - activeQueueCount;

    if (availableSlots <= 0) {
      toast.error(`Upload queue is full. Limit: ${MAX_QUEUE_ITEMS}`);
      event.target.value = "";
      return;
    }

    const filesToQueue = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      toast.error(
        `Only ${availableSlots} photo(s) were queued because the queue limit is ${MAX_QUEUE_ITEMS}.`,
      );
    }

    try {
      for (const file of filesToQueue) {
        const blob = await compressGalleryImage(file);

        await queuePhotoBlob({
          blob,
          source: "gallery",
          originalFileName: file.name,
        });
      }

      toast.success(`${filesToQueue.length} gallery photo(s) queued`);
    } catch (error) {
      handleError(error, "Failed to queue gallery photo(s)");
    } finally {
      event.target.value = "";
    }
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

      const rawBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.95),
      );

      const blob = rawBlob ? await compressImageBlob(rawBlob) : null;

      if (!blob) throw new Error("Failed to capture photo");

      await queuePhotoBlob({
        blob,
        source: "camera",
      });

      toast.success("Photo captured and queued");
    } catch (error) {
      handleError(error, "Failed to capture photo");
    }
  };

  /* ─────────────────────────────
     Background upload queue
  ───────────────────────────── */

  const uploadQueueItem = async (item: PhotoQueueItem) => {
    if (!navigator.onLine) {
      throw new Error("Device is offline");
    }

    await updateQueueItem(item.id, {
      status: "uploading",
      attempts: item.attempts + 1,
      error: undefined,
    });

    const formData = new FormData();
    formData.append("photo", item.blob, item.fileName);
    formData.append("fileName", item.fileName);
    formData.append("folderPath", item.folderPath);
    formData.append("source", item.source || "camera");

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
      dropboxPath: data.dropboxPath,
      fileName: data.fileName || item.fileName,
      error: undefined,
    });

    if (
      currentBrowsePath &&
      item.folderPath.toLowerCase() === currentBrowsePath.toLowerCase()
    ) {
      fetchGalleryFiles(currentBrowsePath);
    }
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
    if (!isOnline) {
      toast.error(
        "You are offline. Retry will be available when connection returns.",
      );
      return;
    }

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

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const removeQueueItem = async (item: PhotoQueueItem) => {
    const isUploadedToDropbox = item.status === "uploaded" && item.dropboxPath;

    if (isUploadedToDropbox) {
      const confirmed = window.confirm(
        "Delete this uploaded photo from Dropbox? This only works for photos you uploaded unless you are admin.",
      );

      if (!confirmed) return;

      const res = await fetch("/api/dropbox/delete-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dropboxPath: item.dropboxPath }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to delete photo",
        );
      }

      toast.success("Photo deleted from Dropbox");
    } else {
      toast.success("Photo removed from local queue");
    }

    await deleteQueueItem(item.id);
    syncQueueState(
      queueRef.current.filter((queueItem) => queueItem.id !== item.id),
    );
  };

  const exportLocalBackupZip = async () => {
    const itemsToBackup = queueRef.current.filter(
      (item) => item.status !== "uploaded",
    );

    if (itemsToBackup.length === 0) {
      toast.error("No active queued photos to back up");
      return;
    }

    try {
      const JSZipModule = await import("jszip");
      const JSZip = JSZipModule.default;
      const zip = new JSZip();

      const batchName = `${LOCAL_BACKUP_BATCH_PREFIX}_${getLocalTimestampForBatch()}_${getSafeBackupNamePart(
        selectedUploadPath || itemsToBackup[0]?.folderPath || "selected-folder",
      )}`;

      const photosFolder = zip.folder(batchName);
      const manifest = itemsToBackup.map((item, index) => {
        const numberedFileName = `${String(index + 1).padStart(
          3,
          "0",
        )}_${item.fileName}`;

        photosFolder?.file(numberedFileName, item.blob);

        return {
          backupFileName: numberedFileName,
          originalAppFileName: item.fileName,
          originalGalleryFileName: item.originalFileName || null,
          source: item.source || "camera",
          targetDropboxFolderPath: item.folderPath,
          queueStatus: item.status,
          attempts: item.attempts,
          capturedOrSelectedAt: new Date(item.createdAt).toISOString(),
          localBackupCreatedAt: new Date().toISOString(),
          lastError: item.error || null,
        };
      });

      photosFolder?.file(
        "backup-manifest.json",
        JSON.stringify(
          {
            backupName: batchName,
            backupCreatedAt: new Date().toISOString(),
            photoCount: itemsToBackup.length,
            note: "These photos were exported from the ActFast Field Photo Upload offline queue. Dropbox upload can still continue later from the app queue.",
            items: manifest,
          },
          null,
          2,
        ),
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `${batchName}.zip`);

      const backupSavedAt = Date.now();
      const updated = queueRef.current.map((item) =>
        item.status !== "uploaded"
          ? { ...item, localBackupSavedAt: backupSavedAt }
          : item,
      );

      syncQueueState(updated);
      await Promise.all(updated.map((item) => saveQueueItem(item)));

      toast.success("Local ZIP backup created");
    } catch (error) {
      handleError(
        error,
        "Failed to create local ZIP backup. Make sure jszip is installed.",
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getRelativeFolderParts = () =>
    getRelativeBrowsePath().split("/").filter(Boolean);

  const getBreadcrumbItems = () => {
    if (!selectedProjectPath) return [];

    const projectName =
      selectedProjectPath.split("/").filter(Boolean).pop() || "Project";
    const relativeParts = getRelativeFolderParts();
    const items = [{ label: projectName, path: selectedProjectPath }];

    relativeParts.reduce((runningPath, part) => {
      const nextPath = `${runningPath}/${part}`;
      items.push({ label: part, path: nextPath });
      return nextPath;
    }, selectedProjectPath);

    return items;
  };

  const findChildFolderByName = (folderName: string) =>
    childFolders.find(
      (folder) => folder.name.toLowerCase() === folderName.toLowerCase(),
    );

  const openKnownFolder = async (folderName: string) => {
    const folder = findChildFolderByName(folderName);
    if (!folder) {
      toast.error(`${folderName} is not available at this level`);
      return;
    }
    await openFolder(folder);
  };

  const openDirectProjectPhotoFolder = async (
    relativePath: string,
    label: string,
  ) => {
    if (!selectedProjectPath) {
      toast.error("Select a project first");
      return;
    }

    const directPath = `${selectedProjectPath}/${relativePath}`;
    await openFolder({ name: label, path: directPath });
  };

  const getSafeRoomFolderParentPath = () => {
    if (!selectedProjectPath || !currentBrowsePath) return "";

    const relativeParts = getRelativeFolderParts();

    if (relativeParts[0] === "1-PICTURES") {
      return `${selectedProjectPath}/1-PICTURES`;
    }

    if (
      relativeParts[0] === "0-CONTENTS-WET-PICS" &&
      relativeParts[1] === "2 NR CONTENT PHOTOS"
    ) {
      return `${selectedProjectPath}/0-CONTENTS-WET-PICS/2 NR CONTENT PHOTOS`;
    }

    return currentBrowsePath;
  };

  const createRoomFolderSafely = async () => {
    if (!isOnline) {
      toast.error(
        "You are offline. Creating Dropbox folders is disabled for now.",
      );
      return;
    }

    const safeParentPath = getSafeRoomFolderParentPath();

    if (!safeParentPath) {
      toast.error("Select a project and photo folder first");
      return;
    }

    if (!newFolderName.trim()) {
      toast.error("Enter a room or area name");
      return;
    }

    try {
      const res = await fetch("/api/dropbox/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentPath: safeParentPath,
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
      setCurrentBrowsePath(data.folder.path);
      setSelectedUploadPath(data.folder.path);
      await fetchChildFolders(data.folder.path);
      toast.success("Room folder created and selected");
    } catch (error) {
      handleError(error, "Failed to create room folder");
    }
  };

  const deleteGalleryPhoto = async (photo: DropboxImageFile) => {
    if (!photo.canDelete) {
      toast.error("You can only delete your own photos unless you are admin");
      return;
    }

    const confirmed = window.confirm(
      `Delete this uploaded photo from Dropbox?\n\n${photo.name}`,
    );

    if (!confirmed) return;

    try {
      const res = await fetch("/api/dropbox/delete-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dropboxPath: photo.path }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to delete photo",
        );
      }

      setSelectedGalleryPhoto(null);
      await fetchGalleryFiles(currentBrowsePath);
      toast.success("Photo deleted");
    } catch (error) {
      handleError(error, "Failed to delete photo");
    }
  };

  const handleCameraTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2) return;

    const [firstTouch, secondTouch] = Array.from(event.touches);
    pinchDistanceRef.current = Math.hypot(
      firstTouch.clientX - secondTouch.clientX,
      firstTouch.clientY - secondTouch.clientY,
    );
  };

  const handleCameraTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || pinchDistanceRef.current === null) return;

    const [firstTouch, secondTouch] = Array.from(event.touches);
    const nextDistance = Math.hypot(
      firstTouch.clientX - secondTouch.clientX,
      firstTouch.clientY - secondTouch.clientY,
    );

    const difference = nextDistance - pinchDistanceRef.current;

    if (Math.abs(difference) < 18) return;

    const minZoom = cameraZoomOptions[0] || 1;
    const maxZoom = cameraZoomOptions[cameraZoomOptions.length - 1] || 3;
    const nextZoom = Math.min(
      Math.max(cameraZoom + (difference > 0 ? 0.25 : -0.25), minZoom),
      maxZoom,
    );

    pinchDistanceRef.current = nextDistance;
    applyCameraZoom(Number(nextZoom.toFixed(2)));
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
    <div className="min-h-screen bg-slate-100 px-3 py-16 sm:px-4 lg:px-6">
      <Navbar />

      <div className="mx-auto mt-8 max-w-7xl">
        <div className="mb-4 rounded-2xl bg-white p-4 shadow sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Field Photo Upload
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Pick a project, choose the correct photo folder, capture photos,
                and review uploaded images from the folder gallery.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Photo taker:{" "}
                <span className="font-medium">{photoTakerName}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4 lg:min-w-[520px]">
              <div className="rounded-xl bg-slate-100 p-3">
                <div className="text-xs text-slate-500">Connection</div>
                <div
                  className={
                    isOnline
                      ? "font-bold text-green-600"
                      : "font-bold text-red-600"
                  }
                >
                  {isOnline ? "Online" : "Offline"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 p-3">
                <div className="text-xs text-slate-500">Pending</div>
                <div className="text-xl font-bold text-yellow-600">
                  {pendingCount}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 p-3">
                <div className="text-xs text-slate-500">Uploading</div>
                <div className="text-xl font-bold text-blue-600">
                  {uploadingCount}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 p-3">
                <div className="text-xs text-slate-500">Uploaded</div>
                <div className="text-xl font-bold text-green-600">
                  {uploadedCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {debugError && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <div className="font-bold">Debug Error:</div>
            <div className="mt-1 whitespace-pre-wrap break-words">
              {debugError}
            </div>
          </div>
        )}

        {!isOnline && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            You are offline. Dropbox browsing, deleting, and uploading are
            paused. Already queued photos remain stored on this device.
          </div>
        )}

        {shouldShowLocalBackupReminder && (
          <div className="mb-4 rounded-xl border border-orange-300 bg-orange-50 p-4 text-sm text-orange-900">
            <div className="font-bold">Local backup recommended</div>
            <p className="mt-1">
              Some photos have been waiting locally for a while. Save a ZIP
              backup to this device so the photos are not only stored in browser
              storage.
            </p>
            <button
              type="button"
              onClick={exportLocalBackupZip}
              className="mt-3 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
            >
              Save Local ZIP Backup ({activeItemsWithoutLocalBackup.length})
            </button>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
          <div className="space-y-4">
            <section className="rounded-2xl bg-white p-4 shadow sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">1. Project Folder</h2>
                <button
                  type="button"
                  onClick={fetchProjectFolders}
                  disabled={!isOnline}
                  className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white hover:bg-slate-900 disabled:bg-slate-400"
                >
                  Refresh
                </button>
              </div>

              {isAdmin && (
                <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    disabled={!isOnline}
                    checked={showOnlyProjectFolders}
                    onChange={(e) =>
                      setShowOnlyProjectFolders(e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Show Only Project Folders
                </label>
              )}

              {!isAdmin && (
                <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                  You will only see valid project folders and YEAR-NO CLAIMS
                  folders.
                </div>
              )}

              <div className="relative">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Search and select project
                </label>
                <input
                  value={projectSearchTerm}
                  disabled={!isOnline}
                  onFocus={() => setProjectDropdownOpen(true)}
                  onChange={(e) => {
                    setProjectSearchTerm(e.target.value);
                    setProjectDropdownOpen(true);
                  }}
                  placeholder={
                    selectedProjectPath
                      ? selectedProjectPath.split("/").filter(Boolean).pop()
                      : "Type project name or number..."
                  }
                  className="w-full rounded-xl border p-3 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setProjectDropdownOpen((prev) => !prev)}
                  disabled={!isOnline}
                  className="absolute bottom-2 right-2 rounded-lg bg-slate-100 px-2 py-1 text-sm text-slate-600 disabled:opacity-50"
                >
                  ▼
                </button>
                {projectDropdownOpen && (
                  <div className="absolute z-30 mt-2 max-h-80 w-full overflow-auto rounded-xl border bg-white shadow-xl">
                    {visibleProjectFolders.length === 0 ? (
                      <div className="p-3 text-sm text-slate-500">
                        No matching folders.
                      </div>
                    ) : (
                      visibleProjectFolders.map((folder) => (
                        <button
                          key={folder.path}
                          type="button"
                          onClick={() => {
                            setSelectedProjectPath(folder.path);
                            setProjectSearchTerm(folder.name);
                            setProjectDropdownOpen(false);
                          }}
                          className={
                            "block w-full px-3 py-3 text-left text-sm hover:bg-blue-50 " +
                            (selectedProjectPath === folder.path
                              ? "bg-blue-100 font-semibold text-blue-900"
                              : "text-slate-800")
                          }
                        >
                          <div>📁 {folder.name}</div>
                          <div className="mt-0.5 break-all text-xs text-slate-400">
                            {folder.path}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedProjectPath && (
                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800">
                  Selected project:
                  <div className="break-all font-semibold">
                    {selectedProjectPath}
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="mt-4 border-t pt-4">
                  <div className="mb-2 text-sm font-semibold text-slate-800">
                    Admin: create simple root folder
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newProjectName}
                      disabled={!isOnline}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Folder name"
                      className="w-full rounded-lg border p-3"
                    />
                    <button
                      type="button"
                      onClick={createProjectFolder}
                      disabled={!isOnline}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-slate-400"
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}
            </section>

            {isAdmin && (
              <section className="rounded-2xl bg-white p-4 shadow sm:p-5">
                <button
                  type="button"
                  onClick={() => setTemplateSectionOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div>
                    <h2 className="text-lg font-semibold">
                      ➕ Create Project Folder from Template
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Admin tool — minimized by default to avoid accidental
                      folder creation.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {templateSectionOpen ? "Hide" : "Show"}
                  </span>
                </button>

                {templateSectionOpen && (
                  <div className="mt-4 border-t pt-4">
                    <p className="mb-3 text-sm text-slate-600">
                      Enter only the project name. The system will copy{" "}
                      <span className="font-medium">
                        {PROJECT_TEMPLATE_PATH}
                      </span>{" "}
                      using the next project number.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        value={templateProjectName}
                        onChange={(e) => setTemplateProjectName(e.target.value)}
                        disabled={!isOnline}
                        placeholder="Example: SMITH"
                        className="w-full rounded-lg border p-3"
                      />
                      <button
                        type="button"
                        onClick={createProjectFolderFromTemplate}
                        disabled={
                          !isOnline ||
                          !nextProjectFolderName ||
                          isCreatingTemplateProject
                        }
                        className="rounded-lg bg-purple-600 px-5 py-3 font-medium text-white hover:bg-purple-700 disabled:bg-slate-400"
                      >
                        {isCreatingTemplateProject ? "Creating..." : "Create"}
                      </button>
                    </div>
                    <div className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                      <div className="text-slate-500">
                        Generated folder name:
                      </div>
                      <div className="break-all font-semibold text-slate-900">
                        {nextProjectFolderName ||
                          "Enter a project name to preview"}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            <section className="rounded-2xl bg-white p-4 shadow sm:p-5">
              <h2 className="mb-3 text-lg font-semibold">2. Folder Browser</h2>
              {!selectedProjectPath ? (
                <p className="text-sm text-slate-500">
                  Select a project folder first.
                </p>
              ) : (
                <>
                  <div className="sticky top-16 z-20 mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm shadow-sm backdrop-blur sm:top-20">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-blue-700">
                        You are here
                      </div>
                      <div className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
                        Current photo folder
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getBreadcrumbItems().map((item, index) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() =>
                            openFolder({ name: item.label, path: item.path })
                          }
                          className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-blue-100 hover:bg-blue-100"
                        >
                          {index > 0 ? "/ " : ""}
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 break-all rounded-xl bg-white/80 p-3 text-xs font-medium text-slate-700 ring-1 ring-blue-100">
                      {currentBrowsePath}
                    </div>
                  </div>
                  <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={goUpOneLevel}
                      disabled={
                        !isOnline ||
                        currentBrowsePath.toLowerCase() ===
                          selectedProjectPath.toLowerCase()
                      }
                      className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-400"
                    >
                      ← Back One Level
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryOpen(true)}
                      disabled={!currentBrowsePath}
                      className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-slate-400"
                    >
                      Open Gallery ({galleryFiles.length})
                    </button>
                  </div>
                  <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                    <div className="font-semibold">Folder safety tip</div>
                    <p className="mt-1">
                      For rooms like Living Room or Bedroom, use “Create Room /
                      Area Folder”. It will create the folder under the main
                      photo folder instead of accidentally nesting it inside
                      another room.
                    </p>
                  </div>
                  <div className="mb-3 rounded-xl border p-3">
                    <div className="mb-2 text-sm font-semibold text-slate-800">
                      Quick photo destinations
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          openDirectProjectPhotoFolder(
                            "1-PICTURES",
                            "1-PICTURES",
                          )
                        }
                        disabled={!isOnline || !selectedProjectPath}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-slate-300"
                      >
                        Open 1-PICTURES
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openDirectProjectPhotoFolder(
                            "0-CONTENTS-WET-PICS/2 NR CONTENT PHOTOS",
                            "2 NR CONTENT PHOTOS",
                          )
                        }
                        disabled={!isOnline || !selectedProjectPath}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-slate-300"
                      >
                        Open 0-CONTENTS-WET-PICS / 2 NR CONTENT PHOTOS
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      The NR content photo button jumps directly to the approved
                      folder. Non-admin users will not browse the parent
                      0-CONTENTS-WET-PICS folder.
                    </p>
                  </div>
                  <div className="mb-3 rounded-xl border p-3">
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Create room / area folder
                    </label>
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <input
                        value={newFolderName}
                        disabled={!isOnline}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Example: Living Room"
                        className="w-full rounded-lg border p-3"
                      />
                      <button
                        type="button"
                        onClick={createRoomFolderSafely}
                        disabled={!isOnline}
                        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
                      >
                        Create Room
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Safe parent:{" "}
                      <span className="break-all font-medium">
                        {getSafeRoomFolderParentPath() ||
                          "Select a photo folder first"}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-xl border">
                    <div className="border-b bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                      Folders here
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
                            disabled={!isOnline}
                            className="flex w-full items-center justify-between px-3 py-3 text-left hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-xs">
                      <div className="font-medium text-green-800">
                        Photos will upload to the folder you are browsing:
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

          <div className="space-y-4">
            <section
              className={
                cameraActive
                  ? "fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-black text-white"
                  : "overflow-hidden rounded-2xl bg-white shadow"
              }
            >
              <div
                className={
                  cameraActive
                    ? "absolute left-0 right-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-3 text-white sm:p-4"
                    : "flex items-center justify-between border-b p-4"
                }
              >
                <div>
                  <h2
                    className={
                      cameraActive
                        ? "text-sm font-semibold sm:text-base"
                        : "text-lg font-semibold"
                    }
                  >
                    3. Camera
                  </h2>
                  <p
                    className={
                      cameraActive
                        ? "text-[11px] text-white/70 sm:text-xs"
                        : "text-xs text-slate-500"
                    }
                  >
                    {cameraActive
                      ? "Camera mode — close to return to the page."
                      : "Designed to feel closer to a phone camera app."}
                  </p>
                </div>
                {cameraActive && (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/25"
                  >
                    Close
                  </button>
                )}
              </div>

              <div
                className={
                  cameraActive
                    ? "relative min-h-0 flex-1 touch-none bg-black"
                    : "relative bg-black"
                }
                onTouchStart={handleCameraTouchStart}
                onTouchMove={handleCameraTouchMove}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={
                    cameraActive
                      ? "h-full w-full object-cover"
                      : "h-[55vh] min-h-[360px] w-full object-contain landscape:h-[72vh]"
                  }
                />
                <canvas ref={canvasRef} className="hidden" />
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center text-white">
                    <div>
                      <div className="text-4xl">📷</div>
                      <div className="mt-2 text-lg font-semibold">
                        Camera is closed
                      </div>
                      <p className="mt-1 text-sm text-white/70">
                        Select a folder, then open the camera.
                      </p>
                    </div>
                  </div>
                )}
                {cameraActive && (
                  <div className="pointer-events-none absolute inset-0 z-20 p-3 pt-20 sm:p-4 sm:pt-24">
                    <div className="pointer-events-auto flex items-start justify-between gap-2">
                      <div className="max-w-[70vw] rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur sm:text-xs">
                        <span className="block truncate">
                          {cameraLensLabel}
                          {cameraDevices.length > 1
                            ? ` • ${cameraDevices.length} lenses detected`
                            : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleTorch}
                        disabled={!torchSupported}
                        className="rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur disabled:opacity-45 sm:px-4 sm:py-2 sm:text-sm"
                      >
                        {torchOn ? "⚡ On" : "⚡ Flash"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div
                className={
                  cameraActive
                    ? "absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/90 to-transparent px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 sm:px-8"
                    : "grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3"
                }
              >
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    disabled={!selectedUploadPath}
                    className="rounded-xl bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700 disabled:bg-slate-400"
                  >
                    Open Camera
                  </button>
                ) : (
                  <div className="mx-auto grid w-full max-w-md gap-3">
                    <div className="mx-auto flex max-w-full flex-wrap justify-center gap-2 rounded-full bg-black/45 px-2.5 py-2 backdrop-blur">
                      {(cameraZoomOptions.length > 0
                        ? cameraZoomOptions
                        : [0.6, 1]
                      ).map((zoom) => (
                        <button
                          key={zoom}
                          type="button"
                          onClick={() => applyCameraZoom(zoom)}
                          className={
                            "rounded-full px-3 py-1.5 text-xs font-black shadow-sm transition sm:px-4 sm:text-sm " +
                            (Math.abs(cameraZoom - zoom) < 0.05
                              ? "scale-110 bg-white text-black"
                              : "bg-white/15 text-white hover:bg-white/25")
                          }
                        >
                          {zoom}x
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={!selectedUploadPath || isQueueFull}
                        className="justify-self-end rounded-full bg-white/15 px-3 py-2 text-xs font-bold text-white backdrop-blur hover:bg-white/25 disabled:opacity-40 sm:px-4 sm:text-sm"
                      >
                        Gallery
                      </button>
                      <button
                        type="button"
                        onClick={capturePhotoToQueue}
                        disabled={isQueueFull}
                        className="h-16 w-16 rounded-full border-4 border-white bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.18)] transition hover:scale-105 disabled:opacity-50 sm:h-20 sm:w-20"
                        aria-label="Take photo"
                      >
                        <span className="sr-only">
                          {isQueueFull ? "Queue Full" : "Take Photo"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryOpen(true)}
                        disabled={!currentBrowsePath}
                        className="justify-self-start rounded-full bg-white/15 px-3 py-2 text-xs font-bold text-white backdrop-blur hover:bg-white/25 disabled:opacity-40 sm:px-4 sm:text-sm"
                      >
                        Folder
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGallerySelect}
                  className="hidden"
                />
                {!cameraActive && (
                  <>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      disabled={!selectedUploadPath || isQueueFull}
                      className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:bg-slate-400"
                    >
                      Upload from Phone Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryOpen(true)}
                      disabled={!currentBrowsePath}
                      className="rounded-xl bg-slate-800 px-5 py-3 font-medium text-white hover:bg-slate-900 disabled:bg-slate-400"
                    >
                      View Folder Gallery
                    </button>
                  </>
                )}
              </div>

              {selectedUploadPath && !cameraActive && (
                <div className="border-t bg-slate-50 p-4 text-xs text-slate-600">
                  Upload destination:{" "}
                  <span className="break-all font-medium">
                    {selectedUploadPath}
                  </span>
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white p-4 shadow sm:p-5">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Folder Gallery</h2>
                  <p className="text-sm text-slate-600">
                    {isAdmin
                      ? "Admin view: photos in the folder you are browsing."
                      : "Your uploaded photos in the folder you are browsing."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    currentBrowsePath && fetchGalleryFiles(currentBrowsePath)
                  }
                  disabled={!isOnline || !currentBrowsePath || loadingGallery}
                  className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-400"
                >
                  {loadingGallery ? "Loading..." : "Refresh Gallery"}
                </button>
              </div>
              {!currentBrowsePath ? (
                <p className="text-sm text-slate-500">Select a folder first.</p>
              ) : galleryFiles.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
                  No image files found in this folder.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {pagedGalleryFiles.map((photo) => (
                      <button
                        key={photo.path}
                        type="button"
                        onClick={() => {
                          setSelectedGalleryPhoto(photo);
                          setGalleryOpen(true);
                        }}
                        className="group overflow-hidden rounded-xl border bg-slate-50 text-left shadow-sm hover:ring-2 hover:ring-blue-400"
                      >
                        {photo.previewUrl ? (
                          <img
                            src={photo.previewUrl}
                            alt={photo.name}
                            className="aspect-square w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-square items-center justify-center text-3xl">
                            🖼️
                          </div>
                        )}
                        <div className="p-2">
                          <div className="truncate text-xs font-medium text-slate-800">
                            {photo.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {photo.owner || "unknown"} •{" "}
                            {formatFileSize(photo.size)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {galleryTotalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryPage((page) => Math.max(1, page - 1))
                        }
                        disabled={galleryPage === 1}
                        className="rounded-lg bg-slate-200 px-3 py-2 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-slate-600">
                        Page {galleryPage} of {galleryTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryPage((page) =>
                            Math.min(galleryTotalPages, page + 1),
                          )
                        }
                        disabled={galleryPage === galleryTotalPages}
                        className="rounded-lg bg-slate-200 px-3 py-2 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </div>

        <section className="mt-4 rounded-2xl bg-white p-4 shadow sm:p-5">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Upload Queue</h2>
              <p className="text-sm text-slate-600">
                Failed photos retry automatically. Use the queue to review,
                retry, delete, or make a local backup.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={retryFailedUploads}
                disabled={!isOnline || failedCount === 0}
                className="rounded-lg bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:bg-slate-400"
              >
                Retry Failed ({failedCount})
              </button>
              <button
                type="button"
                onClick={clearUploadedItems}
                disabled={uploadedCount === 0}
                className="rounded-lg bg-slate-600 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:bg-slate-400"
              >
                Clear Uploaded
              </button>
              <button
                type="button"
                onClick={exportLocalBackupZip}
                disabled={activeQueueItems.length === 0}
                className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:bg-slate-400"
              >
                Backup ({activeQueueItems.length})
              </button>
              <button
                type="button"
                onClick={clearQueueHistory}
                disabled={queue.length === 0}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-slate-400"
              >
                Clear History
              </button>
            </div>
          </div>
          {queue.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
              No photos captured yet.
            </p>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {pagedQueueItems.map((item) => {
                  const thumbnailUrl = URL.createObjectURL(item.blob);
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border bg-white p-3 text-sm shadow-sm"
                    >
                      <img
                        src={thumbnailUrl}
                        alt={item.fileName}
                        className="mb-3 aspect-square w-full rounded-lg border object-cover"
                        onLoad={() => URL.revokeObjectURL(thumbnailUrl)}
                      />
                      <div
                        className="truncate font-medium"
                        title={item.fileName}
                      >
                        {item.fileName}
                      </div>
                      <div className="mt-1 break-all text-xs text-slate-500">
                        {item.folderPath}
                      </div>
                      <div className="mt-2 text-xs">
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
                        Source: {item.source || "camera"}
                      </div>
                      <div className="text-xs text-slate-500">
                        Attempts: {item.attempts}
                      </div>
                      {item.error && (
                        <div className="mt-1 text-xs text-red-600">
                          {item.error}
                        </div>
                      )}
                      {item.uploadedAt && (
                        <div className="text-xs text-slate-500">
                          Uploaded: {new Date(item.uploadedAt).toLocaleString()}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          removeQueueItem(item).catch((error) =>
                            handleError(error, "Failed to remove photo"),
                          )
                        }
                        className="mt-3 w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                      >
                        {item.status === "uploaded"
                          ? "Delete Uploaded Photo"
                          : "Remove From Queue"}
                      </button>
                    </div>
                  );
                })}
              </div>
              {queueTotalPages > 1 && (
                <div className="mt-4 flex items-center justify-between gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() =>
                      setQueuePage((page) => Math.max(1, page - 1))
                    }
                    disabled={queuePage === 1}
                    className="rounded-lg bg-slate-200 px-3 py-2 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-slate-600">
                    Queue page {queuePage} of {queueTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQueuePage((page) =>
                        Math.min(queueTotalPages, page + 1),
                      )
                    }
                    disabled={queuePage === queueTotalPages}
                    className="rounded-lg bg-slate-200 px-3 py-2 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 p-3 text-white sm:p-6">
          <div className="mx-auto flex h-full max-w-6xl flex-col">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Folder Gallery</div>
                <div className="break-all text-xs text-white/60">
                  {currentBrowsePath}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGalleryOpen(false);
                  setSelectedGalleryPhoto(null);
                }}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
              >
                Close
              </button>
            </div>
            {selectedGalleryPhoto ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <div className="min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">
                  {selectedGalleryPhoto.previewUrl ? (
                    <img
                      src={selectedGalleryPhoto.previewUrl}
                      alt={selectedGalleryPhoto.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/70">
                      Preview unavailable
                    </div>
                  )}
                </div>
                <div className="rounded-xl bg-white/10 p-3 text-sm">
                  <div className="break-all font-semibold">
                    {selectedGalleryPhoto.name}
                  </div>
                  <div className="mt-1 text-white/70">
                    Owner: {selectedGalleryPhoto.owner || "unknown"} • Source:{" "}
                    {selectedGalleryPhoto.source} • Size:{" "}
                    {formatFileSize(selectedGalleryPhoto.size)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGalleryPhoto(null)}
                      className="rounded-lg bg-white/20 px-4 py-2 font-medium text-white hover:bg-white/30"
                    >
                      Back to Photos
                    </button>
                    {selectedGalleryPhoto.canDelete && (
                      <button
                        type="button"
                        onClick={() => deleteGalleryPhoto(selectedGalleryPhoto)}
                        className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                      >
                        Delete Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : galleryFiles.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-white/10 text-white/70">
                No image files found in this folder.
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-auto">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {galleryFiles.map((photo) => (
                    <button
                      key={photo.path}
                      type="button"
                      onClick={() => setSelectedGalleryPhoto(photo)}
                      className="overflow-hidden rounded-xl bg-white/10 text-left hover:bg-white/20"
                    >
                      {photo.previewUrl ? (
                        <img
                          src={photo.previewUrl}
                          alt={photo.name}
                          className="aspect-square w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square items-center justify-center text-3xl">
                          🖼️
                        </div>
                      )}
                      <div className="p-2">
                        <div className="truncate text-xs font-medium">
                          {photo.name}
                        </div>
                        <div className="text-[11px] text-white/60">
                          {photo.owner || "unknown"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
