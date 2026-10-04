/**
 * Cek Ongkir pricing - the single place where a price is computed.
 *
 *   base (Harga Publish, per kg, from price_tariffs - Jabodetabek-origin)
 *     x origin markup (decided by the ORIGIN region, never the destination)
 *     x layanan multiplier
 *   -> per-kg price; total = chargeable kg x per-kg price + koli handling,
 *      rounded to the nearest Rp500.
 *
 * Base prices are never stored marked up. The origin category of every region
 * (Jabodetabek / Jawa / Luar Jawa) lives in price_regions.kategori_origin.
 */
export type OriginCategory = "JABODETABEK" | "JAWA" | "LUAR_JAWA";

export const ORIGIN_MARKUP: Record<OriginCategory, number> = {
  JABODETABEK: 0,
  JAWA: 0.15,
  LUAR_JAWA: 0.25,
};

export const LAYANAN = ["Darat", "Regular", "Express", "Kargo", "Charter"] as const;
export type Layanan = (typeof LAYANAN)[number];

const LAYANAN_MULTIPLIER: Record<Layanan, number> = { Darat: 0.85, Regular: 1, Express: 1.4, Kargo: 0.6, Charter: 2.5 };
const MIN_CHARGEABLE_KG = 1;
const KOLI_HANDLING_FEE = 2000;
const ROUND_TO = 500;

export function getOriginMarkup(category: OriginCategory): number {
  return ORIGIN_MARKUP[category];
}

/** Express/Kargo shift the published lead time (existing behaviour); the
 * origin never does. */
export function adjustLeadTime(min: number, max: number, layanan: Layanan): { min: number; max: number } {
  if (layanan === "Express") {
    const m = Math.max(1, Math.ceil(min * 0.5));
    return { min: m, max: Math.max(m, Math.ceil(max * 0.6)) };
  }
  if (layanan === "Kargo") return { min: min + 1, max: max + 2 };
  return { min, max };
}

export interface PricingInput {
  basePricePerKg: number;
  originCategory: OriginCategory;
  beratKg: number;
  jumlahKoli: number;
  layanan: Layanan;
}

export interface PricingResult {
  hargaPublishPerKg: number;
  originCategory: OriginCategory;
  markupPersen: number;
  hargaSetelahPenyesuaianPerKg: number;
  layananMultiplier: number;
  chargeableKg: number;
  biayaKoli: number;
  total: number;
}

export function calculatePricing(i: PricingInput): PricingResult {
  const markup = getOriginMarkup(i.originCategory);
  const multiplier = LAYANAN_MULTIPLIER[i.layanan];
  const adjusted = i.basePricePerKg * (1 + markup);
  const chargeableKg = Math.max(i.beratKg, MIN_CHARGEABLE_KG);
  const biayaKoli = Math.max(i.jumlahKoli - 1, 0) * KOLI_HANDLING_FEE;
  // Round cents away first so 10000 x 1.15 is exactly 11500, not 11499.999...
  const perKg = Math.round(adjusted * multiplier * 100) / 100;
  const total = Math.round((Math.round(chargeableKg * perKg * 100) / 100 + biayaKoli) / ROUND_TO) * ROUND_TO;
  return {
    hargaPublishPerKg: i.basePricePerKg,
    originCategory: i.originCategory,
    markupPersen: Math.round(markup * 100),
    hargaSetelahPenyesuaianPerKg: Math.round(adjusted * 100) / 100,
    layananMultiplier: multiplier,
    chargeableKg,
    biayaKoli,
    total,
  };
}
