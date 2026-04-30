// app/(site)/project-updates/page.tsx

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
import {
  FaArrowLeft,
  FaCamera,
  FaCheck,
  FaCopy,
  FaFolder,
  FaImage,
  FaPaperPlane,
  FaSave,
  FaSpinner,
  FaTrash,
  FaWhatsapp,
  FaEdit,
  FaSyncAlt,
} from "react-icons/fa";

type DropboxFolder = {
  name: string;
  path: string;
};

type DropboxImage = {
  name: string;
  path: string;
  previewUrl: string;
  size: number;
  modifiedAt: string | null;
  owner: string;
  source: "camera" | "gallery";
  canDelete: boolean;
};

type LocalPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  source: "camera" | "gallery";
};

type CameraFacingDevice = {
  deviceId: string;
  label: string;
  isBackCamera: boolean;
  isUltraWide: boolean;
};

type SavedDraft = {
  projectCode: string;
  projectPath: string;
  updates: string;
  leftToDo: string;
  existingPhotoPaths: string[];
  savedAt: string;
  shareText?: string;
};

type SubmitResult = {
  updateId: string;
  shareText: string;
  savedPhotoNames: string[];
  savedPhotoPaths: string[];
  dateFolderPath: string;
  logPath: string;
};

type ProjectUpdateRecord = {
  id: string;
  projectCode: string;
  updates: string | null;
  leftToDo: string | null;
  photoNames: string[];
  photoPaths: string[];
  submittedById: string | null;
  editedById: string | null;
  editedAt: string | null;
  createdAt: string;
  whatsappShareStatus: string;
};

const LOCAL_DRAFT_KEY = "actfast-project-update-draft-v1";

const PROJECT_FOLDER_REGEX = /^\d{4}-\d{3,4}-\d{2}-[A-Za-z0-9-]+$/;
const NO_CLAIMS_FOLDER_REGEX = /^\d{4}-NO CLAIMS$/i;

const SMART_IMAGE_QUALITY = 0.85;
const SMART_IMAGE_MAX_EDGE_PX = 2560;
const CAPTURE_COOLDOWN_MS = 1000;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isProjectFolderName(folderName: string) {
  return (
    PROJECT_FOLDER_REGEX.test(folderName) ||
    NO_CLAIMS_FOLDER_REGEX.test(folderName)
  );
}

function getFileExtensionFromName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && extension.length <= 5 ? extension : "jpg";
}

function getLocalTimestampForFile() {
  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const sec = String(now.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}_${hh}-${min}-${sec}`;
}

function cleanFileNamePart(value: string) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

  return cleaned || "unknown";
}

function formatFileSize(bytes: number) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

function buildFallbackShareText(params: {
  projectCode: string;
  submittedBy?: string | null;
  updates: string;
  leftToDo: string;
  photoCount: number;
}) {
  const dateTime = new Date().toLocaleString("en-CA", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Vancouver",
  });

  return [
    "PROJECT UPDATE",
    `Project: ${params.projectCode || "Not selected"}`,
    `Date/Time: ${dateTime}`,
    params.submittedBy ? `Submitted By: ${params.submittedBy}` : "",
    "",
    "Updates:",
    params.updates.trim() || "No update provided.",
    "",
    "Left to do:",
    params.leftToDo.trim() || "No left-to-do notes provided.",
    "",
    `Photos attached/selected: ${params.photoCount}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function ProjectUpdatesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastCaptureAtRef = useRef(0);
  const pinchDistanceRef = useRef<number | null>(null);

  const [projectFolders, setProjectFolders] = useState<DropboxFolder[]>([]);
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [selectedProjectCode, setSelectedProjectCode] = useState("");
  const [selectedProjectPath, setSelectedProjectPath] = useState("");

  const [localPhotos, setLocalPhotos] = useState<LocalPhoto[]>([]);
  const [selectedDropboxImages, setSelectedDropboxImages] = useState<
    DropboxImage[]
  >([]);

  const [updates, setUpdates] = useState("");
  const [leftToDo, setLeftToDo] = useState("");

  const [browseLoading, setBrowseLoading] = useState(false);
  const [picturesRootPath, setPicturesRootPath] = useState("");
  const [currentBrowsePath, setCurrentBrowsePath] = useState("");
  const [parentBrowsePath, setParentBrowsePath] = useState<string | null>(null);
  const [folders, setFolders] = useState<DropboxFolder[]>([]);
  const [dropboxImages, setDropboxImages] = useState<DropboxImage[]>([]);

  // Camera important fix:
  // cameraModalOpen renders the video first, then useEffect starts the actual camera stream.
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [pendingCameraStart, setPendingCameraStart] = useState(false);

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

  const [photoTakerName, setPhotoTakerName] = useState("unknown");
  const [isAdmin, setIsAdmin] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<SubmitResult | null>(null);
  const [shareAttempted, setShareAttempted] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<SavedDraft | null>(null);

  const [adminUpdates, setAdminUpdates] = useState<ProjectUpdateRecord[]>([]);
  const [loadingAdminUpdates, setLoadingAdminUpdates] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState("");
  const [adminEditUpdates, setAdminEditUpdates] = useState("");
  const [adminEditLeftToDo, setAdminEditLeftToDo] = useState("");

  const totalPhotoCount = localPhotos.length + selectedDropboxImages.length;

  const visibleProjectFolders = useMemo(() => {
    const folders = [...projectFolders]
      .filter((folder) => isProjectFolderName(folder.name))
      .sort((a, b) =>
        b.name.localeCompare(a.name, undefined, { numeric: true }),
      );

    const search = projectSearchTerm.trim().toLowerCase();
    if (!search) return folders;

    return folders.filter((folder) =>
      folder.name.toLowerCase().includes(search),
    );
  }, [projectFolders, projectSearchTerm]);

  const fallbackShareText = useMemo(
    () =>
      buildFallbackShareText({
        projectCode: selectedProjectCode,
        submittedBy: photoTakerName,
        updates,
        leftToDo,
        photoCount: totalPhotoCount,
      }),
    [selectedProjectCode, photoTakerName, updates, leftToDo, totalPhotoCount],
  );

  const shareText =
    saveResult?.shareText || pendingDraft?.shareText || fallbackShareText;

  useEffect(() => {
    if (status !== "loading" && !session) router.push("/login");
  }, [session, status, router]);

  useEffect(() => {
    if (!session) return;

    fetchProjectFolders();
    restoreLocalDraft();

    return () => {
      stopCamera();
      localPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/user/profile/${session.user.email}`);
        const data = await res.json();

        const name =
          data?.nickname ||
          data?.firstName ||
          session.user?.name ||
          session.user?.email ||
          "unknown";

        setPhotoTakerName(cleanFileNamePart(name));

        const role = String(data?.role || "").toLowerCase();
        setIsAdmin(
          ["admin", "superadmin", "super-admin", "owner"].includes(role),
        );
      } catch {
        const fallback = session.user?.name || session.user?.email || "unknown";
        setPhotoTakerName(cleanFileNamePart(fallback));
      }
    };

    fetchProfile();
  }, [session?.user?.email, session?.user?.name]);

  useEffect(() => {
    if (!cameraModalOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCameraModal();
    };

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [cameraModalOpen]);

  useEffect(() => {
    if (!cameraModalOpen || !pendingCameraStart) return;

    const timer = window.setTimeout(() => {
      startCameraStream().finally(() => setPendingCameraStart(false));
    }, 100);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraModalOpen, pendingCameraStart]);

  useEffect(() => {
    saveLocalDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedProjectCode,
    selectedProjectPath,
    updates,
    leftToDo,
    selectedDropboxImages.length,
    localPhotos.length,
  ]);

  useEffect(() => {
    if (isAdmin) fetchAdminUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, selectedProjectCode]);

  const fetchProjectFolders = async () => {
    try {
      setLoadingProjects(true);

      const res = await fetch("/api/dropbox/list-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to load project folders",
        );
      }

      setProjectFolders(data.folders || []);
    } catch (error) {
      console.error("Failed to fetch Dropbox project folders:", error);
      toast.error("Unable to load Dropbox project folders");
    } finally {
      setLoadingProjects(false);
    }
  };

  const selectProjectFolder = (folder: DropboxFolder) => {
    setSelectedProjectCode(folder.name);
    setSelectedProjectPath(folder.path);
    setProjectSearchTerm(folder.name);
    setProjectDropdownOpen(false);
    resetDropboxBrowser();
    setSaveResult(null);
    setShareAttempted(false);
  };

  const restoreLocalDraft = () => {
    try {
      const rawDraft = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (!rawDraft) return;

      const draft = JSON.parse(rawDraft) as SavedDraft;

      setPendingDraft(draft);
      setSelectedProjectCode(draft.projectCode || "");
      setSelectedProjectPath(draft.projectPath || "");
      setProjectSearchTerm(draft.projectCode || "");
      setUpdates(draft.updates || "");
      setLeftToDo(draft.leftToDo || "");
    } catch {
      localStorage.removeItem(LOCAL_DRAFT_KEY);
    }
  };

  const saveLocalDraft = () => {
    if (!selectedProjectCode && !updates && !leftToDo && totalPhotoCount === 0)
      return;

    const draft: SavedDraft = {
      projectCode: selectedProjectCode,
      projectPath: selectedProjectPath,
      updates,
      leftToDo,
      existingPhotoPaths: selectedDropboxImages.map((image) => image.path),
      savedAt: new Date().toISOString(),
      shareText: saveResult?.shareText,
    };

    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(draft));
    setPendingDraft(draft);
  };

  const clearLocalDraft = () => {
    localStorage.removeItem(LOCAL_DRAFT_KEY);
    setPendingDraft(null);
  };

  const resetDropboxBrowser = () => {
    setPicturesRootPath("");
    setCurrentBrowsePath("");
    setParentBrowsePath(null);
    setFolders([]);
    setDropboxImages([]);
    setSelectedDropboxImages([]);
  };

  const browseProjectPictures = async (path?: string) => {
    if (!selectedProjectPath) {
      toast.error("Please select a project first");
      return;
    }

    setBrowseLoading(true);

    try {
      const targetPath = path || `${selectedProjectPath}/1-PICTURES`;
      const rootPicturesPath = `${selectedProjectPath}/1-PICTURES`;

      const [foldersRes, filesRes] = await Promise.all([
        fetch("/api/dropbox/list-folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: targetPath }),
        }),
        fetch("/api/dropbox/list-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: targetPath }),
        }),
      ]);

      const foldersData = await readApiResponse(foldersRes);
      const filesData = await readApiResponse(filesRes);

      if (!foldersRes.ok) {
        throw new Error(
          foldersData.detail || foldersData.message || "Failed to load folders",
        );
      }

      if (!filesRes.ok) {
        throw new Error(
          filesData.detail || filesData.message || "Failed to load images",
        );
      }

      setPicturesRootPath(rootPicturesPath);
      setCurrentBrowsePath(targetPath);
      setParentBrowsePath(
        targetPath.toLowerCase() === rootPicturesPath.toLowerCase()
          ? null
          : targetPath.split("/").slice(0, -1).join("/"),
      );

      setFolders(foldersData.folders || []);
      setDropboxImages(filesData.files || []);
    } catch (error: any) {
      console.error("Browse 1-PICTURES error:", error);
      toast.error(error?.message || "Unable to browse 1-PICTURES folder");
    } finally {
      setBrowseLoading(false);
    }
  };

  const deleteDropboxImage = async (image: DropboxImage) => {
    if (!image.canDelete) {
      toast.error("You can only delete your own photos unless you are admin");
      return;
    }

    const confirmed = window.confirm(
      `Delete this uploaded photo from Dropbox?\n\n${image.name}`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch("/api/dropbox/delete-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dropboxPath: image.path }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(
          data.detail || data.message || "Failed to delete photo",
        );
      }

      setSelectedDropboxImages((prev) =>
        prev.filter((item) => item.path !== image.path),
      );

      if (currentBrowsePath) {
        await browseProjectPictures(currentBrowsePath);
      }

      toast.success("Photo deleted");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete photo");
    }
  };

  const openCameraModal = () => {
    setCameraModalOpen(true);
    setPendingCameraStart(true);
  };

  const closeCameraModal = () => {
    stopCamera();
    setCameraModalOpen(false);
    setPendingCameraStart(false);
  };

  const getCameraLensPriority = (label: string, index: number) => {
    const lowerLabel = label.toLowerCase();

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

    if (/wide/.test(lowerLabel) && !/tele/.test(lowerLabel)) return 2;

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

        return {
          deviceId: device.deviceId,
          label,
          isBackCamera: looksBackFacing,
          isUltraWide: getCameraLensPriority(label, index) <= 2,
        };
      })
      .filter(
        (device) =>
          device.isBackCamera ||
          !/front|user|facetime|selfie/i.test(device.label),
      );
  };

  const getAlternateRearCameraCandidates = (
    devices: CameraFacingDevice[],
    activeDeviceId: string,
  ) => {
    return devices
      .filter((device) => device.deviceId && device.deviceId !== activeDeviceId)
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

  const getWideCameraCandidates = (
    devices: CameraFacingDevice[],
    activeDeviceId: string,
    standardDeviceId: string,
  ) => {
    const alternateDevices = getAlternateRearCameraCandidates(
      devices,
      activeDeviceId,
    );

    return alternateDevices.sort((a, b) => {
      const aScore =
        (a.deviceId === standardDeviceId ? 20 : 0) + (a.isUltraWide ? -10 : 0);
      const bScore =
        (b.deviceId === standardDeviceId ? 20 : 0) + (b.isUltraWide ? -10 : 0);
      return aScore - bScore;
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

    zoomOptions.add(0.6);
    zoomOptions.add(1);

    const maxZoom = capabilities?.zoom?.max ?? 1;

    [2, 3].forEach((zoom) => {
      if (zoom <= maxZoom) zoomOptions.add(zoom);
    });

    setCameraZoomOptions(Array.from(zoomOptions).sort((a, b) => a - b));
    setTorchSupported(Boolean(capabilities?.torch));
  };

  const startCameraStream = async (
    preferredDeviceId?: string,
    preferredZoom = 1,
  ): Promise<boolean> => {
    setCameraStarting(true);

    try {
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
        await videoRef.current.play().catch(() => undefined);
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
      setCameraActive(false);
      return false;
    } finally {
      setCameraStarting(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setCameraStarting(false);
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

  const switchToNextRearLens = async () => {
    const devices = await getAvailableBackCameras();

    if (devices.length <= 1) {
      toast.error(
        "This browser is only exposing one rear camera. Try Chrome/Samsung Internet, allow camera permission, then reload.",
      );
      return;
    }

    const currentIndex = devices.findIndex(
      (device) => device.deviceId === activeCameraDeviceId,
    );
    const nextIndex =
      currentIndex >= 0 ? (currentIndex + 1) % devices.length : 0;
    const nextDevice = devices[nextIndex];

    const switched = await startCameraStream(nextDevice.deviceId, 1);

    if (switched) {
      setCameraZoom(1);
      setCameraLensLabel(
        `Rear lens ${nextIndex + 1} of ${devices.length}: ${nextDevice.label}`,
      );
      toast.success(
        `Switched to rear lens ${nextIndex + 1} of ${devices.length}`,
      );
    }
  };

  const applyCameraZoom = async (zoom: number) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    const capabilities = getVideoTrackCapabilities(track);

    if (zoom < 1) {
      if ((capabilities?.zoom?.min ?? 1) <= zoom) {
        try {
          await track.applyConstraints({
            advanced: [{ zoom } as MediaTrackConstraintSet],
          });

          setCameraZoom(zoom);
          setCameraLensLabel("0.6x wide/macro lens");
          return;
        } catch {
          // Try physical lens fallback below.
        }
      }

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
        const switched = await startCameraStream(candidate.deviceId, 0.6);

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

      toast.error("This browser is only exposing one rear lens right now.");
      return;
    }

    if (
      Math.abs(zoom - 1) < 0.05 &&
      standardBackCameraDeviceId &&
      activeCameraDeviceId !== standardBackCameraDeviceId
    ) {
      await startCameraStream(standardBackCameraDeviceId, 1);
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

  const compressImageBlob = async (fileOrBlob: File | Blob) => {
    const inputType = fileOrBlob.type;

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

  const addLocalPhotoFile = (file: File, source: "camera" | "gallery") => {
    const photo: LocalPhoto = {
      id: makeId(),
      file,
      previewUrl: URL.createObjectURL(file),
      source,
    };

    setLocalPhotos((prev) => [...prev, photo]);
    setShareAttempted(false);
  };

  const handleGallerySelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    try {
      for (const file of files) {
        const compressedBlob = await compressImageBlob(file);
        const extension = getFileExtensionFromName(file.name);

        const compressedFile = new File(
          [compressedBlob],
          `${getLocalTimestampForFile()}__${photoTakerName}__gallery.${extension}`,
          { type: compressedBlob.type || "image/jpeg" },
        );

        addLocalPhotoFile(compressedFile, "gallery");
      }

      toast.success(`${files.length} gallery photo(s) added`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add gallery photo(s)",
      );
    } finally {
      event.target.value = "";
    }
  };

  const capturePhotoToLocalList = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Open the camera first");
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

      if (!rawBlob) throw new Error("Failed to capture photo");

      const compressedBlob = await compressImageBlob(rawBlob);

      const file = new File(
        [compressedBlob],
        `${getLocalTimestampForFile()}__${photoTakerName}__camera.jpg`,
        { type: compressedBlob.type || "image/jpeg" },
      );

      addLocalPhotoFile(file, "camera");
      toast.success("Photo captured");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to capture photo",
      );
    }
  };

  const removeLocalPhoto = (id: string) => {
    setLocalPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((photo) => photo.id !== id);
    });
  };

  const toggleDropboxImage = (image: DropboxImage) => {
    setSelectedDropboxImages((prev) => {
      const exists = prev.some((item) => item.path === image.path);
      if (exists) return prev.filter((item) => item.path !== image.path);
      return [...prev, image];
    });

    setShareAttempted(false);
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

  const validateBeforeSave = () => {
    if (!selectedProjectCode || !selectedProjectPath) {
      toast.error("Please select a project folder");
      return false;
    }

    if (!selectedProjectPath.startsWith("/")) {
      toast.error("Invalid Dropbox project path. Please reselect the project.");
      return false;
    }

    if (!updates.trim() && !leftToDo.trim()) {
      toast.error("Please enter an update or left-to-do note");
      return false;
    }

    if (totalPhotoCount === 0) {
      toast.error("Please add or select at least one photo");
      return false;
    }

    return true;
  };

  const saveProjectUpdate = async () => {
    if (!validateBeforeSave()) return null;

    setIsSaving(true);
    setShareAttempted(false);
    toast.loading("Saving project update...", { id: "project-update-save" });

    try {
      const formData = new FormData();

      formData.append("projectCode", selectedProjectCode);
      formData.append("projectPath", selectedProjectPath);
      formData.append("updates", updates);
      formData.append("leftToDo", leftToDo);
      formData.append(
        "existingPhotoPaths",
        JSON.stringify(selectedDropboxImages.map((image) => image.path)),
      );

      localPhotos.forEach((photo) => {
        formData.append("files", photo.file, photo.file.name);
      });

      const res = await fetch("/api/project-updates", {
        method: "POST",
        body: formData,
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Save failed");
      }

      const result: SubmitResult = {
        updateId: data.updateId,
        shareText: data.shareText,
        savedPhotoNames: data.savedPhotoNames || [],
        savedPhotoPaths: data.savedPhotoPaths || [],
        dateFolderPath: data.dateFolderPath,
        logPath: data.logPath,
      };

      setSaveResult(result);

      localStorage.setItem(
        LOCAL_DRAFT_KEY,
        JSON.stringify({
          projectCode: selectedProjectCode,
          projectPath: selectedProjectPath,
          updates,
          leftToDo,
          existingPhotoPaths: selectedDropboxImages.map((image) => image.path),
          savedAt: new Date().toISOString(),
          updateId: result.updateId,
          shareText: result.shareText,
        }),
      );

      toast.success("Saved to Dropbox. Please share to WhatsApp.", {
        id: "project-update-save",
      });

      if (isAdmin) fetchAdminUpdates();

      return result;
    } catch (error: any) {
      saveLocalDraft();

      toast.error(error?.message || "Save failed. Draft kept on this device.", {
        id: "project-update-save",
      });

      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const markWhatsAppShareAttempted = async (updateId: string) => {
    try {
      await fetch("/api/project-updates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updateId,
          whatsappShareStatus: "ATTEMPTED",
        }),
      });
    } catch {
      toast.error("Share attempted, but database status was not updated.");
    }
  };

  const shareUpdate = async () => {
    const textToShare = shareText;
    const filesToShare = localPhotos.map((photo) => photo.file);

    try {
      if (
        navigator.share &&
        filesToShare.length > 0 &&
        navigator.canShare?.({ files: filesToShare })
      ) {
        await navigator.share({
          title: "Project Update",
          text: textToShare,
          files: filesToShare,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "Project Update",
          text: textToShare,
        });
      } else {
        await navigator.clipboard.writeText(textToShare);
        toast.success("Message copied. Paste it into WhatsApp.");
      }

      if (saveResult?.updateId) {
        await markWhatsAppShareAttempted(saveResult.updateId);
      }

      setShareAttempted(true);
      toast.success("Share attempted. Confirm it was sent in WhatsApp.");
    } catch (error: any) {
      if (error?.name === "AbortError") {
        toast.error("Sharing was cancelled. Please share before exiting.");
      } else {
        toast.error("Unable to open sharing. Message kept for copy/paste.");
      }
    }
  };

  const saveAndShare = async () => {
    const result = saveResult || (await saveProjectUpdate());
    if (!result) return;
    await shareUpdate();
  };

  const copyShareText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Formatted update copied");
    } catch {
      toast.error("Unable to copy message");
    }
  };

  const clearCompletedUpdate = () => {
    if (!saveResult || !shareAttempted) {
      toast.error(
        "Please save and attempt WhatsApp sharing before clearing/exiting",
      );
      return;
    }

    localPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));

    setLocalPhotos([]);
    setSelectedDropboxImages([]);
    setUpdates("");
    setLeftToDo("");
    setSaveResult(null);
    setShareAttempted(false);
    resetDropboxBrowser();
    clearLocalDraft();

    toast.success("Update completed and cleared");
  };

  const fetchAdminUpdates = async () => {
    if (!isAdmin) return;

    setLoadingAdminUpdates(true);

    try {
      const query = selectedProjectCode
        ? `?projectCode=${encodeURIComponent(selectedProjectCode)}`
        : "";

      const res = await fetch(`/api/project-updates${query}`);
      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to load project updates");
      }

      setAdminUpdates(data.updates || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load admin updates");
    } finally {
      setLoadingAdminUpdates(false);
    }
  };

  const startEditingAdminUpdate = (update: ProjectUpdateRecord) => {
    setEditingUpdateId(update.id);
    setAdminEditUpdates(update.updates || "");
    setAdminEditLeftToDo(update.leftToDo || "");
  };

  const cancelEditingAdminUpdate = () => {
    setEditingUpdateId("");
    setAdminEditUpdates("");
    setAdminEditLeftToDo("");
  };

  const saveAdminUpdateEdit = async (updateId: string) => {
    try {
      const res = await fetch("/api/project-updates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updateId,
          updates: adminEditUpdates,
          leftToDo: adminEditLeftToDo,
        }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to edit update");
      }

      toast.success("Update edited and Dropbox log regenerated");
      cancelEditingAdminUpdate();
      fetchAdminUpdates();
    } catch (error: any) {
      toast.error(error?.message || "Failed to edit update");
    }
  };

  const deleteAdminUpdate = async (updateId: string) => {
    const confirmed = window.confirm(
      "Delete this project update? This will soft-delete it in MongoDB and regenerate the Dropbox text log.",
    );

    if (!confirmed) return;

    try {
      const res = await fetch("/api/project-updates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updateId }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete update");
      }

      toast.success("Update deleted and Dropbox log regenerated");
      fetchAdminUpdates();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete update");
    }
  };

  if (status === "loading") {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-100 pt-16 text-slate-900">
      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Field Reporting
              </p>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Project Updates
              </h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                Save daily updates to MongoDB, upload/copy photos to Dropbox,
                compile the Dropbox text log, and require a WhatsApp share
                attempt.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Photo taker:{" "}
                <span className="font-semibold">{photoTakerName}</span>
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-200">
              <p className="font-semibold">Status</p>
              <p>
                {saveResult
                  ? "MongoDB + Dropbox saved"
                  : "Draft / not saved yet"}
              </p>
              <p>
                {shareAttempted
                  ? "WhatsApp share attempted"
                  : "WhatsApp share pending"}
              </p>
            </div>
          </div>
        </section>

        {pendingDraft && !saveResult && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">Local backup detected</p>
                <p>
                  A draft from {new Date(pendingDraft.savedAt).toLocaleString()}{" "}
                  is stored on this device.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearLocalDraft();
                  setPendingDraft(null);
                  toast.success("Local backup cleared");
                }}
                className="rounded-xl bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700"
              >
                Clear backup
              </button>
            </div>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col gap-6">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">
                    1. Select Project Folder
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Choose the Dropbox project folder connected to this update.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchProjectFolders}
                  disabled={loadingProjects}
                  className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900 disabled:bg-slate-400"
                >
                  {loadingProjects ? "Loading..." : "Refresh"}
                </button>
              </div>

              <div className="relative">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Search and select project
                </label>

                <input
                  value={projectSearchTerm}
                  onFocus={() => setProjectDropdownOpen(true)}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setProjectSearchTerm(event.target.value);
                    setProjectDropdownOpen(true);
                  }}
                  placeholder={
                    selectedProjectCode || "Type project name or number..."
                  }
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setProjectDropdownOpen((prev) => !prev)}
                  className="absolute bottom-2 right-2 rounded-lg bg-slate-100 px-2 py-1 text-sm text-slate-600"
                >
                  ▼
                </button>

                {projectDropdownOpen && (
                  <div className="absolute z-40 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                    {visibleProjectFolders.length === 0 ? (
                      <div className="p-3 text-sm text-slate-500">
                        No matching folders.
                      </div>
                    ) : (
                      visibleProjectFolders.map((folder) => (
                        <button
                          key={folder.path}
                          type="button"
                          onClick={() => selectProjectFolder(folder)}
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
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200">
                  <p className="font-semibold">{selectedProjectCode}</p>
                  <p className="mt-1 break-all text-xs text-slate-500">
                    {selectedProjectPath}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-bold">2. Add Photos</h2>
              <p className="mt-1 text-sm text-slate-600">
                Take new photos, select from gallery, or reuse photos from the
                project&apos;s 1-PICTURES folder.
              </p>

              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGallerySelect}
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={openCameraModal}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <FaCamera /> Take Photos
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 font-semibold text-white hover:bg-slate-900"
                >
                  <FaImage /> Gallery
                </button>

                <button
                  type="button"
                  onClick={() => browseProjectPictures()}
                  disabled={!selectedProjectPath || browseLoading}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {browseLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaFolder />
                  )}{" "}
                  Browse 1-PICTURES
                </button>
              </div>

              {localPhotos.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-bold">New / Gallery Photos</h3>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {localPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200"
                      >
                        <img
                          src={photo.previewUrl}
                          alt="Selected update photo"
                          className="h-32 w-full object-cover"
                        />

                        <div className="p-2 text-xs">
                          <p className="truncate font-semibold">
                            {photo.file.name}
                          </p>
                          <p className="text-slate-500">{photo.source}</p>

                          <button
                            type="button"
                            onClick={() => removeLocalPhoto(photo.id)}
                            className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl bg-red-100 px-2 py-1 font-semibold text-red-700 hover:bg-red-200"
                          >
                            <FaTrash /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(currentBrowsePath ||
                folders.length > 0 ||
                dropboxImages.length > 0) && (
                <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-bold">Dropbox Image Browser</h3>
                      <p className="break-all text-xs text-slate-500">
                        {currentBrowsePath || picturesRootPath}
                      </p>
                    </div>

                    {parentBrowsePath && (
                      <button
                        type="button"
                        onClick={() => browseProjectPictures(parentBrowsePath)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100"
                      >
                        <FaArrowLeft /> Back
                      </button>
                    )}
                  </div>

                  {folders.length > 0 && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {folders.map((folder) => (
                        <button
                          key={folder.path}
                          type="button"
                          onClick={() => browseProjectPictures(folder.path)}
                          className="flex items-center gap-2 rounded-xl bg-white p-3 text-left text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-blue-50"
                        >
                          <FaFolder className="text-blue-600" /> {folder.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {dropboxImages.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {dropboxImages.map((image) => {
                        const selected = selectedDropboxImages.some(
                          (item) => item.path === image.path,
                        );

                        return (
                          <div
                            key={image.path}
                            className={`overflow-hidden rounded-2xl ring-2 ${
                              selected
                                ? "bg-blue-50 ring-blue-500"
                                : "bg-white ring-slate-200"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => toggleDropboxImage(image)}
                              className="block w-full text-left"
                            >
                              {image.previewUrl ? (
                                <img
                                  src={image.previewUrl}
                                  alt={image.name}
                                  className="h-32 w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-32 items-center justify-center bg-slate-200 text-slate-500">
                                  <FaImage />
                                </div>
                              )}

                              <div className="p-2 text-xs">
                                <p className="truncate font-semibold">
                                  {image.name}
                                </p>
                                <p className="text-slate-500">
                                  {image.owner || "unknown"} •{" "}
                                  {formatFileSize(image.size)}
                                </p>
                                {selected && (
                                  <p className="mt-1 font-bold text-blue-700">
                                    Selected
                                  </p>
                                )}
                              </div>
                            </button>

                            {image.canDelete && (
                              <button
                                type="button"
                                onClick={() => deleteDropboxImage(image)}
                                className="mx-2 mb-2 flex w-[calc(100%-1rem)] items-center justify-center gap-1 rounded-xl bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-200"
                              >
                                <FaTrash /> Delete
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      No images found in this folder.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-bold">3. Write Update</h2>
              <textarea
                value={updates}
                onChange={(event) => {
                  setUpdates(event.target.value);
                  setShareAttempted(false);
                }}
                rows={6}
                className="mt-3 w-full resize-y rounded-2xl border border-slate-300 p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Example: Completed demolition in the living room, removed damaged baseboards, and set up drying equipment."
              />
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-bold">4. Left to do</h2>
              <textarea
                value={leftToDo}
                onChange={(event) => {
                  setLeftToDo(event.target.value);
                  setShareAttempted(false);
                }}
                rows={5}
                className="mt-3 w-full resize-y rounded-2xl border border-slate-300 p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Example: Scheduler to book electrician. Return tomorrow for moisture check. Need approval before reinstalling flooring."
              />
            </div>

            {isAdmin && (
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold">
                      Admin: Manage Project Updates
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Edits and deletes regenerate the Dropbox
                      PROJECT-UPDATES-LOG.txt from MongoDB.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchAdminUpdates}
                    disabled={loadingAdminUpdates}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:bg-slate-400"
                  >
                    <FaSyncAlt
                      className={loadingAdminUpdates ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {adminUpdates.length === 0 ? (
                    <p className="rounded-xl border border-dashed p-4 text-sm text-slate-500">
                      No project updates found.
                    </p>
                  ) : (
                    adminUpdates.map((update) => {
                      const isEditing = editingUpdateId === update.id;

                      return (
                        <div
                          key={update.id}
                          className="rounded-2xl border bg-slate-50 p-4"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="text-sm">
                              <p className="font-bold">{update.projectCode}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(update.createdAt).toLocaleString()} •
                                By {update.submittedById || "Unknown"}
                              </p>
                              {update.editedAt && (
                                <p className="text-xs text-orange-700">
                                  Edited by {update.editedById || "Unknown"} on{" "}
                                  {new Date(update.editedAt).toLocaleString()}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEditingAdminUpdate(update)}
                                className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-200"
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteAdminUpdate(update.id)}
                                className="rounded-lg bg-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-200"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="mt-3 space-y-3">
                              <textarea
                                value={adminEditUpdates}
                                onChange={(event) =>
                                  setAdminEditUpdates(event.target.value)
                                }
                                rows={4}
                                className="w-full rounded-xl border p-3 text-sm"
                              />
                              <textarea
                                value={adminEditLeftToDo}
                                onChange={(event) =>
                                  setAdminEditLeftToDo(event.target.value)
                                }
                                rows={3}
                                className="w-full rounded-xl border p-3 text-sm"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => saveAdminUpdateEdit(update.id)}
                                  className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                                >
                                  Save Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditingAdminUpdate}
                                  className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                              <div>
                                <p className="font-bold text-slate-700">
                                  Updates
                                </p>
                                <p className="whitespace-pre-wrap text-slate-600">
                                  {update.updates || "No update provided."}
                                </p>
                              </div>
                              <div>
                                <p className="font-bold text-slate-700">
                                  Left to do
                                </p>
                                <p className="whitespace-pre-wrap text-slate-600">
                                  {update.leftToDo ||
                                    "No left-to-do notes provided."}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-6">
            <div className="sticky top-20 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-bold">Formatted WhatsApp Message</h2>
              <p className="mt-1 text-sm text-slate-600">
                This is what the user will share after saving.
              </p>

              <pre className="mt-4 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
                {shareText}
              </pre>

              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={saveAndShare}
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSaving ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaWhatsapp />
                  )}{" "}
                  Save & Share to WhatsApp
                </button>

                <button
                  type="button"
                  onClick={saveProjectUpdate}
                  disabled={isSaving || !!saveResult}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSaving ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSave />
                  )}{" "}
                  Save to Database + Dropbox
                </button>

                <button
                  type="button"
                  onClick={shareUpdate}
                  disabled={!saveResult && !pendingDraft?.shareText}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <FaPaperPlane /> Retry WhatsApp Share
                </button>

                <button
                  type="button"
                  onClick={copyShareText}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
                >
                  <FaCopy /> Copy Message
                </button>

                <button
                  type="button"
                  onClick={clearCompletedUpdate}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                >
                  <FaCheck /> Clear After WhatsApp Sent
                </button>
              </div>

              {saveResult && (
                <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-xs text-blue-900 ring-1 ring-blue-200">
                  <p className="font-bold">Saved Record / Dropbox Paths</p>
                  <p className="mt-2 break-all">
                    MongoDB update ID: {saveResult.updateId}
                  </p>
                  <p className="mt-2 break-all">
                    Date folder: {saveResult.dateFolderPath}
                  </p>
                  <p className="mt-2 break-all">
                    Log file: {saveResult.logPath}
                  </p>
                  <p className="mt-2">
                    Saved photos: {saveResult.savedPhotoNames.length}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {cameraModalOpen && (
        <section className="fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-black text-white">
          <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-3 text-white sm:p-4">
            <div>
              <h2 className="text-sm font-semibold sm:text-base">Camera</h2>
              <p className="text-[11px] text-white/70 sm:text-xs">
                {cameraStarting
                  ? "Starting camera..."
                  : cameraActive
                    ? "Camera mode — close to return to the update."
                    : "Camera is ready to start."}
              </p>
            </div>
            <button
              type="button"
              onClick={closeCameraModal}
              className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/25"
            >
              Close
            </button>
          </div>

          <div
            className="relative min-h-0 flex-1 touch-none bg-black"
            onTouchStart={handleCameraTouchStart}
            onTouchMove={handleCameraTouchMove}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-center">
                <div>
                  <div className="text-4xl">📷</div>
                  <p className="mt-2 text-sm text-white/80">
                    {cameraStarting ? "Opening camera..." : "Camera not active"}
                  </p>
                  {!cameraStarting && (
                    <button
                      type="button"
                      onClick={() => startCameraStream()}
                      className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black"
                    >
                      Retry Camera
                    </button>
                  )}
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

                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={switchToNextRearLens}
                      disabled={cameraDevices.length <= 1}
                      className="rounded-full bg-black/45 px-3 py-1.5 text-xs font-bold text-white backdrop-blur disabled:opacity-45 sm:px-4 sm:py-2 sm:text-sm"
                    >
                      ↔ Lens
                    </button>
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
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/90 to-transparent px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 sm:px-8">
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
                    disabled={!cameraActive}
                    className={
                      "rounded-full px-3 py-1.5 text-xs font-black shadow-sm transition disabled:opacity-40 sm:px-4 sm:text-sm " +
                      (Math.abs(cameraZoom - zoom) < 0.05
                        ? "scale-110 bg-white text-black"
                        : "bg-white/15 text-white hover:bg-white/25")
                    }
                  >
                    {zoom}x
                  </button>
                ))}

                <button
                  type="button"
                  onClick={switchToNextRearLens}
                  disabled={!cameraActive || cameraDevices.length <= 1}
                  className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-black text-white shadow-sm transition hover:bg-white/25 disabled:opacity-40 sm:px-4 sm:text-sm"
                >
                  Switch Lens
                </button>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="justify-self-end rounded-full bg-white/15 px-3 py-2 text-xs font-bold text-white backdrop-blur hover:bg-white/25 sm:px-4 sm:text-sm"
                >
                  Gallery
                </button>

                <button
                  type="button"
                  onClick={capturePhotoToLocalList}
                  disabled={!cameraActive}
                  className="h-16 w-16 rounded-full border-4 border-white bg-white shadow-[0_0_0_6px_rgba(255,255,255,0.18)] transition hover:scale-105 disabled:opacity-40 sm:h-20 sm:w-20"
                  aria-label="Take photo"
                >
                  <span className="sr-only">Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={closeCameraModal}
                  className="justify-self-start rounded-full bg-white/15 px-3 py-2 text-xs font-bold text-white backdrop-blur hover:bg-white/25 sm:px-4 sm:text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
