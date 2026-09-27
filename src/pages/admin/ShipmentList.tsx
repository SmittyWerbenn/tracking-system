import { CheckCircle2, Download, Eye, FileEdit, LayoutList, ListTree, Loader2, MapPin, PackageSearch, Printer, Search, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../store/AuthContext";
import { useSettings } from "../../store/SettingsContext";
import { useShipments, type PendingClaim } from "../../store/ShipmentContext";
import type { ShipmentStatus } from "../../types";
import { exportShipmentsCsv } from "../../utils/exportCsv";
import { formatTanggalJam, formatTanggalPendek, stripKeteranganMeta, todayISO } from "../../utils/format";
import { getStagnantShipments } from "../../utils/stagnant";
import { SHIPMENT_STATUS_OPTIONS } from "../../utils/status";

function isShipmentStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUS_OPTIONS as string[]).includes(value);
}

/** Server-side search/status filtering (debounced) via ShipmentContext.refresh,
 * matching this app's actual scale (up to the API's page cap). Date range
 * and the "macet" quick-filter refine client-side over that already-
 * filtered, already-bounded batch rather than the whole table. */
export default function ShipmentList() {
  const { shipments, isLoading, refresh, fetchPendingClaims, confirmClaim, rejectClaim } = useShipments();
  const { settings } = useSettings();
  const { profile } = useAuth();
  const canCreateShipment = profile?.role === "Superadmin" || profile?.role === "Admin";
  const canManageClaims = profile?.role === "Superadmin" || profile?.role === "Admin";
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState<"ringkas" | "detail">("detail");
  const [pendingClaims, setPendingClaims] = useState<PendingClaim[]>([]);
  const [claimActionAwb, setClaimActionAwb] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  function loadPendingClaims() {
    if (!canManageClaims) return;
    fetchPendingClaims()
      .then(setPendingClaims)
      .catch(() => {});
  }

  useEffect(() => {
    loadPendingClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConfirmClaim(awb: string) {
    setClaimActionAwb(awb);
    setClaimError(null);
    const result = await confirmClaim(awb);
    setClaimActionAwb(null);
    if (result.ok) loadPendingClaims();
    else setClaimError(result.error);
  }

  async function handleRejectClaim(awb: string) {
    setClaimActionAwb(awb);
    setClaimError(null);
    const result = await rejectClaim(awb);
    setClaimActionAwb(null);
    if (result.ok) loadPendingClaims();
    else setClaimError(result.error);
  }

  const statusParam = searchParams.get("status") ?? "";
  const statusFilter: ShipmentStatus | "Semua" = isShipmentStatus(statusParam) ? statusParam : "Semua";
  const macetOnly = searchParams.get("macet") === "1";

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    refresh({ status: statusFilter === "Semua" ? undefined : statusFilter, q: debouncedQuery || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, debouncedQuery]);

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
        if (stagnantAwbs && !stagnantAwbs.has(s.awb)) return false;
        if (dateFrom && s.tanggalDibuat < dateFrom) return false;
        if (dateTo && s.tanggalDibuat > dateTo) return false;
        return true;
      })
      .sort((a, b) => (a.tanggalDibuat + a.jamDibuat < b.tanggalDibuat + b.jamDibuat ? 1 : -1));
  }, [shipments, stagnantAwbs, dateFrom, dateTo]);

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
        {canCreateShipment && (
          <Link
            to="/admin/pengiriman/baru"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            Buat Pengiriman
          </Link>
        )}
      </div>

      {canManageClaims && pendingClaims.length > 0 && (
        <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-violet-800">
            <PackageSearch size={15} /> Klaim Pengiriman Menunggu Konfirmasi ({pendingClaims.length})
          </p>
          {claimError && <p className="mb-3 text-xs font-medium text-red-600">{claimError}</p>}
          <div className="flex flex-col gap-2">
            {pendingClaims.map((c) => (
              <div
                key={c.awb}
                className="flex flex-col gap-2 rounded-lg border border-violet-100 bg-white px-3.5 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold text-slate-900">
                    {c.awb}{" "}
                    <span className="font-sans text-xs font-normal text-slate-500">
                      {c.kotaAsal} → {c.kotaTujuan}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Diajukan oleh <span className="font-medium text-slate-700">{c.driver.nama}</span> (
                    {c.driver.telepon}) ·{" "}
                    {formatTanggalJam(c.claimRequestedAt.slice(0, 10), c.claimRequestedAt.slice(11, 16))}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={claimActionAwb === c.awb}
                    onClick={() => handleRejectClaim(c.awb)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <XCircle size={13} /> Tolak
                  </button>
                  <button
                    type="button"
                    disabled={claimActionAwb === c.awb}
                    onClick={() => handleConfirmClaim(c.awb)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                  >
                    {claimActionAwb === c.awb ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    Konfirmasi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">{filtered.length} pengiriman</p>
        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("ringkas")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
              viewMode === "ringkas" ? "bg-blue-900 text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutList size={13} /> Data Ringkas
          </button>
          <button
            type="button"
            onClick={() => setViewMode("detail")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
              viewMode === "detail" ? "bg-blue-900 text-white" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ListTree size={13} /> Data Detail
          </button>
        </div>
      </div>

      <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Bounded height (not just overflow-x-auto) so the horizontal
            scrollbar sits right under the visible rows instead of at the
            very bottom of a wide table the user would have to scroll the
            whole page down to reach. */}
        <div className="max-h-[65vh] overflow-auto">
          <table className={`w-full text-left text-sm ${viewMode === "detail" ? "min-w-[1900px]" : "min-w-[920px]"}`}>
            <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">AWB</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                {viewMode === "detail" && (
                  <>
                    <th className="px-4 py-3 font-medium">Pengirim</th>
                    <th className="px-4 py-3 font-medium">Penerima</th>
                  </>
                )}
                <th className="px-4 py-3 font-medium">Rute</th>
                {viewMode === "detail" && (
                  <>
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium">Berat (Kg)</th>
                    <th className="px-4 py-3 font-medium">Koli</th>
                    <th className="px-4 py-3 font-medium">Diterima Oleh</th>
                    <th className="px-4 py-3 font-medium">Diterima</th>
                    <th className="px-4 py-3 font-medium">Keterangan</th>
                  </>
                )}
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Truck</th>
                <th className="px-4 py-3 font-medium">Driver</th>
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
                  {viewMode === "detail" && (
                    <>
                      <td className="px-4 py-3 text-slate-600">{s.pengirim.nama}</td>
                      <td className="px-4 py-3 text-slate-600">{s.penerima.nama}</td>
                    </>
                  )}
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {s.kotaAsal} → {s.kotaTujuan}
                  </td>
                  {viewMode === "detail" && (
                    <>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{s.layanan}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{s.beratKg}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{s.jumlahKoli}</td>
                      <td className="px-4 py-3 text-slate-600">{s.pod?.namaPenerima ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                        {s.pod ? `${formatTanggalPendek(s.pod.tanggal)}, ${s.pod.jam}` : "-"}
                      </td>
                      <td className="max-w-[260px] whitespace-normal break-words px-4 py-3 text-slate-600">
                        {stripKeteranganMeta(s.deskripsiBarang)}
                      </td>
                    </>
                  )}
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={s.status} size="sm" />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {s.claimStatus === "pending" ? (
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                        Diklaim: {s.claimDriverNama}
                      </span>
                    ) : (
                      s.truck.nomorUnit
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{s.truck.driver ?? "-"}</td>
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
                      {profile?.role !== "Viewer" && (
                        <Link
                          to={`/admin/update-tracking/${s.awb}`}
                          title="Update"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                        >
                          <FileEdit size={16} />
                        </Link>
                      )}
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
              {isLoading && (
                <tr>
                  <td colSpan={viewMode === "detail" ? 16 : 8} className="px-4 py-10 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-900" />
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={viewMode === "detail" ? 16 : 8} className="px-4 py-10 text-center text-sm text-slate-400">
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
