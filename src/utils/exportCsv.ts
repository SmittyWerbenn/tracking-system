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
  "Truck",
  "Driver",
  "Last Update",
] as const;

/** Builds a CSV string from the given shipments (already filtered by the
 * caller) and triggers a real browser download. */
export function exportShipmentsCsv(shipments: Shipment[], filename = "data-pengiriman.csv") {
  const rows = shipments.map((s) => [
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
    s.truck.nomorUnit,
    s.truck.driver ?? "-",
    lastUpdateText(s),
  ]);

  const lines = [COLUMNS.join(","), ...rows.map((row) => row.map((v) => csvEscape(String(v))).join(","))];
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
