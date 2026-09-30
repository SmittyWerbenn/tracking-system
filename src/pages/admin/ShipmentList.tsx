import { adminPath } from "../../utils/urls";
import { AlertTriangle, Ban, CheckCircle2, Download, Eye, FileEdit, LayoutList, ListTree, Loader2, MapPin, PackageSearch, Pencil, Printer, RefreshCw, Search, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { useAuth } from "../../store/AuthContext";
import { useLocations } from "../../store/LocationContext";
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
  const { shipments, isLoading, refresh, fetchPendingClaims, confirmClaim, rejectClaim, cancelShipment, updateShipmentAlamat } =
    useShipments();
  const { activeTitikLokasi } = useLocations();
  const { settings } = useSettings();
  const { profile } = useAuth();
  const canCreateShipment =
    profile?.role === "Superadmin" || profile?.role === "Admin" || profile?.role === "Client";
  const canManageClaims = profile?.role === "Superadmin" || profile?.role === "Admin";
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState<"ringkas" | "detail">("ringkas");
  const [pendingClaims, setPendingClaims] = useState<PendingClaim[]>([]);
  const [claimActionAwb, setClaimActionAwb] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const [cancelTargetAwb, setCancelTargetAwb] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelPending, setCancelPending] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  function canCancelRow(s: { status: ShipmentStatus }): boolean {
    if (s.status === "Selesai / Terkirim" || s.status === "Dibatalkan") return false;
    if (profile?.role === "Superadmin" || profile?.role === "Admin") return true;
    if (profile?.role === "Client") return s.status === "Dalam Persiapan";
    return false;
  }

  function openCancelModal(awb: string) {
    setCancelTargetAwb(awb);
    setCancelReason("");
    setCancelError(null);
  }

  async function handleCancelShipment() {
    if (!cancelTargetAwb) return;
    setCancelPending(true);
    setCancelError(null);
    const result = await cancelShipment(cancelTargetAwb, cancelReason.trim() || undefined);
    setCancelPending(false);
    if (result.ok) {
      setCancelTargetAwb(null);
    } else {
      setCancelError(result.error);
    }
  }

  const kotaSuggestions = Array.from(new Set(activeTitikLokasi.map((k) => k.namaKota))).sort();
  const [alamatTargetAwb, setAlamatTargetAwb] = useState<string | null>(null);
  const [alamatAsalInput, setAlamatAsalInput] = useState("");
  const [kotaAsalInput, setKotaAsalInput] = useState("");
  const [alamatTujuanInput, setAlamatTujuanInput] = useState("");
  const [kotaTujuanInput, setKotaTujuanInput] = useState("");
  const [alamatPending, setAlamatPending] = useState(false);
  const [alamatError, setAlamatError] = useState<string | null>(null);

  function canEditAlamatRow(s: { status: ShipmentStatus }): boolean {
    return profile?.role === "Client" && s.status === "Dalam Persiapan";
  }

  function openAlamatModal(s: { awb: string; alamatAsal: string; kotaAsal: string; alamatTujuan: string; kotaTujuan: string }) {
    setAlamatTargetAwb(s.awb);
    setAlamatAsalInput(s.alamatAsal);
    setKotaAsalInput(s.kotaAsal);
    setAlamatTujuanInput(s.alamatTujuan);
    setKotaTujuanInput(s.kotaTujuan);
    setAlamatError(null);
  }

  async function handleSaveAlamat() {
    if (!alamatTargetAwb) return;
    setAlamatPending(true);
    setAlamatError(null);
    const result = await updateShipmentAlamat(alamatTargetAwb, {
      alamatAsal: alamatAsalInput.trim(),
      kotaAsal: kotaAsalInput.trim(),
      alamatTujuan: alamatTujuanInput.trim(),
      kotaTujuan: kotaTujuanInput.trim(),
    });
    setAlamatPending(false);
    if (result.ok) {
      setAlamatTargetAwb(null);
    } else {
      setAlamatError(result.error);
    }
  }

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

  const [refreshing, setRefreshing] = useState(false);
  async function handleRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([
        refresh({ status: statusFilter === "Semua" ? undefined : statusFilter, q: debouncedQuery || undefined }),
        canManageClaims ? fetchPendingClaims().then(setPendingClaims).catch(() => {}) : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }

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
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Muat ulang data"
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-blue-900 bg-white px-3.5 py-2 text-sm font-semibold text-blue-900 shadow-sm hover:bg-blue-50 disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
          {canCreateShipment && (
            <Link
              to={adminPath("/pengiriman/baru")}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              Buat Pengiriman
            </Link>
          )}
        </div>
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
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-slate-400 sm:inline">{filtered.length} pengiriman</span>
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("ringkas")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                viewMode === "ringkas" ? "bg-blue-900 text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LayoutList size={13} /> Ringkas
            </button>
            <button
              type="button"
              onClick={() => setViewMode("detail")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                viewMode === "detail" ? "bg-blue-900 text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListTree size={13} /> Detail
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Bounded height (not just overflow-x-auto) so the horizontal
            scrollbar sits right under the visible rows instead of at the
            very bottom of a wide table the user would have to scroll the
            whole page down to reach. */}
        <div className="max-h-[65vh] overflow-auto">
          <table className={`w-full text-left text-sm ${viewMode === "detail" ? "min-w-[2220px]" : "min-w-[920px]"}`}>
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
                    <th className="px-4 py-3 font-medium">Client ID</th>
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium">Berat (Kg)</th>
                    <th className="px-4 py-3 font-medium">Koli</th>
                    <th className="px-4 py-3 font-medium">Estimasi Tiba</th>
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
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{s.customerId ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{s.layanan}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{s.beratKg}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{s.jumlahKoli}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {s.estimasiTiba ? formatTanggalPendek(s.estimasiTiba) : "-"}
                      </td>
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
                        to={adminPath(`/resi/${s.awb}`)}
                        title="Detail"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={adminPath(`/tracking/${s.awb}`)}
                        title="Tracking"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                      >
                        <MapPin size={16} />
                      </Link>
                      {profile?.role !== "Viewer" && profile?.role !== "Client" && (
                        <Link
                          to={adminPath(`/update-tracking/${s.awb}`)}
                          title="Update"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                        >
                          <FileEdit size={16} />
                        </Link>
                      )}
                      <Link
                        to={adminPath(`/resi/${s.awb}`)}
                        title="Cetak Resi"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                      >
                        <Printer size={16} />
                      </Link>
                      {canEditAlamatRow(s) && (
                        <button
                          type="button"
                          onClick={() => openAlamatModal(s)}
                          title="Edit Alamat"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {canCancelRow(s) && (
                        <button
                          type="button"
                          onClick={() => openCancelModal(s.awb)}
                          title="Batalkan Pesanan"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={viewMode === "detail" ? 18 : 8} className="px-4 py-10 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-900" />
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={viewMode === "detail" ? 18 : 8} className="px-4 py-10 text-center text-sm text-slate-400">
                    Tidak ada data pengiriman yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {cancelTargetAwb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Ban size={18} className="text-rose-600" /> Batalkan Pesanan
                </h2>
                <button
                  type="button"
                  onClick={() => setCancelTargetAwb(null)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-600">
                AWB <span className="font-mono font-semibold">{cancelTargetAwb}</span> akan dibatalkan.
                Setelah dibatalkan, status tidak bisa dikembalikan lagi.
              </p>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">
                  Alasan Pembatalan <span className="text-slate-400">(opsional)</span>
                </span>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Contoh: Salah input, pesanan diganti, dll."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </label>
              {cancelError && (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <AlertTriangle size={14} /> {cancelError}
                </p>
              )}
              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCancelTargetAwb(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={cancelPending}
                  onClick={handleCancelShipment}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
                >
                  {cancelPending ? <Loader2 size={15} className="animate-spin" /> : <Ban size={15} />}
                  Batalkan Pesanan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {alamatTargetAwb && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <Pencil size={18} /> Edit Alamat
                </h2>
                <button
                  type="button"
                  onClick={() => setAlamatTargetAwb(null)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Kota Asal</span>
                  <input
                    required
                    list="list-kota-asal-suggestions"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={kotaAsalInput}
                    onChange={(e) => setKotaAsalInput(e.target.value)}
                    autoComplete="off"
                  />
                  <datalist id="list-kota-asal-suggestions">
                    {kotaSuggestions.map((k) => (
                      <option key={k} value={k} />
                    ))}
                  </datalist>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Alamat Asal</span>
                  <textarea
                    required
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={alamatAsalInput}
                    onChange={(e) => setAlamatAsalInput(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Kota Tujuan</span>
                  <input
                    required
                    list="list-kota-tujuan-suggestions"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={kotaTujuanInput}
                    onChange={(e) => setKotaTujuanInput(e.target.value)}
                    autoComplete="off"
                  />
                  <datalist id="list-kota-tujuan-suggestions">
                    {kotaSuggestions.map((k) => (
                      <option key={k} value={k} />
                    ))}
                  </datalist>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Alamat Tujuan</span>
                  <textarea
                    required
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    value={alamatTujuanInput}
                    onChange={(e) => setAlamatTujuanInput(e.target.value)}
                  />
                </label>
              </div>
              {alamatError && (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <AlertTriangle size={14} /> {alamatError}
                </p>
              )}
              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAlamatTargetAwb(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={
                    alamatPending ||
                    !alamatAsalInput.trim() ||
                    !kotaAsalInput.trim() ||
                    !alamatTujuanInput.trim() ||
                    !kotaTujuanInput.trim()
                  }
                  onClick={handleSaveAlamat}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
                >
                  {alamatPending ? <Loader2 size={15} className="animate-spin" /> : null}
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
