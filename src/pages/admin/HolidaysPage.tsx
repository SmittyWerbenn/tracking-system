import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "../../components/layout/AdminLayout";
import { ApiError, api } from "../../utils/apiClient";
import { refreshHolidays, useHolidays, type Holiday } from "../../utils/holidays";

function fmt(date: string): string {
  const [y, m, d] = date.split("-");
  return `${d}-${m}-${y}`;
}

/** Konfigurasi > Hari Libur: tanggal merah yang dikecualikan (selain Minggu) dari Estimasi Tiba & KPI Percentage. */
export default function HolidaysPage() {
  const { holidays } = useHolidays();
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [year, setYear] = useState<string>("");

  useEffect(() => {
    refreshHolidays().catch((e) => setError(e instanceof ApiError ? e.message : "Gagal memuat hari libur."));
  }, []);

  const years = Array.from(new Set(holidays.map((h) => h.date.slice(0, 4)))).sort();
  const shown = holidays.filter((h) => !year || h.date.startsWith(year));

  async function add(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post<Holiday>("/api/holidays", { date, name: name.trim() });
      setDate("");
      setName("");
      await refreshHolidays();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menambah hari libur.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(h: Holiday) {
    setError(null);
    try {
      await api.patch<Holiday>(`/api/holidays/${h.id}`, { isActive: !h.isActive });
      await refreshHolidays();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengubah hari libur.");
    }
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Hari Libur / Tanggal Merah</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tanggal di sini (dan hari Minggu) tidak dihitung dalam Estimasi Tiba dan KPI Percentage. Perubahan berlaku untuk perhitungan berikutnya;
          Estimasi Tiba yang sudah tersimpan dihitung ulang saat log Di-Pickup atau Target Pengiriman diubah.
        </p>
      </div>

      <form onSubmit={add} className="mt-6 flex max-w-2xl flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm">
          <span className="block text-slate-600">Tanggal</span>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="min-w-[12rem] flex-1 text-sm">
          <span className="block text-slate-600">Nama hari libur</span>
          <input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <button disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {busy ? "Menyimpan..." : "Tambah"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 max-w-2xl">
        <select value={year} onChange={(e) => setYear(e.target.value)} className="mb-3 rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Semua tahun</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
          {shown.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <div className={h.isActive ? "" : "text-slate-400 line-through"}>
                <span className="font-mono">{fmt(h.date)}</span> <span className="ml-2">{h.name}</span>
              </div>
              <button onClick={() => toggle(h)} className="shrink-0 text-xs font-medium text-slate-600 underline">
                {h.isActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </li>
          ))}
          {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-500">Belum ada data.</li>}
        </ul>
      </div>
    </AdminLayout>
  );
}
