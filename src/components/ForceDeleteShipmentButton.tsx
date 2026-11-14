import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../store/AuthContext";
import type { Shipment } from "../types";
import { api, ApiError } from "../utils/apiClient";

/** Superadmin-only "Hapus Permanen" for a shipment that is not closed yet (anything but Selesai / Terkirim).
 * The confirm button stays disabled until the AWB is typed exactly; the API re-checks role, status and the typed AWB. */
export function ForceDeleteShipmentButton({ shipment, onDeleted }: { shipment: Pick<Shipment, "awb" | "status">; onDeleted: () => void }) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (profile?.role !== "Superadmin" || shipment.status === "Selesai / Terkirim") return null;

  const matches = typed.trim().toUpperCase() === shipment.awb.toUpperCase();

  async function confirm() {
    if (!matches) return;
    setPending(true);
    setError(null);
    try {
      await api.del(`/api/shipments/${encodeURIComponent(shipment.awb)}/force-delete?confirm=${encodeURIComponent(typed.trim())}`);
      setOpen(false);
      onDeleted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus permanen.");
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setTyped("");
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        <Trash2 size={15} /> Hapus Permanen
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border-t-4 border-red-600 bg-white p-6 shadow-2xl">
            <h2 className="flex items-start gap-2 text-lg font-semibold text-red-700">
              <AlertTriangle size={20} className="mt-0.5 shrink-0" />
              Hapus Permanen Order {shipment.awb}?
            </h2>
            <p className="mt-3 rounded-lg bg-red-50 px-3.5 py-3 text-sm text-red-800">
              Tindakan ini akan menghapus data pengiriman, riwayat tracking, dan foto bukti secara permanen dari database dan{" "}
              <span className="font-bold">TIDAK DAPAT DIPULIHKAN</span> kembali.
            </p>
            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                Ketik nomor resi <span className="font-mono font-semibold text-slate-900">{shipment.awb}</span> untuk konfirmasi
              </span>
              <input
                autoFocus
                autoComplete="off"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm uppercase focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={shipment.awb}
              />
            </label>
            {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!matches || pending}
                onClick={confirm}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
