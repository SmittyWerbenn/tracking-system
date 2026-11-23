/** Client-side mirror of api-worker/src/sla.ts, used only for a live ETA
 * preview while the admin types an SLA - the backend recalculates and
 * stores the authoritative value, this never gets written anywhere. */

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function addBusinessDays(startDateIso: string, days: number): string {
  const [y, m, d] = startDateIso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  let remaining = days;
  while (remaining > 0) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (!isWeekend(date)) remaining--;
  }
  return date.toISOString().slice(0, 10);
}

/** Adds N calendar days to a "YYYY-MM-DD" date (UTC-anchored, timezone-immune). */
export function addCalendarDays(startDateIso: string, days: number): string {
  const [y, m, d] = startDateIso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Set of active holiday dates ("YYYY-MM-DD", Tanggal Merah / cuti bersama) that are skipped like Sundays. */
export type HolidaySet = ReadonlySet<string>;

function isNonDeliveryDay(date: Date, holidays?: HolidaySet): boolean {
  return date.getUTCDay() === 0 || (holidays !== undefined && holidays.has(date.toISOString().slice(0, 10)));
}

/** Adds N delivery days to a "YYYY-MM-DD" date, skipping every Sunday AND every holiday (UTC-anchored, timezone-immune).
 * Fri 20 Nov + 3, Mon 23 Nov a holiday -> Sat 21 (1), Sun 22 + Mon 23 skipped, Tue 24 (2), Wed 25 (3) = 25 Nov. */
export function addDeliveryDaysExcludeSunday(startDateIso: string, days: number, holidays?: HolidaySet): string {
  const [y, m, d] = startDateIso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  let added = 0;
  while (added < days) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (!isNonDeliveryDay(date, holidays)) added++;
  }
  return date.toISOString().slice(0, 10);
}

/** Delivery days from start to end ("YYYY-MM-DD"), excluding Sundays and holidays; min 1. Inverse of addDeliveryDaysExcludeSunday. */
export function countDeliveryDaysExcludingSunday(startDateIso: string, endDateIso: string, holidays?: HolidaySet): number {
  const [y1, m1, d1] = startDateIso.slice(0, 10).split("-").map(Number);
  const [y2, m2, d2] = endDateIso.slice(0, 10).split("-").map(Number);
  const cursor = new Date(Date.UTC(y1, m1 - 1, d1));
  const end = Date.UTC(y2, m2 - 1, d2);
  let days = 0;
  while (cursor.getTime() < end) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    if (!isNonDeliveryDay(cursor, holidays)) days++;
  }
  return Math.max(1, days);
}

/** Date ("YYYY-MM-DD") of the first Di-Pickup log - ltl stage PICKED_UP, or a legacy "Di pickup" log that carries
 * no LTL stage. Order Dibuat / Tiba di Gudang Asal also store type "Di pickup" but are not the pickup itself.
 * `events` must be chronological (oldest first). Null while the cargo has not been picked up. */
export function firstPickupDate(events: ReadonlyArray<{ type: string; tanggal: string; ltlStage?: string | null }>): string | null {
  const hit = events.find((e) => e.ltlStage === "PICKED_UP" || (e.type === "Di pickup" && !e.ltlStage));
  return hit ? hit.tanggal : null;
}

/** Estimasi Tiba = Di-Pickup date + target days (Sundays + holidays skipped). Before pickup it is provisional: creation date + target days. */
export function etaFromPickup(pickupDate: string | null, createdDate: string, slaValue: number, holidays?: HolidaySet): string {
  return addDeliveryDaysExcludeSunday(pickupDate ?? createdDate, slaValue, holidays);
}

/** Named aliases: ETA / KPI day counting that skips Sundays and active national holidays. */
export const calculateEtaBusinessDays = addDeliveryDaysExcludeSunday;
export const countBusinessDeliveryDays = countDeliveryDaysExcludingSunday;

