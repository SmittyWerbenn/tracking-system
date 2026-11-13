import { ArrowRight, CheckCircle2, MapPin, Pencil, Trash2, Truck } from "lucide-react";
import { useState } from "react";
import { actionClass } from "./ActionButton";
import { useLanguage } from "../store/LanguageContext";
import type { TimelineEvent } from "../types";
import { getLtlStage } from "../utils/ltlPipeline";
import { newestFirst } from "../utils/timelineOrder";
import { formatJam, formatTanggalPanjang } from "../utils/format";
import { ImageLightbox, PhotoThumb } from "./ImageLightbox";

interface TrackingTimelineProps {
  events: TimelineEvent[];
  /** Admin portal only: shows an edit / delete button on logs that may be corrected. */
  onEdit?: (event: TimelineEvent) => void;
  onDelete?: (event: TimelineEvent) => void;
}

/** System milestones (initial "Order Dibuat", delivery, cancellation) are never editable or deletable. */
const PROTECTED_EVENT_TYPES = new Set(["Barang Diterima", "Selesai / Terkirim", "Dibatalkan"]);

export function TrackingTimeline({ events, onEdit, onDelete }: TrackingTimelineProps) {
  const { t } = useLanguage();
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);
  // Newest date/time on the top row, oldest at the bottom - for every layanan, LTL included.
  // Row 0 is the one and only "TERBARU" log (the same log the shipment's status follows).
  const ordered = newestFirst(events);

  return (
    <div className="relative">
      <ImageLightbox
        src={lightbox?.src ?? null}
        caption={lightbox?.caption}
        onClose={() => setLightbox(null)}
      />
      <ol className="relative">
        {ordered.map((event, idx) => {
          const isLatest = idx === 0;
          // LTL logs show their pipeline status (e.g. "Tiba di Gudang Asal") instead of the coarse status; logs from the
          // old 25-stage pipeline resolve to the status that replaced them.
          const label = getLtlStage(event.ltlStage)?.label ?? event.type;
          const isDelivered = event.type === "Selesai / Terkirim";
          const manageable = !PROTECTED_EVENT_TYPES.has(event.type);
          // A Transfer Unit log already moved the shipment to another truck, so it can be corrected but not removed.
          const canDelete = manageable && event.type !== "Transfer Unit";
          // Admin view (edit/delete available): each row highlights on hover so it's clear which log an action targets.
          const interactive = !!(onEdit || onDelete);
          return (
            <li
              key={event.id}
              className={
                interactive
                  ? "group relative -mx-3 flex gap-3.5 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-sky-200 hover:bg-sky-50/70"
                  : "relative flex gap-3.5 pb-6 last:pb-0"
              }
            >
              {/* connector line */}
              {idx !== ordered.length - 1 && (
                <span
                  className={`absolute w-px bg-blue-100 ${
                    interactive ? "left-[19px] top-8 h-[calc(100%-1.5rem)]" : "left-[7px] top-5 h-[calc(100%-0.75rem)]"
                  }`}
                />
              )}
              <div className="relative flex flex-col items-center pt-1.5">
                <span
                  className={`z-10 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-slate-50 group-hover:ring-sky-50 ${
                    isLatest ? "bg-blue-900" : "border-2 border-blue-300 bg-white"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium text-slate-500">
                    {formatTanggalPanjang(event.tanggal)} · {formatJam(event.jam)}
                  </p>
                  {isLatest && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                      {t.timeline.latest}
                    </span>
                  )}
                  {manageable && (onEdit || onDelete) && (
                    <span className="ml-auto flex items-center gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(event)}
                          title="Edit log tracking"
                          aria-label="Edit log tracking"
                          className={actionClass("edit")}
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {onDelete && canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(event)}
                          title="Hapus log tracking"
                          aria-label="Hapus log tracking"
                          className={actionClass("danger")}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </span>
                  )}
                </div>

                <p
                  className={`mt-1 flex items-center gap-1.5 text-sm font-semibold ${
                    isDelivered ? "text-emerald-600" : isLatest ? "text-blue-900" : "text-slate-900"
                  }`}
                >
                  {label}
                  {isDelivered && <CheckCircle2 size={15} className="shrink-0" />}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin size={13} className="shrink-0 text-slate-400" />
                  {event.lokasi}
                </p>

                {event.keterangan && (
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{event.keterangan}</p>
                )}

                {event.foto && event.foto.length > 0 && (
                  <div className="mt-2.5 flex gap-2 overflow-x-auto">
                    {event.foto.map((src, i) => (
                      <PhotoThumb
                        key={i}
                        src={src}
                        alt={`Dokumentasi ${label} ${i + 1}`}
                        className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                        onClick={() =>
                          setLightbox({ src, caption: `${label} · ${event.lokasi}` })
                        }
                      />
                    ))}
                  </div>
                )}

                {event.type === "Transfer Unit" && event.truckSebelumnya && event.truck && (
                  <div className="mt-2.5 rounded-lg bg-blue-50 px-3 py-2.5">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-blue-800">
                      Transfer Unit
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                      <div className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 ring-1 ring-slate-200">
                        <Truck size={14} className="text-slate-400" />
                        <span>{event.truckSebelumnya.jenis}</span>
                      </div>
                      <ArrowRight size={16} className="shrink-0 text-blue-400" />
                      <div className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 ring-1 ring-blue-100">
                        <Truck size={14} className="text-blue-500" />
                        <span className="font-medium">{event.truck.jenis}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
