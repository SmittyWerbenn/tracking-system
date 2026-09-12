import { ArrowLeft, MapPin, Phone, Truck as TruckIcon, User } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArmadaStatusBadge } from "../../components/ArmadaStatusBadge";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { StatusBadge } from "../../components/StatusBadge";
import { useFleet } from "../../store/FleetContext";
import { useShipments } from "../../store/ShipmentContext";
import type { Shipment } from "../../types";
import { formatTanggalPendek } from "../../utils/format";

type FilterMode = "Semua" | "Sedang Dibawa" | "Selesai";

export default function TruckHistory() {
  const { id } = useParams<{ id: string }>();
  const { getTruck } = useFleet();
  const { shipments } = useShipments();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<FilterMode>("Semua");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const truck = getTruck(id ?? "");

  function statusForTruck(s: Shipment): FilterMode {
    if (s.truckId === id && s.status !== "Selesai / Terkirim") return "Sedang Dibawa";
    return "Selesai";
  }

  const relevantShipments = useMemo(() => {
    if (!id) return [];
    return shipments
      .filter((s) => s.truckId === id || s.timeline.some((e) => e.truckId === id))
      .filter((s) => filter === "Semua" || statusForTruck(s) === filter)
      .filter((s) => !dateFrom || s.tanggalDibuat >= dateFrom)
      .filter((s) => !dateTo || s.tanggalDibuat <= dateTo)
      .sort((a, b) => (a.tanggalDibuat + a.jamDibuat < b.tanggalDibuat + b.jamDibuat ? 1 : -1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipments, id, filter, dateFrom, dateTo]);

  if (!truck) {
    return (
      <AdminLayout>
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">Truck tidak ditemukan.</p>
          <Link to="/admin/armada" className="mt-3 inline-block text-sm text-blue-700 hover:underline">
            Kembali ke Master Armada
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} /> Kembali
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-white">
              <TruckIcon size={22} />
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-slate-900">{truck.nomorUnit}</p>
              <p className="text-sm text-slate-500">
                {truck.jenis} - {truck.kapasitas}
              </p>
            </div>
          </div>
          <ArmadaStatusBadge status={truck.status} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <User size={15} className="text-slate-400" />
            Driver: <span className="font-medium">{truck.driver?.nama ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Phone size={15} className="text-slate-400" />
            {truck.driver?.telepon ?? "-"}
          </div>
        </div>
        {truck.keterangan && (
          <p className="mt-4 rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500">{truck.keterangan}</p>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Riwayat Perjalanan Truck
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          AWB yang sedang dibawa dan yang pernah dibawa oleh unit ini.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex gap-1.5">
            {(["Semua", "Sedang Dibawa", "Selesai"] as FilterMode[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
            Periode:
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
            />
            <span>-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
            />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">AWB</th>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Tujuan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Keterlibatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {relevantShipments.map((s) => (
                  <tr key={s.awb} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link to={`/admin/resi/${s.awb}`} className="font-mono font-medium text-blue-800 hover:underline">
                        {s.awb}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatTanggalPendek(s.tanggalDibuat)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {s.kotaTujuan}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={s.status} size="sm" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-slate-500">
                      {statusForTruck(s)}
                    </td>
                  </tr>
                ))}
                {relevantShipments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">
                      Belum ada riwayat untuk unit ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
