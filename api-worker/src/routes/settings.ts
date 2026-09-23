import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok } from "../http";
import { parseJsonBody, reqNumber, optBool } from "../validate";
import { requirePermission } from "../authMiddleware";

const KEYS = ["stagnant_threshold_days", "email_sending_enabled"] as const;
const DEFAULTS: Record<(typeof KEYS)[number], string> = {
  stagnant_threshold_days: "2",
  email_sending_enabled: "true",
};

export function registerSettingsRoutes(router: Router) {
  router.get("/api/settings", async (ctx: Ctx) => {
    requirePermission(ctx, "settings.view");
    const rows = await ctx.env.DB.prepare(`SELECT key, value FROM settings`).all<{ key: string; value: string }>();
    const values: Record<string, string> = { ...DEFAULTS };
    for (const row of rows.results ?? []) values[row.key] = row.value;
    return ok({
      stagnantThresholdDays: Number(values.stagnant_threshold_days),
      emailSendingEnabled: values.email_sending_enabled === "true",
    });
  });

  router.patch("/api/settings", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "settings.manage");
    const body = await parseJsonBody(ctx.request);
    const stagnantThresholdDays = body.stagnantThresholdDays !== undefined
      ? reqNumber(body, "stagnantThresholdDays", { min: 1, max: 30 })
      : undefined;
    const emailSendingEnabled = optBool(body, "emailSendingEnabled");

    const now = new Date().toISOString();
    if (stagnantThresholdDays !== undefined) {
      await ctx.env.DB.prepare(
        `INSERT INTO settings (key, value, updated_at, updated_by) VALUES ('stagnant_threshold_days', ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
      )
        .bind(String(stagnantThresholdDays), now, actor.id)
        .run();
    }
    if (emailSendingEnabled !== undefined) {
      await ctx.env.DB.prepare(
        `INSERT INTO settings (key, value, updated_at, updated_by) VALUES ('email_sending_enabled', ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
      )
        .bind(String(emailSendingEnabled), now, actor.id)
        .run();
    }

    return ok({ updated: true });
  });
}
