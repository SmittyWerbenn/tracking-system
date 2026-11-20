// Quick-select Keterangan for the "Dalam Perjalanan" (IN_TRANSIT) status: the sea / ferry legs of an
// inter-island shipment. Stored text stays Indonesian; the English wording lives in trackingI18n.ts.
import type { Shipment } from "../types";
import { formatTanggalPanjang } from "./format";

export interface TransitPreset {
  id: string;
  /** Indonesian text; {destination} / {date} are filled in by renderTransitPreset. */
  text: string;
  /** Lokasi suggestion: "destination", "origin", or a literal ("Pelabuhan"). */
  lokasi: "destination" | "origin" | string;
}

export const TRANSIT_PRESETS: TransitPreset[] = [
  { id: "hub", text: "Cargo menuju area hub tujuan", lokasi: "destination" },
  { id: "port-wait", text: "Cargo tiba di pelabuhan muat, menunggu jadwal keberangkatan kapal", lokasi: "Pelabuhan" },
  { id: "loading", text: "Proses muat cargo ke dalam kapal (loading)", lokasi: "Pelabuhan" },
  { id: "departed", text: "Kapal telah berangkat menuju pelabuhan tujuan", lokasi: "Laut" },
  { id: "sea", text: "Cargo dalam perjalanan laut menuju pelabuhan tujuan", lokasi: "destination" },
  { id: "berthed", text: "Kapal sandar di pelabuhan tujuan, proses bongkar & sortir muatan", lokasi: "destination" },
  { id: "port-out", text: "Cargo keluar dari pelabuhan, menuju hub kota tujuan", lokasi: "destination" },
  { id: "eta", text: "Estimasi tiba di {destination} pada {date}", lokasi: "destination" },
];

/** Destinations across the sea from Java/Sumatera: these get the vessel presets highlighted. */
const INTER_ISLAND_RE =
  /kalimantan|banjarmasin|banjarbaru|balikpapan|samarinda|pontianak|palangka|tarakan|bontang|sulawesi|manado|makassar|palu\b|kendari|gorontalo|mamuju|bitung|papua|jayapura|sorong|merauke|timika|maluku|ambon|ternate|halmahera|nusa tenggara|ntb|ntt|mataram|lombok|kupang|labuan bajo|flores|sumbawa|bima|bali|denpasar|badung|gianyar|batam|kepulauan riau|kepri|tanjung ?pinang|bintan/i;

export function isInterIslandDestination(kota: string | undefined | null): boolean {
  return !!kota && INTER_ISLAND_RE.test(kota);
}

type Ctx = Pick<Shipment, "kotaAsal" | "kotaTujuan" | "estimasiTiba">;

/** Keterangan + suggested Lokasi for a preset. With no ETA on the shipment the date stays as the "[Tanggal]" placeholder. */
export function renderTransitPreset(p: TransitPreset, s: Ctx): { keterangan: string; lokasi: string } {
  const date = s.estimasiTiba ? formatTanggalPanjang(s.estimasiTiba.slice(0, 10)) : "[Tanggal]";
  const lokasi = p.lokasi === "destination" ? s.kotaTujuan : p.lokasi === "origin" ? s.kotaAsal : p.lokasi;
  return { keterangan: p.text.replace("{destination}", s.kotaTujuan).replace("{date}", date), lokasi };
}

/** Lokasi is only overwritten while it is still empty or one of the auto-suggested values (route cities, "Pelabuhan", "Laut"), never a hand-typed one. */
export function lokasiIsSuggestion(lokasi: string, s: Pick<Shipment, "kotaAsal" | "kotaTujuan">): boolean {
  const v = lokasi.trim().toLowerCase();
  return !v || [s.kotaAsal, s.kotaTujuan, "Pelabuhan", "Laut"].some((x) => x.toLowerCase() === v);
}
