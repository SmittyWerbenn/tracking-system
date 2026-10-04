import type { Language } from "../data/translations";
import type { LayananPengiriman } from "../types";
import { api } from "./apiClient";

/** Answer of POST /api/public/ongkir. The backend (api-worker/src/pricing.ts) is
 * the only place a price is computed; this module just asks and formats. */
export interface OngkirEstimate {
  asal: { provinsi: string; kota: string };
  tujuan: { provinsi: string; kota: string; kecamatan: string; kategoriArea: string };
  beratKg: number;
  jumlahKoli: number;
  layanan: LayananPengiriman;
  hargaPublishPerKg: number;
  originCategory: "JABODETABEK" | "JAWA" | "LUAR_JAWA";
  markupPersen: number;
  hargaSetelahPenyesuaianPerKg: number;
  chargeableKg: number;
  biayaKoli: number;
  total: number;
  leadTimeMin: number;
  leadTimeMax: number;
}

export interface OngkirRequest {
  asal: { provinsi: string; kota: string };
  tujuan: { provinsi: string; kota: string; kecamatan: string };
  beratKg: number;
  jumlahKoli: number;
  layanan: LayananPengiriman;
}

export function fetchOngkir(req: OngkirRequest): Promise<OngkirEstimate> {
  return api.post<OngkirEstimate>("/api/public/ongkir", req, { auth: false });
}

/** One level of the wilayah tree: provinces, then kab/kota of a province, then
 * kecamatan of a kab/kota. */
export async function fetchWilayah(provinsi?: string, kota?: string): Promise<string[]> {
  const params = new URLSearchParams();
  if (provinsi) params.set("provinsi", provinsi);
  if (provinsi && kota) params.set("kota", kota);
  const qs = params.toString();
  const res = await api.get<{ items: string[] }>(`/api/public/ongkir/wilayah${qs ? `?${qs}` : ""}`, { auth: false });
  return res.items;
}

export function estimasiHariLabel(min: number, max: number, language: Language): string {
  const unit = language === "en" ? (max === 1 ? "day" : "days") : "hari";
  return min === max ? `${min} ${unit}` : `${min}-${max} ${unit}`;
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
