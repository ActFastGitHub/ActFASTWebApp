"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Navbar from "@/app/components/navBar";

type DropboxFolder = {
  name: string;
  path: string;
};

type UploadLog = {
  fileName: string;
  status: "uploaded" | "failed";
  message?: string;
};

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

  console.error("NON-JSON RESPONSE:", text);

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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [projectFolders, setProjectFolders] = useState<DropboxFolder[]>([]);
  const [childFolders, setChildFolders] = useState<DropboxFolder[]>([]);

  const [selectedProjectPath, setSelectedProjectPath] = useState("");
  const [currentBrowsePath, setCurrentBrowsePath] = useState("");
  const [selectedUploadPath, setSelectedUploadPath] = useState("");

  const [newProjectName, setNewProjectName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const [cameraActive, setCameraActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [debugError, setDebugError] = useState("");
  const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([]);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchProjectFolders();
    }

    return () => {
      stopCamera();
    };
  }, [session]);

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

  const fetchProjectFolders = async () => {
    try {
      setDebugError("");

      const res = await fetch("/api/dropbox/list-folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to load project folders");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path,
        }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to load folders");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderName: newProjectName,
        }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to create project folder");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentPath: currentBrowsePath,
          folderName: newFolderName,
        }),
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Failed to create folder");
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

  const startCamera = async () => {
    if (!selectedUploadPath) {
      toast.error("Select an upload folder first");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment",
          },
        },
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

  const takeAndUploadPhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !selectedUploadPath) {
      return;
    }

    setUploading(true);

    try {
      setDebugError("");

      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas is not supported");
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.9),
      );

      if (!blob) {
        throw new Error("Failed to capture photo");
      }

      const fileName = `photo-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.jpg`;

      const formData = new FormData();
      formData.append("photo", blob, fileName);
      formData.append("fileName", fileName);
      formData.append("folderPath", selectedUploadPath);

      const res = await fetch("/api/dropbox/upload-photo", {
        method: "POST",
        body: formData,
      });

      const data = await readApiResponse(res);

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Upload failed");
      }

      setUploadLogs((prev) => [
        {
          fileName,
          status: "uploaded",
        },
        ...prev,
      ]);

      toast.success("Photo uploaded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";

      setDebugError(message);

      setUploadLogs((prev) => [
        {
          fileName: `photo-${Date.now()}.jpg`,
          status: "failed",
          message,
        },
        ...prev,
      ]);

      toast.error(message);
    } finally {
      setUploading(false);
    }
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

      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-slate-900">
            Field Photo Upload
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Select a project folder, browse deeper if needed, create folders,
            then upload photos directly to the selected Dropbox folder.
          </p>
        </div>

        {debugError && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
            <div className="font-bold">Debug Error:</div>
            <div className="mt-1 whitespace-pre-wrap break-words">{debugError}</div>
            <div className="mt-2 text-xs text-red-600">
              Also check the browser console and terminal for the full response.
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">1. Project Folder</h2>

            <select
              value={selectedProjectPath}
              onChange={(e) => setSelectedProjectPath(e.target.value)}
              className="mb-3 w-full rounded-lg border p-3"
            >
              <option value="">Select project folder</option>
              {projectFolders.map((folder) => (
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
              onClick={takeAndUploadPhoto}
              disabled={!cameraActive || uploading}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-slate-400"
            >
              {uploading ? "Uploading..." : "Take Photo & Upload"}
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
          <h2 className="mb-4 text-lg font-semibold">Upload Log</h2>

          {uploadLogs.length === 0 ? (
            <p className="text-sm text-slate-500">No photos uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {uploadLogs.map((log, index) => (
                <div
                  key={`${log.fileName}-${index}`}
                  className="rounded-lg border p-3 text-sm"
                >
                  <div className="font-medium">{log.fileName}</div>
                  <div
                    className={
                      log.status === "uploaded"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {log.status === "uploaded" ? "Uploaded" : "Failed"}
                  </div>

                  {log.message && (
                    <div className="text-slate-500">{log.message}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}