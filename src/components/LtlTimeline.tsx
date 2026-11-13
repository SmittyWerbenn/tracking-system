import { Check, MapPin, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../store/LanguageContext";
import type { TimelineEvent } from "../types";
import { formatJam, formatTanggalPanjang } from "../utils/format";
import {
  LTL_PHASES,
  applicableLtlStages,
  getLtlStage,
  ltlStageIndex,
  renderLtlDescription,
  type LtlFlags,
  type LtlStageDef,
} from "../utils/ltlPipeline";
import { actionClass } from "./ActionButton";
import { ImageLightbox, PhotoThumb } from "./ImageLightbox";

interface Props {
  events: TimelineEvent[];
  ltl: { flags: LtlFlags; origin: string; destination: string };
  onEdit?: (event: TimelineEvent) => void;
  onDelete?: (event: TimelineEvent) => void;
}

/** System milestones are never editable or deletable (same rule as the classic timeline). */
const PROTECTED = new Set(["Barang Diterima", "Selesai / Terkirim", "Dibatalkan"]);

type State = "done" | "current" | "skipped" | "upcoming";

/** Full LTL checklist: every stage that applies to this shipment, grouped by phase, top to bottom in pipeline order.
 * Logged stages show their time / location / note; the rest stay visible but muted so the whole journey is clear at a glance.
 * Logs without a stage (Kendala, Transfer Unit, ...) appear right under the stage the shipment was at when they happened. */
export function LtlTimeline({ events, ltl, onEdit, onDelete }: Props) {
  const { t } = useLanguage();
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);
  const stages = applicableLtlStages(ltl.flags);

  const byStage = new Map<string, TimelineEvent>();
  const extrasAfter = new Map<string, TimelineEvent[]>();
  let lastCode: string = stages[0]?.code ?? "";
  for (const e of events) {
    if (e.ltlStage && getLtlStage(e.ltlStage)) {
      byStage.set(e.ltlStage, e);
      lastCode = e.ltlStage;
    } else {
      extrasAfter.set(lastCode, [...(extrasAfter.get(lastCode) ?? []), e]);
    }
  }
  let currentIdx = -1;
  for (const code of byStage.keys()) currentIdx = Math.max(currentIdx, ltlStageIndex(code));
  const closed = byStage.has("SHIPMENT_CLOSED");

  const stateOf = (st: LtlStageDef): State => {
    const i = ltlStageIndex(st.code);
    if (byStage.has(st.code)) return i === currentIdx && !closed ? "current" : "done";
    return i < currentIdx ? "skipped" : "upcoming";
  };

  const phases = LTL_PHASES.map((name, p) => {
    const items = stages.filter((s) => s.phase === p);
    const done = items.filter((s) => byStage.has(s.code)).length;
    return { name, items, done };
  }).filter((p) => p.items.length > 0);

  const interactive = !!(onEdit || onDelete);

  function Actions({ event }: { event: TimelineEvent }) {
    const manageable = !PROTECTED.has(event.type);
    if (!manageable || !interactive) return null;
    const canDelete = event.type !== "Transfer Unit";
    return (
      <span className="ml-auto flex items-center gap-2">
        {onEdit && (
          <button type="button" onClick={() => onEdit(event)} title="Edit log tracking" aria-label="Edit log tracking" className={actionClass("edit")}>
            <Pencil size={16} />
          </button>
        )}
        {onDelete && canDelete && (
          <button type="button" onClick={() => onDelete(event)} title="Hapus log tracking" aria-label="Hapus log tracking" className={actionClass("danger")}>
            <Trash2 size={16} />
          </button>
        )}
      </span>
    );
  }

  function Details({ event, label }: { event: TimelineEvent; label: string }) {
    return (
      <>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
          <MapPin size={13} className="shrink-0 text-slate-400" />
          {event.lokasi}
        </p>
        {event.keterangan && <p className="mt-1 text-sm leading-relaxed text-slate-500">{event.keterangan}</p>}
        {event.internalNotes?.trim() && (
          <p className="mt-1 flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-sm leading-relaxed text-amber-800">
            <span className="mt-0.5 shrink-0 rounded-full bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">Internal</span>
            <span className="min-w-0 break-words">{event.internalNotes}</span>
          </p>
        )}
        {event.foto && event.foto.length > 0 && (
          <div className="mt-2.5 flex gap-2 overflow-x-auto">
            {event.foto.map((src, i) => (
              <PhotoThumb
                key={i}
                src={src}
                alt={`Dokumentasi ${label} ${i + 1}`}
                className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                onClick={() => setLightbox({ src, caption: `${label} · ${event.lokasi}` })}
              />
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <div>
      <ImageLightbox src={lightbox?.src ?? null} caption={lightbox?.caption} onClose={() => setLightbox(null)} />
      <div className="space-y-6">
        {phases.map((phase, pi) => {
          const complete = phase.done === phase.items.length;
          return (
            <section key={phase.name}>
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    complete ? "bg-emerald-500 text-white" : phase.done > 0 ? "bg-blue-800 text-white" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {complete ? <Check size={13} /> : pi + 1}
                </span>
                <h3 className={`text-xs font-semibold uppercase tracking-wide ${phase.done > 0 ? "text-slate-700" : "text-slate-400"}`}>{phase.name}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  {phase.done}/{phase.items.length}
                </span>
                <span className="h-px flex-1 bg-slate-100" />
              </div>

              <ol className="ml-3 border-l border-slate-200 pl-6">
                {phase.items.map((st) => {
                  const state = stateOf(st);
                  const event = byStage.get(st.code);
                  const extras = extrasAfter.get(st.code) ?? [];
                  const desc = renderLtlDescription(st, ltl.origin, ltl.destination);
                  return (
                    <li key={st.code} className={`relative ${interactive && event ? "group -ml-3 rounded-xl border border-transparent px-3 py-2.5 pl-3 hover:border-sky-200 hover:bg-sky-50/70" : "pb-4 last:pb-0"}`}>
                      {/* dot sits on the vertical rail */}
                      <span
                        className={`absolute top-3 h-3.5 w-3.5 rounded-full ring-4 ring-white ${interactive && event ? "-left-[31px] group-hover:ring-sky-50" : "-left-[31px]"} ${
                          state === "done"
                            ? "bg-emerald-500"
                            : state === "current"
                              ? "bg-blue-800"
                              : state === "skipped"
                                ? "border-2 border-dashed border-slate-300 bg-white"
                                : "border-2 border-slate-200 bg-white"
                        }`}
                      >
                        {state === "current" && <span className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-60" />}
                      </span>

                      {event ? (
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-medium text-slate-500">
                              {formatTanggalPanjang(event.tanggal)} · {formatJam(event.jam)}
                            </p>
                            {state === "current" && (
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800">{t.timeline.latest}</span>
                            )}
                            <Actions event={event} />
                          </div>
                          <p className={`mt-1 text-sm font-semibold ${state === "current" ? "text-blue-900" : "text-slate-900"}`}>{st.label}</p>
                          <Details event={event} label={st.label} />
                        </div>
                      ) : (
                        <div className="min-w-0 opacity-90">
                          <p className={`text-sm font-medium ${state === "skipped" ? "text-slate-300 line-through" : "text-slate-400"}`}>
                            {st.label}
                            {state === "skipped" && <span className="ml-2 text-[11px] font-normal no-underline text-slate-400">Dilewati</span>}
                          </p>
                          {state === "upcoming" && <p className="text-xs text-slate-300">{desc}</p>}
                        </div>
                      )}

                      {extras.map((x) => (
                        <div key={x.id} className="mt-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[11px] font-medium text-slate-500">
                              {formatTanggalPanjang(x.tanggal)} · {formatJam(x.jam)}
                            </p>
                            <Actions event={x} />
                          </div>
                          <p className="text-sm font-semibold text-amber-900">{x.type}</p>
                          <Details event={x} label={x.type} />
                        </div>
                      ))}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
