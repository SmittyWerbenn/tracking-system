import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Navigation,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DriverLayout } from "../../components/layout/DriverLayout";
import { ApiError } from "../../utils/apiClient";
import {
  fetchDriverLastPosition,
  fetchDriverShipmentDetail,
  reportDriverPosition,
  type DriverLastPosition,
  type DriverShipmentDetail as DriverShipmentDetailData,
} from "../../utils/driverApi";
import { formatJam, formatTanggalPanjang } from "../../utils/format";

function formatCoord(n: number): string {
  return n.toFixed(5);
}

export default function DriverShipmentDetail() {
  const { awb } = useParams<{ awb: string }>();
  const [data, setData] = useState<DriverShipmentDetailData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [lastPosition, setLastPosition] = useState<DriverLastPosition | null>(null);
  const [reporting, setReporting] = useState(false);
  const [positionError, setPositionError] = useState<string | null>(null);
  const [positionSaved, setPositionSaved] = useState(false);

  useEffect(() => {
    if (!awb) return;
    let cancelled = false;
    fetchDriverShipmentDetail(awb)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof ApiError ? err.message : "Gagal memuat pengiriman.");
      });
    fetchDriverLastPosition(awb)
      .then((pos) => {
        if (!cancelled) setLastPosition(pos);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [awb]);

  function handleReportPosition() {
    if (!awb) return;
    if (!navigator.geolocation) {
      setPositionError("Perangkat/browser ini tidak mendukung geolokasi.");
      return;
    }
    setReporting(true);
    setPositionError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        reportDriverPosition(awb, coords)
          .then(() => {
            setLastPosition({ ...coords, created_at: new Date().toISOString() });
            setPositionSaved(true);
            setTimeout(() => setPositionSaved(false), 2500);
          })
          .catch((err) => {
            setPositionError(err instanceof ApiError ? err.message : "Gagal mengirim posisi.");
          })
          .finally(() => setReporting(false));
      },
      (err) => {
        setReporting(false);
        setPositionError(
          err.code === err.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Aktifkan izin lokasi di pengaturan browser."
            : "Gagal mendapatkan lokasi perangkat. Coba lagi.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  if (loadError) {
    return (
      <DriverLayout>
        <Link to="/driver" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <ArrowLeft size={15} /> Kembali
        </Link>
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          <AlertTriangle size={15} /> {loadError}
        </div>
      </DriverLayout>
    );
  }

  if (!data) {
    return (
      <DriverLayout>
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-900" />
        </div>
      </DriverLayout>
    );
  }

  const { shipment, timeline } = data;
  const mapsQuery = encodeURIComponent(`${shipment.alamatTujuan}, ${shipment.kotaTujuan}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <DriverLayout>
      <Link to="/driver" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500">
        <ArrowLeft size={15} /> Kembali
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono text-base font-bold text-slate-900">{shipment.awb}</span>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {shipment.status}
          </span>
        </div>

        <div className="mt-4 flex items-start gap-2.5">
          <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Asal</p>
            <p className="text-sm text-slate-700">{shipment.alamatAsal}, {shipment.kotaAsal}</p>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2.5">
          <MapPin size={16} className="mt-0.5 shrink-0 text-emerald-500" />
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Tujuan</p>
            <p className="text-sm font-medium text-slate-900">{shipment.penerima.nama}</p>
            <p className="text-sm text-slate-700">{shipment.alamatTujuan}, {shipment.kotaTujuan}</p>
          </div>
        </div>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 py-3 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <Navigation size={16} /> Buka Navigasi
        </a>

        {shipment.penerima.telepon && (
          <a
            href={`tel:${shipment.penerima.telepon}`}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Phone size={16} /> Hubungi Penerima ({shipment.penerima.telepon})
          </a>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Informasi Barang</h2>
        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex items-center gap-2.5 text-slate-700">
            <Package size={15} className="text-slate-400" />
            {shipment.jumlahKoli} Koli &middot; {shipment.beratKg} Kg &middot; {shipment.layanan}
          </div>
          <p className="text-slate-600">{shipment.deskripsiBarang}</p>
          {shipment.truckNomorUnit && (
            <div className="flex items-center gap-2.5 text-slate-700">
              <Truck size={15} className="text-slate-400" />
              {shipment.truckNomorUnit}
            </div>
          )}
          <div className="flex items-center gap-2.5 text-slate-700">
            <User size={15} className="text-slate-400" />
            {shipment.penerima.nama}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Laporkan Posisi</h2>

        {lastPosition && (
          <p className="mb-3 text-xs text-slate-500">
            Posisi terakhir: {formatCoord(lastPosition.latitude)}, {formatCoord(lastPosition.longitude)}
            <br />
            {formatTanggalPanjang(lastPosition.created_at.slice(0, 10))} &middot; {formatJam(lastPosition.created_at.slice(11, 16))}
          </p>
        )}

        <button
          type="button"
          onClick={handleReportPosition}
          disabled={reporting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          <MapPin size={16} />
          {reporting ? "Mengambil lokasi..." : "Perbarui Posisi"}
        </button>

        {positionError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
            <AlertTriangle size={14} /> {positionError}
          </div>
        )}
        {positionSaved && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={14} /> Posisi berhasil dikirim.
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Riwayat Perjalanan</h2>
        <ol className="flex flex-col gap-3">
          {[...timeline].reverse().map((e) => (
            <li key={e.id} className="border-l-2 border-slate-200 pl-3">
              <p className="text-xs text-slate-400">
                {formatTanggalPanjang(e.tanggal)} &middot; {formatJam(e.jam)}
              </p>
              <p className="text-sm font-semibold text-slate-900">{e.type}</p>
              <p className="text-xs text-slate-500">{e.lokasi}</p>
              {e.keterangan && <p className="mt-0.5 text-xs text-slate-500">{e.keterangan}</p>}
            </li>
          ))}
        </ol>
      </div>
    </DriverLayout>
  );
}
