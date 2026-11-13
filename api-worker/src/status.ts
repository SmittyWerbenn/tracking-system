// Mirrors src/utils/status.ts on the frontend - kept here as the
// server-side source of truth so the forward-only pipeline rule can never
// be bypassed by a direct API call, even though the UI already enforces it.

export type ShipmentStatus =
  | "Dalam Persiapan"
  | "Berangkat"
  | "Transit"
  | "Dalam Perjalanan"
  | "Kendala"
  | "Tiba di Tujuan"
  | "Selesai / Terkirim"
  | "Dibatalkan"
  | "Re-route"
  | "Penarikan"
  | "Hold";

export type TimelineEventType =
  | "Barang Diterima"
  | "Di pickup"
  | "Berangkat"
  | "Transit"
  | "Dalam Perjalanan"
  | "Kendala"
  | "Transfer Unit"
  | "Tiba di Tujuan"
  | "Selesai / Terkirim"
  | "Re-route"
  | "Penarikan";

export const TIMELINE_EVENT_TYPES: TimelineEventType[] = [
  "Barang Diterima",
  "Di pickup",
  "Berangkat",
  "Transit",
  "Dalam Perjalanan",
  "Kendala",
  "Transfer Unit",
  "Tiba di Tujuan",
  "Selesai / Terkirim",
  "Re-route",
  "Penarikan",
];

const PIPELINE_RANK: Record<string, number> = {
  "Dalam Persiapan": 0,
  "Barang Diterima": 0,
  "Di pickup": 0,
  Berangkat: 1,
  Transit: 2,
  "Dalam Perjalanan": 2,
  Kendala: 2,
  "Re-route": 2,
  Penarikan: 2,
  "Transfer Unit": 2,
  "Tiba di Tujuan": 3,
  "Selesai / Terkirim": 4,
};

export function pipelineRank(status: string): number {
  return PIPELINE_RANK[status] ?? 0;
}

export function eventTypeToShipmentStatus(type: TimelineEventType): ShipmentStatus {
  if (type === "Barang Diterima" || type === "Di pickup") return "Dalam Persiapan";
  if (type === "Transfer Unit") return "Dalam Perjalanan";
  return type as ShipmentStatus;
}

export function isForwardTransition(currentStatus: string, nextType: TimelineEventType): boolean {
  if (nextType === "Barang Diterima") return false;
  return pipelineRank(nextType) >= pipelineRank(currentStatus);
}

/** Tracking history is ordered by the event's own date/time (it may be backdated); `seq` (input order) only breaks ties
 * within the same minute. The newest row by this order is the shipment's "TERBARU" log and decides its status. */
export function timelineOrderSql(dir: "ASC" | "DESC", alias = ""): string {
  const p = alias ? `${alias}.` : "";
  return `${p}tanggal ${dir}, ${p}jam ${dir}, ${p}seq ${dir}`;
}

/** Same order as timelineOrderSql("ASC") for rows already in memory. */
export function compareTimeline(a: { tanggal: string; jam: string; seq: number }, b: { tanggal: string; jam: string; seq: number }): number {
  const ka = `${a.tanggal}T${a.jam}`;
  const kb = `${b.tanggal}T${b.jam}`;
  return ka < kb ? -1 : ka > kb ? 1 : a.seq - b.seq;
}
