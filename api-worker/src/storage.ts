import { AwsClient } from "aws4fetch";
import type { Env } from "./types";

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

export function validateUpload(mimeType: string, sizeBytes: number): void {
  if (!IMAGE_MIME_TYPES.has(mimeType)) {
    throw new Error(`Tipe file "${mimeType}" tidak didukung. Gunakan JPG, PNG, atau WEBP.`);
  }
  if (sizeBytes <= 0 || sizeBytes > MAX_UPLOAD_BYTES) {
    throw new Error(`Ukuran file melebihi batas (${MAX_UPLOAD_BYTES / 1024 / 1024}MB).`);
  }
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
