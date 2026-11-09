import type { Shipment, TimelineEventType } from "../types";

/** Quick-select descriptions per tracking status. "{penerima}" is filled in by the form. */
export const KETERANGAN_PRESETS: Partial<Record<TimelineEventType, string[]>> = {
  Berangkat: ["Paket telah diberangkatkan dari gudang GMS Logistics"],
  Transit: ["Paket telah tiba di gudang GMS Logistics", "Paket sedang transit di hub GMS Logistics"],
  "Dalam Perjalanan": ["Paket sedang dibawa kurir menuju alamat tujuan", "Paket dalam perjalanan menuju kota tujuan"],
  "Tiba di Tujuan": ["Paket telah tiba di kota tujuan"],
  "Selesai / Terkirim": ["Paket telah diterima oleh {penerima}"],
  Kendala: [],
  "Transfer Unit": ["Paket dipindahkan ke unit armada lain"],
  "Re-route": ["Paket dialihkan ke rute lain"],
  Penarikan: ["Paket ditarik kembali ke gudang asal"],
};

export function presetsFor(type: TimelineEventType, penerima: string): string[] {
  return (KETERANGAN_PRESETS[type] ?? []).map((t) => t.replace("{penerima}", penerima || "penerima"));
}

/** Default "Lokasi" for a status: origin when departing/pulling back, destination on arrival,
 * otherwise the last known location of the shipment (falling back to the destination city). */
export function defaultLokasiFor(type: TimelineEventType, s: Pick<Shipment, "kotaAsal" | "kotaTujuan" | "timeline">): string {
  if (type === "Berangkat" || type === "Penarikan") return s.kotaAsal;
  if (type === "Tiba di Tujuan" || type === "Selesai / Terkirim") return s.kotaTujuan;
  const last = [...s.timeline].reverse().find((e) => e.lokasi && !e.lokasi.startsWith("Gudang "));
  return last?.lokasi ?? s.kotaTujuan;
}
