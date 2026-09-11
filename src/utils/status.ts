import type { ShipmentStatus, TimelineEventType } from "../types";

interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
  ring: string;
}

const STYLES: Record<string, StatusStyle> = {
  "Dalam Persiapan": {
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-400",
    ring: "ring-slate-200",
  },
  "Berangkat": {
    bg: "bg-sky-100",
    text: "text-sky-700",
    dot: "bg-sky-500",
    ring: "ring-sky-200",
  },
  "Transit": {
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  "Dalam Perjalanan": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
    ring: "ring-blue-200",
  },
  "Kendala": {
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
    ring: "ring-red-200",
  },
  "Transfer Unit": {
    bg: "bg-violet-100",
    text: "text-violet-700",
    dot: "bg-violet-500",
    ring: "ring-violet-200",
  },
  "Tiba di Tujuan": {
    bg: "bg-teal-100",
    text: "text-teal-700",
    dot: "bg-teal-500",
    ring: "ring-teal-200",
  },
  "Selesai / Terkirim": {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  "Barang Diterima": {
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-400",
    ring: "ring-slate-200",
  },
};

export function getStatusStyle(status: ShipmentStatus | TimelineEventType): StatusStyle {
  return STYLES[status] ?? STYLES["Dalam Persiapan"];
}

export const SHIPMENT_STATUS_OPTIONS: ShipmentStatus[] = [
  "Dalam Persiapan",
  "Berangkat",
  "Transit",
  "Dalam Perjalanan",
  "Kendala",
  "Tiba di Tujuan",
  "Selesai / Terkirim",
];

export const TIMELINE_EVENT_OPTIONS: TimelineEventType[] = [
  "Barang Diterima",
  "Berangkat",
  "Transit",
  "Dalam Perjalanan",
  "Kendala",
  "Transfer Unit",
  "Tiba di Tujuan",
  "Selesai / Terkirim",
];

/** Maps a timeline event type to the resulting shipment-level status. */
export function eventTypeToShipmentStatus(type: TimelineEventType): ShipmentStatus {
  if (type === "Barang Diterima") return "Dalam Persiapan";
  if (type === "Transfer Unit") return "Dalam Perjalanan";
  return type as ShipmentStatus;
}
