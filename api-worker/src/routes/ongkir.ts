import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody } from "../validate";
import { LAYANAN, adjustLeadTime, calculatePricing, type Layanan, type OriginCategory } from "../pricing";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 120;
const hits = new Map<string, number[]>();

function checkRateLimit(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) throw Errors.rateLimited("Terlalu banyak permintaan. Coba lagi dalam beberapa menit.");
  recent.push(now);
  hits.set(key, recent);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function registerOngkirRoutes(router: Router) {
  // Wilayah tree for the Cek Ongkir pickers, one level per call:
  //   (nothing) -> provinsi list; ?provinsi= -> kab/kota; ?provinsi=&kota= -> kecamatan.
  router.get("/api/public/ongkir/wilayah", async (ctx: Ctx) => {
    checkRateLimit(ctx.request.headers.get("CF-Connecting-IP") ?? "unknown");
    const q = new URL(ctx.request.url).searchParams;
    const provinsi = str(q.get("provinsi"));
    const kota = str(q.get("kota"));
    const db = ctx.env.DB;
    if (!provinsi) {
      const r = await db.prepare(`SELECT DISTINCT provinsi AS nama FROM price_regions ORDER BY provinsi`).all<{ nama: string }>();
      return ok({ items: r.results.map((x) => x.nama) });
    }
    if (!kota) {
      const r = await db
        .prepare(`SELECT kabupaten_kota AS nama FROM price_regions WHERE provinsi = ? ORDER BY kabupaten_kota`)
        .bind(provinsi)
        .all<{ nama: string }>();
      return ok({ items: r.results.map((x) => x.nama) });
    }
    const r = await db
      .prepare(
        `SELECT t.kecamatan AS nama FROM price_tariffs t JOIN price_regions g ON g.id = t.region_id
         WHERE g.provinsi = ? AND g.kabupaten_kota = ? ORDER BY t.kecamatan`,
      )
      .bind(provinsi, kota)
      .all<{ nama: string }>();
    return ok({ items: r.results.map((x) => x.nama) });
  });

  // The pricing source of truth: the frontend only displays this answer.
  router.post("/api/public/ongkir", async (ctx: Ctx) => {
    checkRateLimit(ctx.request.headers.get("CF-Connecting-IP") ?? "unknown");
    const body = await parseJsonBody(ctx.request);
    const asal = (body.asal ?? {}) as Record<string, unknown>;
    const tujuan = (body.tujuan ?? {}) as Record<string, unknown>;
    const beratKg = Number(body.beratKg);
    const jumlahKoli = Math.max(1, Math.floor(Number(body.jumlahKoli) || 1));
    const layanan = str(body.layanan) as Layanan;

    if (!str(asal.provinsi) || !str(asal.kota)) throw Errors.badRequest("Pilih provinsi dan kabupaten/kota asal.");
    if (!str(tujuan.provinsi) || !str(tujuan.kota) || !str(tujuan.kecamatan)) {
      throw Errors.badRequest("Pilih provinsi, kabupaten/kota, dan kecamatan tujuan.");
    }
    if (!Number.isFinite(beratKg) || beratKg <= 0 || beratKg > 100000) throw Errors.badRequest("Berat paket tidak valid.");
    if (!LAYANAN.includes(layanan)) throw Errors.badRequest("Layanan tidak dikenal.");

    // Origin must be a known region: an unclassifiable origin is an error,
    // never a silent 0% / 15% / 25%.
    const origin = await ctx.env.DB.prepare(
      `SELECT kategori_origin FROM price_regions WHERE provinsi = ? AND kabupaten_kota = ?`,
    )
      .bind(str(asal.provinsi), str(asal.kota))
      .first<{ kategori_origin: OriginCategory }>();
    if (!origin) throw Errors.badRequest("Wilayah asal tidak dikenali, sehingga harga tidak dapat dihitung.");

    const tarif = await ctx.env.DB.prepare(
      `SELECT t.tarif_per_kg, t.kategori_area, t.lead_min, t.lead_max
       FROM price_tariffs t JOIN price_regions g ON g.id = t.region_id
       WHERE g.provinsi = ? AND g.kabupaten_kota = ? AND t.kecamatan = ?`,
    )
      .bind(str(tujuan.provinsi), str(tujuan.kota), str(tujuan.kecamatan))
      .first<{ tarif_per_kg: number; kategori_area: string; lead_min: number; lead_max: number }>();
    if (!tarif) throw Errors.badRequest("Tarif untuk tujuan tersebut tidak ditemukan.");

    const pricing = calculatePricing({
      basePricePerKg: tarif.tarif_per_kg,
      originCategory: origin.kategori_origin,
      beratKg,
      jumlahKoli,
      layanan,
    });
    const lead = adjustLeadTime(tarif.lead_min, tarif.lead_max, layanan);

    return ok({
      asal: { provinsi: str(asal.provinsi), kota: str(asal.kota) },
      tujuan: { provinsi: str(tujuan.provinsi), kota: str(tujuan.kota), kecamatan: str(tujuan.kecamatan), kategoriArea: tarif.kategori_area },
      beratKg,
      jumlahKoli,
      layanan,
      ...pricing,
      leadTimeMin: lead.min,
      leadTimeMax: lead.max,
    });
  });
}
