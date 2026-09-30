import { driverPath } from "../../utils/urls";
import { AlertTriangle, ArrowRight, CalendarClock, FileSpreadsheet, Loader2, MessageCircle, Package, PackageSearch, RefreshCw, ScanLine, Truck, Weight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarcodeScannerModal } from "../../components/BarcodeScannerModal";
import { DriverLayout } from "../../components/layout/DriverLayout";
import { useAuth } from "../../store/AuthContext";
import { useHelpContact } from "../../store/HelpContactContext";
import {
  cancelShipmentClaim,
  claimShipment,
  fetchDriverShipments,
  fetchDriverTrucks,
  fetchOpenShipments,
  type DriverShipmentSummary,
  type DriverTruckInfo,
  type OpenShipmentSummary,
} from "../../utils/driverApi";
import { formatTanggalPanjang } from "../../utils/format";

const KENDALA_STATUS = "Kendala";
const SELESAI_STATUS = "Selesai / Terkirim";

type StatusFilter = "aktif" | "kendala" | "selesai" | "terbuka";

export default function DriverDashboard() {
  const { profile } = useAuth();
  const { helpWhatsAppNumber } = useHelpContact();
  const [shipments, setShipments] = useState<DriverShipmentSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trucks, setTrucks] = useState<DriverTruckInfo[]>([]);
  const [openShipments, setOpenShipments] = useState<OpenShipmentSummary[] | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const [claimingAwb, setClaimingAwb] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("aktif");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResultAwb, setScanResultAwb] = useState<string | null>(null);
  const [scanNotFound, setScanNotFound] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  function loadShipments() {
    fetchDriverShipments()
      .then(setShipments)
      .catch(() => setError("Gagal memuat pengiriman. Coba muat ulang halaman."));
  }

  function loadOpenShipments() {
    fetchOpenShipments()
      .then(setOpenShipments)
      .catch(() => setOpenError("Gagal memuat pesanan terbuka. Coba muat ulang halaman."));
  }

  useEffect(() => {
    loadShipments();
    loadOpenShipments();
    fetchDriverTrucks()
      .then(setTrucks)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    setOpenError(null);
    try {
      await Promise.all([
        fetchDriverShipments()
          .then(setShipments)
          .catch(() => setError("Gagal memuat pengiriman. Coba muat ulang halaman.")),
        fetchOpenShipments()
          .then(setOpenShipments)
          .catch(() => setOpenError("Gagal memuat pesanan terbuka. Coba muat ulang halaman.")),
        fetchDriverTrucks().then(setTrucks).catch(() => {}),
      ]);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleClaim(awb: string) {
    setClaimingAwb(awb);
    setOpenError(null);
    try {
      await claimShipment(awb);
      loadOpenShipments();
    } catch (err) {
      setOpenError(err instanceof Error ? err.message : "Gagal mengambil pesanan.");
    } finally {
      setClaimingAwb(null);
    }
  }

  async function handleCancelClaim(awb: string) {
    setClaimingAwb(awb);
    setOpenError(null);
    try {
      await cancelShipmentClaim(awb);
      loadOpenShipments();
    } catch (err) {
      setOpenError(err instanceof Error ? err.message : "Gagal membatalkan klaim.");
    } finally {
      setClaimingAwb(null);
    }
  }

  function handleScanned(rawAwb: string) {
    setScannerOpen(false);
    const scanned = rawAwb.trim();
    const match = (openShipments ?? []).find((s) => s.awb.toUpperCase() === scanned.toUpperCase());
    setFilter("terbuka");
    if (match) {
      setScanResultAwb(match.awb);
      setScanNotFound(null);
    } else {
      setScanResultAwb(null);
      setScanNotFound(scanned);
    }
  }

  const active = (shipments ?? []).filter(
    (s) => s.status !== SELESAI_STATUS && s.status !== KENDALA_STATUS,
  );
  const kendala = (shipments ?? []).filter((s) => s.status === KENDALA_STATUS);
  // Best-effort "selesai hari ini" - detail's timeline has the real date,
  // this list endpoint doesn't, so this counts all "Selesai" items for now.
  const selesai = (shipments ?? []).filter((s) => s.status === SELESAI_STATUS);
  const terbuka = openShipments ?? [];
  const scanResult = scanResultAwb ? terbuka.find((s) => s.awb === scanResultAwb) ?? null : null;

  return (
    <DriverLayout wide>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-7">
        <div>
          <p className="text-sm text-slate-500">Halo,</p>
          <h1 className="text-lg font-semibold text-slate-900">{profile?.nama}</h1>
          <p className="text-xs text-slate-400">Driver</p>
        </div>
        <div className="flex flex-wrap items-center gap-7">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Muat ulang data"
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-blue-900 bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-900 shadow-sm hover:bg-blue-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
          <Link
            to={driverPath("/riwayat")}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-blue-900 bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-900 shadow-sm hover:bg-blue-50"
          >
            <FileSpreadsheet size={16} /> Data Pengiriman
          </Link>
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            <ScanLine size={18} /> Scan AWB
          </button>
        </div>
      </div>

      {trucks.length > 0 && (
        <div className="mb-5">
          {/* Primary unit - the truck this driver mainly runs */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 to-blue-950 p-4 shadow-md">
            <Truck size={96} className="pointer-events-none absolute -right-4 -top-4 rotate-12 text-white/10" />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-200">
                  <Truck size={13} /> Unit Truck Anda
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="inline-block rounded-lg bg-white px-3.5 py-1.5 font-mono text-2xl font-extrabold tracking-wide text-blue-950 shadow-sm">
                    {trucks[0].nomorUnit}
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                    {trucks[0].jenis}
                  </span>
                </div>
              </div>
              <a
                href={`https://wa.me/${helpWhatsAppNumber}?text=${encodeURIComponent(
                  `Halo Admin, saya driver ${profile?.nama ?? ""} butuh bantuan.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25"
              >
                <MessageCircle size={14} /> Butuh Bantuan?
              </a>
            </div>
          </div>

          {/* Any additional units, listed underneath */}
          {trucks.length > 1 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {trucks.slice(1).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                  <Truck size={15} className="shrink-0 text-slate-400" />
                  <span className="font-mono text-sm font-semibold text-slate-700">{t.nomorUnit}</span>
                  <span className="text-xs text-slate-400">{t.jenis}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-8 grid grid-cols-4 gap-3 sm:gap-7">
        <button
          type="button"
          onClick={() => setFilter("aktif")}
          className={`rounded-xl border p-3 text-center transition-colors sm:p-4 ${
            filter === "aktif" ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
          }`}
        >
          <p className="text-lg font-bold text-blue-900 sm:text-2xl">{active.length}</p>
          <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">Aktif</p>
        </button>
        <button
          type="button"
          onClick={() => setFilter("selesai")}
          className={`rounded-xl border p-3 text-center transition-colors sm:p-4 ${
            filter === "selesai" ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
          }`}
        >
          <p className="text-lg font-bold text-emerald-600 sm:text-2xl">{selesai.length}</p>
          <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">Selesai</p>
        </button>
        <button
          type="button"
          onClick={() => setFilter("kendala")}
          className={`rounded-xl border p-3 text-center transition-colors sm:p-4 ${
            filter === "kendala" ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
          }`}
        >
          <p className="text-lg font-bold text-red-600 sm:text-2xl">{kendala.length}</p>
          <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">Kendala</p>
        </button>
        <button
          type="button"
          onClick={() => setFilter("terbuka")}
          className={`rounded-xl border p-3 text-center transition-colors sm:p-4 ${
            filter === "terbuka" ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-white"
          }`}
        >
          <p className="text-lg font-bold text-violet-600 sm:text-2xl">{terbuka.length}</p>
          <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">Terbuka</p>
        </button>
      </div>

      {filter === "terbuka" ? (
        <>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pesanan Terbuka
          </h2>
          <p className="mb-3 text-xs text-slate-400">
            Pengiriman yang belum ditugaskan ke driver manapun - klik "Ambil Pesanan" untuk mengajukan
            klaim, lalu tunggu admin konfirmasi. Atau scan barcode/QR pada resi.
          </p>

          {scanNotFound && (
            <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-700">
              <span className="flex items-center gap-2">
                <AlertTriangle size={15} /> AWB "{scanNotFound}" tidak ditemukan di pesanan terbuka.
              </span>
              <button onClick={() => setScanNotFound(null)} className="shrink-0 text-amber-700 hover:text-amber-900">
                <X size={14} />
              </button>
            </div>
          )}

          {scanResult && (
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Hasil Scan</p>
                <button onClick={() => setScanResultAwb(null)} className="text-slate-400 hover:text-slate-700">
                  <X size={14} />
                </button>
              </div>
              <OpenShipmentCard
                item={scanResult}
                claiming={claimingAwb === scanResult.awb}
                onClaim={() => handleClaim(scanResult.awb)}
                onCancel={() => handleCancelClaim(scanResult.awb)}
                highlighted
              />
            </div>
          )}

          {openError && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
              <AlertTriangle size={15} /> {openError}
            </div>
          )}

          {openShipments === null && !openError && (
            <div className="flex justify-center py-10">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-blue-900" />
            </div>
          )}

          {openShipments !== null && terbuka.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
              Tidak ada pesanan terbuka saat ini.
            </div>
          )}

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {terbuka
              .filter((s) => s.awb !== scanResultAwb)
              .map((s) => (
                <OpenShipmentCard
                  key={s.awb}
                  item={s}
                  claiming={claimingAwb === s.awb}
                  onClaim={() => handleClaim(s.awb)}
                  onCancel={() => handleCancelClaim(s.awb)}
                />
              ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pengiriman Saya · {filter === "aktif" ? "Aktif" : filter === "kendala" ? "Kendala" : "Selesai"}
          </h2>

          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          {shipments === null && !error && (
            <div className="flex justify-center py-10">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-blue-900" />
            </div>
          )}

          {shipments !== null && shipments.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
              Belum ada pengiriman yang ditugaskan ke Anda.
            </div>
          )}

          {shipments !== null &&
            shipments.length > 0 &&
            { aktif: active, kendala, selesai }[filter].length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
                Tidak ada pengiriman di kategori ini.
              </div>
            )}

          <ShipmentGrid shipments={{ aktif: active, kendala, selesai }[filter]} />
        </>
      )}

      {scannerOpen && <BarcodeScannerModal onClose={() => setScannerOpen(false)} onDetected={handleScanned} />}
    </DriverLayout>
  );
}

function OpenShipmentCard({
  item,
  claiming,
  onClaim,
  onCancel,
  highlighted = false,
}: {
  item: OpenShipmentSummary;
  claiming: boolean;
  onClaim: () => void;
  onCancel: () => void;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        highlighted ? "border-violet-300 ring-2 ring-violet-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-bold text-slate-900">{item.awb}</span>
        {item.claimStatus === "pending" && item.isMine && (
          <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
            Menunggu Konfirmasi
          </span>
        )}
      </div>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
        {item.kotaAsal} <ArrowRight size={13} className="text-slate-300" /> {item.kotaTujuan}
      </p>
      <p className="mt-1 text-xs text-slate-500">{item.alamatTujuan}</p>
      <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Package size={12} /> {item.jumlahKoli} Koli
        </span>
        <span>{item.layanan}</span>
      </div>
      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
        <Weight size={12} /> {item.beratKg} Kg
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
        <CalendarClock size={12} className="shrink-0 text-slate-400" />
        Estimasi Tiba: <span className="font-medium text-slate-700">{item.estimasiTiba ? formatTanggalPanjang(item.estimasiTiba) : "Belum tersedia"}</span>
      </p>

      {item.claimStatus === "pending" && item.isMine ? (
        <button
          type="button"
          disabled={claiming}
          onClick={onCancel}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
        >
          {claiming ? <Loader2 size={13} className="animate-spin" /> : null}
          Batalkan Klaim
        </button>
      ) : (
        <button
          type="button"
          disabled={claiming}
          onClick={onClaim}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-violet-600 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {claiming ? <Loader2 size={13} className="animate-spin" /> : <PackageSearch size={13} />}
          Ambil Pesanan
        </button>
      )}
    </div>
  );
}

function ShipmentGrid({ shipments }: { shipments: DriverShipmentSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {shipments.map((s) => (
        <Link
          key={s.awb}
          to={driverPath(`/shipments/${s.awb}`)}
          className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:bg-slate-50"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-bold text-slate-900">{s.awb}</span>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                s.status === KENDALA_STATUS
                  ? "bg-red-50 text-red-700"
                  : s.status === SELESAI_STATUS
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-50 text-blue-700"
              }`}
            >
              {s.status}
            </span>
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
            {s.kotaAsal} <ArrowRight size={13} className="text-slate-300" /> {s.kotaTujuan}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Package size={12} /> {s.jumlahKoli} Koli
            </span>
            {s.truckNomorUnit && (
              <span className="flex items-center gap-1">
                <Truck size={12} /> {s.truckNomorUnit}
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <Weight size={12} /> {s.beratKg} Kg
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarClock size={12} className="shrink-0 text-slate-400" />
            Estimasi Tiba:{" "}
            <span className="font-medium text-slate-700">
              {s.estimasiTiba ? formatTanggalPanjang(s.estimasiTiba) : "Belum tersedia"}
            </span>
          </p>
        </Link>
      ))}
    </div>
  );
}
