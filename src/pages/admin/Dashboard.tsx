import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  MessageSquare,
  Package,
  PackagePlus,
  Route,
  Star,
  Truck,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { StagnantShipmentsCard } from "../../components/StagnantShipmentsCard";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { useFeedback } from "../../store/FeedbackContext";
import { useFleet } from "../../store/FleetContext";
import { useNotifications } from "../../store/NotificationContext";
import { useSettings } from "../../store/SettingsContext";
import { useShipments } from "../../store/ShipmentContext";
import type { ShipmentStatus } from "../../types";
import { formatTanggalPendek } from "../../utils/format";
import { getStagnantShipments } from "../../utils/stagnant";

export default function Dashboard() {
  const { shipments } = useShipments();
  const { trucks } = useFleet();
  const { notifications } = useNotifications();
  const { feedback } = useFeedback();
  const { settings } = useSettings();

  const total = shipments.length;
  const dalamPerjalanan = shipments.filter((s) => s.status === "Dalam Perjalanan").length;
  const transit = shipments.filter((s) => s.status === "Transit").length;
  const selesai = shipments.filter((s) => s.status === "Selesai / Terkirim").length;
  const bermasalah = shipments.filter((s) => s.status === "Kendala").length;
  const truckOnTrip = trucks.filter((t) => t.status === "On Trip").length;
  const avgRating = feedback.length === 0 ? 0 : feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;

  const stagnant = useMemo(
    () => getStagnantShipments(shipments, settings.stagnantThresholdDays),
    [shipments, settings.stagnantThresholdDays],
  );

  const recent = [...shipments]
    .sort((a, b) => (a.tanggalDibuat + a.jamDibuat < b.tanggalDibuat + b.jamDibuat ? 1 : -1))
    .slice(0, 5);

  const recentNotifications = notifications.slice(0, 4);
  const recentFeedback = [...feedback].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)).slice(0, 4);

  const statusBreakdown = shipments.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan operasional pengiriman PT Gangsar Mitra Sautama.
          </p>
        </div>
        <Link
          to="/admin/pengiriman/baru"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
        >
          <PackagePlus size={17} />
          Buat Pengiriman
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Pengiriman" value={total} icon={Package} accent="bg-blue-100 text-blue-700" />
        <StatCard label="Dalam Perjalanan" value={dalamPerjalanan} icon={Truck} accent="bg-sky-100 text-sky-700" />
        <StatCard label="Transit" value={transit} icon={Route} accent="bg-amber-100 text-amber-700" />
        <StatCard label="Selesai" value={selesai} icon={CheckCircle2} accent="bg-emerald-100 text-emerald-700" />
        <StatCard label="Kendala" value={bermasalah} icon={AlertTriangle} accent="bg-red-100 text-red-700" />
        <StatCard label="AWB Macet" value={stagnant.length} icon={AlertTriangle} accent="bg-red-100 text-red-700" />
        <StatCard label="Total Armada" value={trucks.length} icon={Truck} accent="bg-violet-100 text-violet-700" />
        <StatCard label="Truck On Trip" value={truckOnTrip} icon={Truck} accent="bg-sky-100 text-sky-700" />
        <StatCard
          label="Avg. Customer Rating"
          value={avgRating.toFixed(1)}
          icon={Star}
          accent="bg-amber-100 text-amber-700"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-800">Pengiriman Terbaru (AWB)</h2>
            <Link
              to="/admin/pengiriman"
              className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
            >
              Lihat semua <ArrowRight size={13} />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {recent.map((s) => (
              <li key={s.awb}>
                <Link
                  to={`/admin/resi/${s.awb}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-medium text-slate-900">{s.awb}</p>
                    <p className="truncate text-xs text-slate-500">
                      {s.kotaAsal} → {s.kotaTujuan} · {s.penerima.nama}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {formatTanggalPendek(s.tanggalDibuat)}
                    </span>
                    <StatusBadge status={s.status} size="sm" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-800">Status Pengiriman</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <li key={status}>
                <Link
                  to={`/admin/pengiriman?status=${encodeURIComponent(status)}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                >
                  <StatusBadge status={status as ShipmentStatus} size="sm" />
                  <span className="text-sm font-semibold text-slate-700">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StagnantShipmentsCard items={stagnant} />

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <Bell size={16} className="text-blue-800" />
            <h2 className="text-sm font-semibold text-slate-800">Notifikasi Terbaru</h2>
          </div>
          {recentNotifications.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Belum ada notifikasi.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentNotifications.map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <p className="text-sm font-medium text-slate-800">{n.subject}</p>
                  <p className="mt-0.5 font-mono text-xs text-slate-400">{n.awb}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-slate-100 px-5 py-3">
            <Link to="/admin/notifikasi" className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline">
              Lihat semua <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <MessageSquare size={16} className="text-blue-800" />
            <h2 className="text-sm font-semibold text-slate-800">Feedback Terbaru</h2>
          </div>
          {recentFeedback.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Belum ada feedback.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentFeedback.map((f) => (
                <li key={f.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800">{f.customerName}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={12}
                          className={n <= f.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                        />
                      ))}
                    </div>
                  </div>
                  {f.comment && <p className="mt-0.5 truncate text-xs text-slate-500">{f.comment}</p>}
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-slate-100 px-5 py-3">
            <Link to="/admin/feedback" className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline">
              Lihat semua <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
