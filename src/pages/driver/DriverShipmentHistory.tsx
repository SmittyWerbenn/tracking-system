import { AlertTriangle, ArrowLeft, ArrowRight, Download, FileText, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DriverLayout } from "../../components/layout/DriverLayout";
import { fetchDriverShipments, type DriverShipmentSummary } from "../../utils/driverApi";
import { exportDriverShipmentsCsv } from "../../utils/exportCsv";
import { formatTanggalPanjang } from "../../utils/format";
import { SHIPMENT_STATUS_OPTIONS } from "../../utils/status";

const KENDALA_STATUS = "Kendala";
const SELESAI_STATUS = "Selesai / Terkirim";

function statusStyle(status: string): string {
  if (status === KENDALA_STATUS) return "bg-red-50 text-red-700";
  if (status === SELESAI_STATUS) return "bg-emerald-50 text-emerald-700";
  return "bg-blue-50 text-blue-700";
}

/** Full shipment history for the logged-in driver (not just the dashboard's
 * status-filtered tabs), with a date-created filter and Excel/PDF export -
 * the CSV shares the admin portal's Excel-friendly convention, and "PDF" is
 * the browser's own print-to-PDF (window.print()), matching how resi
 * printing already works elsewhere in this app rather than adding a PDF
 * library dependency. */
export default function DriverShipmentHistory() {
  const [shipments, setShipments] = useState<DriverShipmentSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  useEffect(() => {
    fetchDriverShipments()
      .then(setShipments)
      .catch(() => setError("Gagal memuat data kiriman. Coba muat ulang halaman."));
  }, []);

  const filtered = useMemo(() => {
    return (shipments ?? [])
      .filter((s) => {
        if (dateFrom && s.tanggalDibuat < dateFrom) return false;
        if (dateTo && s.tanggalDibuat > dateTo) return false;
        if (statusFilter !== "Semua" && s.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => (a.tanggalDibuat + a.jamDibuat < b.tanggalDibuat + b.jamDibuat ? 1 : -1));
  }, [shipments, dateFrom, dateTo, statusFilter]);

  return (
    <DriverLayout wide>
      <Link to="/driver" className="no-print mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
        <ArrowLeft size={15} /> Kembali
      </Link>

      <div className="mb-4">
        <h1 className="text-lg font-semibold text-slate-900">Data Kiriman Saya</h1>
        <p className="text-xs text-slate-400">Seluruh pengiriman yang pernah ditugaskan ke Anda.</p>
      </div>

      <div className="no-print mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:flex-wrap">
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <span className="text-xs text-slate-400">s/d</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="Semua">Semua Status</option>
          {SHIPMENT_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {(dateFrom || dateTo || statusFilter !== "Semua") && (
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setStatusFilter("Semua");
            }}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <X size={14} /> Reset
          </button>
        )}
        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            onClick={() => exportDriverShipmentsCsv(filtered, `data-kiriman-saya-${Date.now()}.csv`)}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-blue-900 bg-white px-3.5 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50"
          >
            <Download size={15} /> Unduh Excel
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            <FileText size={15} /> Unduh PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="no-print mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {shipments === null && !error && (
        <div className="no-print flex justify-center py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-blue-900" />
        </div>
      )}

      {shipments !== null && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
          Tidak ada pengiriman yang cocok dengan filter.
        </div>
      )}

      {filtered.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">AWB</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Rute</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Estimasi Tiba</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.awb}>
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-slate-900">{s.awb}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatTanggalPanjang(s.tanggalDibuat)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        {s.kotaAsal} <ArrowRight size={12} className="text-slate-300" /> {s.kotaTujuan}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {s.estimasiTiba ? formatTanggalPanjang(s.estimasiTiba) : "Belum tersedia"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DriverLayout>
  );
}
