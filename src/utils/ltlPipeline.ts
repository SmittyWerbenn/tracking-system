// LTL (Less Than Truckload) tracking pipeline: 9 ordered statuses. Pure module with no
// imports - the file is mirrored byte-for-byte at src/utils/ltlPipeline.ts (same
// pattern as status.ts) so the API (source of truth) and the UI never disagree.
//
// Design: every LTL status is stored as an ordinary timeline event whose `type`
// is the coarse legacy status it maps to (so dashboards, filters, SLA/ETA, cancel
// rules and non-LTL code keep working) plus a `ltl_stage` code.
//
// History: the pipeline used to have 25 granular stages in 6 phases. Logs written
// back then keep their old `ltl_stage` code in the database; LEGACY_STAGE_MAP folds
// each of them into one of the 9 statuses at read time, so nothing is migrated.
// Packing kayu, insurance and DO Balik are shipment attributes (header badges), not steps.

export type LtlStageCode =
  | "ORDER_RECEIVED" | "PICKED_UP" | "ARRIVED_ORIGIN_HUB" | "DEPARTED"
  | "IN_TRANSIT" | "ARRIVED_DESTINATION_HUB" | "OUT_FOR_DELIVERY" | "DELIVERED" | "POD_RETURNED";

/** Legacy event types an LTL status can map to. */
type LegacyType = "Di pickup" | "Berangkat" | "Dalam Perjalanan" | "Tiba di Tujuan" | "Selesai / Terkirim";
/** Which city a status defaults to: the shipment's origin, its destination, or the active transit point. */
export type LtlCity = "origin" | "destination" | "transit";

export interface LtlStageDef {
  code: LtlStageCode;
  label: string;
  /** Default Keterangan; supports {origin} and {destination}. */
  description: string;
  /** Coarse legacy event type this status is stored as. */
  type: LegacyType;
  city: LtlCity;
  /** May be logged again while it is the current status (one log per transit point). */
  repeatable?: boolean;
}

export const LTL_STAGES: readonly LtlStageDef[] = [
  { code: "ORDER_RECEIVED", label: "Order Dibuat", description: "Pesanan {origin} → {destination} diproses", type: "Di pickup", city: "origin" },
  { code: "PICKED_UP", label: "Di-Pickup", description: "Cargo diambil dari shipper", type: "Di pickup", city: "origin" },
  { code: "ARRIVED_ORIGIN_HUB", label: "Tiba di Gudang Asal", description: "Cek fisik, packing kayu, asuransi & konsolidasi selesai", type: "Di pickup", city: "origin" },
  { code: "DEPARTED", label: "Berangkat", description: "Armada linehaul berangkat dari {origin}", type: "Berangkat", city: "origin" },
  { code: "IN_TRANSIT", label: "Dalam Perjalanan", description: "Cargo menuju area {destination}", type: "Dalam Perjalanan", city: "transit", repeatable: true },
  { code: "ARRIVED_DESTINATION_HUB", label: "Tiba di Gudang Tujuan", description: "Menunggu proses bongkar & sortir", type: "Tiba di Tujuan", city: "destination" },
  { code: "OUT_FOR_DELIVERY", label: "Sedang Diantar", description: "Sedang menuju ke alamat penerima", type: "Tiba di Tujuan", city: "destination" },
  { code: "DELIVERED", label: "Terkirim", description: "Menunggu serah terima & POD", type: "Selesai / Terkirim", city: "destination" },
  // Final step, after the hand-over: the original POD / Surat Jalan is back at GMS (closes DO Balik). No POD photos, no consignee name.
  { code: "POD_RETURNED", label: "POD Kembali", description: "Dokumen POD / Surat Jalan asli telah kembali dan diterima", type: "Selesai / Terkirim", city: "origin" },
];

/** The hand-over to the consignee; everything up to it is the delivery itself, POD_RETURNED is the paperwork after it. */
export const LTL_DELIVERED_INDEX = 7;
export const LTL_FINAL_INDEX = 8;

export const LTL_STAGE_CODES: readonly LtlStageCode[] = LTL_STAGES.map((s) => s.code);

/** Codes of the retired 25-stage pipeline -> the status that replaces them. Codes that kept their name are not listed. */
const LEGACY_STAGE_MAP: Record<string, LtlStageCode> = {
  BOOKING_CONFIRMED: "ORDER_RECEIVED",
  PICK_UP_DISPATCHED: "ORDER_RECEIVED",
  CARGO_VERIFIED: "ARRIVED_ORIGIN_HUB",
  PACKING_REQUIRED: "ARRIVED_ORIGIN_HUB",
  PACKING_COMPLETED: "ARRIVED_ORIGIN_HUB",
  INSURANCE_REQUIRED: "ARRIVED_ORIGIN_HUB",
  INSURANCE_CONFIRMED: "ARRIVED_ORIGIN_HUB",
  READY_FOR_CONSOLIDATION: "ARRIVED_ORIGIN_HUB",
  CONSOLIDATED: "ARRIVED_ORIGIN_HUB",
  LOADED_LINEHAUL: "ARRIVED_ORIGIN_HUB",
  LINEHAUL_DEPARTED: "DEPARTED",
  TRANSIT_HUB: "IN_TRANSIT",
  UNLOADING_TALLY: "ARRIVED_DESTINATION_HUB",
  SORTING_COMPLETED: "ARRIVED_DESTINATION_HUB",
  READY_FOR_DELIVERY: "ARRIVED_DESTINATION_HUB",
  ARRIVED_CONSIGNEE: "OUT_FOR_DELIVERY",
  EPOD_UPLOADED: "DELIVERED",
  HARDCOPY_POD_RETURNED: "POD_RETURNED",
  SHIPMENT_CLOSED: "POD_RETURNED",
};

/** Shipment attributes that only adjust wording now (they no longer add or block steps). */
export interface LtlFlags {
  packingKayu?: boolean | null;
  asuransi?: boolean | null;
}

/** LTL pipeline applies only to the "LTL" / "LTL Domestik" layanan; FTL, Express, Regular... keep their own flow. */
export function isLtlLayanan(layanan: string | null | undefined): boolean {
  return /^ltl(\s|$)/i.test((layanan ?? "").trim());
}

/** Current code for a stored `ltl_stage` (old 25-stage codes included); undefined when it is not an LTL status. */
export function normalizeLtlStage(code: string | null | undefined): LtlStageCode | undefined {
  if (!code) return undefined;
  if ((LTL_STAGE_CODES as readonly string[]).includes(code)) return code as LtlStageCode;
  return LEGACY_STAGE_MAP[code];
}

/** Status definition for a stored code - a legacy code resolves to the status that replaced it. */
export function getLtlStage(code: string | null | undefined): LtlStageDef | undefined {
  const current = normalizeLtlStage(code);
  return current ? LTL_STAGES.find((s) => s.code === current) : undefined;
}

/** Position (0-8) of a stored code in the pipeline; -1 when it is not an LTL status. */
export function ltlStageIndex(code: string | null | undefined): number {
  const current = normalizeLtlStage(code);
  return current ? LTL_STAGE_CODES.indexOf(current) : -1;
}

/** Where a log without an LTL code (driver / legacy input) puts the shipment, by its coarse type. */
const TYPE_FLOOR: Record<string, LtlStageCode> = {
  "Barang Diterima": "ORDER_RECEIVED",
  "Di pickup": "PICKED_UP",
  Berangkat: "DEPARTED",
  Transit: "IN_TRANSIT",
  "Dalam Perjalanan": "IN_TRANSIT",
  "Tiba di Tujuan": "ARRIVED_DESTINATION_HUB",
  "Selesai / Terkirim": "DELIVERED",
};

/** Where a shipment with no usable log stands, by its coarse status. */
const STATUS_FLOOR: Record<string, LtlStageCode> = {
  "Dalam Persiapan": "ORDER_RECEIVED",
  Hold: "ORDER_RECEIVED",
  Berangkat: "DEPARTED",
  Transit: "IN_TRANSIT",
  "Dalam Perjalanan": "IN_TRANSIT",
  Kendala: "IN_TRANSIT",
  "Re-route": "IN_TRANSIT",
  Penarikan: "IN_TRANSIT",
  "Tiba di Tujuan": "ARRIVED_DESTINATION_HUB",
  "Selesai / Terkirim": "DELIVERED",
};

/** Pipeline position of one log: its LTL code, else what its coarse type implies; -1 for exceptions (Kendala, Transfer Unit, ...). */
export function ltlIndexOfEvent(e: { ltlStage?: string | null; type?: string | null }): number {
  const byStage = ltlStageIndex(e.ltlStage);
  return byStage >= 0 ? byStage : ltlStageIndex(TYPE_FLOOR[e.type ?? ""]);
}

/** Index (0-8) of the shipment's current status. `events` must be chronological (oldest first, as the API sends them):
 * the newest log that carries a pipeline position decides - the same log that sits on the top "TERBARU" row
 * (exceptions such as Kendala are stepped over). With no such log it falls back to the coarse status.
 * A delivered shipment is at Terkirim, or at POD Kembali once that was logged (whatever the dates on the logs). */
export function currentLtlIndex(events: ReadonlyArray<{ ltlStage?: string | null; type?: string | null }>, status: string): number {
  if (status === "Selesai / Terkirim") {
    return events.some((e) => ltlStageIndex(e.ltlStage) === LTL_FINAL_INDEX) ? LTL_FINAL_INDEX : LTL_DELIVERED_INDEX;
  }
  for (let i = events.length - 1; i >= 0; i--) {
    const idx = ltlIndexOfEvent(events[i]);
    if (idx >= 0) return idx;
  }
  return ltlStageIndex(STATUS_FLOOR[status]);
}

/** Whether a status may be logged when the shipment is at `currentIndex`: forward only, plus repeating a repeatable current status.
 * POD Kembali never skips the hand-over: it is only available once the shipment is at Terkirim. */
export function canLogLtlStage(stage: LtlStageDef, currentIndex: number): boolean {
  const i = LTL_STAGE_CODES.indexOf(stage.code);
  if (i === LTL_FINAL_INDEX) return currentIndex === LTL_DELIVERED_INDEX;
  return i > currentIndex || (i === currentIndex && !!stage.repeatable);
}

/** Statuses still selectable, in pipeline order (skipping ahead is allowed, going back is not). */
export function nextLtlStages(currentIndex: number): LtlStageDef[] {
  return LTL_STAGES.filter((s) => canLogLtlStage(s, currentIndex));
}

/** Default Keterangan of a status. The origin-hub text only mentions packing kayu / asuransi when the shipment has them. */
export function renderLtlDescription(stage: LtlStageDef, origin: string, destination: string, flags: LtlFlags = { packingKayu: true, asuransi: true }): string {
  let text = stage.description;
  if (stage.code === "ARRIVED_ORIGIN_HUB") {
    const steps = ["Cek fisik", ...(flags.packingKayu ? ["packing kayu"] : []), ...(flags.asuransi ? ["asuransi"] : [])];
    text = `${steps.join(", ")} & konsolidasi selesai`;
  }
  return text.replace(/\{origin\}/g, origin || "asal").replace(/\{destination\}/g, destination || "tujuan");
}
