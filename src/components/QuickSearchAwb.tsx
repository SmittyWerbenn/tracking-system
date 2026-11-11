import { Loader2, Search } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useShipments } from "../store/ShipmentContext";

interface Props {
  /** Where to go for the AWB that was typed (e.g. its update page or its tracking view). */
  to: (awb: string) => string;
  /** Focus the field on mount, so the admin can type the next AWB straight away. */
  autoFocus?: boolean;
  className?: string;
}

/** "Cari resi lain": jump to another AWB without going back to the list. Enter or the Cari button submits.
 * A pasted tracking/detail URL is reduced to its AWB, and an unknown AWB is reported here instead of opening an empty page. */
export function QuickSearchAwb({ to, autoFocus, className = "" }: Props) {
  const navigate = useNavigate();
  const { getByAwb } = useShipments();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (pending) return;
    // Accept a pasted URL (".../tracking/AWB") as well as a bare AWB.
    const awb = value.trim().split(/[/?#]/).filter(Boolean).pop() ?? "";
    if (!awb) {
      setError("Masukkan nomor resi.");
      return;
    }
    setPending(true);
    setError(null);
    const found = await getByAwb(awb);
    setPending(false);
    if (!found) {
      setError(`Resi "${awb}" tidak ditemukan.`);
      inputRef.current?.select();
      return;
    }
    setValue("");
    navigate(to(found.awb));
  }

  return (
    <form onSubmit={submit} className={className} role="search">
      <div className="flex items-stretch gap-2">
        <div className="relative min-w-0 flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Cari resi lain..."
            aria-label="Cari resi lain"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 font-mono text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : null} Cari
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
