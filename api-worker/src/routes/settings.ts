import type { Router } from "../router";
import type { Ctx } from "../types";
import { ok, Errors } from "../http";
import { parseJsonBody, reqNumber, reqString, optBool } from "../validate";
import { requirePermission } from "../authMiddleware";
import { requireValidWhatsApp } from "../help";
import { writeAuditLog } from "../audit";

const KEYS = [
  "stagnant_threshold_days",
  "email_sending_enabled",
  "help_phone_number",
  "help_whatsapp_admin",
  "help_whatsapp_superadmin",
  "contact_email",
  "contact_address",
  "contact_hours",
  "office_head",
  "office_branch",
] as const;
type Key = (typeof KEYS)[number];

const DEFAULTS: Record<Key, string> = {
  stagnant_threshold_days: "2",
  email_sending_enabled: "true",
  // WhatsApp CS (Compro / Contact page), WhatsApp Admin and WhatsApp
  // Superadmin (help buttons). No placeholder numbers in code: an unset number
  // is reported as "belum dikonfigurasi" by the UI instead.
  help_phone_number: "",
  help_whatsapp_admin: "",
  help_whatsapp_superadmin: "",
  // The public Contact page (/kontak) used to hardcode these. The defaults are
  // exactly that text, so the page looks the same until a Superadmin edits it.
  contact_email: "cs@gms-logistics.co.id",
  contact_address: "Jl. Raya Cakung No. 88, Cakung, Jakarta Timur, DKI Jakarta",
  contact_hours: "Senin - Sabtu, 08.00 - 18.00 WIB",
  // "Office & Operational Hub" shown on the Compro; editable under Pengaturan (no code change needed).
  office_head: "Surabaya",
  office_branch: "Jakarta (Cakung)",
};

/** Contact details shown on the public Contact page. Shared by the admin
 * settings endpoint and the public one so both always agree. */
export async function loadContactInfo(db: D1Database) {
  const rows = await db
    .prepare(
      `SELECT key, value FROM settings
       WHERE key IN ('help_phone_number','contact_email','contact_address','contact_hours','office_head','office_branch')`,
    )
    .all<{ key: string; value: string }>();
  const v: Record<string, string> = {
    help_phone_number: DEFAULTS.help_phone_number,
    contact_email: DEFAULTS.contact_email,
    contact_address: DEFAULTS.contact_address,
    contact_hours: DEFAULTS.contact_hours,
    office_head: DEFAULTS.office_head,
    office_branch: DEFAULTS.office_branch,
  };
  for (const row of rows.results ?? []) if (row.value) v[row.key] = row.value;
  return {
    helpPhoneNumber: v.help_phone_number,
    contactEmail: v.contact_email,
    contactAddress: v.contact_address,
    contactHours: v.contact_hours,
    headOffice: v.office_head,
    branchHub: v.office_branch,
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
      helpWhatsAppAdmin: values.help_whatsapp_admin,
      helpWhatsAppSuperadmin: values.help_whatsapp_superadmin,
      contactEmail: values.contact_email,
      contactAddress: values.contact_address,
      contactHours: values.contact_hours,
      headOffice: values.office_head,
      branchHub: values.office_branch,
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
    if (helpPhoneNumber !== undefined) requireValidWhatsApp("WhatsApp CS", helpPhoneNumber);
    // Admin / Superadmin numbers may be cleared (""), meaning "not configured".
    const readOptionalWhatsApp = (field: string, label: string): string | undefined => {
      if (body[field] === undefined) return undefined;
      if (typeof body[field] !== "string") throw Errors.badRequest(`${label} harus berupa teks.`);
      const v = (body[field] as string).trim();
      if (v.length > 30) throw Errors.badRequest(`${label} maksimal 30 karakter.`);
      if (v !== "") requireValidWhatsApp(label, v);
      return v;
    };
    const helpWhatsAppAdmin = readOptionalWhatsApp("helpWhatsAppAdmin", "WhatsApp Admin");
    const helpWhatsAppSuperadmin = readOptionalWhatsApp("helpWhatsAppSuperadmin", "WhatsApp Superadmin");

    // Public Contact page details.
    const contactEmail = body.contactEmail !== undefined ? reqString(body, "contactEmail", { max: 120 }) : undefined;
    if (contactEmail !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      throw Errors.badRequest("Email kontak harus berupa email yang valid.");
    }
    const contactAddress = body.contactAddress !== undefined ? reqString(body, "contactAddress", { max: 300 }) : undefined;
    const contactHours = body.contactHours !== undefined ? reqString(body, "contactHours", { max: 150 }) : undefined;
    // Office & Operational Hub (Compro): required, trimmed, validated here regardless of the form.
    const readOffice = (field: string, label: string): string | undefined => {
      if (body[field] === undefined) return undefined;
      if (typeof body[field] !== "string") throw Errors.badRequest(`${label} harus berupa teks.`);
      const v = (body[field] as string).trim().replace(/\s+/g, " ");
      if (!v) throw Errors.badRequest(`${label} wajib diisi.`);
      if (v.length > 100) throw Errors.badRequest(`${label} maksimal 100 karakter.`);
      return v;
    };
    const headOffice = readOffice("headOffice", "Head Office");
    const branchHub = readOffice("branchHub", "Branch / Operational Hub");

    // Nomor Bantuan and the Contact page details are Superadmin-only - they're
    // meant to stay stable across an Admin/GMS-Admin turnover, so a GMS-Admin
    // account (even with the general settings.manage permission) can't change
    // them. Enforced here, not just by hiding the inputs.
    const touchesContact =
      helpPhoneNumber !== undefined ||
      helpWhatsAppAdmin !== undefined ||
      helpWhatsAppSuperadmin !== undefined ||
      contactEmail !== undefined ||
      contactAddress !== undefined ||
      contactHours !== undefined ||
      headOffice !== undefined ||
      branchHub !== undefined;
    if (touchesContact && actor.role !== "Superadmin") {
      throw Errors.forbidden("Hanya Superadmin yang dapat mengubah informasi kontak.");
    }

    const now = new Date().toISOString();
    if (stagnantThresholdDays !== undefined) await upsert(ctx, "stagnant_threshold_days", String(stagnantThresholdDays), now, actor.id);
    if (emailSendingEnabled !== undefined) await upsert(ctx, "email_sending_enabled", String(emailSendingEnabled), now, actor.id);
    if (helpPhoneNumber !== undefined) await upsert(ctx, "help_phone_number", helpPhoneNumber, now, actor.id);
    if (helpWhatsAppAdmin !== undefined) await upsert(ctx, "help_whatsapp_admin", helpWhatsAppAdmin, now, actor.id);
    if (helpWhatsAppSuperadmin !== undefined) await upsert(ctx, "help_whatsapp_superadmin", helpWhatsAppSuperadmin, now, actor.id);
    if (contactEmail !== undefined) await upsert(ctx, "contact_email", contactEmail, now, actor.id);
    if (contactAddress !== undefined) await upsert(ctx, "contact_address", contactAddress, now, actor.id);
    if (contactHours !== undefined) await upsert(ctx, "contact_hours", contactHours, now, actor.id);
    if (headOffice !== undefined || branchHub !== undefined) {
      const before = await ctx.env.DB.prepare(`SELECT key, value FROM settings WHERE key IN ('office_head','office_branch')`).all<{ key: string; value: string }>();
      const prev: Record<string, string> = { office_head: DEFAULTS.office_head, office_branch: DEFAULTS.office_branch };
      for (const r of before.results ?? []) prev[r.key] = r.value;
      const changes: string[] = [];
      if (headOffice !== undefined && headOffice !== prev.office_head) {
        await upsert(ctx, "office_head", headOffice, now, actor.id);
        changes.push(`Head Office: "${prev.office_head}" -> "${headOffice}"`);
      }
      if (branchHub !== undefined && branchHub !== prev.office_branch) {
        await upsert(ctx, "office_branch", branchHub, now, actor.id);
        changes.push(`Branch / Operational Hub: "${prev.office_branch}" -> "${branchHub}"`);
      }
      if (changes.length) {
        await writeAuditLog(ctx.env, actor, {
          action: "UPDATE_OFFICE_HUB",
          actionLabel: "UPDATE OFFICE & OPERATIONAL HUB",
          module: "Pengaturan",
          description: `Office & Operational Hub diperbarui. ${changes.join("; ")}`,
        });
      }
    }

    return ok({ updated: true });
  });
}
