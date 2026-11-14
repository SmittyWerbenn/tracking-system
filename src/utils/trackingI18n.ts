// Bilingual (ID/EN) wording for everything a customer sees on the tracking page that does not live in
// data/translations.ts: shipment statuses, the 9 LTL pipeline statuses, and the system's default
// Keterangan templates. Stored data stays Indonesian (it is the source of truth); English is derived at
// render time. ltlPipeline.ts is mirrored byte-for-byte with the API, so its English lives here instead.
import type { Language } from "../data/translations";
import { LTL_STAGES, normalizeLtlStage, type LtlStageCode } from "./ltlPipeline";

/** Coarse shipment statuses + timeline event types (also what old, non-LTL logs carry). */
const STATUS_EN: Record<string, string> = {
  "Dalam Persiapan": "In Preparation",
  "Barang Diterima": "Order Received",
  "Di pickup": "Picked Up",
  Berangkat: "Departed",
  Transit: "In Transit",
  "Dalam Perjalanan": "In Transit",
  Kendala: "Issue",
  "Transfer Unit": "Unit Transfer",
  "Tiba di Tujuan": "Arrived at Destination",
  "Selesai / Terkirim": "Delivered",
  Dibatalkan: "Cancelled",
  "Re-route": "Re-routed",
  Penarikan: "Returned to Origin",
  Hold: "On Hold",
};

const LTL_EN: Record<LtlStageCode, string> = {
  ORDER_RECEIVED: "Order Received",
  PICKED_UP: "Picked Up",
  ARRIVED_ORIGIN_HUB: "Arrived at Origin Hub",
  DEPARTED: "Departed",
  IN_TRANSIT: "In Transit",
  ARRIVED_DESTINATION_HUB: "Arrived at Destination Hub",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  POD_RETURNED: "POD Returned",
};

/** Shipment status / event type in the active language (unknown values are shown as they are). */
export function statusLabel(status: string, lang: Language): string {
  return lang === "en" ? STATUS_EN[status] ?? status : status;
}

/** Label of an LTL pipeline status (legacy 25-stage codes included); undefined when `code` is not an LTL status. */
export function ltlStageLabel(code: string | null | undefined, lang: Language): string | undefined {
  const current = normalizeLtlStage(code);
  if (!current) return undefined;
  return lang === "en" ? LTL_EN[current] : LTL_STAGES.find((s) => s.code === current)?.label;
}

/** [Indonesian template, English template]. {a} / {b} are free text (city, consignee name) carried over as typed. */
const KETERANGAN_TEMPLATES: [string, string][] = [
  // LTL pipeline defaults (ltlPipeline.ts)
  ["Pesanan {a} → {b} diproses", "Order {a} → {b} is being processed"],
  ["Cargo diambil dari shipper", "Cargo picked up from shipper"],
  ["Armada linehaul berangkat dari {a}", "Linehaul fleet departed from {a}"],
  ["Cargo menuju area {a}", "Cargo is in transit to {a} area"],
  ["Menunggu proses bongkar & sortir", "Awaiting unloading & sorting process"],
  ["Sedang menuju ke alamat penerima", "Out for delivery to recipient address"],
  ["Menunggu serah terima & POD", "Awaiting handover & POD"],
  ["Dokumen POD / Surat Jalan asli telah kembali dan diterima", "Original POD / Delivery Order document has been returned and received"],
  // Non-LTL quick-select defaults (trackingPresets.ts) and older system texts
  ["Paket telah di-pickup", "Package has been picked up"],
  ["Paket telah diberangkatkan", "Package has departed"],
  ["Paket telah tiba di gudang GMS Logistics", "Package has arrived at the GMS Logistics warehouse"],
  ["Paket sedang dalam perjalanan ke penerima", "Package is on its way to the recipient"],
  ["Paket telah tiba di kota tujuan", "Package has arrived at the destination city"],
  ["Paket telah diterima oleh {a}", "Package has been received by {a}"],
  ["Paket telah diterima", "Package has been received"],
  ["Paket dipindahkan ke unit armada lain", "Package transferred to another fleet unit"],
  ["Paket dialihkan ke rute lain", "Package re-routed to another route"],
  ["Paket ditarik kembali ke gudang asal", "Package returned to the origin warehouse"],
  ["Barang diterima dan siap dikirim", "Goods received and ready to ship"],
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TEMPLATE_RULES = KETERANGAN_TEMPLATES.map(([idText, enText]) => ({
  // Whole-text match only, so a note an admin wrote by hand (or edited) is never half-translated.
  re: new RegExp(`^${escapeRe(idText).replace("\\{a\\}", "(.+?)").replace("\\{b\\}", "(.+?)")}(\\.?)$`, "i"),
  enText,
}));

/** "Cek fisik[, packing kayu][, asuransi] & konsolidasi selesai" - the origin-hub text varies with the shipment's attributes. */
const ORIGIN_HUB_RE = /^Cek fisik(, packing kayu)?(, asuransi)? & konsolidasi selesai(\.?)$/i;

/** A tracking log's Keterangan in the active language. System default texts are translated;
 * anything else (a manual note) is returned exactly as written. */
export function translateKeterangan(text: string, lang: Language): string {
  if (lang !== "en" || !text) return text;
  const trimmed = text.trim();
  const hub = ORIGIN_HUB_RE.exec(trimmed);
  if (hub) return `Physical check${hub[1] ? ", wooden packing" : ""}${hub[2] ? ", insurance" : ""} & consolidation completed${hub[3]}`;
  for (const { re, enText } of TEMPLATE_RULES) {
    const m = re.exec(trimmed);
    if (!m) continue;
    const dot = m[m.length - 1];
    return enText.replace("{a}", m[1] ?? "").replace("{b}", m.length > 3 ? m[2] ?? "" : "") + dot;
  }
  // A note that is just a status name (e.g. "Dalam Perjalanan").
  const ltl = LTL_STAGES.find((s) => s.label.toLowerCase() === trimmed.toLowerCase());
  if (ltl) return LTL_EN[ltl.code];
  return STATUS_EN[trimmed] ?? text;
}

/** "Gudang Jakarta" (the system's first-log location) -> "Jakarta Warehouse"; any other location is left alone. */
export function translateLokasi(lokasi: string, lang: Language): string {
  if (lang !== "en") return lokasi;
  const m = /^Gudang (.+)$/.exec(lokasi);
  return m ? `${m[1]} Warehouse` : lokasi;
}

const DAYS_EN: Record<string, string> = { senin: "Monday", selasa: "Tuesday", rabu: "Wednesday", kamis: "Thursday", jumat: "Friday", "jum'at": "Friday", sabtu: "Saturday", minggu: "Sunday" };

/** Operating hours are free text from Settings ("Senin - Sabtu, 08.00 - 18.00 WIB"); in English only the day names change. */
export function localizeDays(text: string, lang: Language): string {
  if (lang !== "en") return text;
  return text.replace(/\b(senin|selasa|rabu|kamis|jum'?at|sabtu|minggu)\b/gi, (d) => DAYS_EN[d.toLowerCase()] ?? d);
}
