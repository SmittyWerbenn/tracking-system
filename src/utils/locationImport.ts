import type { TitikJenis, TitikLokasi } from "../types";
import { normalizeHeader } from "./csv";
import { downloadXlsx } from "./xlsx";

/** Template / export layout. Kota / Kabupaten and Nama Titik Transit are
 * required; Provinsi, Kode, Jenis and Aktif are optional (Jenis defaults to
 * Transit, Aktif to Ya). */
export const LOCATION_TEMPLATE_HEADERS = ["Kota / Kabupaten", "Provinsi", "Nama Titik Transit", "Kode", "Jenis", "Aktif"] as const;

export interface BulkLocationRowInput {
  namaKota: string;
  provinsi: string;
  namaTitik: string;
  kodeKota: string;
  jenis: string;
  aktif: string;
  /** Row number in the source file (header = row 1), for error messages. */
  sourceRow: number;
}

type Field = Exclude<keyof BulkLocationRowInput, "sourceRow">;

/** Header names accepted per field (compared case/spacing-insensitively).
 * Kota and Kabupaten are one column now, so every spelling of it maps to the
 * same field; the old "Nama Kota" / "Kode Kota" names keep working. */
const HEADER_ALIASES: Record<Field, string[]> = {
  namaKota: ["Kota / Kabupaten", "Kota/Kabupaten", "Kota", "Kabupaten", "Nama Kota"],
  provinsi: ["Provinsi"],
  namaTitik: ["Nama Titik Transit", "Titik Transit", "Nama Titik"],
  kodeKota: ["Kode", "Kode Kota"],
  jenis: ["Jenis", "Jenis Titik"],
  aktif: ["Aktif", "Status"],
};

const HEADER_LOOKUP = new Map<string, Field>();
for (const [field, names] of Object.entries(HEADER_ALIASES) as [Field, string[]][]) {
  for (const n of names) HEADER_LOOKUP.set(normalizeHeader(n), field);
}

const REQUIRED_FIELDS: { field: Field; label: string }[] = [
  { field: "namaKota", label: "Kota / Kabupaten" },
  { field: "namaTitik", label: "Nama Titik Transit" },
];

/**
 * Converts a raw 2D table (CSV or read-excel-file) into row objects, matching
 * the header row by name (case/spacing-insensitive), so column order doesn't
 * matter. Fails with a clear message when a required column is missing. If a
 * file has both a "Kota" and a "Kabupaten" column, the first non-empty value
 * of the two is used.
 */
export function tableToBulkLocationRows(table: unknown[][]): {
  rows: BulkLocationRowInput[];
  headerError?: string;
} {
  if (table.length === 0) return { rows: [], headerError: "File kosong." };

  const headerRow = table[0].map((c) => normalizeHeader(String(c ?? "")));
  const fieldByColumn = headerRow.map((h) => HEADER_LOOKUP.get(h));
  const present = new Set(fieldByColumn.filter((f): f is Field => !!f));

  if (present.size === 0) {
    return { rows: [], headerError: "Header kolom tidak dikenali. Gunakan template yang disediakan (Kota / Kabupaten, Provinsi, Nama Titik Transit)." };
  }
  const missing = REQUIRED_FIELDS.filter((r) => !present.has(r.field)).map((r) => r.label);
  if (missing.length > 0) {
    return { rows: [], headerError: `Kolom wajib tidak ditemukan di file: ${missing.join(", ")}. Gunakan template yang disediakan.` };
  }

  const rows: BulkLocationRowInput[] = [];
  for (let r = 1; r < table.length; r++) {
    const raw = table[r];
    if (!raw || raw.every((c) => c === null || c === undefined || String(c).trim() === "")) continue;

    const record: Partial<Record<Field, string>> = {};
    fieldByColumn.forEach((field, colIndex) => {
      if (!field) return;
      const cell = raw[colIndex];
      const value = cell === null || cell === undefined ? "" : String(cell).trim();
      if (!record[field]) record[field] = value;
    });

    rows.push({
      namaKota: record.namaKota ?? "",
      provinsi: record.provinsi ?? "",
      namaTitik: record.namaTitik ?? "",
      kodeKota: record.kodeKota ?? "",
      jenis: record.jenis ?? "",
      aktif: record.aktif ?? "",
      sourceRow: r + 1,
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

/** Case/whitespace-insensitive identity of a location (Kota / Kabupaten +
 * Provinsi + Nama Titik Transit) - the same rule the API uses for duplicates. */
export function locationIdentity(kota: string, provinsi: string, titik: string): string {
  return [kota, provinsi, titik].map((s) => s.trim().replace(/\s+/g, " ").toLowerCase()).join("\u0001");
}

const COLUMN_WIDTHS = [28, 22, 34, 10, 12, 8];

/** Downloads every Kota & Titik Transit as .xlsx in the same layout the import
 * reads, so the file can be completed and uploaded back as-is. */
export async function exportLocationsXlsx(titik: TitikLokasi[]): Promise<void> {
  const sorted = [...titik].sort(
    (a, b) =>
      a.provinsi.localeCompare(b.provinsi, "id") ||
      a.namaKota.localeCompare(b.namaKota, "id") ||
      a.namaTitik.localeCompare(b.namaTitik, "id"),
  );
  const today = new Date().toISOString().slice(0, 10);
  await downloadXlsx(
    `kota-titik-transit-${today}.xlsx`,
    LOCATION_TEMPLATE_HEADERS,
    sorted.map((t) => [t.namaKota, t.provinsi, t.namaTitik, t.kodeKota, t.jenis, t.aktif ? "Ya" : "Tidak"]),
    COLUMN_WIDTHS,
  );
}

export async function downloadBulkLocationTemplate(): Promise<void> {
  await downloadXlsx(
    "template-kota-titik-transit.xlsx",
    LOCATION_TEMPLATE_HEADERS,
    [
      ["Jakarta Pusat", "DKI Jakarta", "Gudang Transit Pulogadung", "JKT", "Transit", "Ya"],
      ["Kabupaten Semarang", "Jawa Tengah", "Hub Semarang", "SMG", "Hub", "Ya"],
    ],
    COLUMN_WIDTHS,
  );
}
