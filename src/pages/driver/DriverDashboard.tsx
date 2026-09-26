import { AlertTriangle, ArrowRight, Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DriverLayout } from "../../components/layout/DriverLayout";
import { useAuth } from "../../store/AuthContext";
import { fetchDriverShipments, type DriverShipmentSummary } from "../../utils/driverApi";

const KENDALA_STATUS = "Kendala";
const SELESAI_STATUS = "Selesai / Terkirim";

export default function DriverDashboard() {
  const { profile } = useAuth();
  const [shipments, setShipments] = useState<DriverShipmentSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDriverShipments()
      .then((items) => {
        if (!cancelled) setShipments(items);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat pengiriman. Coba muat ulang halaman.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const active = (shipments ?? []).filter((s) => s.status !== SELESAI_STATUS);
  const kendala = (shipments ?? []).filter((s) => s.status === KENDALA_STATUS);
  // Best-effort "selesai hari ini" - detail's timeline has the real date,
  // this list endpoint doesn't, so this counts all "Selesai" items for now.
  const selesai = (shipments ?? []).filter((s) => s.status === SELESAI_STATUS);

  return (
    <DriverLayout wide>
      <div className="mb-5">
        <p className="text-sm text-slate-500">Halo,</p>
        <h1 className="text-lg font-semibold text-slate-900">{profile?.nama}</h1>
        <p className="text-xs text-slate-400">Driver</p>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center sm:p-4">
          <p className="text-xl font-bold text-blue-900 sm:text-2xl">{active.length}</p>
          <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">Aktif</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center sm:p-4">
          <p className="text-xl font-bold text-emerald-600 sm:text-2xl">{selesai.length}</p>
          <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">Selesai</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center sm:p-4">
          <p className="text-xl font-bold text-red-600 sm:text-2xl">{kendala.length}</p>
          <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">Kendala</p>
        </div>
      </div>

      <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Pengiriman Saya</h2>

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

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {shipments?.map((s) => (
          <Link
            key={s.awb}
            to={`/driver/shipments/${s.awb}`}
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
          </Link>
        ))}
      </div>
    </DriverLayout>
  );
}
