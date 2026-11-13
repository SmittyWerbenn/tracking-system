import { AlertTriangle, Building2, MapPin } from "lucide-react";

export interface ClientOption {
  customerId: string;
  nama: string | null;
  kota?: string | null;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

/** Live confirmation of which client a Client ID belongs to, so a wrong code is caught before the order is created. */
export function ClientPreview({ value, clients, className = "" }: { value: string; clients: ClientOption[]; className?: string }) {
  const code = value.trim();
  const match = code ? clients.find((c) => c.customerId.toLowerCase() === code.toLowerCase()) : undefined;

  if (!code) {
    return (
      <div className={`flex items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400 ${className}`}>
        <Building2 size={14} className="shrink-0" /> Pilih Client ID untuk melihat nama perusahaan
      </div>
    );
  }
  // Clients not loaded yet (or none available to this account): nothing reliable to say, so don't warn.
  if (clients.length === 0) return null;
  if (!match) {
    return (
      <div role="alert" className={`flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 ${className}`}>
        <AlertTriangle size={14} className="mt-0.5 shrink-0" /> Client ID tidak ditemukan di master data.
      </div>
    );
  }
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 ${className}`}>
      <Building2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Nama Client Terpilih</p>
        <p className="break-words text-sm font-bold text-slate-900">{match.nama?.trim() || "(Nama belum diisi di master Client)"}</p>
        {match.kota?.trim() && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={11} className="shrink-0" /> {match.kota}
          </p>
        )}
      </div>
    </div>
  );
}

/** Client ID input with "ID - Nama" suggestions (datalist). The preview card is rendered separately so each form can lay it out. */
export function ClientIdInput({
  id,
  value,
  onChange,
  clients,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  clients: ClientOption[];
  disabled?: boolean;
}) {
  return (
    <>
      <input
        required
        disabled={disabled}
        list={id}
        className={`${inputClass} ${disabled ? "bg-slate-50 text-slate-500" : ""}`}
        placeholder="Contoh: IDTMDI001"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
      <datalist id={id}>
        {clients.map((c) => (
          <option key={c.customerId} value={c.customerId} label={c.nama ? `${c.customerId} - ${c.nama}` : c.customerId} />
        ))}
      </datalist>
    </>
  );
}
