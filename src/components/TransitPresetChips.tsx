import { Ship } from "lucide-react";
import type { Shipment } from "../types";
import { isInterIslandDestination, renderTransitPreset, TRANSIT_PRESETS } from "../utils/transitPresets";

interface Props {
  shipment: Pick<Shipment, "kotaAsal" | "kotaTujuan" | "estimasiTiba">;
  /** Called with the rendered text; `lokasi` is a suggestion the parent applies only while Lokasi is still empty. */
  onPick: (keterangan: string, lokasi: string) => void;
}

/** Template chips shown above Keterangan while the status is "Dalam Perjalanan". Picking one fills the text; it stays editable. */
export function TransitPresetChips({ shipment, onPick }: Props) {
  const interIsland = isInterIslandDestination(shipment.kotaTujuan);
  return (
    <div className="mb-2">
      <p className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-slate-600">
        <Ship size={16} /> Template keterangan perjalanan{interIsland ? " (rute antar-pulau)" : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        {TRANSIT_PRESETS.map((p) => {
          const r = renderTransitPreset(p, shipment);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onPick(r.keterangan, r.lokasi)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-left text-sm font-medium leading-snug text-slate-700 hover:border-blue-400 hover:text-blue-700"
            >
              {r.keterangan}
            </button>
          );
        })}
      </div>
    </div>
  );
}
