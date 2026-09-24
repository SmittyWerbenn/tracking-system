import type { TitikJenis } from "../types";
import { downloadCsv, normalizeHeader } from "./csv";

export const LOCATION_TEMPLATE_HEADERS = ["Nama Kota", "Kode Kota", "Provinsi", "Jenis", "Aktif"] as const;

export interface BulkLocationRowInput {
  namaKota: string;
  kodeKota: string;
  provinsi: string;
  jenis: string;
  aktif: string;
}

const FIELD_ORDER: (keyof BulkLocationRowInput)[] = ["namaKota", "kodeKota", "provinsi", "jenis", "aktif"];

const HEADER_LOOKUP = new Map(LOCATION_TEMPLATE_HEADERS.map((h, i) => [normalizeHeader(h), FIELD_ORDER[i]]));

/**
 * Converts a raw 2D table (from CSV parsing or read-excel-file) into row
 * objects, matching the header row against LOCATION_TEMPLATE_HEADERS
 * (case/spacing-insensitive) so column order in the uploaded file doesn't
 * matter as long as the header names match.
 */
export function tableToBulkLocationRows(table: unknown[][]): {
  rows: BulkLocationRowInput[];
  headerError?: string;
} {
  if (table.length === 0) return { rows: [], headerError: "File kosong." };

  const headerRow = table[0].map((c) => normalizeHeader(String(c ?? "")));
  const fieldByColumn = headerRow.map((h) => HEADER_LOOKUP.get(h));
  const matchedCount = fieldByColumn.filter(Boolean).length;

  if (matchedCount === 0) {
    return {
      rows: [],
      headerError: "Header kolom tidak dikenali. Gunakan template yang disediakan.",
    };
  }

  const rows: BulkLocationRowInput[] = [];
  for (let r = 1; r < table.length; r++) {
    const raw = table[r];
    if (!raw || raw.every((c) => c === null || c === undefined || String(c).trim() === "")) continue;

    const record: Partial<BulkLocationRowInput> = {};
    fieldByColumn.forEach((field, colIndex) => {
      if (!field) return;
      const cell = raw[colIndex];
      record[field] = cell === null || cell === undefined ? "" : String(cell).trim();
    });

    rows.push({
      namaKota: record.namaKota ?? "",
      kodeKota: record.kodeKota ?? "",
      provinsi: record.provinsi ?? "",
      jenis: record.jenis ?? "",
      aktif: record.aktif ?? "",
    });
  }

  return { rows };
}

const JENIS_VALUES: TitikJenis[] = ["Gudang", "Hub", "Transit", "Cabang", "Tujuan"];

export function normalizeJenis(value: string): TitikJenis {
  const v = value.trim().toLowerCase();
  const match = JENIS_VALUES.find((j) => j.toLowerCase() === v);
  return match ?? "Transit";
}

/** Blank/"ya"/"aktif"/"true"/"1" all read as active; anything else (e.g.
 * "tidak", "nonaktif", "0") reads as inactive. */
export function normalizeAktif(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (v === "") return true;
  return ["ya", "aktif", "true", "1", "yes", "active"].includes(v);
}

export function downloadBulkLocationTemplate() {
  downloadCsv("template-bulk-lokasi.csv", LOCATION_TEMPLATE_HEADERS, [
    ["Jakarta", "JKT", "DKI Jakarta", "Gudang", "Ya"],
    ["Semarang", "SMG", "Jawa Tengah", "Transit", "Ya"],
  ]);
}
