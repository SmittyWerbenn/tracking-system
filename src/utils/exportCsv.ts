import type { Shipment } from "../types";
import { downloadCsv } from "./csv";
import type { DriverShipmentSummary } from "./driverApi";
import { stripKeteranganMeta } from "./format";
import { countDeliveryDaysExcludingSunday, etaFromPickup } from "./sla";
import { getHolidaySet } from "./holidays";

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
  "Tanggal Order",
  "Tanggal Di Pickup",
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
  "KPI Percentage",
  "Status Kendala",
  "Truck",
  "Driver",
  "Last Update",
] as const;

const INTERNAL_COLUMN = COLUMNS.indexOf("Keterangan Internal");

function pickupDateOf(s: Shipment): string | undefined {
  const events = s.timeline ?? [];
  return events.find((e) => e.ltlStage === "PICKED_UP" || (e.type === "Di pickup" && !e.ltlStage))?.tanggal ?? s.pickupAt;
}

function deliveredDateOf(s: Shipment): string | undefined {
  const events = s.timeline ?? [];
  return s.deliveredAt ?? events.find((e) => e.ltlStage === "DELIVERED")?.tanggal ?? (s.status === "Selesai / Terkirim" ? s.pod?.tanggal ?? events.find((e) => e.type === "Selesai / Terkirim")?.tanggal : undefined);
}

/** Estimasi Tiba = first Di-Pickup date + Target Hari (Mon-Sat, Sundays + holidays skipped). Derived here so rows saved before that rule stay consistent with KPI.
 * Before pickup there is no ETA (never the order date): undefined -> "Menunggu Pickup". */
function effectiveEta(s: Shipment): string | undefined {
  const pickup = pickupDateOf(s);
  return etaFromPickup(pickup ?? null, s.slaValue, getHolidaySet()) ?? undefined;
}

/** KPI Percentage: first Di-Pickup to Terkirim (Sundays excluded) vs Target Hari. Delivered: actual round(target/actual*100)% (can exceed 100% when early).
 * Picked up but not delivered: "In Progress". Not picked up: "-". Order date is only a fallback for delivered legacy rows with no Di-Pickup log. */
export function kpiPercentageText(s: Shipment): string {
  const delivered = deliveredDateOf(s);
  const pickup = pickupDateOf(s) ?? (delivered ? s.tanggalDibuat : undefined);
  if (!pickup) return "-";
  if (!delivered) return "In Progress";
  const actual = countDeliveryDaysExcludingSunday(pickup, delivered, getHolidaySet());
  const target = Math.max(1, s.slaValue ?? 1);
  if (s.slaValue == null) return "100%";
  return `${Math.round((target / Math.max(1, actual)) * 100)}%`;
}

/** Status Kendala: every Kendala tracking log, oldest first, as "[dd-mm-yyyy] keterangan" joined by "; ". Empty when none. */
function kendalaText(s: Shipment): string {
  return (s.kendala ?? [])
    .map((k) => `[${formatTanggalDDMMYYYY(k.tanggal)}] ${k.keterangan?.trim() || k.lokasi?.trim() || "Kendala"}`)
    .join("; ");
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
    pickupDateOf(s) ? formatTanggalDDMMYYYY(pickupDateOf(s)!.slice(0, 10)) : "-",
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
    (() => { const e = effectiveEta(s); return e ? formatTanggalDDMMYYYY(e) : pickupDateOf(s) ? "-" : "Menunggu Pickup"; })(),
    s.pod?.namaPenerima ?? "-",
    receivedAtText(s),
    stripKeteranganMeta(s.deskripsiBarang),
    s.lastKeterangan?.trim() || "-",
    internalNotesText(s),
    s.status,
    kpiPercentageText(s),
    kendalaText(s),
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
    s.estimasiTiba ? formatTanggalDDMMYYYY(s.estimasiTiba) : "Menunggu Pickup",
    s.truckNomorUnit ?? "-",
  ]);
  downloadCsv(filename, DRIVER_COLUMNS, rows);
}
