import { api } from "./apiClient";

export type RecycleEntity = "shipment" | "user" | "truck" | "location" | "layanan" | "mitra";

export interface RecycleItemResult {
  id: string;
  ok: boolean;
  message?: string;
}

export interface RecycleSummary {
  succeeded: number;
  failed: number;
  results: RecycleItemResult[];
}

/** Move rows to the Recycle Bin (Superadmin only - the API enforces it). A single failed id throws an ApiError. */
export function moveToRecycleBin(entityType: RecycleEntity, ids: string[], reason: string) {
  return api.post<RecycleSummary>("/api/recycle/delete", { entityType, ids, reason });
}

export function restoreFromBin(ids: string[], reason: string) {
  return api.post<RecycleSummary>("/api/recycle/restore", { ids, reason });
}

export function purgeFromBin(ids: string[], reason: string) {
  return api.post<RecycleSummary>("/api/recycle/purge", { ids, reason });
}

/** First failure message of a bulk result, for a one-line toast. */
export function summaryMessage(s: RecycleSummary, okText: string): string {
  if (s.failed === 0) return okText;
  const firstFail = s.results.find((r) => !r.ok)?.message;
  return `${s.succeeded} berhasil, ${s.failed} gagal${firstFail ? `: ${firstFail}` : ""}`;
}
