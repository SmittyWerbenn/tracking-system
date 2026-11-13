import type { Shipment, TimelineEventType } from "../types";
import { LTL_STAGES, currentLtlIndex, isLtlLayanan, nextLtlStages, normalizeLtlStage, renderLtlDescription, type LtlStageDef } from "./ltlPipeline";
import { getAllowedNextEvents } from "./status";
import { defaultLokasiFor, presetsFor } from "./trackingPresets";

/** One entry of the "Status" dropdown. Non-LTL: a plain event type. LTL: one of the 8 pipeline statuses (or an exception like Kendala). */
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

/** Index (0-7) of the LTL status this shipment is at: the one of its newest log, i.e. the top row of the timeline. */
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
  const stages = nextLtlStages(ltlIndexOf(s));
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
  if (stage.city === "origin") return s.kotaAsal;
  if (stage.city === "destination") return s.kotaTujuan;
  // In transit: the active transit point (where the last in-transit log was), else the destination.
  const lastTransit = [...s.timeline].reverse().find((e) => normalizeLtlStage(e.ltlStage) === "IN_TRANSIT" && e.lokasi);
  return lastTransit?.lokasi ?? s.kotaTujuan;
}

/** Auto-filled Lokasi / Keterangan for a choice; both stay editable. */
export function choiceDefaults(
  c: TrackingChoice,
  s: Pick<Shipment, "kotaAsal" | "kotaTujuan" | "timeline" | "packingKayu" | "asuransi">,
  penerima: string,
): { lokasi: string; keterangan: string; presets: string[] } {
  const stage = LTL_STAGES.find((st) => st.code === c.ltlStage);
  if (stage) {
    const text = renderLtlDescription(stage, s.kotaAsal, s.kotaTujuan, { packingKayu: s.packingKayu, asuransi: s.asuransi });
    return { lokasi: stageCity(stage, s), keterangan: text, presets: [text] };
  }
  const presets = presetsFor(c.type, penerima);
  return { lokasi: defaultLokasiFor(c.type, s), keterangan: presets[0] ?? "", presets };
}

/** True when this choice is the hand-over to the consignee (needs penerima name + POD photos). LTL: Terkirim. */
export function isHandoverChoice(c: TrackingChoice | undefined): boolean {
  return !!c && c.type === "Selesai / Terkirim";
}

/** Whether the tracking form is closed for this shipment. */
export function isTrackingLocked(s: Shipment): boolean {
  return s.status === "Dibatalkan" || s.status === "Hold" || s.status === "Selesai / Terkirim";
}
