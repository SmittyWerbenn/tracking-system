import type { Shipment, TimelineEventType } from "../types";
import {
  currentLtlIndex,
  getLtlStage,
  isLtlLayanan,
  ltlStageIndex,
  nextLtlStages,
  renderLtlDescription,
  type LtlStageDef,
} from "./ltlPipeline";
import { getAllowedNextEvents } from "./status";
import { defaultLokasiFor, presetsFor } from "./trackingPresets";

/** One entry of the "Status" dropdown. Non-LTL: a plain event type. LTL: a pipeline stage (or an exception like Kendala). */
export interface TrackingChoice {
  value: string;
  label: string;
  type: TimelineEventType;
  ltlStage?: string;
}

/** Exceptions an LTL shipment can still log at any point, next to the pipeline stages. */
const LTL_EXCEPTIONS: TimelineEventType[] = ["Kendala", "Transfer Unit", "Re-route", "Penarikan"];

export function isLtlShipment(s: Pick<Shipment, "layanan">): boolean {
  return isLtlLayanan(s.layanan);
}

/** Index of the furthest LTL stage this shipment has reached (-1 = none). */
export function ltlIndexOf(s: Pick<Shipment, "timeline" | "status">): number {
  return currentLtlIndex(s.timeline, s.status);
}

/** The selectable statuses for a shipment, in pipeline order. `allow` filters out types the caller's role may not log. */
export function getTrackingChoices(s: Shipment, allow: (c: TrackingChoice) => boolean = () => true): TrackingChoice[] {
  if (!isLtlShipment(s)) {
    return getAllowedNextEvents(s.status)
      .map((t): TrackingChoice => ({ value: t, label: t, type: t }))
      .filter(allow);
  }
  const stages = nextLtlStages({ packingKayu: s.packingKayu, asuransi: s.asuransi, hasTransit: s.hasTransit }, ltlIndexOf(s));
  const out: TrackingChoice[] = stages
    .map((st): TrackingChoice => ({ value: st.code, label: st.label, type: st.type, ltlStage: st.code }))
    .filter(allow);
  // Exceptions only while the cargo is still in the pipeline (not after hand-over).
  if (s.status !== "Selesai / Terkirim") {
    for (const t of LTL_EXCEPTIONS) {
      const c: TrackingChoice = { value: t, label: t, type: t };
      if (allow(c)) out.push(c);
    }
  }
  return out;
}

function stageCity(stage: LtlStageDef, s: Pick<Shipment, "kotaAsal" | "kotaTujuan" | "timeline">): string {
  switch (stage.city) {
    case "origin": return s.kotaAsal;
    case "destination": return s.kotaTujuan;
    case "manual": return "";
    default: {
      const last = [...s.timeline].reverse().find((e) => e.lokasi && !e.lokasi.startsWith("Gudang "));
      return last?.lokasi ?? s.kotaAsal;
    }
  }
}

/** Auto-filled Lokasi / Keterangan for a choice; both stay editable. */
export function choiceDefaults(
  c: TrackingChoice,
  s: Pick<Shipment, "kotaAsal" | "kotaTujuan" | "timeline">,
  penerima: string,
): { lokasi: string; keterangan: string; presets: string[] } {
  const stage = getLtlStage(c.ltlStage);
  if (stage) {
    const text = renderLtlDescription(stage, s.kotaAsal, s.kotaTujuan);
    return { lokasi: stageCity(stage, s), keterangan: text, presets: [text] };
  }
  const presets = presetsFor(c.type, penerima);
  return { lokasi: defaultLokasiFor(c.type, s), keterangan: presets[0] ?? "", presets };
}

/** True when this choice is the actual hand-over to the consignee (needs penerima name + POD photos). */
export function isHandoverChoice(c: TrackingChoice | undefined): boolean {
  if (!c) return false;
  return c.type === "Selesai / Terkirim" && (!c.ltlStage || c.ltlStage === "DELIVERED");
}

/** Follow-up LTL stages after DELIVERED (e-POD, hardcopy, closed): type is "Selesai" but no POD/penerima needed. */
export function isLtlPostDelivery(c: TrackingChoice | undefined): boolean {
  return !!c && c.type === "Selesai / Terkirim" && !!c.ltlStage && c.ltlStage !== "DELIVERED";
}

/** Whether the tracking form is closed for this shipment. LTL stays open after DELIVERED until SHIPMENT_CLOSED. */
export function isTrackingLocked(s: Shipment): boolean {
  if (s.status === "Dibatalkan" || s.status === "Hold") return true;
  if (s.status !== "Selesai / Terkirim") return false;
  if (!isLtlShipment(s)) return true;
  return ltlIndexOf(s) >= ltlStageIndex("SHIPMENT_CLOSED");
}

/** Props for the full LTL timeline checklist. */
export function ltlOf(s: Shipment) {
  return { flags: { packingKayu: s.packingKayu, asuransi: s.asuransi, hasTransit: s.hasTransit }, origin: s.kotaAsal, destination: s.kotaTujuan, status: s.status };
}
