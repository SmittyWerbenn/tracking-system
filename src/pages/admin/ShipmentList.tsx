import { Eye, FileEdit, MapPin, Printer, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { useShipments } from "../../store/ShipmentContext";
import type { ShipmentStatus } from "../../types";
import { formatTanggalPendek } from "../../utils/format";
import { SHIPMENT_STATUS_OPTIONS } from "../../utils/status";

export default function ShipmentList() {
  const { shipments } = useShipments();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "Semua">("Semua");
  const [dateFilter, setDateFilter] = useState("");

  const filtered = useMemo(() => {
    return shipments
      .filter((s) => {
        if (statusFilter !== "Semua" && s.status !== statusFilter) return false;
        if (dateFilter && s.tanggalDibuat !== dateFilter) return false;
        if (query) {
          const q = query.toLowerCase();
          const haystack = [
            s.awb,
            s.pengirim.nama,
            s.penerima.nama,
            s.kotaAsal,
            s.kotaTujuan,
            s.truck.nomorUnit,
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (a.tanggalDibuat + a.jamDibuat < b.tanggalDibuat + b.jamDibuat ? 1 : -1));
  }, [shipments, query, statusFilter, dateFilter]);

  function lastUpdate(awb: string) {
    const s = shipments.find((x) => x.awb === awb);
    const last = s?.timeline[s.timeline.length - 1];
    if (!last) return "-";
    return `${formatTanggalPendek(last.tanggal)}, ${last.jam}`;
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Data Pengiriman</h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftar seluruh resi (AWB) yang tercatat dalam sistem.
          </p>
        </div>
        <Link
          to="/admin/pengiriman/baru"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          Buat Pengiriman
        </Link>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari AWB, nama, kota, nomor truck..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ShipmentStatus | "Semua")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="Semua">Semua Status</option>
          {SHIPMENT_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {(query || statusFilter !== "Semua" || dateFilter) && (
          <button
            onClick={() => {
              setQuery("");
              setStatusFilter("Semua");
              setDateFilter("");
            }}
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Reset
          </button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">AWB</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Pengirim</th>
                <th className="px-4 py-3 font-medium">Penerima</th>
                <th className="px-4 py-3 font-medium">Rute</th>
                <th className="px-4 py-3 font-medium">Truck</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Update</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.awb} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-slate-900">
                    {s.awb}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatTanggalPendek(s.tanggalDibuat)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.pengirim.nama}</td>
                  <td className="px-4 py-3 text-slate-600">{s.penerima.nama}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {s.kotaAsal} → {s.kotaTujuan}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{s.truck.nomorUnit}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={s.status} size="sm" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                    {lastUpdate(s.awb)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/admin/resi/${s.awb}`}
                        title="Detail"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/tracking/${s.awb}`}
                        title="Tracking"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                      >
                        <MapPin size={16} />
                      </Link>
                      <Link
                        to={`/admin/update-tracking/${s.awb}`}
                        title="Update"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                      >
                        <FileEdit size={16} />
                      </Link>
                      <Link
                        to={`/admin/resi/${s.awb}`}
                        title="Cetak Resi"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                      >
                        <Printer size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                    Tidak ada data pengiriman yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
