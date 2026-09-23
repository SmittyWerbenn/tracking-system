import type { Language } from "../data/translations";
import { JARAK_DARI_JAKARTA_KM, PULAU_KOTA } from "../data/ongkirData";
import type { LayananPengiriman } from "../types";

interface OngkirTier {
  label: string;
  labelEn: string;
  maxKm: number; // inclusive upper bound this tier applies to; last tier uses Infinity
  baseFee: number;
  perKgRate: number;
  minCharge: number;
  hariMin: number;
  hariMax: number;
}

const LOCAL_TIER: OngkirTier = {
  label: "Dalam Kota",
  labelEn: "Within City",
  maxKm: 0,
  baseFee: 5000,
  perKgRate: 1000,
  minCharge: 8000,
  hariMin: 1,
  hariMax: 1,
};

// Same-island routes (e.g. Jakarta -> Surabaya are both "Jawa") - ordered by
// ascending distance, the first tier whose maxKm the route fits under is used.
const TIERS_SATU_PULAU: OngkirTier[] = [
  { label: "Jabodetabek & Sekitarnya", labelEn: "Jabodetabek & Nearby", maxKm: 150, baseFee: 6000, perKgRate: 1800, minCharge: 9000, hariMin: 1, hariMax: 2 },
  { label: "Antar Kota Satu Pulau (Sedang)", labelEn: "Same-Island (Medium)", maxKm: 400, baseFee: 9000, perKgRate: 2500, minCharge: 12000, hariMin: 2, hariMax: 3 },
  { label: "Antar Kota Satu Pulau (Jauh)", labelEn: "Same-Island (Far)", maxKm: Infinity, baseFee: 12000, perKgRate: 3200, minCharge: 15000, hariMin: 3, hariMax: 4 },
];

// Cross-island routes (e.g. Jakarta -> Makassar).
const TIERS_LUAR_PULAU: OngkirTier[] = [
  { label: "Luar Pulau Jawa (Terdekat)", labelEn: "Outside Java (Nearest)", maxKm: 700, baseFee: 18000, perKgRate: 4500, minCharge: 22000, hariMin: 4, hariMax: 6 },
  { label: "Luar Pulau Jawa (Sedang)", labelEn: "Outside Java (Medium)", maxKm: 1500, baseFee: 25000, perKgRate: 6000, minCharge: 30000, hariMin: 5, hariMax: 7 },
  { label: "Luar Pulau Jawa (Jauh)", labelEn: "Outside Java (Far)", maxKm: Infinity, baseFee: 35000, perKgRate: 8000, minCharge: 40000, hariMin: 6, hariMax: 9 },
];

const LAYANAN_MULTIPLIER: Record<LayananPengiriman, number> = {
  Darat: 0.85,
  Regular: 1,
  Express: 1.4,
  Kargo: 0.6,
  Charter: 2.5,
};

const MIN_DISTANCE_KM = 20;
const KOLI_HANDLING_FEE = 2000;

export interface OngkirEstimate {
  kotaAsal: string;
  kotaTujuan: string;
  beratKg: number;
  jumlahKoli: number;
  layanan: LayananPengiriman;
  distanceKm: number;
  tierLabel: string;
  total: number;
  estimasiHari: string;
}

function pickTier(distanceKm: number, samePulau: boolean): OngkirTier {
  if (distanceKm <= 0) return LOCAL_TIER;
  const tiers = samePulau ? TIERS_SATU_PULAU : TIERS_LUAR_PULAU;
  return tiers.find((t) => distanceKm <= t.maxKm) ?? tiers[tiers.length - 1];
}

function estimasiHariLabel(tier: OngkirTier, layanan: LayananPengiriman, language: Language): string {
  let min = tier.hariMin;
  let max = tier.hariMax;
  if (layanan === "Express") {
    min = Math.max(1, Math.ceil(min * 0.5));
    max = Math.max(min, Math.ceil(max * 0.6));
  } else if (layanan === "Kargo") {
    min += 1;
    max += 2;
  }
  const unit = language === "en" ? (max === 1 ? "day" : "days") : "hari";
  return min === max ? `${min} ${unit}` : `${min}-${max} ${unit}`;
}

/** Mock "cek ongkir" estimator - berat (weight) and jarak (distance, via the
 * JARAK_DARI_JAKARTA_KM proxy, combined with same-island vs. cross-island
 * tiering via PULAU_KOTA) both drive the price; this is a dummy/prototype
 * calculation, not a real courier tariff. */
export function estimateOngkir(
  kotaAsal: string,
  kotaTujuan: string,
  beratKg: number,
  jumlahKoli: number,
  layanan: LayananPengiriman,
  language: Language = "id",
): OngkirEstimate {
  const sameCity = kotaAsal.trim().toLowerCase() === kotaTujuan.trim().toLowerCase();
  const distA = JARAK_DARI_JAKARTA_KM[kotaAsal] ?? 0;
  const distB = JARAK_DARI_JAKARTA_KM[kotaTujuan] ?? 0;
  const distanceKm = sameCity ? 0 : Math.max(Math.abs(distA - distB), MIN_DISTANCE_KM);
  const pulauA = PULAU_KOTA[kotaAsal];
  const samePulau = pulauA !== undefined && pulauA === PULAU_KOTA[kotaTujuan];

  const tier = pickTier(distanceKm, samePulau);
  const beratDihitung = Math.max(beratKg, 1);
  const multiplier = LAYANAN_MULTIPLIER[layanan];

  const subtotalBerat = beratDihitung * tier.perKgRate * multiplier;
  const subtotalKoli = Math.max(jumlahKoli - 1, 0) * KOLI_HANDLING_FEE;
  const baseFee = tier.baseFee * multiplier;

  let total = Math.round(baseFee + subtotalBerat + subtotalKoli);
  total = Math.max(total, tier.minCharge);
  total = Math.round(total / 500) * 500;

  return {
    kotaAsal,
    kotaTujuan,
    beratKg,
    jumlahKoli,
    layanan,
    distanceKm,
    tierLabel: language === "en" ? tier.labelEn : tier.label,
    total,
    estimasiHari: estimasiHariLabel(tier, layanan, language),
  };
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
