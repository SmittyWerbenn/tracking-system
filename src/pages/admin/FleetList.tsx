import { Ban, History, Pencil, Plus, RotateCcw, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArmadaStatusBadge } from "../../components/ArmadaStatusBadge";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { useAuth } from "../../store/AuthContext";
import { useFleet, type TruckFormData, type TruckWithDriver } from "../../store/FleetContext";
import type { ArmadaStatus } from "../../types";
import { ARMADA_STATUS_OPTIONS } from "../../utils/status";

function isArmadaStatus(value: string): value is ArmadaStatus {
  return (ARMADA_STATUS_OPTIONS as string[]).includes(value);
}

const TRUCK_TYPES = ["Wingbox", "CDD", "Box", "Pickup", "Fuso", "Tronton"];

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

const emptyForm: TruckFormData = {
  nomorUnit: "",
  jenis: "Wingbox",
  kapasitas: "",
  driverNama: "",
  driverTelepon: "",
  status: "Available",
  keterangan: "",
};

export default function FleetList() {
  const { trucksWithDriver, createTruck, updateTruck, setTruckStatus } = useFleet();
  const { profile } = useAuth();
  const canEdit = profile.role === "Admin";

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TruckFormData>(emptyForm);
  const [searchParams, setSearchParams] = useSearchParams();

  const statusParam = searchParams.get("status") ?? "";
  const statusFilter: ArmadaStatus | "Semua" = isArmadaStatus(statusParam) ? statusParam : "Semua";

  function handleStatusFilterChange(value: ArmadaStatus | "Semua") {
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

  const filteredTrucks = useMemo(
    () => (statusFilter === "Semua" ? trucksWithDriver : trucksWithDriver.filter((t) => t.status === statusFilter)),
    [trucksWithDriver, statusFilter],
  );

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(t: TruckWithDriver) {
    setEditingId(t.id);
    setForm({
      nomorUnit: t.nomorUnit,
      jenis: t.jenis,
      kapasitas: t.kapasitas,
      driverNama: t.driver?.nama ?? "",
      driverTelepon: t.driver?.telepon ?? "",
      status: t.status,
      keterangan: t.keterangan ?? "",
    });
    setModalOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (editingId) {
      updateTruck(editingId, form);
    } else {
      createTruck(form);
    }
    setModalOpen(false);
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Master Armada</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola data unit truck dan driver.</p>
        </div>
        {canEdit && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            <Plus size={16} /> Tambah Truck
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value as ArmadaStatus | "Semua")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="Semua">Semua Status</option>
          {ARMADA_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {statusFilter !== "Semua" && (
          <button
            onClick={() => handleStatusFilterChange("Semua")}
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Reset
          </button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nomor Unit</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Kapasitas</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">No. HP Driver</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Keterangan</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrucks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-slate-900">
                    {t.nomorUnit}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{t.jenis}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{t.kapasitas}</td>
                  <td className="px-4 py-3 text-slate-600">{t.driver?.nama ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{t.driver?.telepon ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <ArmadaStatusBadge status={t.status} size="sm" />
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-xs text-slate-500" title={t.keterangan}>
                    {t.keterangan ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/admin/armada/${t.id}`}
                        title="Riwayat Perjalanan"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                      >
                        <History size={16} />
                      </Link>
                      {canEdit && (
                        <button
                          onClick={() => openEdit(t)}
                          title="Edit"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {canEdit && t.status !== "Inactive" && (
                        <button
                          onClick={() => setTruckStatus(t.id, "Inactive")}
                          title="Nonaktifkan"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Ban size={16} />
                        </button>
                      )}
                      {canEdit && t.status === "Inactive" && (
                        <button
                          onClick={() => setTruckStatus(t.id, "Available")}
                          title="Aktifkan"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTrucks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                    Tidak ada armada yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Edit Truck" : "Tambah Truck"}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Nomor Unit / Polisi</span>
                  <input
                    required
                    className={inputClass}
                    placeholder="B 9123 XYZ"
                    value={form.nomorUnit}
                    onChange={(e) => setForm({ ...form, nomorUnit: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Jenis Truck</span>
                  <select
                    className={inputClass}
                    value={form.jenis}
                    onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                  >
                    {TRUCK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Kapasitas</span>
                  <input
                    required
                    className={inputClass}
                    placeholder="8 Ton"
                    value={form.kapasitas}
                    onChange={(e) => setForm({ ...form, kapasitas: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Status Armada</span>
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as TruckFormData["status"] })}
                  >
                    {ARMADA_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Nama Driver</span>
                  <input
                    required
                    className={inputClass}
                    placeholder="Nama driver"
                    value={form.driverNama}
                    onChange={(e) => setForm({ ...form, driverNama: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">No. HP Driver</span>
                  <input
                    required
                    className={inputClass}
                    placeholder="0812-0000-0000"
                    value={form.driverTelepon}
                    onChange={(e) => setForm({ ...form, driverTelepon: e.target.value })}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Keterangan</span>
                  <textarea
                    rows={2}
                    className={inputClass}
                    placeholder="Opsional"
                    value={form.keterangan}
                    onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  />
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
