import { MapPinned, Pencil, Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { useAuth } from "../../store/AuthContext";
import { useLocations, type TitikFormData } from "../../store/LocationContext";
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
  const { titikLokasi, createTitik, updateTitik } = useLocations();
  const { profile } = useAuth();
  const canEdit = profile?.role === "Superadmin" || profile?.role === "Admin";

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TitikFormData>(emptyForm);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(t: TitikLokasi) {
    setEditingId(t.id);
    setForm({ namaKota: t.namaKota, kodeKota: t.kodeKota, provinsi: t.provinsi, jenis: t.jenis, aktif: t.aktif });
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (editingId) {
      await updateTitik(editingId, form);
    } else {
      await createTitik(form);
    }
    setModalOpen(false);
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Kota &amp; Titik Transit</h1>
          <p className="mt-1 text-sm text-slate-500">
            Master data lokasi yang digunakan pada pengiriman dan update tracking.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            <Plus size={16} /> Tambah Titik
          </button>
        )}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                      <button
                        onClick={() => openEdit(t)}
                        title="Edit"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Edit Titik" : "Tambah Titik"}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                    value={form.namaKota}
                    onChange={(e) => setForm({ ...form, namaKota: e.target.value })}
                  />
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
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.aktif}
                    onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Aktif (tampil di dropdown lokasi)</span>
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
