import { SearchableSelect } from "./SearchableSelect";
import type { ArmadaType } from "../types";

export interface ArmadaValue {
  armadaType: ArmadaType;
  truckId: string;
  vehiclePlate: string;
  driverName: string;
}

export interface ArmadaTruckOption {
  id: string;
  nomorUnit: string;
  jenis: string;
  driver?: { nama: string; telepon?: string } | null;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

/** Armada picker shared by Buat Pengiriman and Edit Pengiriman.
 * Internal: Master Armada unit (plate from the list; its registered driver comes with it; empty = Pesanan Terbuka).
 * Vendor (stored as armada_type "sewa"): free-text plate + optional driver note; no registered driver, never in
 * Pesanan Terbuka. The plate (Nopol) may be left empty and filled in later, for Internal and Vendor alike. */
export function ArmadaFields({
  value,
  onChange,
  trucks,
  allowSewa = true,
  internalHint,
}: {
  value: ArmadaValue;
  onChange: (next: ArmadaValue) => void;
  trucks: ArmadaTruckOption[];
  allowSewa?: boolean;
  internalHint?: string;
}) {
  const set = (patch: Partial<ArmadaValue>) => onChange({ ...value, ...patch });
  const selected = trucks.find((t) => t.id === value.truckId);
  const options = trucks.map((t) => ({
    value: t.id,
    label: `${t.nomorUnit} - ${t.jenis}`,
    description: t.driver ? `Driver: ${t.driver.nama}` : undefined,
  }));
  const isSewa = value.armadaType === "sewa";

  return (
    <>
      {allowSewa && (
        <div className="sm:col-span-2" role="radiogroup" aria-label="Tipe Armada">
          <span className="mb-1.5 block text-xs font-medium text-slate-600">Tipe Armada</span>
          <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 text-sm font-semibold">
            {([["internal", "Internal"], ["sewa", "Vendor"]] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={value.armadaType === k}
                // Switching type drops the other type's input so nothing stale is submitted.
                onClick={() => (value.armadaType === k ? undefined : onChange({ armadaType: k, truckId: "", vehiclePlate: "", driverName: "" }))}
                className={`rounded-md px-4 py-1.5 transition-colors ${value.armadaType === k ? "bg-blue-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {isSewa ? (
        <>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Plat Nomor (Vendor)</span>
            <input
              maxLength={20}
              className={`${inputClass} uppercase`}
              placeholder="mis. B 9123 XYZ (boleh diisi belakangan)"
              value={value.vehiclePlate}
              onChange={(e) => set({ vehiclePlate: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Nama Driver (opsional)</span>
            <input
              maxLength={100}
              className={inputClass}
              placeholder="Catatan nama driver vendor"
              value={value.driverName}
              onChange={(e) => set({ driverName: e.target.value })}
            />
          </label>
          <p className="sm:col-span-2 text-[11px] text-slate-400">
            Armada Vendor tidak perlu didaftarkan di Master Armada/Driver, dan pengiriman ini tidak akan muncul di
            "Pesanan Terbuka" portal driver internal.
          </p>
        </>
      ) : (
        <>
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">Plat Nomor / Unit Truck</span>
            <SearchableSelect
              options={options}
              value={value.truckId}
              onChange={(v) => set({ truckId: v })}
              placeholder="Pilih Unit Truck (boleh diisi belakangan)"
              emptyLabel="Tidak ada unit truck yang tersedia."
            />
            {internalHint && <p className="mt-1.5 text-[11px] text-slate-400">{internalHint}</p>}
          </div>
          {selected && (
            <div className="sm:col-span-2 flex flex-wrap items-center gap-4 rounded-lg bg-slate-50 px-3.5 py-3 text-sm">
              <span className="font-medium text-slate-700">{selected.nomorUnit}</span>
              <span className="text-slate-500">{selected.jenis}</span>
              <span className="text-slate-500">Driver: {selected.driver?.nama ?? "-"}</span>
              {selected.driver?.telepon && <span className="text-xs text-slate-400">{selected.driver.telepon}</span>}
            </div>
          )}
        </>
      )}
    </>
  );
}
