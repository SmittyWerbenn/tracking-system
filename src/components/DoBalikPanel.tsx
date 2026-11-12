import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useShipments } from "../store/ShipmentContext";
import type { Shipment } from "../types";

/** Persistent DO Balik banner for the AWB detail page: orange while the original DO is outstanding, green once confirmed. */
export function DoBalikPanel({ shipment, canConfirm, onDone }: { shipment: Shipment; canConfirm: boolean; onDone: () => unknown }) {
  const { confirmDoBalik } = useShipments();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!shipment.requiresDoBalik) return null;

  if (shipment.doBalikStatus === "returned") {
    const at = shipment.doBalikReturnedAt ? new Date(shipment.doBalikReturnedAt) : null;
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
        <CheckCircle2 size={18} className="shrink-0" />
        DO Balik Selesai: dokumen Surat Jalan / DO asli sudah diterima kembali
        {at && !Number.isNaN(at.getTime()) ? ` (${at.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })})` : ""}.
      </div>
    );
  }

  const delivered = shipment.status === "Selesai / Terkirim";
  async function confirm() {
    setPending(true);
    setError(null);
    const res = await confirmDoBalik(shipment.awb);
    setPending(false);
    if (!res.ok) setError(res.error);
    else await onDone();
  }

  return (
    <div role="alert" className="mt-4 rounded-xl border-2 border-orange-400 bg-orange-50 px-4 py-3 no-print">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-start gap-2 text-sm font-semibold text-orange-800">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <span>
            {delivered
              ? "PENGIRIMAN INI MEMILIKI REQUIREMENT DO BALIK: pastikan dokumen Surat Jalan / DO asli segera ditarik dan dikembalikan ke kantor/klien."
              : "WAJIB DO BALIK: setelah barang diterima, dokumen Surat Jalan / DO asli harus dikembalikan."}
          </span>
        </p>
        {canConfirm && delivered && (
          <button
            onClick={confirm}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {pending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Konfirmasi DO Balik Diterima
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
