import { Download, Eye, FileEdit, MapPin, Printer, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { useSettings } from "../../store/SettingsContext";
import { useShipments } from "../../store/ShipmentContext";
import type { ShipmentStatus } from "../../types";
import { exportShipmentsCsv } from "../../utils/exportCsv";
import { formatTanggalPendek, todayISO } from "../../utils/format";
import { getStagnantShipments } from "../../utils/stagnant";
import { SHIPMENT_STATUS_OPTIONS } from "../../utils/status";

function isShipmentStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUS_OPTIONS as string[]).includes(value);
}

export default function ShipmentList() {
  const { shipments } = useShipments();
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const statusParam = searchParams.get("status") ?? "";
  const statusFilter: ShipmentStatus | "Semua" = isShipmentStatus(statusParam) ? statusParam : "Semua";
  const macetOnly = searchParams.get("macet") === "1";

  const stagnantAwbs = useMemo(() => {
    if (!macetOnly) return null;
    return new Set(getStagnantShipments(shipments, settings.stagnantThresholdDays).map((s) => s.shipment.awb));
  }, [shipments, settings.stagnantThresholdDays, macetOnly]);

  function handleStatusFilterChange(value: ShipmentStatus | "Semua") {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === "Semua") {
        next.delete("status");
      } else {
        next.set("status", value);
      }
      return next;
    });
  }

  function clearMacetFilter() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("macet");
      return next;
    });
  }

  const filtered = useMemo(() => {
    return shipments
      .filter((s) => {
        if (statusFilter !== "Semua" && s.status !== statusFilter) return false;
        if (stagnantAwbs && !stagnantAwbs.has(s.awb)) return false;
        if (dateFrom && s.tanggalDibuat < dateFrom) return false;
        if (dateTo && s.tanggalDibuat > dateTo) return false;
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
  }, [shipments, query, statusFilter, stagnantAwbs, dateFrom, dateTo]);

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

      {macetOnly && (
        <div className="mt-5 flex items-center gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-800">
          Menampilkan hanya AWB macet (tidak ada update terbaru)
          <button
            onClick={clearMacetFilter}
            className="ml-auto inline-flex items-center gap-1 rounded-md p-1 text-amber-700 hover:bg-amber-100"
            title="Hapus filter"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className={`${macetOnly ? "mt-3" : "mt-5"} flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center`}>
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
          onChange={(e) => handleStatusFilterChange(e.target.value as ShipmentStatus | "Semua")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="Semua">Semua Status</option>
          {SHIPMENT_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
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
        {(query || statusFilter !== "Semua" || dateFrom || dateTo || macetOnly) && (
          <button
            onClick={() => {
              setQuery("");
              setDateFrom("");
              setDateTo("");
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.delete("status");
                next.delete("macet");
                return next;
              });
            }}
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Reset
          </button>
        )}
        <button
          onClick={() => exportShipmentsCsv(filtered, `data-pengiriman-${todayISO()}.csv`)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Download size={15} /> Export CSV
        </button>
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
