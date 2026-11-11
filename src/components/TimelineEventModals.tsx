import { AlertTriangle, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { TimelineEvent, TimelineEventType } from "../types";
import { TIMELINE_EVENT_OPTIONS } from "../utils/status";
import { LocationTextInput } from "./LocationTextInput";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

/** Statuses an existing log may be switched to (Selesai needs a POD, Transfer Unit a truck, Barang Diterima is the initial log). */
const EDITABLE_TYPES = TIMELINE_EVENT_OPTIONS.filter(
  (t) => t !== "Barang Diterima" && t !== "Selesai / Terkirim" && t !== "Transfer Unit",
);

interface EditProps {
  event: TimelineEvent;
  onSave: (data: { type: TimelineEventType; lokasi: string; tanggal: string; jam: string; keterangan: string }) => Promise<string | null>;
  onClose: () => void;
}

export function EditTimelineEventModal({ event, onSave, onClose }: EditProps) {
  const [type, setType] = useState<TimelineEventType>(event.type);
  const [lokasi, setLokasi] = useState(event.lokasi);
  const [tanggal, setTanggal] = useState(event.tanggal);
  const [jam, setJam] = useState(event.jam);
  const [keterangan, setKeterangan] = useState(event.keterangan);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const typeLocked = event.type === "Transfer Unit";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (!lokasi.trim()) {
      setError("Lokasi wajib diisi.");
      return;
    }
    setPending(true);
    setError(null);
    const err = await onSave({ type, lokasi: lokasi.trim(), tanggal, jam, keterangan: keterangan.trim() });
    if (err) {
      setError(err);
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-900">Edit Log Tracking</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Status</span>
            <select className={inputClass} value={type} disabled={typeLocked} onChange={(e) => setType(e.target.value as TimelineEventType)}>
              {(typeLocked ? [event.type] : EDITABLE_TYPES).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {typeLocked && <span className="mt-1.5 block text-[11px] text-slate-400">Status Transfer Unit tidak dapat diganti.</span>}
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Kota / Lokasi</span>
            <LocationTextInput id="edit-timeline-lokasi" required className={inputClass} value={lokasi} onChange={setLokasi} kind="area" placeholder="Nama area / kota" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Tanggal</span>
            <input required type="date" className={inputClass} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Jam</span>
            <input required type="time" className={inputClass} value={jam} onChange={(e) => setJam(e.target.value)} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Keterangan (opsional)</span>
            <textarea rows={3} maxLength={500} className={inputClass} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          </label>
        </div>
        {error && (
          <p className="mt-3 flex items-start gap-1.5 text-sm font-medium text-red-600">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" onClick={onClose} disabled={pending} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60">
            Batal
          </button>
          <button type="submit" disabled={pending} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            {pending && <Loader2 size={14} className="animate-spin" />} Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}

interface DeleteProps {
  event: TimelineEvent;
  onConfirm: () => Promise<string | null>;
  onClose: () => void;
}

export function DeleteTimelineEventModal({ event, onConfirm, onClose }: DeleteProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (pending) return;
    setPending(true);
    setError(null);
    const err = await onConfirm();
    if (err) {
      setError(err);
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-slate-900">Hapus Log Tracking</h2>
        <p className="mt-3 text-sm text-slate-600">Apakah Anda yakin ingin menghapus update status ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
          <p className="font-semibold text-slate-800">{event.type}</p>
          <p className="text-slate-500">
            {event.lokasi} · {event.tanggal} {event.jam}
          </p>
          {event.keterangan && <p className="mt-0.5 text-slate-500">{event.keterangan}</p>}
        </div>
        <p className="mt-3 text-xs text-slate-400">Status pengiriman akan menyesuaikan ke log sebelumnya.</p>
        {error && (
          <p className="mt-3 flex items-start gap-1.5 text-sm font-medium text-red-600">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2.5">
          <button type="button" onClick={onClose} disabled={pending} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60">
            Batal
          </button>
          <button type="button" onClick={confirm} disabled={pending} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
            {pending && <Loader2 size={14} className="animate-spin" />} Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
