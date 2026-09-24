import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  MapPinned,
  Plus,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { useLocations } from "../store/LocationContext";
import type { TitikJenis } from "../types";
import { readTableFromFile } from "../utils/csv";
import {
  downloadBulkLocationTemplate,
  normalizeAktif,
  normalizeJenis,
  tableToBulkLocationRows,
  type BulkLocationRowInput,
} from "../utils/locationImport";

interface BulkLocationRow extends BulkLocationRowInput {
  id: string;
  jenisValue: TitikJenis;
  aktifValue: boolean;
}

const JENIS_OPTIONS: TitikJenis[] = ["Gudang", "Hub", "Transit", "Cabang", "Tujuan"];

let rowSeq = 0;
function newRowId() {
  rowSeq += 1;
  return `bulk-lokasi-${Date.now()}-${rowSeq}`;
}

function emptyRow(): BulkLocationRow {
  return {
    id: newRowId(),
    namaKota: "",
    kodeKota: "",
    provinsi: "",
    jenis: "",
    jenisValue: "Transit",
    aktif: "",
    aktifValue: true,
  };
}

function fromInput(input: BulkLocationRowInput): BulkLocationRow {
  return {
    ...input,
    id: newRowId(),
    jenisValue: normalizeJenis(input.jenis),
    aktifValue: normalizeAktif(input.aktif),
  };
}

function isRowBlank(row: BulkLocationRow): boolean {
  return !row.namaKota.trim() && !row.kodeKota.trim() && !row.provinsi.trim();
}

function rowErrors(row: BulkLocationRow, existingKota: string[], allRows: BulkLocationRow[]): string[] {
  const errs: string[] = [];
  if (!row.namaKota.trim()) errs.push("Nama kota kosong");
  if (!row.kodeKota.trim()) errs.push("Kode kota kosong");
  if (!row.provinsi.trim()) errs.push("Provinsi kosong");

  const normalized = row.namaKota.trim().toLowerCase();
  if (normalized) {
    if (existingKota.includes(normalized)) {
      errs.push(`"${row.namaKota.trim()}" sudah ada di master data`);
    } else if (allRows.some((r) => r.id !== row.id && r.namaKota.trim().toLowerCase() === normalized)) {
      errs.push(`"${row.namaKota.trim()}" duplikat di baris lain pada tabel ini`);
    }
  }
  return errs;
}

const cellInputClass =
  "w-full min-w-[140px] rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100";

export function BulkLocationImport({ existingKota = [] }: { existingKota?: string[] }) {
  const { createTitik } = useLocations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<BulkLocationRow[]>(() => [emptyRow(), emptyRow(), emptyRow()]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ created: string[]; skipped: number } | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  function updateRow<K extends keyof BulkLocationRow>(id: string, key: K, value: BulkLocationRow[K]) {
    setResult(null);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportError(null);
    setImporting(true);
    setResult(null);
    try {
      const table = await readTableFromFile(file);
      const { rows: parsed, headerError } = tableToBulkLocationRows(table);
      if (headerError) {
        setImportError(headerError);
        return;
      }
      if (parsed.length === 0) {
        setImportError("Tidak ada baris data yang terbaca dari file.");
        return;
      }
      const imported = parsed.map(fromInput);
      setRows((prev) => {
        const withoutBlanks = prev.filter((r) => !isRowBlank(r));
        return [...withoutBlanks, ...imported];
      });
    } catch (err) {
      setImportError(
        err instanceof Error
          ? `Gagal membaca file: ${err.message}`
          : "Gagal membaca file. Pastikan formatnya .xlsx atau .csv.",
      );
    } finally {
      setImporting(false);
    }
  }

  async function handleSubmitAll() {
    const withErrors = rows.map((r) => ({ row: r, errors: rowErrors(r, existingKota, rows) }));
    const validRows = withErrors.filter((r) => r.errors.length === 0).map((r) => r.row);
    let skipped = rows.length - validRows.length;
    if (validRows.length === 0) return;

    setSubmitting(true);
    setImportError(null);
    const created: string[] = [];
    for (const row of validRows) {
      try {
        await createTitik({
          namaKota: row.namaKota.trim(),
          kodeKota: row.kodeKota.trim().toUpperCase(),
          provinsi: row.provinsi.trim(),
          jenis: row.jenisValue,
          aktif: row.aktifValue,
        });
        created.push(row.namaKota.trim());
      } catch {
        skipped += 1;
      }
    }
    setResult({ created, skipped });
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    setSubmitting(false);
  }

  const rowsWithErrors = rows.map((r) => ({ row: r, errors: rowErrors(r, existingKota, rows) }));
  const validCount = rowsWithErrors.filter((r) => r.errors.length === 0).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Bulk Input / Import Excel</h2>
            <p className="mt-1 text-xs text-slate-500">
              Isi beberapa baris sekaligus, atau import dari file Excel (.xlsx) / CSV sesuai template. Kolom:
              Nama Kota, Kode Kota, Provinsi, Jenis (Gudang/Hub/Transit/Cabang/Tujuan), Aktif (Ya/Tidak).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadBulkLocationTemplate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Download size={14} />
              Unduh Template
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100 disabled:opacity-60"
            >
              {importing ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
              Import Excel / CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
        {importError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            {importError}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-2.5 py-2.5">Status</th>
              <th className="px-2.5 py-2.5">Nama Kota</th>
              <th className="px-2.5 py-2.5">Kode</th>
              <th className="px-2.5 py-2.5">Provinsi</th>
              <th className="px-2.5 py-2.5">Jenis</th>
              <th className="px-2.5 py-2.5">Aktif</th>
              <th className="px-2.5 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rowsWithErrors.map(({ row, errors }) => (
              <tr key={row.id} className="border-b border-slate-100 align-top last:border-0">
                <td className="relative px-2.5 py-2">
                  {errors.length === 0 ? (
                    <span title="Baris valid" className="inline-flex text-emerald-600">
                      <CheckCircle2 size={16} />
                    </span>
                  ) : (
                    <div className="inline-block">
                      <span
                        onMouseEnter={() => setHoveredRowId(row.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                        onFocus={() => setHoveredRowId(row.id)}
                        onBlur={() => setHoveredRowId(null)}
                        tabIndex={0}
                        className="inline-flex cursor-help text-amber-500 focus:outline-none"
                      >
                        <AlertTriangle size={16} />
                      </span>
                      {hoveredRowId === row.id && (
                        <div className="absolute left-0 top-full z-20 mt-1.5 w-56 rounded-lg border border-slate-200 bg-white p-3 text-left normal-case leading-relaxed text-slate-600 shadow-lg">
                          <p className="mb-1.5 text-[11px] font-semibold text-slate-800">
                            Baris ini belum lengkap:
                          </p>
                          <ul className="list-disc space-y-0.5 pl-3.5 text-[11px]">
                            {errors.map((e) => (
                              <li key={e}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-2.5 py-2">
                  <input
                    className={cellInputClass}
                    value={row.namaKota}
                    onChange={(e) => updateRow(row.id, "namaKota", e.target.value)}
                    placeholder="Jakarta"
                  />
                </td>
                <td className="px-2.5 py-2">
                  <input
                    className={`${cellInputClass} min-w-[80px] uppercase`}
                    value={row.kodeKota}
                    onChange={(e) => updateRow(row.id, "kodeKota", e.target.value)}
                    placeholder="JKT"
                  />
                </td>
                <td className="px-2.5 py-2">
                  <input
                    className={cellInputClass}
                    value={row.provinsi}
                    onChange={(e) => updateRow(row.id, "provinsi", e.target.value)}
                    placeholder="DKI Jakarta"
                  />
                </td>
                <td className="px-2.5 py-2">
                  <select
                    className={cellInputClass}
                    value={row.jenisValue}
                    onChange={(e) => updateRow(row.id, "jenisValue", e.target.value as TitikJenis)}
                  >
                    {JENIS_OPTIONS.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2.5 py-2">
                  <input
                    type="checkbox"
                    checked={row.aktifValue}
                    onChange={(e) => updateRow(row.id, "aktifValue", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-500"
                  />
                </td>
                <td className="px-2.5 py-2">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    title="Hapus baris"
                    className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <Plus size={14} />
          Tambah Baris
        </button>

        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-800">{validCount}</span> dari {rows.length} baris valid
          </p>
          <button
            type="button"
            onClick={handleSubmitAll}
            disabled={submitting || validCount === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <MapPinned size={16} />}
            Simpan {validCount > 0 ? validCount : ""} Titik
          </button>
        </div>
      </div>

      {result && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 size={18} />
            <p className="text-sm font-semibold">
              {result.created.length} titik lokasi berhasil ditambahkan
              {result.skipped > 0 ? `, ${result.skipped} baris dilewati karena tidak valid.` : "."}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {result.created.map((nama, i) => (
              <span key={`${nama}-${i}`} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                {nama}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

