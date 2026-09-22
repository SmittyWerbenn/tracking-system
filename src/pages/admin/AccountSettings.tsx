import { AlertTriangle, ArrowLeft, CheckCircle2, KeyRound, Save, UserCog } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { useAuth } from "../../store/AuthContext";
import { initials } from "../../utils/initials";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

export default function AccountSettings() {
  const navigate = useNavigate();
  const { profile, updateProfile, changePassword } = useAuth();

  const [nama, setNama] = useState(profile.nama);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    updateProfile({ nama: nama.trim() || "Admin" });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);

    if (newPassword.length < 4) {
      setPasswordError("Password baru minimal 4 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }
    const ok = changePassword(currentPassword, newPassword);
    if (!ok) {
      setPasswordError("Password saat ini salah.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  }

  return (
    <AdminLayout>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={15} /> Kembali
      </button>

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Pengaturan Akun</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola profil dan keamanan akun Admin Anda.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile */}
        <form
          onSubmit={handleSaveProfile}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <UserCog size={17} className="text-blue-900" />
            <h2 className="text-sm font-semibold text-slate-800">Profil</h2>
          </div>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-lg font-semibold text-amber-700">
              {initials(nama)}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{profile.nama}</p>
              <p className="text-xs text-slate-400">Role: Admin</p>
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Nama Tampilan</span>
            <input
              required
              className={inputClass}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama Anda"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Username</span>
            <input disabled value="admin" className={`${inputClass} bg-slate-50 text-slate-400`} />
          </label>

          {profileSaved && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={15} />
              Perubahan profil disimpan.
            </div>
          )}

          <button
            type="submit"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
          >
            <Save size={15} />
            Simpan Perubahan
          </button>
        </form>

        {/* Password */}
        <form
          onSubmit={handleChangePassword}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <KeyRound size={17} className="text-blue-900" />
            <h2 className="text-sm font-semibold text-slate-800">Ganti Password</h2>
          </div>

          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Password Saat Ini</span>
              <input
                required
                type="password"
                className={inputClass}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Password Baru</span>
              <input
                required
                type="password"
                className={inputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                Konfirmasi Password Baru
              </span>
              <input
                required
                type="password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
          </div>

          {passwordError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
              <AlertTriangle size={15} />
              {passwordError}
            </div>
          )}
          {passwordSaved && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 size={15} />
              Password berhasil diubah.
            </div>
          )}

          <button
            type="submit"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
          >
            <KeyRound size={15} />
            Ubah Password
          </button>

          <p className="mt-4 rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500">
            Demo prototype - password tersimpan di browser Anda (localStorage), bukan di server.
          </p>
        </form>
      </div>
    </AdminLayout>
  );
}
