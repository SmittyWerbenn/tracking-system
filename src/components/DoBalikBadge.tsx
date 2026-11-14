import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import type { Shipment } from "../types";

type DoBalikInfo = Pick<Shipment, "requiresDoBalik" | "doBalikStatus">;

/** Conspicuous DO Balik flag: orange "DO BALIK" while the original DO is still out, green once it is back. Renders nothing when not required. */
export function DoBalikBadge({ shipment, className = "" }: { shipment: DoBalikInfo; className?: string }) {
  if (!shipment.requiresDoBalik) return null;
  const returned = shipment.doBalikStatus === "returned";
  return (
    <span
      title={returned ? "DO Balik sudah diterima kembali" : "Wajib DO Balik: dokumen Surat Jalan / DO asli harus dikembalikan"}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-sans text-[11px] font-bold uppercase tracking-wide ${
        returned ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300" : "bg-orange-500 text-white ring-1 ring-orange-600"
      } ${className}`}
    >
      {returned ? <CheckCircle2 size={11} /> : <FileText size={11} />}
      {returned ? "DO Balik Selesai" : "DO BALIK"}
    </span>
  );
}

/** Pop-up shown right after a DO Balik shipment is saved as Selesai / Terkirim. */
export function DoBalikAlertModal({ awb, onClose }: { awb: string; onClose: () => void }) {
  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="do-balik-title" className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border-4 border-orange-500 bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            <AlertTriangle size={24} />
          </span>
          <div>
            <h2 id="do-balik-title" className="text-lg font-bold leading-snug text-orange-700">
              ⚠️ PERHATIAN: PENGIRIMAN INI MEMILIKI REQUIREMENT DO BALIK!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Pengiriman untuk Resi <span className="font-mono font-semibold text-slate-900">{awb}</span> telah selesai/terkirim. Pastikan dokumen Surat Jalan / DO Balik asli segera ditarik dan dikembalikan ke kantor/klien.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            autoFocus
            onClick={onClose}
            className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
