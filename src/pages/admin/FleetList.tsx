import { AlertTriangle, Ban, CheckCircle2, History, Pencil, Plus, RotateCcw, Table, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArmadaStatusBadge } from "../../components/ArmadaStatusBadge";
import { BulkFleetImport } from "../../components/BulkFleetImport";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { useAuth } from "../../store/AuthContext";
import { useFleet, type TruckFormData, type TruckWithDriver } from "../../store/FleetContext";
import type { ArmadaStatus } from "../../types";
import { ApiError } from "../../utils/apiClient";
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
  const canEdit = profile?.role === "Superadmin" || profile?.role === "Admin";

  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [form, setForm] = useState<TruckFormData>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  function closeInput() {
    setExpanded(false);
    setMode("single");
    setForm(emptyForm);
    setCreateError(null);
  }

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TruckFormData>(emptyForm);
  const [editError, setEditError] = useState<string | null>(null);

  const existingNomorUnit = useMemo(
    () => trucksWithDriver.map((t) => t.nomorUnit.replace(/\s+/g, "").toLowerCase()),
    [trucksWithDriver],
  );
  const isDuplicateNomorUnit =
    form.nomorUnit.trim() !== "" && existingNomorUnit.includes(form.nomorUnit.replace(/\s+/g, "").toLowerCase());

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

  async function handleCreateSubmit(e: FormEvent) {
    e.preventDefault();
    if (isDuplicateNomorUnit) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createTruck(form);
      setForm(emptyForm);
      setCreated(true);
      setTimeout(() => setCreated(false), 2000);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Gagal menyimpan unit truck. Coba lagi.");
    } finally {
      setCreating(false);
    }
  }

  function openEdit(t: TruckWithDriver) {
    setEditingId(t.id);
    setEditForm({
      nomorUnit: t.nomorUnit,
      jenis: t.jenis,
      kapasitas: t.kapasitas,
      driverNama: t.driver?.nama ?? "",
      driverTelepon: t.driver?.telepon ?? "",
      status: t.status,
      keterangan: t.keterangan ?? "",
    });
    setEditError(null);
    setEditModalOpen(true);
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditError(null);
    try {
      await updateTruck(editingId, editForm);
      setEditModalOpen(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Gagal menyimpan perubahan. Coba lagi.");
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Master Armada</h1>
          <p className="mt-1 text-sm text-slate-500">
            {!expanded
              ? "Kelola data unit truck dan driver."
              : mode === "single"
                ? "Tambah satu unit truck ke master armada."
                : "Tambah banyak unit truck sekaligus dengan mengisi tabel atau mengimpor file Excel/CSV."}
          </p>
        </div>
        {canEdit && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            <Plus size={16} /> Tambah Truck
          </button>
        )}
        {canEdit && expanded && (
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  mode === "single" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Plus size={13} />
                Input 1 Truck
              </button>
              <button
                type="button"
                onClick={() => setMode("bulk")}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  mode === "bulk" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Table size={13} />
                Bulk / Import Excel
              </button>
            </div>
            <button
              type="button"
              onClick={closeInput}
              title="Tutup"
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {canEdit && expanded && mode === "bulk" && (
        <div className="mt-6">
          <BulkFleetImport existingNomorUnit={existingNomorUnit} />
        </div>
      )}

      {canEdit && expanded && mode === "single" && (
        <form
          onSubmit={handleCreateSubmit}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Nomor Unit / Polisi</span>
              <input
                required
                className={`${inputClass} ${isDuplicateNomorUnit ? "border-amber-400 focus:border-amber-500 focus:ring-amber-100" : ""}`}
                placeholder="B 9123 XYZ"
                value={form.nomorUnit}
                onChange={(e) => setForm({ ...form, nomorUnit: e.target.value })}
              />
              {isDuplicateNomorUnit && (
                <span className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                  <AlertTriangle size={13} /> "{form.nomorUnit.trim()}" sudah ada di master data, tidak bisa dobel.
                </span>
              )}
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

          {createError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
              <AlertTriangle size={15} /> {createError}
            </div>
          )}
          {created && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={15} /> Unit truck berhasil ditambahkan.
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={creating || isDuplicateNomorUnit}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
            >
              <Plus size={15} /> Simpan Truck
            </button>
          </div>
        </form>
      )}

      {!expanded && (
      <>
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
      </>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Edit Truck</h2>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
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
                    value={editForm.nomorUnit}
                    onChange={(e) => setEditForm({ ...editForm, nomorUnit: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Jenis Truck</span>
                  <select
                    className={inputClass}
                    value={editForm.jenis}
                    onChange={(e) => setEditForm({ ...editForm, jenis: e.target.value })}
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
                    value={editForm.kapasitas}
                    onChange={(e) => setEditForm({ ...editForm, kapasitas: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Status Armada</span>
                  <select
                    className={inputClass}
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TruckFormData["status"] })}
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
                    value={editForm.driverNama}
                    onChange={(e) => setEditForm({ ...editForm, driverNama: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">No. HP Driver</span>
                  <input
                    required
                    className={inputClass}
                    placeholder="0812-0000-0000"
                    value={editForm.driverTelepon}
                    onChange={(e) => setEditForm({ ...editForm, driverTelepon: e.target.value })}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Keterangan</span>
                  <textarea
                    rows={2}
                    className={inputClass}
                    placeholder="Opsional"
                    value={editForm.keterangan}
                    onChange={(e) => setEditForm({ ...editForm, keterangan: e.target.value })}
                  />
                </label>
              </div>

              {editError && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
                  <AlertTriangle size={15} /> {editError}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
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
