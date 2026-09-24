import { CheckCircle2, Mail, Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { useSettings } from "../../store/SettingsContext";

export default function SettingsPage() {
  const { settings, setStagnantThresholdDays, setEmailSendingEnabled } = useSettings();
  const [days, setDays] = useState(settings.stagnantThresholdDays);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDays(settings.stagnantThresholdDays);
  }, [settings.stagnantThresholdDays]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStagnantThresholdDays(Math.max(1, days));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Pengaturan</h1>
        <p className="mt-1 text-sm text-slate-500">Konfigurasi sistem tracking.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <SettingsIcon size={17} className="text-blue-900" />
          <h2 className="text-sm font-semibold text-slate-800">Tracking</h2>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-600">
            AWB dianggap macet setelah (hari)
          </span>
          <input
            type="number"
            min={1}
            required
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <p className="mt-2 text-xs text-slate-400">
          AWB yang tidak mengalami perubahan status selama lebih dari jumlah hari ini akan muncul
          pada daftar "AWB Memerlukan Perhatian" di Dashboard.
        </p>

        {saved && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={15} />
            Pengaturan disimpan.
          </div>
        )}

        <button
          type="submit"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          Simpan Pengaturan
        </button>
      </form>

      <div className="mt-6 max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Mail size={17} className="text-blue-900" />
          <h2 className="text-sm font-semibold text-slate-800">Pengiriman Email</h2>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-800">Kirim email notifikasi ke customer</p>
            <p className="mt-1 text-xs text-slate-400">
              Matikan sementara untuk menghemat kuota SMTP. Saat nonaktif, tombol kirim email
              (resi baru, kendala, selesai) tidak akan mengirim email sungguhan.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.emailSendingEnabled}
            onClick={() => setEmailSendingEnabled(!settings.emailSendingEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              settings.emailSendingEnabled ? "bg-blue-900" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailSendingEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div
          className={`mt-4 flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium ${
            settings.emailSendingEnabled ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          <CheckCircle2 size={15} />
          {settings.emailSendingEnabled ? "Pengiriman email aktif." : "Pengiriman email dinonaktifkan."}
        </div>
      </div>
    </AdminLayout>
  );
}
