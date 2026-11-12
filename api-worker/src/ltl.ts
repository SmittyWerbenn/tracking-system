// LTL (Less Than Truckload) tracking pipeline: 25 ordered milestones with three
// conditional groups (packing kayu, insurance, transit hub). Pure module with no
// imports - the file is mirrored byte-for-byte at src/utils/ltlPipeline.ts (same
// pattern as status.ts) so the API (source of truth) and the UI never disagree.
//
// Design: every LTL milestone is stored as an ordinary timeline event whose `type`
// is the coarse legacy status it maps to (so dashboards, filters, SLA/ETA, cancel
// rules and non-LTL code keep working) plus a `ltl_stage` code with the fine detail.

export type LtlStageCode =
  | "BOOKING_CONFIRMED" | "PICK_UP_DISPATCHED" | "PICKED_UP" | "ARRIVED_ORIGIN_HUB" | "CARGO_VERIFIED"
  | "PACKING_REQUIRED" | "PACKING_COMPLETED" | "INSURANCE_REQUIRED" | "INSURANCE_CONFIRMED"
  | "READY_FOR_CONSOLIDATION" | "CONSOLIDATED" | "LOADED_LINEHAUL" | "LINEHAUL_DEPARTED" | "IN_TRANSIT"
  | "TRANSIT_HUB" | "ARRIVED_DESTINATION_HUB" | "UNLOADING_TALLY" | "SORTING_COMPLETED" | "READY_FOR_DELIVERY"
  | "OUT_FOR_DELIVERY" | "ARRIVED_CONSIGNEE" | "DELIVERED" | "EPOD_UPLOADED" | "HARDCOPY_POD_RETURNED" | "SHIPMENT_CLOSED";

/** Legacy event types an LTL stage can map to. */
type LegacyType = "Di pickup" | "Berangkat" | "Transit" | "Dalam Perjalanan" | "Tiba di Tujuan" | "Selesai / Terkirim";
export type LtlCondition = "packing" | "insurance" | "transit";
/** Which city a stage defaults to: the shipment's origin, its destination, or the last known location. */
export type LtlCity = "origin" | "destination" | "last" | "manual";

export interface LtlStageDef {
  code: LtlStageCode;
  label: string;
  /** Default Keterangan; supports {origin} and {destination}. */
  description: string;
  /** Coarse legacy event type this stage is stored as. */
  type: LegacyType;
  /** Index into LTL_PHASES (the 6 macro steps of the stepper). */
  phase: number;
  city: LtlCity;
  /** Only part of the pipeline when this shipment attribute is true. */
  condition?: LtlCondition;
}

export const LTL_STAGES: readonly LtlStageDef[] = [
  { code: "BOOKING_CONFIRMED", label: "BOOKING CONFIRMED", description: "Order {origin} → {destination} sudah diterima", type: "Di pickup", phase: 0, city: "origin" },
  { code: "PICK_UP_DISPATCHED", label: "PICK UP DISPATCHED", description: "Armada pickup menuju lokasi shipper", type: "Di pickup", phase: 0, city: "origin" },
  { code: "PICKED_UP", label: "PICKED UP", description: "Cargo berhasil diambil dari shipper", type: "Di pickup", phase: 0, city: "origin" },
  { code: "ARRIVED_ORIGIN_HUB", label: "ARRIVED ORIGIN HUB", description: "Cargo sudah tiba di hub asal", type: "Di pickup", phase: 1, city: "origin" },
  { code: "CARGO_VERIFIED", label: "CARGO VERIFIED", description: "Koli, berat, volume dan kondisi cargo sudah diperiksa", type: "Di pickup", phase: 1, city: "origin" },
  { code: "PACKING_REQUIRED", label: "PACKING REQUIRED", description: "Cargo membutuhkan packing kayu", type: "Di pickup", phase: 1, city: "origin", condition: "packing" },
  { code: "PACKING_COMPLETED", label: "PACKING COMPLETED", description: "Proses packing kayu selesai", type: "Di pickup", phase: 1, city: "origin", condition: "packing" },
  { code: "INSURANCE_REQUIRED", label: "INSURANCE REQUIRED", description: "Cargo memerlukan perlindungan asuransi", type: "Di pickup", phase: 1, city: "origin", condition: "insurance" },
  { code: "INSURANCE_CONFIRMED", label: "INSURANCE CONFIRMED", description: "Asuransi cargo sudah terkonfirmasi", type: "Di pickup", phase: 1, city: "origin", condition: "insurance" },
  { code: "READY_FOR_CONSOLIDATION", label: "READY FOR CONSOLIDATION", description: "Cargo siap masuk konsolidasi", type: "Di pickup", phase: 2, city: "origin" },
  { code: "CONSOLIDATED", label: "CONSOLIDATED", description: "Cargo sudah digabung dengan muatan LTL lainnya", type: "Di pickup", phase: 2, city: "origin" },
  { code: "LOADED_LINEHAUL", label: "LOADED LINEHAUL", description: "Cargo sudah dimuat ke armada linehaul", type: "Di pickup", phase: 2, city: "origin" },
  { code: "LINEHAUL_DEPARTED", label: "LINEHAUL DEPARTED", description: "Armada linehaul telah berangkat", type: "Berangkat", phase: 2, city: "origin" },
  { code: "IN_TRANSIT", label: "IN TRANSIT", description: "Cargo dalam perjalanan menuju area tujuan", type: "Dalam Perjalanan", phase: 2, city: "last" },
  { code: "TRANSIT_HUB", label: "TRANSIT HUB", description: "Cargo diproses di hub transit", type: "Transit", phase: 2, city: "manual", condition: "transit" },
  { code: "ARRIVED_DESTINATION_HUB", label: "ARRIVED DESTINATION HUB", description: "Cargo sudah tiba di hub tujuan", type: "Tiba di Tujuan", phase: 3, city: "destination" },
  { code: "UNLOADING_TALLY", label: "UNLOADING + TALLY", description: "Cargo dibongkar dan jumlah koli diverifikasi", type: "Tiba di Tujuan", phase: 3, city: "destination" },
  { code: "SORTING_COMPLETED", label: "SORTING COMPLETED", description: "Cargo selesai sortir untuk rute {destination}", type: "Tiba di Tujuan", phase: 3, city: "destination" },
  { code: "READY_FOR_DELIVERY", label: "READY FOR DELIVERY", description: "Cargo siap proses last mile", type: "Tiba di Tujuan", phase: 3, city: "destination" },
  { code: "OUT_FOR_DELIVERY", label: "OUT FOR DELIVERY", description: "Cargo menuju alamat consignee", type: "Tiba di Tujuan", phase: 4, city: "destination" },
  { code: "ARRIVED_CONSIGNEE", label: "ARRIVED CONSIGNEE", description: "Armada tiba di lokasi penerima", type: "Tiba di Tujuan", phase: 4, city: "destination" },
  { code: "DELIVERED", label: "DELIVERED", description: "Cargo selesai diserahterimakan kepada consignee", type: "Selesai / Terkirim", phase: 5, city: "destination" },
  { code: "EPOD_UPLOADED", label: "e-POD UPLOADED", description: "Bukti serah terima digital tersedia", type: "Selesai / Terkirim", phase: 5, city: "destination" },
  { code: "HARDCOPY_POD_RETURNED", label: "HARDCOPY POD RETURNED", description: "SJ/POD asli telah kembali", type: "Selesai / Terkirim", phase: 5, city: "destination" },
  { code: "SHIPMENT_CLOSED", label: "SHIPMENT CLOSED", description: "Pengiriman LTL selesai dan ditutup", type: "Selesai / Terkirim", phase: 5, city: "destination" },
];

/** The 6 macro steps shown in the stepper; the 25 stages roll up into them. */
export const LTL_PHASES = ["Pickup", "Origin Hub & Handling", "Consolidation & Linehaul", "Destination Hub", "Out for Delivery", "Delivered & POD"] as const;

export const LTL_STAGE_CODES: readonly LtlStageCode[] = LTL_STAGES.map((s) => s.code);

/** Attributes of a shipment that decide which conditional stages apply. */
export interface LtlFlags {
  packingKayu?: boolean | null;
  asuransi?: boolean | null;
  hasTransit?: boolean | null;
}

/** LTL pipeline applies only to the "LTL" / "LTL Domestik" layanan; FTL, Express, Regular... keep their own flow. */
export function isLtlLayanan(layanan: string | null | undefined): boolean {
  return /^ltl(\s|$)/i.test((layanan ?? "").trim());
}

export function getLtlStage(code: string | null | undefined): LtlStageDef | undefined {
  return LTL_STAGES.find((s) => s.code === code);
}

export function ltlStageIndex(code: string | null | undefined): number {
  return LTL_STAGES.findIndex((s) => s.code === code);
}

export function isStageApplicable(stage: LtlStageDef, f: LtlFlags): boolean {
  switch (stage.condition) {
    case "packing": return !!f.packingKayu;
    case "insurance": return !!f.asuransi;
    case "transit": return !!f.hasTransit;
    default: return true;
  }
}

/** The stages that make up this shipment's pipeline (conditional ones dropped when they don't apply). */
export function applicableLtlStages(f: LtlFlags): LtlStageDef[] {
  return LTL_STAGES.filter((s) => isStageApplicable(s, f));
}

/** Where a shipment with no (or only legacy) tracking logs stands, derived from its coarse status. */
const STATUS_FLOOR: Record<string, LtlStageCode> = {
  "Dalam Persiapan": "BOOKING_CONFIRMED",
  Hold: "BOOKING_CONFIRMED",
  Berangkat: "LINEHAUL_DEPARTED",
  Transit: "IN_TRANSIT",
  "Dalam Perjalanan": "IN_TRANSIT",
  "Tiba di Tujuan": "ARRIVED_DESTINATION_HUB",
  "Selesai / Terkirim": "DELIVERED",
};

/** Index of the furthest stage reached: highest logged ltl stage, else a floor from the coarse status. -1 = nothing yet. */
export function currentLtlIndex(events: ReadonlyArray<{ ltlStage?: string | null }>, status: string): number {
  let max = -1;
  for (const e of events) max = Math.max(max, ltlStageIndex(e.ltlStage));
  if (max >= 0) return max;
  return ltlStageIndex(STATUS_FLOOR[status]);
}

/** Stages still selectable: applicable ones after the current stage (skipping ahead is allowed, going back is not). */
export function nextLtlStages(f: LtlFlags, currentIndex: number): LtlStageDef[] {
  return LTL_STAGES.filter((s, i) => i > currentIndex && isStageApplicable(s, f));
}

export function renderLtlDescription(stage: LtlStageDef, origin: string, destination: string): string {
  return stage.description.replace(/\{origin\}/g, origin || "asal").replace(/\{destination\}/g, destination || "tujuan");
}

/** Phase (0-5) the shipment is in, for the macro stepper. */
export function ltlPhaseOf(index: number): number {
  return index < 0 ? 0 : LTL_STAGES[index].phase;
}
