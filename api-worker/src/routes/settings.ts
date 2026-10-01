import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, reqNumber, reqString, optBool } from "../validate";
import { requirePermission } from "../authMiddleware";

const KEYS = [
  "stagnant_threshold_days",
  "email_sending_enabled",
  "help_phone_number",
  "contact_phone",
  "contact_email",
  "contact_address",
  "contact_hours",
] as const;
type Key = (typeof KEYS)[number];

const DEFAULTS: Record<Key, string> = {
  stagnant_threshold_days: "2",
  email_sending_enabled: "true",
  // Matches the number previously hardcoded in src/utils/contact.ts, so
  // nothing changes for existing users until a Superadmin edits it.
  help_phone_number: "0812-0000-8899",
  // The public Contact page (/kontak) used to hardcode these. The defaults are
  // exactly that text, so the page looks the same until a Superadmin edits it.
  contact_phone: "021-2200-8899",
  contact_email: "cs@gms-logistics.co.id",
  contact_address: "Jl. Raya Cakung No. 88, Cakung, Jakarta Timur, DKI Jakarta",
  contact_hours: "Senin - Sabtu, 08.00 - 18.00 WIB",
};

/** Contact details shown on the public Contact page. Shared by the admin
 * settings endpoint and the public one so both always agree. */
export async function loadContactInfo(db: D1Database) {
  const rows = await db
    .prepare(
      `SELECT key, value FROM settings
       WHERE key IN ('help_phone_number','contact_phone','contact_email','contact_address','contact_hours')`,
    )
    .all<{ key: string; value: string }>();
  const v: Record<string, string> = {
    help_phone_number: DEFAULTS.help_phone_number,
    contact_phone: DEFAULTS.contact_phone,
    contact_email: DEFAULTS.contact_email,
    contact_address: DEFAULTS.contact_address,
    contact_hours: DEFAULTS.contact_hours,
  };
  for (const row of rows.results ?? []) if (row.value) v[row.key] = row.value;
  return {
    helpPhoneNumber: v.help_phone_number,
    contactPhone: v.contact_phone,
    contactEmail: v.contact_email,
    contactAddress: v.contact_address,
    contactHours: v.contact_hours,
  };
}

async function upsert(ctx: Ctx, key: Key, value: string, now: string, userId: string) {
  await ctx.env.DB.prepare(
    `INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
  )
    .bind(key, value, now, userId)
    .run();
}

export function registerSettingsRoutes(router: Router) {
  router.get("/api/settings", async (ctx: Ctx) => {
    requirePermission(ctx, "settings.view");
    const rows = await ctx.env.DB.prepare(`SELECT key, value FROM settings`).all<{ key: string; value: string }>();
    const values: Record<string, string> = { ...DEFAULTS };
    for (const row of rows.results ?? []) values[row.key] = row.value;
    return ok({
      stagnantThresholdDays: Number(values.stagnant_threshold_days),
      emailSendingEnabled: values.email_sending_enabled === "true",
      helpPhoneNumber: values.help_phone_number,
      contactPhone: values.contact_phone,
      contactEmail: values.contact_email,
      contactAddress: values.contact_address,
      contactHours: values.contact_hours,
    });
  });

  router.patch("/api/settings", async (ctx: Ctx) => {
    const actor = requirePermission(ctx, "settings.manage");
    const body = await parseJsonBody(ctx.request);
    const stagnantThresholdDays = body.stagnantThresholdDays !== undefined
      ? reqNumber(body, "stagnantThresholdDays", { min: 1, max: 30 })
      : undefined;
    const emailSendingEnabled = optBool(body, "emailSendingEnabled");
    const helpPhoneNumber = body.helpPhoneNumber !== undefined ? reqString(body, "helpPhoneNumber", { max: 30 }) : undefined;

    // Public Contact page details.
    const contactPhone = body.contactPhone !== undefined ? reqString(body, "contactPhone", { max: 30 }) : undefined;
    const contactEmail = body.contactEmail !== undefined ? reqString(body, "contactEmail", { max: 120 }) : undefined;
    if (contactEmail !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      throw Errors.badRequest("Email kontak harus berupa email yang valid.");
    }
    const contactAddress = body.contactAddress !== undefined ? reqString(body, "contactAddress", { max: 300 }) : undefined;
    const contactHours = body.contactHours !== undefined ? reqString(body, "contactHours", { max: 150 }) : undefined;

    // Nomor Bantuan and the Contact page details are Superadmin-only - they're
    // meant to stay stable across an Admin/GMS-Admin turnover, so a GMS-Admin
    // account (even with the general settings.manage permission) can't change
    // them. Enforced here, not just by hiding the inputs.
    const touchesContact =
      helpPhoneNumber !== undefined ||
      contactPhone !== undefined ||
      contactEmail !== undefined ||
      contactAddress !== undefined ||
      contactHours !== undefined;
    if (touchesContact && actor.role !== "Superadmin") {
      throw Errors.forbidden("Hanya Superadmin yang dapat mengubah informasi kontak.");
    }

    const now = new Date().toISOString();
    if (stagnantThresholdDays !== undefined) await upsert(ctx, "stagnant_threshold_days", String(stagnantThresholdDays), now, actor.id);
    if (emailSendingEnabled !== undefined) await upsert(ctx, "email_sending_enabled", String(emailSendingEnabled), now, actor.id);
    if (helpPhoneNumber !== undefined) await upsert(ctx, "help_phone_number", helpPhoneNumber, now, actor.id);
    if (contactPhone !== undefined) await upsert(ctx, "contact_phone", contactPhone, now, actor.id);
    if (contactEmail !== undefined) await upsert(ctx, "contact_email", contactEmail, now, actor.id);
    if (contactAddress !== undefined) await upsert(ctx, "contact_address", contactAddress, now, actor.id);
    if (contactHours !== undefined) await upsert(ctx, "contact_hours", contactHours, now, actor.id);

    return ok({ updated: true });
  });
}
