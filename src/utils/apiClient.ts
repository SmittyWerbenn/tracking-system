// Client for the production backend (Cloudflare Worker + D1 + MinIO, see
// api-worker/). Same endpoint is used in dev and prod - CORS on the Worker
// allows both origins - so no local proxy is needed (unlike the email
// Worker, which has a local dev route via server/emailApiPlugin.ts).
const API_BASE = "https://gms-api.indotrans-tracking.workers.dev";

const TOKEN_KEY = "gms-session-token";

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}
interface ApiFailure {
  success: false;
  error: { code: string; message: string; requestId: string };
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: { auth?: boolean } = { auth: true },
): Promise<T> {
  const headers: Record<string, string> = {};
  let requestBody: BodyInit | undefined;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: requestBody });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
  }

  const json = (await res.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;

  if (!res.ok || !json || json.success === false) {
    if (res.status === 401) setToken(null);
    const err = json && json.success === false ? json.error : null;
    throw new ApiError(res.status, err?.code ?? "UNKNOWN_ERROR", err?.message ?? `Terjadi kesalahan (${res.status}).`);
  }

  return (json as ApiSuccess<T>).data;
}

export const api = {
  get: <T>(path: string, opts?: { auth?: boolean }) => request<T>("GET", path, undefined, opts),
  post: <T>(path: string, body?: unknown, opts?: { auth?: boolean }) => request<T>("POST", path, body, opts),
  patch: <T>(path: string, body?: unknown, opts?: { auth?: boolean }) => request<T>("PATCH", path, body, opts),
  del: <T>(path: string, opts?: { auth?: boolean }) => request<T>("DELETE", path, undefined, opts),
};

/** Converts a base64 data URL (from compressImage) into a File, for upload. */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, b64] = dataUrl.split(",");
  const mime = /data:(.*);base64/.exec(meta)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

export interface UploadedFile {
  id: string;
  url: string;
}

/** Uploads a compressed image (data URL) to the backend, which proxies it
 * into MinIO and records its metadata in D1. Returns the file id to
 * reference from the owning record, plus a short-lived signed view URL. */
export async function uploadFile(
  dataUrl: string,
  entityType: string,
  entityId: string,
  filename = "photo.jpg",
): Promise<UploadedFile> {
  const form = new FormData();
  form.append("file", dataUrlToFile(dataUrl, filename));
  form.append("entityType", entityType);
  form.append("entityId", entityId);
  return api.post<UploadedFile>("/api/files/upload", form);
}
