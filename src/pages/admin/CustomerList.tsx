import { Building2, Plus, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { RefreshButton } from "../../components/RefreshButton";
import { api, ApiError } from "../../utils/apiClient";
import { formatTanggalPanjang } from "../../utils/format";

interface CustomerAccount {
  id: string;
  nama: string;
  email: string;
  aktif: boolean;
  createdAt: string;
}

interface CustomerRow {
  customerId: string;
  nama: string | null;
  kota: string | null;
  shipmentCount: number;
  accounts: CustomerAccount[];
}

function formatCreatedAt(iso: string): string {
  return formatTanggalPanjang(iso.slice(0, 10));
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newId, setNewId] = useState("");
  const [newNama, setNewNama] = useState("");
  const [newKota, setNewKota] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function openModal() {
    setNewId("");
    setNewNama("");
    setNewKota("");
    setFormError(null);
    setModalOpen(true);
  }

  async function handleAddClient(e: FormEvent) {
    e.preventDefault();
    const customerId = newId.trim().toUpperCase();
    const nama = newNama.trim();
    if (!customerId || !nama) {
      setFormError("Client ID dan Nama Client wajib diisi.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await api.post("/api/customers", { customerId, nama, kota: newKota.trim() });
      setModalOpen(false);
      setNotice(`Client ${customerId} berhasil ditambahkan. Sekarang bisa dipilih di Manajemen User > Tambah User.`);
      await fetchCustomers();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Gagal menambahkan client.");
    } finally {
      setSaving(false);
    }
  }

  function fetchCustomers() {
    setError(null);
    return api
      .get<{ items: CustomerRow[] }>("/api/customers")
      .then((res) => setCustomers(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Gagal memuat data customer."));
  }

  useEffect(() => {
    setIsLoading(true);
    fetchCustomers().finally(() => setIsLoading(false));
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetchCustomers();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftar Client beserta akun yang tertaut dan jumlah pengiriman. Client baru ditambahkan di
            sini terlebih dahulu, lalu dipilih saat membuat user di Manajemen User.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={handleRefresh} refreshing={refreshing} />
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            <Plus size={16} /> Tambah Client
          </button>
        </div>
      </div>

      {notice && (
        <div className="mt-5 flex items-start justify-between gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-emerald-600 hover:text-emerald-900" title="Tutup">
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-900" />
        </div>
      ) : customers.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-400">
          Belum ada Client. Klik "Tambah Client" untuk membuat Client ID pertama.
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Client ID</th>
                  <th className="px-4 py-3 font-medium">Nama Client</th>
                  <th className="px-4 py-3 font-medium">Kota</th>
                  <th className="px-4 py-3 font-medium">Nama Akun</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status Akun</th>
                  <th className="px-4 py-3 font-medium">Dibuat</th>
                  <th className="px-4 py-3 font-medium">Jumlah Pengiriman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => {
                  const rows = c.accounts.length > 0 ? c.accounts : [null];
                  return rows.map((a, i) => (
                    <tr key={a ? a.id : `client-${c.customerId}`} className="hover:bg-slate-50">
                      {i === 0 && (
                        <>
                          <td rowSpan={rows.length} className="whitespace-nowrap border-r border-slate-100 px-4 py-3 align-top">
                            <span className="flex items-center gap-1.5 font-mono font-semibold text-slate-900">
                              <Building2 size={14} className="text-teal-600" />
                              {c.customerId}
                            </span>
                          </td>
                          <td rowSpan={rows.length} className="px-4 py-3 align-top text-slate-800">
                            {c.nama ?? "-"}
                          </td>
                          <td rowSpan={rows.length} className="px-4 py-3 align-top text-slate-800">
                            {c.kota ?? "-"}
                          </td>
                        </>
                      )}
                      {a ? (
                        <>
                          <td className="px-4 py-3 text-slate-800">{a.nama}</td>
                          <td className="px-4 py-3 text-slate-600">{a.email}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                a.aktif ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {a.aktif ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatCreatedAt(a.createdAt)}</td>
                        </>
                      ) : (
                        <td colSpan={4} className="px-4 py-3 text-xs italic text-slate-400">
                          Belum ada akun user untuk client ini.
                        </td>
                      )}
                      {i === 0 && (
                        <td rowSpan={rows.length} className="whitespace-nowrap px-4 py-3 align-top text-slate-600">
                          {c.shipmentCount}
                        </td>
                      )}
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <form onSubmit={handleAddClient} className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Tambah Client</h2>
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
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Client ID</span>
                  <input
                    required
                    autoFocus
                    value={newId}
                    onChange={(e) => setNewId(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                    placeholder="Contoh: IDCLIENT001"
                    autoComplete="off"
                    maxLength={50}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <span className="mt-1.5 block text-[11px] text-slate-400">
                    Nomor pelanggan unik. Tidak bisa diubah setelah dibuat.
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Nama Client</span>
                  <input
                    required
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    placeholder="Contoh: PT Megah Jaya"
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Kota</span>
                  <input
                    value={newKota}
                    onChange={(e) => setNewKota(e.target.value)}
                    placeholder="Contoh: Jakarta Barat"
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
    </AdminLayout>
  );
}
