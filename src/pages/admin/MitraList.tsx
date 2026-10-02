import { Ban, Handshake, Pencil, Plus, RotateCcw, Search, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { RefreshButton } from "../../components/RefreshButton";
import { useMitras, type Mitra, type MitraFormData } from "../../store/MitraContext";
import { ApiError } from "../../utils/apiClient";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

const emptyForm: MitraFormData = { kodeMitra: "", nama: "", pic: "", telepon: "", email: "", alamat: "", area: "" };

export default function MitraList() {
  const { mitras, isLoading, refresh, createMitra, updateMitra, setMitraAktif } = useMitras();
  const [refreshing, setRefreshing] = useState(false);
  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }

  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mitras;
    return mitras.filter((m) =>
      [m.kodeMitra, m.nama, m.pic, m.area].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [mitras, search]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<MitraFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openAdd() {
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  async function handleAddSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await createMitra({ ...form, kodeMitra: form.kodeMitra.trim().toUpperCase() });
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Gagal menambahkan Mitra. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  const [editing, setEditing] = useState<Mitra | null>(null);
  const [editForm, setEditForm] = useState<MitraFormData>(emptyForm);
  const [editError, setEditError] = useState<string | null>(null);

  function openEdit(m: Mitra) {
    setEditing(m);
    setEditForm({
      kodeMitra: m.kodeMitra,
      nama: m.nama,
      pic: m.pic ?? "",
      telepon: m.telepon ?? "",
      email: m.email ?? "",
      alamat: m.alamat ?? "",
      area: m.area ?? "",
    });
    setEditError(null);
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setEditError(null);
    try {
      const { kodeMitra: _kodeMitra, ...rest } = editForm;
      await updateMitra(editing.kodeMitra, rest);
      setEditing(null);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Gagal menyimpan perubahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  const [togglingId, setTogglingId] = useState<string | null>(null);
  async function handleToggleActive(m: Mitra) {
    const next = !m.aktif;
    const msg = next
      ? `Aktifkan kembali Mitra ${m.kodeMitra}? Akun user Mitra ini bisa login lagi.`
      : `Nonaktifkan Mitra ${m.kodeMitra}? Akun user Mitra ini akan dibekukan dan tidak bisa login.`;
    if (!window.confirm(msg)) return;
    setTogglingId(m.kodeMitra);
    try {
      await setMitraAktif(m.kodeMitra, next);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Master Mitra</h1>
          <p className="mt-1 text-sm text-slate-500">
            Data mitra agen pihak ketiga. Tambahkan Mitra di sini terlebih dahulu, lalu kaitkan dengan
            akun user (role Mitra) di Manajemen User, dan teruskan/assign paket ke Mitra dari Detail Paket.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={handleRefresh} refreshing={refreshing} />
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            <Plus size={16} /> Tambah Mitra
          </button>
        </div>
      </div>

      <div className="relative mt-5 max-w-xs">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kode, nama, PIC, atau area..."
          className={`${inputClass} pl-9`}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Kode Mitra</th>
                <th className="px-4 py-3 font-medium">Nama Mitra</th>
                <th className="px-4 py-3 font-medium">PIC</th>
                <th className="px-4 py-3 font-medium">No. HP</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Area/Coverage</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-14 text-center">
                    {isLoading ? (
                      <span className="text-sm text-slate-400">Memuat data Mitra...</span>
                    ) : (
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                        <Handshake size={28} className="text-slate-300" />
                        <p className="text-sm font-semibold text-slate-700">
                          {search ? "Tidak ada Mitra yang cocok." : "Belum ada data Mitra."}
                        </p>
                        {!search && (
                          <button
                            type="button"
                            onClick={openAdd}
                            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
                          >
                            <Plus size={15} /> Tambah Mitra
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )}
              {filtered.map((m) => (
                <tr key={m.kodeMitra} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="flex items-center gap-1.5 font-mono font-semibold text-slate-900">
                      <Handshake size={14} className="text-teal-600" />
                      {m.kodeMitra}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-800">{m.nama}</td>
                  <td className="px-4 py-3 text-slate-600">{m.pic ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{m.telepon ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{m.email ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{m.area ?? "-"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        m.aktif ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {m.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(m)}
                        title="Edit"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(m)}
                        disabled={togglingId === m.kodeMitra}
                        title={m.aktif ? "Nonaktifkan" : "Aktifkan"}
                        className={`rounded-md p-1.5 hover:bg-slate-100 disabled:opacity-50 ${
                          m.aktif ? "text-slate-500 hover:text-red-600" : "text-slate-500 hover:text-emerald-600"
                        }`}
                      >
                        {m.aktif ? <Ban size={16} /> : <RotateCcw size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <form onSubmit={handleAddSubmit} className="max-h-[90vh] overflow-y-auto p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Tambah Mitra</h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Kode Mitra</span>
                  <input
                    required
                    autoFocus
                    value={form.kodeMitra}
                    onChange={(e) => setForm({ ...form, kodeMitra: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                    placeholder="Contoh: MITRA-JKT-001"
                    autoComplete="off"
                    maxLength={50}
                    className={`${inputClass} font-mono`}
                  />
                  <span className="mt-1.5 block text-[11px] text-slate-400">
                    Kode unik Mitra. Tidak bisa diubah setelah dibuat.
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Nama Mitra</span>
                  <input
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="Contoh: Mitra Agen Doring Jakarta"
                    maxLength={100}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">PIC</span>
                  <input
                    value={form.pic}
                    onChange={(e) => setForm({ ...form, pic: e.target.value })}
                    placeholder="Nama penanggung jawab"
                    maxLength={100}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">No. HP</span>
                  <input
                    value={form.telepon}
                    onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    maxLength={30}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="mitra@contoh.com"
                    maxLength={150}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Alamat</span>
                  <input
                    value={form.alamat}
                    onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                    maxLength={300}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Area/Coverage</span>
                  <input
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="Contoh: Jakarta & sekitarnya"
                    maxLength={150}
                    className={inputClass}
                  />
                </label>
              </div>
              {formError && <p className="mt-4 text-sm font-medium text-red-600">{formError}</p>}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <form onSubmit={handleEditSubmit} className="max-h-[90vh] overflow-y-auto p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Edit Mitra</h2>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Kode Mitra</span>
                  <input
                    value={editForm.kodeMitra}
                    disabled
                    className={`${inputClass} bg-slate-50 font-mono text-slate-500`}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Nama Mitra</span>
                  <input
                    required
                    value={editForm.nama}
                    onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                    maxLength={100}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">PIC</span>
                  <input
                    value={editForm.pic}
                    onChange={(e) => setEditForm({ ...editForm, pic: e.target.value })}
                    maxLength={100}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">No. HP</span>
                  <input
                    value={editForm.telepon}
                    onChange={(e) => setEditForm({ ...editForm, telepon: e.target.value })}
                    maxLength={30}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Email</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    maxLength={150}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Alamat</span>
                  <input
                    value={editForm.alamat}
                    onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                    maxLength={300}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Area/Coverage</span>
                  <input
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                    maxLength={150}
                    className={inputClass}
                  />
                </label>
              </div>
              {editError && <p className="mt-4 text-sm font-medium text-red-600">{editError}</p>}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
