import { AlertTriangle, Clock, Loader2, Send, Zap } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAuth } from "../store/AuthContext";
import { useShipments } from "../store/ShipmentContext";
import type { Shipment } from "../types";
import { nowHHMM, todayISO } from "../utils/format";
import { choiceDefaults, getTrackingChoices, isHandoverChoice, type TrackingChoice } from "../utils/trackingChoices";
import { LocationTextInput } from "./LocationTextInput";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

/** Statuses the quick form can log: no Transfer Unit (it needs a truck), and Re-route / Penarikan stay admin-only like in the API. */
function quickOptions(shipment: Shipment, role: string | undefined): TrackingChoice[] {
  // LTL: the 9 pipeline statuses, from the current one onward. POD Kembali is an admin step, like Re-route / Penarikan.
  return getTrackingChoices(shipment, (c) => {
    if (c.type === "Transfer Unit") return false;
    if (role === "Mitra" && (c.type === "Re-route" || c.type === "Penarikan" || c.ltlStage === "POD_RETURNED")) return false;
    return true;
  });
}

interface Props {
  shipment: Shipment;
  /** Called after the update is saved: reload the shipment, toast, and move focus to "Cari resi lain". */
  onSaved: () => Promise<void>;
}

/** "Quick Update Pengiriman": a compact status / location / note form for the Tracking page (no photos or documents).
 * The parent keys it by the shipment's progress, so after a save it comes back clean with the next valid status. */
export function QuickUpdatePanel({ shipment, onSaved }: Props) {
  const { profile } = useAuth();
  const { addTrackingUpdate } = useShipments();
  const options = quickOptions(shipment, profile?.role);
  const first: TrackingChoice = options[0] ?? { value: "Transit", label: "Transit", type: "Transit" };

  const [choiceValue, setChoiceValue] = useState(first.value);
  const choice = options.find((o) => o.value === choiceValue) ?? first;
  const type = choice.type;
  const [lokasi, setLokasi] = useState(() => choiceDefaults(first, shipment, shipment.penerima.nama).lokasi);
  const [keterangan, setKeterangan] = useState(() => choiceDefaults(first, shipment, shipment.penerima.nama).keterangan);
  const [namaPenerima, setNamaPenerima] = useState(shipment.penerima.nama);
  // "Keterangan Internal" is private to GMS ops (Superadmin/Admin); other roles never see the field.
  const canWriteInternal = profile?.role === "Superadmin" || profile?.role === "Admin";
  // One internal note per AWB: prefilled with the current one, saved back to the shipment only when changed.
  const [internalNotes, setInternalNotes] = useState(shipment.internalNotes ?? "");
  const [tanggal, setTanggal] = useState(todayISO());
  const [jam, setJam] = useState(nowHHMM());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelesai = isHandoverChoice(choice);

  function changeType(next: TrackingChoice) {
    setChoiceValue(next.value);
    // Same auto-fill as the full form (LTL: stage description with {origin}/{destination}); both stay editable.
    const d = choiceDefaults(next, shipment, namaPenerima || shipment.penerima.nama);
    setLokasi(d.lokasi);
    setKeterangan(d.keterangan);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (!isSelesai && !lokasi.trim()) {
      setError("Isi lokasi saat ini terlebih dahulu.");
      return;
    }
    if (isSelesai && !namaPenerima.trim()) {
      setError("Isi nama penerima barang terlebih dahulu.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await addTrackingUpdate({
      awb: shipment.awb,
      type,
      ltlStage: choice.ltlStage,
      lokasi: isSelesai ? shipment.kotaTujuan : lokasi.trim(),
      tanggal,
      jam,
      keterangan: keterangan.trim(),
      internalNotes: canWriteInternal && internalNotes.trim() !== (shipment.internalNotes ?? "").trim() ? internalNotes.trim() : undefined,
      namaPenerima: isSelesai ? namaPenerima.trim() : undefined,
    });
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }
    await onSaved();
    // The parent remounts this panel (new key) with a clean form; nothing more to reset here.
  }

  return (
    <form onSubmit={submit} className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Zap size={16} className="text-blue-900" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Quick Update Pengiriman</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-600">Status / Tahapan</span>
          <select
            className={inputClass}
            value={choice.value}
            onChange={(e) => {
              const next = options.find((o) => o.value === e.target.value);
              if (next) changeType(next);
            }}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {isSelesai ? (
          <div className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Lokasi Saat Ini</span>
            <div className={`${inputClass} bg-slate-50 text-slate-600`}>{shipment.kotaTujuan}</div>
          </div>
        ) : (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Lokasi Saat Ini</span>
            <LocationTextInput
              id="quick-update-lokasi"
              required
              className={inputClass}
              value={lokasi}
              onChange={setLokasi}
              kind="area"
              placeholder="Contoh: Jakarta / Gudang Duren Sawit"
            />
          </label>
        )}

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-slate-600">Keterangan / Catatan (opsional)</span>
          <textarea
            rows={2}
            maxLength={500}
            className={inputClass}
            placeholder="Deskripsi update perjalanan"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
          />
        </label>

        {canWriteInternal && (
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Keterangan Internal (Khusus Internal GMS)</span>
            <input
              maxLength={500}
              className={inputClass}
              placeholder="Contoh: Resi Vendor JNE-09123812 / Subkon PT Maju"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              autoComplete="off"
            />
            <span className="mt-1.5 block text-[11px] text-slate-400">
              Catatan internal untuk AWB ini (satu catatan per AWB, tidak muncul di halaman tracking publik customer).
            </span>
          </label>
        )}

        {isSelesai && (
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Nama Penerima (Diterima oleh)</span>
            <input
              required
              className={inputClass}
              value={namaPenerima}
              onChange={(e) => setNamaPenerima(e.target.value)}
              placeholder="Nama orang yang menerima barang"
            />
          </label>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1 basis-64">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Clock size={13} className="text-slate-400" /> Waktu Update (WIB)
          </p>
          {/* Always visible: defaults to now, but can be backdated; the timeline orders by this date/time. */}
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="sr-only">Tanggal Update</span>
              <input required type="date" aria-label="Tanggal Update" className={inputClass} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </label>
            <label className="block">
              <span className="sr-only">Jam Update</span>
              <input required type="time" aria-label="Jam Update" className={inputClass} value={jam} onChange={(e) => setJam(e.target.value)} />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Simpan Update
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-1.5 text-sm font-medium text-red-600">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}
    </form>
  );
}
