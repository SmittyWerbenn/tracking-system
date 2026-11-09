import type { Shipment, TimelineEventType } from "../types";

/** Quick-select descriptions per tracking status. "{penerima}" is filled in by the form. */
export const KETERANGAN_PRESETS: Partial<Record<TimelineEventType, string[]>> = {
  "Barang Diterima": ["Paket telah di-pickup."],
  "Di pickup": ["Paket telah di-pickup."],
  Berangkat: ["Paket telah diberangkatkan."],
  Transit: ["Paket telah tiba di gudang GMS Logistics"],
  "Dalam Perjalanan": ["Paket sedang dalam perjalanan ke penerima."],
  "Tiba di Tujuan": ["Paket telah tiba di kota tujuan."],
  "Selesai / Terkirim": ["Paket telah diterima.", "Paket telah diterima oleh {penerima}"],
  Kendala: [],
  "Transfer Unit": ["Paket dipindahkan ke unit armada lain."],
  "Re-route": ["Paket dialihkan ke rute lain."],
  Penarikan: ["Paket ditarik kembali ke gudang asal."],
};

export function presetsFor(type: TimelineEventType, penerima: string): string[] {
  return (KETERANGAN_PRESETS[type] ?? []).map((t) => t.replace("{penerima}", penerima || "penerima"));
}

/** Default "Lokasi" for a status: origin when departing/pulling back, destination when en route/arrived,
 * otherwise the last known location of the shipment (falling back to the destination city). */
export function defaultLokasiFor(type: TimelineEventType, s: Pick<Shipment, "kotaAsal" | "kotaTujuan" | "timeline">): string {
  if (type === "Di pickup" || type === "Berangkat" || type === "Penarikan") return s.kotaAsal;
  if (type === "Dalam Perjalanan" || type === "Tiba di Tujuan" || type === "Selesai / Terkirim") return s.kotaTujuan;
  const last = [...s.timeline].reverse().find((e) => e.lokasi && !e.lokasi.startsWith("Gudang "));
  return last?.lokasi ?? s.kotaTujuan;
}
