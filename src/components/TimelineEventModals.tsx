import { AlertTriangle, Loader2, X } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Shipment, TimelineEvent, TimelineEventType } from "../types";
import { getLtlStage } from "../utils/ltlPipeline";
import { TIMELINE_EVENT_OPTIONS } from "../utils/status";
import { TransitPresetChips } from "./TransitPresetChips";
import { DooringPresetChips } from "./DooringPresetChips";
import { lokasiIsSuggestion } from "../utils/transitPresets";
import { LocationTextInput } from "./LocationTextInput";
import { PhotoPickerBox } from "./PhotoPickerBox";
import { checkPhotoSize, compressImage } from "../utils/compressImage";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

/** Statuses an existing log may be switched to (Selesai needs a POD, Transfer Unit a truck, Barang Diterima is the initial log). */
const EDITABLE_TYPES = TIMELINE_EVENT_OPTIONS.filter(
  (t) => t !== "Barang Diterima" && t !== "Selesai / Terkirim" && t !== "Transfer Unit",
);

interface EditProps {
  event: TimelineEvent;
  onSave: (data: { type: TimelineEventType; lokasi: string; tanggal: string; jam: string; keterangan: string; namaPenerima?: string; addPhotos?: string[]; removePhotoIds?: string[] }) => Promise<string | null>;
  /** Show the photo section (Superadmin + Admin): add/replace/delete the log's photos. */
  allowPhotos?: boolean;
  /** Current recipient name from the POD card (shown for the Terkirim log only). */
  namaPenerima?: string;
  /** Route + ETA of the shipment, for the "Dalam Perjalanan" templates. */
  route?: Pick<Shipment, "kotaAsal" | "kotaTujuan" | "estimasiTiba">;
  onClose: () => void;
}

export function EditTimelineEventModal({ event, onSave, namaPenerima: initialPenerima, route, allowPhotos, onClose }: EditProps) {
  const isHandover = event.type === "Selesai / Terkirim" && event.ltlStage !== "POD_RETURNED";
  const [penerima, setPenerima] = useState(initialPenerima ?? "");
  const [type, setType] = useState<TimelineEventType>(event.type);
  const [lokasi, setLokasi] = useState(event.lokasi);
  const [tanggal, setTanggal] = useState(event.tanggal);
  const [jam, setJam] = useState(event.jam);
  const [keterangan, setKeterangan] = useState(event.keterangan);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [removedIdx, setRemovedIdx] = useState<number[]>([]);
  const existingPhotos = (event.foto ?? []).map((url, i) => ({ url, id: event.fotoIds?.[i], i }));

  async function pickPhotos(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const f of files) {
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) {
        setError("Format foto harus JPG, JPEG, PNG, atau WEBP.");
        continue;
      }
      const sizeErr = checkPhotoSize(f);
      if (sizeErr) {
        setError(sizeErr);
        continue;
      }
      try {
        const dataUrl = await compressImage(f);
        setNewPhotos((p) => [...p, dataUrl]);
        setError(null);
      } catch {
        setError("Gagal memproses foto.");
      }
    }
  }
  // Transfer Unit moved the truck; an LTL stage log keeps its stage (delete + re-log to change it).
  const typeLocked = event.type === "Transfer Unit" || event.type === "Selesai / Terkirim" || !!event.ltlStage;
  const ltlLabel = getLtlStage(event.ltlStage)?.label;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (!lokasi.trim()) {
      setError("Lokasi wajib diisi.");
      return;
    }
    setPending(true);
    setError(null);
    const err = await onSave({ type, lokasi: lokasi.trim(), tanggal, jam, keterangan: keterangan.trim(),
      ...(isHandover ? { namaPenerima: penerima.trim() } : {}),
      ...(allowPhotos
        ? {
            addPhotos: newPhotos,
            removePhotoIds: removedIdx.map((i) => existingPhotos[i]?.id).filter((x): x is string => !!x),
          }
        : {}),
    });
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
                  {typeLocked && ltlLabel ? ltlLabel : t}
                </option>
              ))}
            </select>
            {typeLocked && <span className="mt-1.5 block text-[11px] text-slate-400">Status log ini tidak dapat diganti (hapus lalu catat ulang bila salah).</span>}
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
          {isHandover && (
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Nama Penerima</span>
              <input type="text" maxLength={150} className={inputClass} value={penerima} onChange={(e) => setPenerima(e.target.value)} />
            </label>
          )}
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Keterangan (opsional)</span>
            {event.ltlStage === "DOORING_SCHEDULED" && <DooringPresetChips onPick={setKeterangan} />}
            {type === "Dalam Perjalanan" && route && (
              <TransitPresetChips shipment={route} onPick={(k, l) => { setKeterangan(k); if (lokasiIsSuggestion(lokasi, route)) setLokasi(l); }} />
            )}
            <textarea rows={3} maxLength={500} className={inputClass} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          </label>
          {allowPhotos && (
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">Foto (Surat Jalan / POD / bukti)</span>
              <div className="flex flex-wrap items-start gap-2.5">
                {existingPhotos.map((p) =>
                  removedIdx.includes(p.i) ? null : (
                    <div key={p.url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
                      <img src={p.url} alt="Foto log" className="h-full w-full object-cover" />
                      {p.id && (
                        <button type="button" aria-label="Hapus foto" onClick={() => setRemovedIdx((r) => [...r, p.i])} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-red-600">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ),
                )}
                {newPhotos.map((url, i) => (
                  <div key={i} className="relative h-24 w-24 overflow-hidden rounded-lg border border-blue-300">
                    <img src={url} alt="Foto baru" className="h-full w-full object-cover" />
                    <button type="button" aria-label="Batalkan foto" onClick={() => setNewPhotos((p) => p.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-red-600">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <PhotoPickerBox size="sm" multiple onChange={pickPhotos} />
              </div>
              <span className="mt-1.5 block text-[11px] text-slate-400">JPG, JPEG, PNG, WEBP. Foto dikompres otomatis.</span>
            </div>
          )}
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
