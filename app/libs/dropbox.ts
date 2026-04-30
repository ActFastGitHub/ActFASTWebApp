// app/libs/dropbox.ts

const DROPBOX_API = "https://api.dropboxapi.com/2";
const DROPBOX_CONTENT = "https://content.dropboxapi.com/2";

export function getDropboxRootPath() {
  const root = process.env.DROPBOX_ROOT_PATH || "";

  if (!root.startsWith("/")) {
    throw new Error("DROPBOX_ROOT_PATH must start with /");
  }

  return root.replace(/\/$/, "");
}

export function cleanSegment(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ");
}

export function joinDropboxPath(...parts: string[]) {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join("/")
    .replace(/\/+/g, "/");
}

export function isInsideRoot(path: string) {
  const root = getDropboxRootPath().toLowerCase();
  const normalized = path.toLowerCase();

  return normalized === root || normalized.startsWith(`${root}/`);
}

export async function getDropboxAccessToken() {
  const appKey = process.env.DROPBOX_APP_KEY;
  const appSecret = process.env.DROPBOX_APP_SECRET;
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;

  if (!appKey || !appSecret || !refreshToken) {
    throw new Error("Missing Dropbox environment variables");
  }

  const basicAuth = Buffer.from(`${appKey}:${appSecret}`).toString("base64");

  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.error_description || "Failed to refresh Dropbox token",
    );
  }

  return data.access_token as string;
}

export async function dropboxApiFetch<T>(
  endpoint: string,
  body: Record<string, unknown>,
) {
  const token = await getDropboxAccessToken();

  const res = await fetch(`${DROPBOX_API}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error_summary || "Dropbox API error");
  }

  return data as T;
}

export async function dropboxContentUpload(path: string, fileBuffer: Buffer) {
  const token = await getDropboxAccessToken();

  const res = await fetch(`${DROPBOX_CONTENT}/files/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Dropbox-API-Arg": JSON.stringify({
        path,
        mode: "add",
        autorename: true,
        mute: false,
      }),
      "Content-Type": "application/octet-stream",
    },
    body: new Uint8Array(fileBuffer),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error_summary || "Dropbox upload failed");
  }

  return data;
}
