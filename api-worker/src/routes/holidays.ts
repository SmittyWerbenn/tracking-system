import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, reqString, optBool } from "../validate";
import { requireAuth, requirePermission } from "../authMiddleware";
import { writeAuditLog } from "../audit";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validDate(v: string): boolean {
  if (!DATE_RE.test(v)) return false;
  const [y, m, d] = v.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

interface HolidayRow { id: number; date: string; name: string; is_active: number }
const toDto = (r: HolidayRow) => ({ id: r.id, date: r.date, name: r.name, isActive: r.is_active === 1 });

export function registerHolidayRoutes(router: Router) {
  // Any signed-in user: the UI needs the dates for ETA previews and the CSV KPI.
  router.get("/api/holidays", async (ctx: Ctx) => {
    requireAuth(ctx);
    const r = await ctx.env.DB.prepare(`SELECT id, date, name, is_active FROM holidays ORDER BY date ASC`).all<HolidayRow>();
    return ok((r.results ?? []).map(toDto));
  });

  router.post("/api/holidays", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "settings.manage");
    const body = await parseJsonBody(ctx.request);
    const date = reqString(body, "date", { max: 10 });
    const name = reqString(body, "name", { min: 1, max: 100 });
    if (!validDate(date)) throw Errors.badRequest("Tanggal harus berformat YYYY-MM-DD yang valid.");
    const exists = await ctx.env.DB.prepare(`SELECT id FROM holidays WHERE date = ?`).bind(date).first();
    if (exists) throw Errors.badRequest("Tanggal tersebut sudah terdaftar sebagai hari libur.");
    await ctx.env.DB.prepare(`INSERT INTO holidays (date, name, is_active) VALUES (?, ?, 1)`).bind(date, name).run();
    await writeAuditLog(ctx.env, actor, {
      action: "CREATE_HOLIDAY", actionLabel: "TAMBAH HARI LIBUR", module: "Pengaturan",
      description: `Hari libur ${date} ("${name}") ditambahkan.`,
    });
    const row = await ctx.env.DB.prepare(`SELECT id, date, name, is_active FROM holidays WHERE date = ?`).bind(date).first<HolidayRow>();
    return ok(toDto(row!));
  });

  router.patch("/api/holidays/:id", async (ctx: Ctx, params) => {
    const actor = requirePermission(ctx, "settings.manage");
    const id = Number(params.id);
    const row = Number.isInteger(id)
      ? await ctx.env.DB.prepare(`SELECT id, date, name, is_active FROM holidays WHERE id = ?`).bind(id).first<HolidayRow>()
      : null;
    if (!row) throw Errors.notFound("Hari libur tidak ditemukan.");
    const body = await parseJsonBody(ctx.request);
    const isActive = optBool(body, "isActive");
    const name = body.name !== undefined ? reqString(body, "name", { min: 1, max: 100 }) : undefined;
    const nextActive = isActive === undefined ? row.is_active : isActive ? 1 : 0;
    const nextName = name ?? row.name;
    await ctx.env.DB.prepare(`UPDATE holidays SET name = ?, is_active = ? WHERE id = ?`).bind(nextName, nextActive, id).run();
    await writeAuditLog(ctx.env, actor, {
      action: "UPDATE_HOLIDAY", actionLabel: "UBAH HARI LIBUR", module: "Pengaturan",
      description: `Hari libur ${row.date} ("${nextName}") ${nextActive === 1 ? "diaktifkan" : "dinonaktifkan"}.`,
    });
    return ok(toDto({ ...row, name: nextName, is_active: nextActive }));
  });
}
