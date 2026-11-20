import { Truck } from "lucide-react";

/** Quick keterangan presets for "Proses Dooring". Stored text stays Indonesian (English wording lives in trackingI18n.ts). */
export const DOORING_PRESETS = [
  "Pengantaran (dooring) ke alamat penerima telah dijadwalkan",
  "Pengantaran (dooring) Terjadwal",
];

/** Chips shown above Keterangan while the status is "Proses Dooring". Picking one swaps the text; the textarea stays editable. */
export function DooringPresetChips({ onPick }: { onPick: (keterangan: string) => void }) {
  return (
    <div className="mb-2">
      <p className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-600">
        <Truck size={16} /> Template keterangan dooring
      </p>
      <div className="flex flex-wrap gap-2">
        {DOORING_PRESETS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onPick(t)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm font-medium leading-snug text-slate-700 hover:border-blue-400 hover:text-blue-700"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
