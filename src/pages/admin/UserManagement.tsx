import { Camera, Pencil, Plus, Power, Shield, Upload, X } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { RefreshButton } from "../../components/RefreshButton";
import { useAuth } from "../../store/AuthContext";
import { useUserManagement, type UserFormData } from "../../store/UserManagementContext";
import { ASSIGNABLE_USER_ROLES, roleLabel, type AppUser, type UserRole } from "../../types";
import { checkPhotoSize, compressImage, MAX_PHOTO_SIZE_MB } from "../../utils/compressImage";
import { formatTanggalPanjang } from "../../utils/format";
import { initials } from "../../utils/initials";
import { useFileUrl } from "../../utils/useFileUrl";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

function emptyForm(defaultRole: UserRole): UserFormData {
  return {
    nama: "",
    email: "",
    role: defaultRole,
    fotoDataUrl: undefined,
    password: "",
    driverId: null,
    customerId: null,
  };
}

function UserRowAvatar({ fileId, nama }: { fileId?: string; nama: string }) {
  const url = useFileUrl(fileId);
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
      {url ? <img src={url} alt={nama} className="h-full w-full object-cover" /> : initials(nama)}
    </div>
  );
}

const ROLE_BADGE_STYLE: Record<UserRole, string> = {
  Superadmin: "bg-rose-100 text-rose-700",
  Admin: "bg-blue-100 text-blue-700",
  Driver: "bg-amber-100 text-amber-700",
  Viewer: "bg-violet-100 text-violet-700",
  "Cust-Admin": "bg-teal-100 text-teal-700",
};

const ROLE_DESCRIPTION: Record<UserRole, string> = {
  Superadmin: "Akses penuh, termasuk mengelola user lain.",
  Admin: "Dapat membuat/mengubah data pengiriman, armada, lokasi, dan pengaturan.",
  Driver: "Hanya dapat membuka Update Tracking untuk melaporkan status/serah terima.",
  Viewer: "Hanya dapat melihat data (read-only), tidak bisa mengubah apa pun.",
  "Cust-Admin":
    "Setara Viewer, ditambah bisa Buat Pengiriman. Hanya melihat data pengiriman dengan Customer ID miliknya sendiri.",
};

function formatLastLogin(iso?: string): string {
  if (!iso) return "-";
  const date = iso.slice(0, 10);
  const time = iso.slice(11, 16);
  return `${formatTanggalPanjang(date)}, ${time} WIB`;
}

export default function UserManagement() {
  const { users, drivers, customerIds, refresh, createUser, updateUser, setUserActive } = useUserManagement();
  const [refreshing, setRefreshing] = useState(false);
  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }
  const { profile } = useAuth();
  // Admin may only add/edit Driver and Viewer accounts - Admin-role
  // accounts (including their own) are Superadmin's to manage.
  const isAdminActor = profile?.role === "Admin";
  const assignableRoles = isAdminActor ? ASSIGNABLE_USER_ROLES.filter((r) => r !== "Admin") : ASSIGNABLE_USER_ROLES;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormData>(emptyForm(assignableRoles[0]));
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm(assignableRoles[0]));
    setPhotoError(null);
    setSubmitError(null);
    setModalOpen(true);
  }

  function openEdit(u: AppUser) {
    setEditingId(u.id);
    const linkedDriver = drivers.find((d) => d.linkedUserId === u.id);
    setForm({
      nama: u.nama,
      email: u.email,
      role: u.role,
      fotoDataUrl: undefined,
      password: "",
      driverId: linkedDriver?.id ?? null,
      customerId: u.customerId ?? null,
    });
    setPhotoError(null);
    setSubmitError(null);
    setModalOpen(true);
  }

  // Drivers selectable for this account: not yet linked to anyone, or
  // already linked to the account being edited (so its current pick stays
  // in the list instead of disappearing).
  const selectableDrivers = drivers.filter((d) => !d.linkedUserId || d.linkedUserId === editingId);

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeError = checkPhotoSize(file);
    if (sizeError) {
      setPhotoError(sizeError);
      return;
    }
    setPhotoError(null);
    compressImage(file, 320, 0.8)
      .then((dataUrl) => setForm((f) => ({ ...f, fotoDataUrl: dataUrl })))
      .catch(() => setPhotoError("Gagal memproses foto. Coba foto lain."));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (form.role === "Cust-Admin" && !form.customerId?.trim()) {
      setSubmitError("Customer ID wajib diisi untuk role Cust-Admin.");
      return;
    }
    const data: UserFormData = {
      nama: form.nama,
      email: form.email,
      role: form.role,
      fotoDataUrl: form.fotoDataUrl,
      driverId: form.role === "Driver" ? form.driverId ?? null : null,
      customerId: form.role === "Cust-Admin" ? form.customerId?.trim() ?? null : null,
      ...(form.password ? { password: form.password } : {}),
    };
    try {
      if (editingId) {
        await updateUser(editingId, data);
      } else {
        await createUser(data);
      }
      setModalOpen(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal menyimpan user.");
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Manajemen User</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola akun internal dan peran akses (GMS-Admin / Driver / Viewer / Cust-Admin).
            {isAdminActor
              ? " Sebagai GMS-Admin, Anda hanya dapat menambah/mengubah akun Driver, Viewer, dan Cust-Admin."
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={handleRefresh} refreshing={refreshing} />
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            <Plus size={16} /> Tambah User
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Login</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const canManage = u.role !== "Superadmin" && !(isAdminActor && u.role === "Admin");
                return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <UserRowAvatar fileId={u.foto} nama={u.nama} />
                      <span className="font-medium text-slate-900">{u.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${ROLE_BADGE_STYLE[u.role]}`}
                    >
                      <Shield size={12} />
                      {roleLabel(u.role)}
                    </span>
                    {u.role === "Cust-Admin" && u.customerId && (
                      <span className="mt-1 block text-[11px] text-slate-400">{u.customerId}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.aktif ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {u.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                    {formatLastLogin(u.lastLogin)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {canManage ? (
                        <>
                          <button
                            onClick={() => openEdit(u)}
                            title="Edit"
                            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setUserActive(u.id, !u.aktif)}
                            title={u.aktif ? "Nonaktifkan" : "Aktifkan"}
                            className={`rounded-md p-1.5 hover:bg-slate-100 ${
                              u.aktif ? "text-slate-500 hover:text-red-600" : "text-slate-500 hover:text-emerald-600"
                            }`}
                          >
                            <Power size={16} />
                          </button>
                        </>
                      ) : (
                        <span
                          className="text-xs text-slate-300"
                          title={
                            u.role === "Superadmin"
                              ? "Akun Superadmin tidak bisa diubah lewat halaman ini"
                              : "Hanya Superadmin yang dapat mengubah akun GMS-Admin lain"
                          }
                        >
                          -
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <form onSubmit={handleSubmit} className="max-h-[90vh] overflow-y-auto p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingId ? "Edit User" : "Tambah User"}
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
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Foto</span>
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                      {form.fotoDataUrl ? (
                        <img src={form.fotoDataUrl} alt="Foto user" className="h-full w-full object-cover" />
                      ) : (
                        initials(form.nama || "?")
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-blue-400 hover:text-blue-700">
                        <Camera size={14} /> Kamera
                        <input
                          type="file"
                          accept="image/*"
                          capture="user"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:border-blue-400 hover:text-blue-700">
                        <Upload size={14} /> Upload Foto
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      </label>
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">Maks {MAX_PHOTO_SIZE_MB}MB</p>
                  {photoError && <p className="mt-1.5 text-xs font-medium text-red-600">{photoError}</p>}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Nama</span>
                  <input
                    required
                    className={inputClass}
                    placeholder="Nama lengkap"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Email</span>
                  <input
                    required
                    type="email"
                    className={inputClass}
                    placeholder="nama@gangsarmitrasuatama.co.id"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    Password {editingId && <span className="text-slate-400">(opsional)</span>}
                  </span>
                  <input
                    required={!editingId}
                    type="password"
                    className={inputClass}
                    placeholder={editingId ? "Kosongkan jika tidak ingin mengubah" : "Buat password awal"}
                    value={form.password ?? ""}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">Role</span>
                  <select
                    className={inputClass}
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  >
                    {assignableRoles.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel(role)}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1.5 block text-[11px] text-slate-400">{ROLE_DESCRIPTION[form.role]}</span>
                </label>

                {form.role === "Driver" && (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                      Data Driver (Truck &amp; Nomor HP)
                    </span>
                    <select
                      className={inputClass}
                      value={form.driverId ?? ""}
                      onChange={(e) => setForm({ ...form, driverId: e.target.value || null })}
                    >
                      <option value="">- Belum ditautkan -</option>
                      {selectableDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nama} - {d.telepon}
                          {d.nomorUnit ? ` (${d.nomorUnit})` : ""}
                        </option>
                      ))}
                    </select>
                    <span className="mt-1.5 block text-[11px] text-slate-400">
                      Menautkan akun ini ke data driver di Master Armada, supaya pengiriman yang
                      ditugaskan ke truck-nya muncul di dashboard Portal Driver. Kalau belum
                      ditautkan, dashboard driver akan kosong.
                    </span>
                  </label>
                )}

                {form.role === "Cust-Admin" && (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">Customer ID</span>
                    <input
                      required
                      list="customer-id-suggestions"
                      className={inputClass}
                      placeholder="Contoh: IDCUST001"
                      value={form.customerId ?? ""}
                      onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                      autoComplete="off"
                    />
                    <datalist id="customer-id-suggestions">
                      {customerIds.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                    <span className="mt-1.5 block text-[11px] text-slate-400">
                      Akun ini hanya akan melihat data pengiriman dengan Customer ID yang sama.
                    </span>
                  </label>
                )}
              </div>

              {submitError && (
                <p className="mt-4 text-sm font-medium text-red-600">{submitError}</p>
              )}

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
