import { AlertTriangle, Building2, MapPin } from "lucide-react";

export interface ClientOption {
  customerId: string;
  nama: string | null;
  kota?: string | null;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

/** Live confirmation of which client a Client ID belongs to, so a wrong code is caught before the order is created.
 * One compact row exactly as tall as the Client ID input (h-[38px]) so the two line up edge to edge. */
export function ClientPreview({ value, clients, className = "" }: { value: string; clients: ClientOption[]; className?: string }) {
  const code = value.trim();
  const match = code ? clients.find((c) => c.customerId.toLowerCase() === code.toLowerCase()) : undefined;
  const box = `flex h-[38px] w-full items-center gap-2 rounded-lg border px-3 text-sm ${className}`;

  if (!code) {
    return (
      <div className={`${box} border-dashed border-slate-200 text-xs text-slate-400`}>
        <Building2 size={14} className="shrink-0" />
        <span className="truncate">Pilih Client ID untuk melihat nama perusahaan</span>
      </div>
    );
  }
  // Clients not loaded yet (or none available to this account): nothing reliable to say, so don't warn.
  if (clients.length === 0) return <div className={`${box} border-transparent`} aria-hidden />;
  if (!match) {
    return (
      <div role="alert" className={`${box} border-red-200 bg-red-50 text-xs font-medium text-red-700`}>
        <AlertTriangle size={14} className="shrink-0" />
        <span className="truncate">Client ID tidak ditemukan di master data.</span>
      </div>
    );
  }
  const nama = match.nama?.trim() || "(Nama belum diisi di master Client)";
  return (
    <div className={`${box} border-emerald-200 bg-emerald-50/70 text-emerald-900`} title={match.kota?.trim() ? `${nama} • ${match.kota}` : nama}>
      <Building2 size={16} className="shrink-0 text-emerald-600" />
      <span className="min-w-0 flex-1 truncate font-bold text-slate-900">{nama}</span>
      {match.kota?.trim() && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
          <MapPin size={10} /> {match.kota}
        </span>
      )}
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
        className={`${inputClass} h-[38px] ${disabled ? "bg-slate-50 text-slate-500" : ""}`}
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
