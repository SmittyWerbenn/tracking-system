/**
 * Cek Ongkir pricing - the single place where a price is computed.
 *
 *   base (Harga Publish, per kg, from price_tariffs - Jabodetabek-origin)
 *     x origin markup (decided by the ORIGIN region, never the destination)
 *   -> per-kg price; total = chargeable kg x per-kg price + koli handling,
 *      rounded to the nearest Rp500.
 *
 * Harga Publish is priced for TWO layanan: LTL (origin markup 0/15/25% + minimum billing weight by destination, see
 * ltlMinimumKg) and LCL (same base rate per kg, no minimum beyond the 1 kg floor, +20% only when the ORIGIN is outside
 * Java - see lclOriginMarkup; the destination never matters). Every other layanan has a Rate Publish of Rp0
 * (see ratePublishFor) - the LTL/LCL rate is never reused for them.
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

/** Layanan names come from Master Layanan (nothing is listed here); these two keep their existing lead-time shift. */
export type Layanan = string;

/** Minimum billing weight (kg) for LTL, by DESTINATION: Jawa 50, Luar Jawa 100, Pelosok Terjauh 300. The area
 * categories already in price_tariffs.kategori_area are Pusat Kota / Sub-Urban / Pelosok / Pelosok Remote;
 * "Pelosok Remote..." is the farthest tier and is what "Pelosok Terjauh" means here. */
export const LTL_MINIMUM_KG = { JAWA: 50, LUAR_JAWA: 100, PELOSOK_TERJAUH: 300 } as const;
export type MinimumKategori = "Jawa" | "Luar Jawa" | "Pelosok Terjauh";

export function ltlMinimumKg(destRegion: OriginCategory, kategoriArea: string): { kg: number; kategori: MinimumKategori } {
  if (/^pelosok remote/i.test(kategoriArea.trim())) return { kg: LTL_MINIMUM_KG.PELOSOK_TERJAUH, kategori: "Pelosok Terjauh" };
  if (destRegion === "LUAR_JAWA") return { kg: LTL_MINIMUM_KG.LUAR_JAWA, kategori: "Luar Jawa" };
  return { kg: LTL_MINIMUM_KG.JAWA, kategori: "Jawa" };
}

/** Rate Publish used for a layanan: the stored tariff for LTL and LCL, Rp0 for every other layanan. */
export function ratePublishFor(priced: boolean, tariffPerKg: number): number {
  return priced ? tariffPerKg : 0;
}

/** LCL origin surcharge, decided by the ORIGIN region only (price_regions.kategori_origin): Jabodetabek / Jawa pay
 * nothing extra, Luar Jawa +20%. LCL does not use the LTL origin markup (0 / 15 / 25%). */
export const LCL_LUAR_JAWA_MARKUP = 0.2;
export function lclOriginMarkup(origin: OriginCategory): number {
  return origin === "LUAR_JAWA" ? LCL_LUAR_JAWA_MARKUP : 0;
}
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
  /** Rate Publish for the chosen layanan (LTL tariff, or 0). */
  basePricePerKg: number;
  originCategory: OriginCategory;
  beratKg: number;
  jumlahKoli: number;
  /** Minimum billing weight (LTL only; 0 = none). */
  minimumKg?: number;
  /** Markup to apply instead of the LTL origin markup (LCL passes its own rule). */
  markup?: number;
}

export interface PricingResult {
  hargaPublishPerKg: number;
  originCategory: OriginCategory;
  markupPersen: number;
  hargaSetelahPenyesuaianPerKg: number;
  chargeableKg: number;
  biayaKoli: number;
  total: number;
}

export function calculatePricing(i: PricingInput): PricingResult {
  const markup = i.markup ?? getOriginMarkup(i.originCategory);
  const adjusted = i.basePricePerKg * (1 + markup);
  const chargeableKg = Math.max(i.beratKg, MIN_CHARGEABLE_KG, i.minimumKg ?? 0);
  // No Rate Publish (non-LTL layanan) means nothing to charge: the koli handling fee must not turn Rp0 into a price.
  const biayaKoli = i.basePricePerKg > 0 ? Math.max(i.jumlahKoli - 1, 0) * KOLI_HANDLING_FEE : 0;
  // Round cents away first so 10000 x 1.15 is exactly 11500, not 11499.999...
  const perKg = Math.round(adjusted * 100) / 100;
  const total = Math.round((Math.round(chargeableKg * perKg * 100) / 100 + biayaKoli) / ROUND_TO) * ROUND_TO;
  return {
    hargaPublishPerKg: i.basePricePerKg,
    originCategory: i.originCategory,
    markupPersen: Math.round(markup * 100),
    hargaSetelahPenyesuaianPerKg: Math.round(adjusted * 100) / 100,
    chargeableKg,
    biayaKoli,
    total,
  };
}
