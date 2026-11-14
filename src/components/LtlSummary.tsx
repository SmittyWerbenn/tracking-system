import { useLanguage } from "../store/LanguageContext";
import type { Shipment } from "../types";

/** LTL header summary: No. Resi, Origin, Destination, Service plus the handling attributes (Packing Kayu, Insurance, DO Balik)
 * at a glance. These are attributes of the shipment, not steps of its tracking pipeline. */
export function LtlSummary({ shipment, className = "" }: { shipment: Shipment; className?: string }) {
  const en = useLanguage().language === "en";
  const items: { label: string; value: string; mono?: boolean; tone?: "yes" | "no" }[] = [
    { label: en ? "AWB No." : "No. Resi", value: shipment.awb, mono: true },
    { label: "Origin", value: shipment.kotaAsal },
    { label: "Destination", value: shipment.kotaTujuan },
    { label: "Service", value: shipment.layanan },
    { label: "Handling", value: shipment.packingKayu ? (en ? "Wooden Packing" : "Packing Kayu") : en ? "Standard" : "Standar" },
    { label: "Insurance", value: shipment.asuransi ? "YES" : "NO", tone: shipment.asuransi ? "yes" : "no" },
  ];
  // DO Balik is internal: the public tracking API does not send it, so the badge only shows in the portal.
  if (shipment.requiresDoBalik !== undefined) {
    const value = !shipment.requiresDoBalik
      ? en ? "No" : "Tidak"
      : shipment.doBalikStatus === "returned"
        ? en ? "Yes · Returned" : "Ya · Sudah kembali"
        : en ? "Yes · Pending" : "Ya · Belum kembali";
    items.push({ label: "DO Balik", value, tone: shipment.requiresDoBalik ? "yes" : "no" });
  }
  return (
    <dl className={`grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3 ${items.length > 6 ? "lg:grid-cols-7" : "lg:grid-cols-6"} ${className}`}>
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{it.label}</dt>
          <dd
            className={`mt-0.5 truncate text-sm font-semibold ${
              it.tone === "yes" ? "text-emerald-700" : it.tone === "no" ? "text-slate-500" : "text-slate-800"
            } ${it.mono ? "font-mono" : ""}`}
            title={it.value}
          >
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
