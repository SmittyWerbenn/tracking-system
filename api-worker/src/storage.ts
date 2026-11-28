import { AwsClient } from "aws4fetch";
import type { Env } from "./types";
import { Errors } from "./http";

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB raw upload ceiling (frontend already compresses images client-side)

function client(env: Env): AwsClient {
  return new AwsClient({
    accessKeyId: env.MINIO_ACCESS_KEY,
    secretAccessKey: env.MINIO_SECRET_KEY,
    service: "s3",
    region: "us-east-1",
  });
}

/** Detects the real image type from magic bytes (never trust client-supplied MIME / extension). */
export function sniffImageMime(buf: ArrayBuffer): string | null {
  const b = new Uint8Array(buf.slice(0, 12));
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "image/png";
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  return null;
}

/** Validates size + declared MIME + actual content. Returns the verified MIME type. */
export function validateUpload(mimeType: string, sizeBytes: number, content?: ArrayBuffer): string {
  if (!IMAGE_MIME_TYPES.has(mimeType)) {
    throw Errors.badRequest("Tipe file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
  }
  if (sizeBytes <= 0 || sizeBytes > MAX_UPLOAD_BYTES) {
    throw Errors.badRequest(`Ukuran file melebihi batas (${MAX_UPLOAD_BYTES / 1024 / 1024}MB).`);
  }
  if (content) {
    const real = sniffImageMime(content);
    if (!real) throw Errors.badRequest("Isi file bukan gambar JPG, PNG, atau WEBP yang valid.");
    return real;
  }
  return mimeType;
}

export async function putObject(env: Env, objectKey: string, body: ArrayBuffer, contentType: string): Promise<void> {
  const url = `${env.MINIO_ENDPOINT}/${env.MINIO_BUCKET}/${objectKey}`;
  const res = await client(env).fetch(url, {
    method: "PUT",
    body,
    headers: { "Content-Type": contentType },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gagal mengunggah file ke storage (${res.status}): ${text.slice(0, 200)}`);
  }
}

export async function deleteObject(env: Env, objectKey: string): Promise<void> {
  const url = `${env.MINIO_ENDPOINT}/${env.MINIO_BUCKET}/${objectKey}`;
  await client(env).fetch(url, { method: "DELETE" });
}

/** Presigned GET so private objects can be shown in <img> tags without
 * making the bucket public. 24h expiry - a 15min default caused a real bug:
 * anyone leaving a tracking/admin page open past that window (or a mobile
 * browser evicting and re-fetching an image from memory) got a 403 from
 * MinIO ("Request has expired"), which renders as a broken-image icon with
 * no visible error. Every URL is signed fresh per page load anyway, so this
 * only widens the window during a single viewing session - it doesn't make
 * links long-lived or shareable beyond that. */
export async function presignGet(env: Env, objectKey: string, expiresSeconds = 60 * 60 * 24): Promise<string> {
  const u = new URL(`${env.MINIO_ENDPOINT}/${env.MINIO_BUCKET}/${objectKey}`);
  u.searchParams.set("X-Amz-Expires", String(expiresSeconds));
  const signed = await client(env).sign(u.toString(), { method: "GET", aws: { signQuery: true } });
  return signed.url;
}
