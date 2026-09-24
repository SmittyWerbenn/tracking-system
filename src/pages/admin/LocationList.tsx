import { AlertTriangle, Ban, CheckCircle2, MapPinned, Pencil, RotateCcw, Table, Plus, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { BulkLocationImport } from "../../components/BulkLocationImport";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { useAuth } from "../../store/AuthContext";
import { useLocations, type TitikFormData } from "../../store/LocationContext";
import { ApiError } from "../../utils/apiClient";
import type { TitikJenis, TitikLokasi } from "../../types";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

const JENIS_OPTIONS: TitikJenis[] = ["Gudang", "Hub", "Transit", "Cabang", "Tujuan"];

const emptyForm: TitikFormData = { namaKota: "", kodeKota: "", provinsi: "", jenis: "Transit", aktif: true };

const JENIS_STYLE: Record<TitikJenis, string> = {
  Gudang: "bg-blue-100 text-blue-700",
  Hub: "bg-violet-100 text-violet-700",
  Transit: "bg-amber-100 text-amber-700",
  Cabang: "bg-teal-100 text-teal-700",
  Tujuan: "bg-emerald-100 text-emerald-700",
};

export default function LocationList() {
  const { titikLokasi, createTitik, updateTitik, setTitikAktif } = useLocations();
  const { profile } = useAuth();
  const canEdit = profile?.role === "Superadmin" || profile?.role === "Admin";

  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [form, setForm] = useState<TitikFormData>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  function closeInput() {
    setExpanded(false);
    setMode("single");
    setForm(emptyForm);
    setCreateError(null);
  }

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TitikFormData>(emptyForm);
  const [editError, setEditError] = useState<string | null>(null);

  const existingKotaNames = useMemo(() => titikLokasi.map((t) => t.namaKota.trim().toLowerCase()), [titikLokasi]);
  const isDuplicateKota = form.namaKota.trim() !== "" && existingKotaNames.includes(form.namaKota.trim().toLowerCase());

  async function handleCreateSubmit(e: FormEvent) {
    e.preventDefault();
    if (isDuplicateKota) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createTitik(form);
      setForm(emptyForm);
      setCreated(true);
      setTimeout(() => setCreated(false), 2000);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Gagal menyimpan titik lokasi. Coba lagi.");
    } finally {
      setCreating(false);
    }
  }

  function openEdit(t: TitikLokasi) {
    setEditingId(t.id);
    setEditForm({ namaKota: t.namaKota, kodeKota: t.kodeKota, provinsi: t.provinsi, jenis: t.jenis, aktif: t.aktif });
    setEditError(null);
    setEditModalOpen(true);
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditError(null);
    try {
      await updateTitik(editingId, editForm);
      setEditModalOpen(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Gagal menyimpan perubahan. Coba lagi.");
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Kota &amp; Titik Transit</h1>
          <p className="mt-1 text-sm text-slate-500">
            {!expanded
              ? "Master data lokasi yang digunakan pada pengiriman dan update tracking."
              : mode === "single"
                ? "Tambah satu titik lokasi ke master data."
                : "Tambah banyak titik lokasi sekaligus dengan mengisi tabel atau mengimpor file Excel/CSV."}
          </p>
        </div>
        {canEdit && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            <Plus size={16} /> Tambah Titik
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
                Input 1 Titik
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
          <BulkLocationImport existingKota={existingKotaNames} />
        </div>
      )}

      {canEdit && expanded && mode === "single" && (
        <form
          onSubmit={handleCreateSubmit}
          className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Nama Kota</span>
              <input
                required
                className={`${inputClass} ${isDuplicateKota ? "border-amber-400 focus:border-amber-500 focus:ring-amber-100" : ""}`}
                placeholder="Jakarta"
                value={form.namaKota}
                onChange={(e) => setForm({ ...form, namaKota: e.target.value })}
              />
              {isDuplicateKota && (
                <span className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                  <AlertTriangle size={13} /> "{form.namaKota.trim()}" sudah ada di master data, tidak bisa dobel.
                </span>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Kode Kota</span>
              <input
                required
                className={inputClass}
                placeholder="JKT"
                value={form.kodeKota}
                onChange={(e) => setForm({ ...form, kodeKota: e.target.value.toUpperCase() })}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Provinsi</span>
              <input
                required
                className={inputClass}
                placeholder="DKI Jakarta"
                value={form.provinsi}
                onChange={(e) => setForm({ ...form, provinsi: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Jenis Titik</span>
              <select
                className={inputClass}
                value={form.jenis}
                onChange={(e) => setForm({ ...form, jenis: e.target.value as TitikJenis })}
              >
                {JENIS_OPTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.aktif}
                onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Aktif (tampil di dropdown lokasi)</span>
            </label>
          </div>

          {createError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
              <AlertTriangle size={15} /> {createError}
            </div>
          )}
          {created && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={15} /> Titik lokasi berhasil ditambahkan.
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={creating || isDuplicateKota}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
            >
              <Plus size={15} /> Simpan Titik
            </button>
          </div>
        </form>
      )}

      {!expanded && (
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nama Kota</th>
                <th className="px-4 py-3 font-medium">Kode</th>
                <th className="px-4 py-3 font-medium">Provinsi</th>
                <th className="px-4 py-3 font-medium">Jenis Titik</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {canEdit && <th className="px-4 py-3 font-medium">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {titikLokasi.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="flex items-center gap-1.5 font-medium text-slate-900">
                      <MapPinned size={14} className="text-slate-400" />
                      {t.namaKota}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-600">{t.kodeKota}</td>
                  <td className="px-4 py-3 text-slate-600">{t.provinsi}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${JENIS_STYLE[t.jenis]}`}>
                      {t.jenis}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        t.aktif ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {t.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(t)}
                          title="Edit"
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                        >
                          <Pencil size={16} />
                        </button>
                        {t.aktif ? (
                          <button
                            onClick={() => setTitikAktif(t.id, false)}
                            title="Nonaktifkan"
                            className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Ban size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setTitikAktif(t.id, true)}
                            title="Aktifkan"
                            className="rounded-md p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Edit Titik</h2>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Nama Kota</span>
                  <input
                    required
                    className={inputClass}
                    placeholder="Jakarta"
                    value={editForm.namaKota}
                    onChange={(e) => setEditForm({ ...editForm, namaKota: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Kode Kota</span>
                  <input
                    required
                    className={inputClass}
                    placeholder="JKT"
                    value={editForm.kodeKota}
                    onChange={(e) => setEditForm({ ...editForm, kodeKota: e.target.value.toUpperCase() })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Provinsi</span>
                  <input
                    required
                    className={inputClass}
                    placeholder="DKI Jakarta"
                    value={editForm.provinsi}
                    onChange={(e) => setEditForm({ ...editForm, provinsi: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Jenis Titik</span>
                  <select
                    className={inputClass}
                    value={editForm.jenis}
                    onChange={(e) => setEditForm({ ...editForm, jenis: e.target.value as TitikJenis })}
                  >
                    {JENIS_OPTIONS.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.aktif}
                    onChange={(e) => setEditForm({ ...editForm, aktif: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Aktif (tampil di dropdown lokasi)</span>
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
