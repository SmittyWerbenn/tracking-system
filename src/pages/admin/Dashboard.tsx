import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Package,
  PackagePlus,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { StatCard } from "../../components/StatCard";
import { StatusBadge } from "../../components/StatusBadge";
import { useShipments } from "../../store/ShipmentContext";
import type { ShipmentStatus } from "../../types";
import { formatTanggalPendek } from "../../utils/format";

export default function Dashboard() {
  const { shipments } = useShipments();

  const total = shipments.length;
  const selesai = shipments.filter((s) => s.status === "Selesai / Terkirim").length;
  const bermasalah = shipments.filter((s) => s.status === "Kendala").length;
  const aktif = total - selesai - bermasalah;

  const recent = [...shipments]
    .sort((a, b) => (a.tanggalDibuat + a.jamDibuat < b.tanggalDibuat + b.jamDibuat ? 1 : -1))
    .slice(0, 5);

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

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Pengiriman"
          value={total}
          icon={Package}
          accent="bg-blue-100 text-blue-700"
        />
        <StatCard
          label="Pengiriman Aktif"
          value={aktif}
          icon={Truck}
          accent="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Selesai"
          value={selesai}
          icon={CheckCircle2}
          accent="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="Bermasalah"
          value={bermasalah}
          icon={AlertTriangle}
          accent="bg-red-100 text-red-700"
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
          <ul className="space-y-3 p-5">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <li key={status} className="flex items-center justify-between gap-3">
                <StatusBadge status={status as ShipmentStatus} size="sm" />
                <span className="text-sm font-semibold text-slate-700">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
