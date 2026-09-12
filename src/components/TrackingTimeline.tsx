import { ArrowRight, Camera, MapPin, Truck, User } from "lucide-react";
import { useState } from "react";
import type { TimelineEvent } from "../types";
import { formatJam, formatTanggalPanjang } from "../utils/format";
import { getStatusStyle } from "../utils/status";
import { ImageLightbox, PhotoThumb } from "./ImageLightbox";
import { StatusBadge } from "./StatusBadge";

interface TrackingTimelineProps {
  events: TimelineEvent[];
}

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);
  // Show most recent first for the reading order, but keep chronological numbering.
  const ordered = [...events].reverse();

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
          const style = getStatusStyle(event.type);
          return (
            <li key={event.id} className="relative flex gap-3.5 pb-6 last:pb-0">
              {/* connector line */}
              {idx !== ordered.length - 1 && (
                <span className="absolute left-[7px] top-5 h-[calc(100%-0.75rem)] w-px bg-slate-200" />
              )}
              <div className="relative flex flex-col items-center pt-1.5">
                <span
                  className={`z-10 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-slate-50 ${
                    isLatest ? style.dot : "bg-slate-300"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium text-slate-500">
                    {formatTanggalPanjang(event.tanggal)} · {formatJam(event.jam)}
                  </p>
                  {isLatest && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      TERBARU
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StatusBadge status={event.type} size="sm" />
                  <span className="flex items-center gap-1 text-sm font-medium text-slate-800">
                    <MapPin size={13} className="shrink-0 text-slate-400" />
                    {event.lokasi}
                  </span>
                </div>

                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{event.keterangan}</p>

                {event.foto && event.foto.length > 0 && (
                  <div className="mt-2.5 flex gap-2 overflow-x-auto">
                    {event.foto.map((src, i) => (
                      <PhotoThumb
                        key={i}
                        src={src}
                        alt={`Dokumentasi ${event.type} ${i + 1}`}
                        className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                        onClick={() =>
                          setLightbox({ src, caption: `${event.type} · ${event.lokasi}` })
                        }
                      />
                    ))}
                  </div>
                )}

                {event.type === "Transfer Unit" && event.truckSebelumnya && event.truck ? (
                  <div className="mt-2.5 rounded-lg bg-violet-50 px-3 py-2.5">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                      Transfer Unit
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                      <div className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 ring-1 ring-slate-200">
                        <Truck size={14} className="text-slate-400" />
                        <span>{event.truckSebelumnya.nomorUnit}</span>
                      </div>
                      <ArrowRight size={16} className="shrink-0 text-violet-400" />
                      <div className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 ring-1 ring-violet-200">
                        <Truck size={14} className="text-violet-500" />
                        <span className="font-medium">{event.truck.nomorUnit}</span>
                        <span className="text-slate-400">· {event.truck.jenis}</span>
                      </div>
                    </div>
                  </div>
                ) : event.truck ? (
                  <div className="mt-2.5 flex flex-wrap items-center gap-4 rounded-lg bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <Truck size={15} className="text-slate-400" />
                      <span className="font-medium">{event.truck.nomorUnit}</span>
                      <span className="text-slate-400">· {event.truck.jenis}</span>
                    </div>
                    {event.truck.driver && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-700">
                        <User size={15} className="text-slate-400" />
                        {event.truck.driver}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <Camera size={13} />
                    Belum ada unit truck ditugaskan pada tahap ini.
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
