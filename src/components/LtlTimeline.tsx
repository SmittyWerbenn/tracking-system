import { Check } from "lucide-react";
import type { TimelineEvent } from "../types";
import {
  LTL_PHASES,
  currentLtlIndex,
  applicableLtlStages,
  getLtlStage,
  ltlStageIndex,
  renderLtlDescription,
  type LtlFlags,
  type LtlStageDef,
} from "../utils/ltlPipeline";

export interface LtlContext {
  flags: LtlFlags;
  origin: string;
  destination: string;
  status: string;
}

interface Props {
  events: TimelineEvent[];
  ltl: LtlContext;
}

/** logged = has its own tracking log (shown in the history above); reached = older shipment with no per-stage log,
 * the stage is implied by its status; skipped = a later stage was logged without this one. */
type State = "logged" | "reached" | "skipped" | "upcoming";

function ltlProgress({ events, ltl }: Props) {
  const stages = applicableLtlStages(ltl.flags);
  const logged = new Set<string>();
  for (const e of events) if (e.ltlStage && getLtlStage(e.ltlStage)) logged.add(e.ltlStage);
  const legacy = logged.size === 0;
  const currentIdx = currentLtlIndex(events, ltl.status);
  const closed = logged.has("SHIPMENT_CLOSED");

  const stateOf = (st: LtlStageDef): State => {
    const i = ltlStageIndex(st.code);
    if (logged.has(st.code)) return "logged";
    if (legacy) return i <= currentIdx ? "reached" : "upcoming";
    return i < currentIdx ? "skipped" : "upcoming";
  };
  const isReached = (st: LtlStageDef) => ["logged", "reached"].includes(stateOf(st));
  return { stages, currentIdx, closed, stateOf, isReached };
}

/** Overall progress: how far along the full LTL pipeline this shipment is. */
export function LtlProgress(props: Props) {
  const { stages, currentIdx, closed, isReached } = ltlProgress(props);
  const total = stages.length;
  const reached = stages.filter(isReached).length;
  const pct = total ? Math.round((reached / total) * 100) : 0;
  const nextStage = stages.find((s) => ltlStageIndex(s.code) > currentIdx);
  return (
    <div className="mb-6 rounded-xl bg-slate-50 px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-semibold text-slate-800">
          {reached} dari {total} tahap <span className="font-normal text-slate-500">· {pct}%</span>
        </p>
        <p className="text-xs text-slate-500">
          {closed ? "Pengiriman LTL selesai dan ditutup" : nextStage ? <>Berikutnya: <span className="font-semibold text-slate-700">{nextStage.label}</span></> : "Semua tahap tercapai"}
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full transition-all ${closed ? "bg-emerald-500" : "bg-blue-800"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** The stages without a tracking log yet, per phase in pipeline order. It sits below the history (which lists the
 * logged stages newest first), so the whole journey stays visible without breaking the newest-on-top order. */
export function LtlRemainingStages(props: Props) {
  const { stages, stateOf, isReached } = ltlProgress(props);
  const { ltl } = props;
  const phases = LTL_PHASES.map((name, p) => {
    const items = stages.filter((s) => s.phase === p);
    return { name, total: items.length, done: items.filter(isReached).length, open: items.filter((s) => stateOf(s) !== "logged") };
  }).filter((p) => p.total > 0);
  if (phases.every((p) => p.open.length === 0)) return null;

  return (
    <div className="mt-8 border-t border-slate-100 pt-6">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Tahap LTL Belum Tercatat</h3>
      <div className="space-y-5">
        {phases.map((phase, pi) => {
          const complete = phase.done === phase.total;
          return (
            <section key={phase.name}>
              <div className="mb-2 flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    complete ? "bg-emerald-500 text-white" : phase.done > 0 ? "bg-blue-800 text-white" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {complete ? <Check size={13} /> : pi + 1}
                </span>
                <h4 className={`text-xs font-semibold uppercase tracking-wide ${phase.done > 0 ? "text-slate-700" : "text-slate-400"}`}>{phase.name}</h4>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  {phase.done}/{phase.total}
                </span>
                <span className="h-px flex-1 bg-slate-100" />
              </div>
              {phase.open.length > 0 && (
                <ol className="ml-3 border-l border-slate-200 pl-6">
                  {phase.open.map((st) => {
                    const state = stateOf(st);
                    return (
                      <li key={st.code} className="relative pb-3 last:pb-0">
                        <span
                          className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-white ring-4 ring-white ${
                            state === "reached" ? "border-2 border-emerald-400" : state === "skipped" ? "border-2 border-dashed border-slate-300" : "border-2 border-slate-200"
                          }`}
                        />
                        <p className={`text-sm font-medium ${state === "skipped" ? "text-slate-300 line-through" : state === "reached" ? "text-slate-600" : "text-slate-400"}`}>
                          {st.label}
                          {state === "skipped" && <span className="ml-2 inline-block text-[11px] font-normal text-slate-400 no-underline">Dilewati</span>}
                        </p>
                        {state === "upcoming" && <p className="text-xs text-slate-300">{renderLtlDescription(st, ltl.origin, ltl.destination)}</p>}
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
