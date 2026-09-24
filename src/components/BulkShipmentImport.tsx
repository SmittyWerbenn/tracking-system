import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useFleet } from "../store/FleetContext";
import { useLocations } from "../store/LocationContext";
import { useShipments } from "../store/ShipmentContext";
import type { LayananPengiriman } from "../types";

interface CreatedShipmentSummary {
  awb: string;
  kotaAsal: string;
  kotaTujuan: string;
}
import { readTableFromFile } from "../utils/csv";
import {
  downloadBulkShipmentTemplate,
  normalizeLayanan,
  tableToBulkRows,
  type BulkRowInput,
} from "../utils/shipmentImport";

interface BulkRow extends BulkRowInput {
  id: string;
  layananValue: LayananPengiriman;
}

const LAYANAN_OPTIONS: LayananPengiriman[] = ["Darat", "Express", "Kargo", "Regular", "Charter"];

let rowSeq = 0;
function newRowId() {
  rowSeq += 1;
  return `bulk-row-${Date.now()}-${rowSeq}`;
}

function emptyRow(): BulkRow {
  return {
    id: newRowId(),
    pengirimNama: "",
    pengirimTelepon: "",
    pengirimEmail: "",
    penerimaNama: "",
    penerimaTelepon: "",
    penerimaEmail: "",
    kotaAsal: "",
    alamatAsal: "",
    kotaTujuan: "",
    alamatTujuan: "",
    layanan: "",
    layananValue: "Regular",
    beratKg: "",
    jumlahKoli: "",
    deskripsiBarang: "",
    nomorPolisiTruck: "",
  };
}

function fromInput(input: BulkRowInput): BulkRow {
  return {
    ...input,
    id: newRowId(),
    layananValue: normalizeLayanan(input.layanan),
  };
}

/** Matches an imported city name against master data ignoring case/whitespace
 * differences, so e.g. "jakarta" or "JAKARTA " still resolves to "Jakarta".
 * Returns the original (trimmed) text unchanged if nothing matches, so the
 * dropdown can still show what was actually imported instead of going blank. */
function resolveKota(value: string, knownKota: string[]): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const exact = knownKota.find((k) => k === trimmed);
  if (exact) return exact;
  const loose = trimmed.toLowerCase().replace(/\s+/g, " ");
  return knownKota.find((k) => k.toLowerCase() === loose) ?? trimmed;
}

function rowErrors(row: BulkRow, knownKota: string[]): string[] {
  const errs: string[] = [];
  if (!row.pengirimNama.trim()) errs.push("Nama pengirim kosong");
  if (!row.pengirimTelepon.trim()) errs.push("No HP pengirim kosong");
  if (!row.pengirimEmail.trim()) errs.push("Email pengirim kosong");
  if (!row.penerimaNama.trim()) errs.push("Nama penerima kosong");
  if (!row.penerimaTelepon.trim()) errs.push("No HP penerima kosong");
  if (!row.penerimaEmail.trim()) errs.push("Email penerima kosong");
  if (!row.kotaAsal) errs.push("Kota asal belum dipilih");
  else if (!knownKota.includes(row.kotaAsal))
    errs.push(`Kota asal "${row.kotaAsal}" tidak ada di master data, pilih dari daftar`);
  if (!row.alamatAsal.trim()) errs.push("Alamat asal kosong");
  if (!row.kotaTujuan) errs.push("Kota tujuan belum dipilih");
  else if (!knownKota.includes(row.kotaTujuan))
    errs.push(`Kota tujuan "${row.kotaTujuan}" tidak ada di master data, pilih dari daftar`);
  if (!row.alamatTujuan.trim()) errs.push("Alamat tujuan kosong");
  if (!row.deskripsiBarang.trim()) errs.push("Deskripsi barang kosong");
  const berat = Number(row.beratKg);
  if (!row.beratKg || !Number.isFinite(berat) || berat <= 0) errs.push("Berat tidak valid");
  const koli = Number(row.jumlahKoli);
  if (!row.jumlahKoli || !Number.isFinite(koli) || koli <= 0) errs.push("Jumlah koli tidak valid");
  return errs;
}

const cellInputClass =
  "w-full min-w-[140px] rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100";

export function BulkShipmentImport() {
  const { createShipment } = useShipments();
  const { trucksWithDriver } = useFleet();
  const { activeTitikLokasi } = useLocations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<BulkRow[]>(() => [emptyRow(), emptyRow(), emptyRow()]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ created: CreatedShipmentSummary[]; skipped: number } | null>(null);
  const [hoveredStatusRowId, setHoveredStatusRowId] = useState<string | null>(null);

  const knownKota = activeTitikLokasi.map((k) => k.namaKota);
  const truckOptions = trucksWithDriver.filter((t) => t.status !== "Inactive");

  function updateRow<K extends keyof BulkRow>(id: string, key: K, value: BulkRow[K]) {
    setResult(null);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function isRowBlank(row: BulkRow): boolean {
    return FIELDS_TO_CHECK_BLANK.every((k) => !String(row[k]).trim());
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

      const { rows: parsed, headerError } = tableToBulkRows(table);
      if (headerError) {
        setImportError(headerError);
        return;
      }
      if (parsed.length === 0) {
        setImportError("Tidak ada baris data yang terbaca dari file.");
        return;
      }

      const imported = parsed.map((p) =>
        fromInput({
          ...p,
          kotaAsal: resolveKota(p.kotaAsal, knownKota),
          kotaTujuan: resolveKota(p.kotaTujuan, knownKota),
        }),
      );
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
    const withErrors = rows.map((r) => ({ row: r, errors: rowErrors(r, knownKota) }));
    const validRows = withErrors.filter((r) => r.errors.length === 0).map((r) => r.row);
    const skipped = rows.length - validRows.length;
    if (validRows.length === 0) return;

    setSubmitting(true);
    const created: CreatedShipmentSummary[] = [];
    for (const row of validRows) {
      const truck = truckOptions.find(
        (t) => t.nomorUnit.replace(/\s+/g, "").toLowerCase() === row.nomorPolisiTruck.replace(/\s+/g, "").toLowerCase(),
      );
      const { awb } = await createShipment({
        pengirim: { nama: row.pengirimNama, telepon: row.pengirimTelepon, email: row.pengirimEmail },
        penerima: { nama: row.penerimaNama, telepon: row.penerimaTelepon, email: row.penerimaEmail },
        alamatAsal: row.alamatAsal,
        kotaAsal: row.kotaAsal,
        alamatTujuan: row.alamatTujuan,
        kotaTujuan: row.kotaTujuan,
        deskripsiBarang: row.deskripsiBarang,
        layanan: row.layananValue,
        beratKg: Number(row.beratKg),
        jumlahKoli: Number(row.jumlahKoli),
        truckId: truck?.id ?? "",
      });
      created.push({ awb, kotaAsal: row.kotaAsal, kotaTujuan: row.kotaTujuan });
    }
    setResult({ created, skipped });
    setRows([emptyRow(), emptyRow(), emptyRow()]);
    setSubmitting(false);
  }

  const rowsWithErrors = rows.map((r) => ({ row: r, errors: rowErrors(r, knownKota) }));
  const validCount = rowsWithErrors.filter((r) => r.errors.length === 0).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Bulk Input / Import Excel</h2>
            <p className="mt-1 text-xs text-slate-500">
              Isi beberapa baris sekaligus, atau import dari file Excel (.xlsx) / CSV sesuai template.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadBulkShipmentTemplate}
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
        <table className="w-full min-w-[1400px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-2.5 py-1.5"></th>
              <th colSpan={3} className="px-2.5 py-1.5 text-blue-800">
                Pengirim
              </th>
              <th colSpan={3} className="border-l border-slate-200 px-2.5 py-1.5 text-blue-800">
                Penerima
              </th>
              <th colSpan={8} className="border-l border-slate-200 px-2.5 py-1.5 text-blue-800">
                Detail Pengiriman
              </th>
              <th className="border-l border-slate-200 px-2.5 py-1.5 text-blue-800">Armada</th>
              <th></th>
            </tr>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-2.5 py-2.5">Status</th>
              <th className="px-2.5 py-2.5">Nama</th>
              <th className="px-2.5 py-2.5">No HP</th>
              <th className="px-2.5 py-2.5">Email</th>
              <th className="border-l border-slate-200 px-2.5 py-2.5">Nama</th>
              <th className="px-2.5 py-2.5">No HP</th>
              <th className="px-2.5 py-2.5">Email</th>
              <th className="border-l border-slate-200 px-2.5 py-2.5">Kota Asal</th>
              <th className="px-2.5 py-2.5">Alamat Asal</th>
              <th className="px-2.5 py-2.5">Kota Tujuan</th>
              <th className="px-2.5 py-2.5">Alamat Tujuan</th>
              <th className="px-2.5 py-2.5">Layanan</th>
              <th className="px-2.5 py-2.5">Berat (Kg)</th>
              <th className="px-2.5 py-2.5">Jumlah Koli</th>
              <th className="px-2.5 py-2.5">Deskripsi Barang</th>
              <th className="border-l border-slate-200 px-2.5 py-2.5">Truck (Opsional)</th>
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
                        onMouseEnter={() => setHoveredStatusRowId(row.id)}
                        onMouseLeave={() => setHoveredStatusRowId(null)}
                        onFocus={() => setHoveredStatusRowId(row.id)}
                        onBlur={() => setHoveredStatusRowId(null)}
                        tabIndex={0}
                        className="inline-flex cursor-help text-amber-500 focus:outline-none"
                      >
                        <AlertTriangle size={16} />
                      </span>
                      {hoveredStatusRowId === row.id && (
                        <div className="absolute left-0 top-full z-20 mt-1.5 w-60 rounded-lg border border-slate-200 bg-white p-3 text-left normal-case leading-relaxed text-slate-600 shadow-lg">
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
                    value={row.pengirimNama}
                    onChange={(e) => updateRow(row.id, "pengirimNama", e.target.value)}
                    placeholder="Nama lengkap"
                  />
                </td>
                <td className="px-2.5 py-2">
                  <input
                    className={cellInputClass}
                    value={row.pengirimTelepon}
                    onChange={(e) => updateRow(row.id, "pengirimTelepon", e.target.value)}
                    placeholder="08xx"
                  />
                </td>
                <td className="px-2.5 py-2">
                  <input
                    className={cellInputClass}
                    value={row.pengirimEmail}
                    onChange={(e) => updateRow(row.id, "pengirimEmail", e.target.value)}
                    placeholder="email@x.com"
                  />
                </td>
                <td className="border-l border-slate-100 px-2.5 py-2">
                  <input
                    className={cellInputClass}
                    value={row.penerimaNama}
                    onChange={(e) => updateRow(row.id, "penerimaNama", e.target.value)}
                    placeholder="Nama lengkap"
                  />
                </td>
                <td className="px-2.5 py-2">
                  <input
                    className={cellInputClass}
                    value={row.penerimaTelepon}
                    onChange={(e) => updateRow(row.id, "penerimaTelepon", e.target.value)}
                    placeholder="08xx"
                  />
                </td>
                <td className="px-2.5 py-2">
                  <input
                    className={cellInputClass}
                    value={row.penerimaEmail}
                    onChange={(e) => updateRow(row.id, "penerimaEmail", e.target.value)}
                    placeholder="email@x.com"
                  />
                </td>
                <td className="border-l border-slate-100 px-2.5 py-2">
                  <select
                    className={`${cellInputClass} ${row.kotaAsal && !knownKota.includes(row.kotaAsal) ? "border-amber-400 text-amber-700" : ""}`}
                    value={row.kotaAsal}
                    onChange={(e) => updateRow(row.id, "kotaAsal", e.target.value)}
                  >
                    <option value="">Pilih kota</option>
                    {row.kotaAsal && !knownKota.includes(row.kotaAsal) && (
                      <option value={row.kotaAsal}>{row.kotaAsal} (tidak dikenal)</option>
                    )}
                    {knownKota.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2.5 py-2">
                  <input
                    className={cellInputClass}
                    value={row.alamatAsal}
                    onChange={(e) => updateRow(row.id, "alamatAsal", e.target.value)}
                    placeholder="Jl. ..."
                  />
                </td>
                <td className="px-2.5 py-2">
                  <select
                    className={`${cellInputClass} ${row.kotaTujuan && !knownKota.includes(row.kotaTujuan) ? "border-amber-400 text-amber-700" : ""}`}
                    value={row.kotaTujuan}
                    onChange={(e) => updateRow(row.id, "kotaTujuan", e.target.value)}
                  >
                    <option value="">Pilih kota</option>
                    {row.kotaTujuan && !knownKota.includes(row.kotaTujuan) && (
                      <option value={row.kotaTujuan}>{row.kotaTujuan} (tidak dikenal)</option>
                    )}
                    {knownKota.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2.5 py-2">
                  <input
                    className={cellInputClass}
                    value={row.alamatTujuan}
                    onChange={(e) => updateRow(row.id, "alamatTujuan", e.target.value)}
                    placeholder="Jl. ..."
                  />
                </td>
                <td className="px-2.5 py-2">
                  <select
                    className={cellInputClass}
                    value={row.layananValue}
                    onChange={(e) => updateRow(row.id, "layananValue", e.target.value as LayananPengiriman)}
                  >
                    {LAYANAN_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2.5 py-2">
                  <input
                    type="number"
                    min={0.1}
                    step={0.1}
                    className={`${cellInputClass} min-w-[80px]`}
                    value={row.beratKg}
                    onChange={(e) => updateRow(row.id, "beratKg", e.target.value)}
                    placeholder="10"
                  />
                </td>
                <td className="px-2.5 py-2">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    className={`${cellInputClass} min-w-[80px]`}
                    value={row.jumlahKoli}
                    onChange={(e) => updateRow(row.id, "jumlahKoli", e.target.value)}
                    placeholder="3"
                  />
                </td>
                <td className="px-2.5 py-2">
                  <input
                    className={`${cellInputClass} min-w-[200px]`}
                    value={row.deskripsiBarang}
                    onChange={(e) => updateRow(row.id, "deskripsiBarang", e.target.value)}
                    placeholder="Isi paket"
                  />
                </td>
                <td className="border-l border-slate-100 px-2.5 py-2">
                  <select
                    className={cellInputClass}
                    value={
                      truckOptions.find(
                        (t) =>
                          t.nomorUnit.replace(/\s+/g, "").toLowerCase() ===
                          row.nomorPolisiTruck.replace(/\s+/g, "").toLowerCase(),
                      )?.nomorUnit ?? ""
                    }
                    onChange={(e) => updateRow(row.id, "nomorPolisiTruck", e.target.value)}
                  >
                    <option value="">Belum ditentukan</option>
                    {truckOptions.map((t) => (
                      <option key={t.id} value={t.nomorUnit}>
                        {t.nomorUnit}
                      </option>
                    ))}
                  </select>
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
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
            Buat {validCount > 0 ? validCount : ""} Pengiriman
          </button>
        </div>
      </div>

      {result && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 size={18} />
            <p className="text-sm font-semibold">
              {result.created.length} resi berhasil dibuat
              {result.skipped > 0 ? `, ${result.skipped} baris dilewati karena tidak valid.` : "."}
            </p>
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {result.created.map((s) => (
              <div key={s.awb} className="flex items-center justify-between rounded-lg bg-white px-3.5 py-2 text-xs">
                <span className="font-mono font-medium text-slate-800">{s.awb}</span>
                <span className="text-slate-500">
                  {s.kotaAsal} &rarr; {s.kotaTujuan}
                </span>
                <Link to={`/admin/resi/${s.awb}`} className="font-medium text-blue-700 hover:underline">
                  Lihat Detail
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const FIELDS_TO_CHECK_BLANK: (keyof BulkRowInput)[] = [
  "pengirimNama",
  "pengirimTelepon",
  "pengirimEmail",
  "penerimaNama",
  "penerimaTelepon",
  "penerimaEmail",
  "kotaAsal",
  "alamatAsal",
  "kotaTujuan",
  "alamatTujuan",
  "deskripsiBarang",
  "beratKg",
  "jumlahKoli",
];
