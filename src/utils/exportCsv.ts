import type { Shipment } from "../types";
import { downloadCsv } from "./csv";
import type { DriverShipmentSummary } from "./driverApi";
import { stripKeteranganMeta } from "./format";

/** Quotes cells containing commas, quotes or line breaks (so lists like "62949,62951" stay in one cell).
 * Line breaks are flattened to a space first so every shipment stays on a single spreadsheet row. */
function csvEscape(value: string): string {
  const flat = value.replace(/\r?\n+/g, " ");
  if (/[",\r\n]/.test(flat)) {
    return `"${flat.replace(/"/g, '""')}"`;
  }
  return flat;
}

/** One internal note per AWB. Only admins receive it from the API. */
function internalNotesText(s: Shipment): string {
  return (s.internalNotes ?? "").trim() || "-";
}

/** tanggal: "2026-09-20" -> "20-09-2026" */
function formatTanggalDDMMYYYY(tanggal: string): string {
  const [y, m, d] = tanggal.split("-");
  if (!y || !m || !d) return tanggal;
  return `${d}-${m}-${y}`;
}

function lastUpdateText(s: Shipment): string {
  const last = s.timeline[s.timeline.length - 1];
  if (!last) return "-";
  return `${formatTanggalDDMMYYYY(last.tanggal)} ${last.jam}`;
}

function receivedAtText(s: Shipment): string {
  if (!s.pod) return "-";
  return `${formatTanggalDDMMYYYY(s.pod.tanggal)} ${s.pod.jam}:00`;
}

const COLUMNS = [
  "Referensi",
  "AWB",
  "Client ID",
  "Tanggal",
  "Pengirim",
  "Penerima",
  "Asal",
  "Tujuan",
  "Service",
  "Berat Final (Kg)",
  "Total Koli",
  "Asuransi",
  "Koli Diasuransi",
  "Nilai Asuransi (Rp)",
  "DO Balik",
  "Estimasi Tiba",
  "Diterima Oleh",
  "Tanggal & Waktu Diterima",
  "Keterangan",
  "Keterangan Tracking Terbaru",
  "Keterangan Internal",
  "Status",
  "KPI Performance",
  "Truck",
  "Driver",
  "Last Update",
] as const;

const INTERNAL_COLUMN = COLUMNS.indexOf("Keterangan Internal");

const DAY_MS = 86_400_000;
function dayNum(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

/** KPI Performance: lead time (calendar days, min 1) from the first Di-Pickup log to delivery, versus the SLA target / Estimasi Tiba. */
export function kpiPerformanceText(s: Shipment, today: string = new Date().toISOString().slice(0, 10)): string {
  const events = s.timeline ?? [];
  const pickupDate = events.find((e) => e.ltlStage === "PICKED_UP" || (e.type === "Di pickup" && !e.ltlStage))?.tanggal ?? s.pickupAt;
  if (!pickupDate) return "-";
  const target = s.slaValue ?? null;
  const eta = s.estimasiTiba ? s.estimasiTiba.slice(0, 10) : null;
  const delivered = s.deliveredAt ?? events.find((e) => e.ltlStage === "DELIVERED")?.tanggal ?? (s.status === "Selesai / Terkirim" ? s.pod?.tanggal ?? events.find((e) => e.type === "Selesai / Terkirim")?.tanggal : undefined);
  const targetTxt = target != null ? ` / Target ${target} Hari` : "";
  if (delivered) {
    const lead = Math.max(1, dayNum(delivered) - dayNum(pickupDate));
    if (!eta) return `Selesai (${lead} Hari${targetTxt})`;
    const diff = dayNum(delivered) - dayNum(eta);
    if (diff <= 0) return diff === 0 ? `On Time (${lead} Hari${targetTxt})` : `On Time (+${-diff} Hari lebih cepat)`;
    return `Late - Terlambat ${diff} Hari (${lead} Hari${targetTxt})`;
  }
  if (eta && dayNum(today) > dayNum(eta)) return `Overdue - Lewat ${dayNum(today) - dayNum(eta)} Hari${target != null ? ` (Target ${target} Hari)` : ""}`;
  const day = Math.max(1, dayNum(today) - dayNum(pickupDate) + 1);
  return `In Progress (Hari ke-${day}${targetTxt})`;
}

/** Builds a CSV string from the given shipments (already filtered by the
 * caller) and triggers a real browser download. `includeInternalNotes` is
 * false for the client-facing "Ringkas" export: the Keterangan Internal
 * column (vendor/subcon AWB, internal remarks) is then left out entirely. */
export function exportShipmentsCsv(
  shipments: Shipment[],
  filename = "data-pengiriman.csv",
  { includeInternalNotes = false }: { includeInternalNotes?: boolean } = {},
) {
  const keep = <T,>(cells: readonly T[]): T[] => (includeInternalNotes ? [...cells] : cells.filter((_, i) => i !== INTERNAL_COLUMN));
  const rows = shipments.map((s) => keep([
    s.reference ?? "-",
    s.awb,
    s.customerId ?? "-",
    formatTanggalDDMMYYYY(s.tanggalDibuat),
    s.pengirim.nama,
    s.penerima.nama,
    s.kotaAsal,
    s.kotaTujuan,
    s.layanan,
    s.beratKg,
    s.jumlahKoli,
    s.asuransi ? "Ya" : "Tidak",
    s.asuransi ? (s.koliAsuransi ?? "-") : "-",
    s.asuransi ? (s.nilaiAsuransi ?? "-") : "-",
    !s.requiresDoBalik ? "Tidak" : s.doBalikStatus === "returned" ? "Ya (Sudah Kembali)" : "Ya (Belum Kembali)",
    s.estimasiTiba ? formatTanggalDDMMYYYY(s.estimasiTiba) : "-",
    s.pod?.namaPenerima ?? "-",
    receivedAtText(s),
    stripKeteranganMeta(s.deskripsiBarang),
    s.lastKeterangan?.trim() || "-",
    internalNotesText(s),
    s.status,
    kpiPerformanceText(s),
    s.truck.nomorUnit,
    s.truck.driver ?? "-",
    lastUpdateText(s),
  ]));

  const lines = [keep(COLUMNS).join(","), ...rows.map((row) => row.map((v) => csvEscape(String(v))).join(","))];
  // Prefix a UTF-8 BOM so Excel opens the file with correct encoding.
  const csvContent = "﻿" + lines.join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const DRIVER_COLUMNS = [
  "AWB",
  "Tanggal",
  "Asal",
  "Tujuan",
  "Status",
  "Service",
  "Berat Final (Kg)",
  "Koli",
  "Estimasi Tiba",
  "Truck",
] as const;

/** Same CSV/Excel-friendly download as exportShipmentsCsv, but for the
 * driver portal's own shipment shape (DriverShipmentSummary), which is a
 * narrower response than the admin Shipment type. */
export function exportDriverShipmentsCsv(shipments: DriverShipmentSummary[], filename = "data-kiriman-saya.csv") {
  const rows = shipments.map((s) => [
    s.awb,
    formatTanggalDDMMYYYY(s.tanggalDibuat),
    s.kotaAsal,
    s.kotaTujuan,
    s.status,
    s.layanan,
    String(s.beratKg),
    String(s.jumlahKoli),
    s.estimasiTiba ? formatTanggalDDMMYYYY(s.estimasiTiba) : "-",
    s.truckNomorUnit ?? "-",
  ]);
  downloadCsv(filename, DRIVER_COLUMNS, rows);
}
