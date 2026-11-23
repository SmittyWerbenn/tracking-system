/** SLA/ETA calculation. Admin only ever inputs an SLA (a business-day
 * count); ETA is always derived, never entered directly - see the shipment
 * routes for where this is called. Business day = Mon-Fri; no holiday
 * calendar yet (sla_unit is kept separate from sla_value specifically so a
 * future "hari_kalender" or holiday-aware unit can be added without a
 * schema change). */

export type SlaUnit = "hari_kerja";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/** Adds N business days to a "YYYY-MM-DD" date, skipping Sat/Sun. Parses
 * and returns pure calendar dates (UTC-anchored, no time-of-day) so this
 * is immune to server/browser timezone differences - see section 13 of the
 * spec this implements. */
export function addBusinessDays(startDateIso: string, days: number): string {
  const [y, m, d] = startDateIso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  let remaining = days;
  while (remaining > 0) {
    date.setTime(date.getTime() + MS_PER_DAY);
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

/** Adds N delivery days to a "YYYY-MM-DD" date, counting Monday-Saturday only: every Sunday passed is skipped (UTC-anchored, timezone-immune).
 * Fri 20 Nov + 3 -> Sat 21 (1), Sun 22 skipped, Mon 23 (2), Tue 24 (3) = 24 Nov. */
export function addDeliveryDaysExcludeSunday(startDateIso: string, days: number): string {
  const [y, m, d] = startDateIso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  let added = 0;
  while (added < days) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() !== 0) added++;
  }
  return date.toISOString().slice(0, 10);
}

/** Delivery days from start to end ("YYYY-MM-DD"), excluding Sundays; min 1. Inverse of addDeliveryDaysExcludeSunday. */
export function countDeliveryDaysExcludingSunday(startDateIso: string, endDateIso: string): number {
  const [y1, m1, d1] = startDateIso.slice(0, 10).split("-").map(Number);
  const [y2, m2, d2] = endDateIso.slice(0, 10).split("-").map(Number);
  const cursor = new Date(Date.UTC(y1, m1 - 1, d1));
  const end = Date.UTC(y2, m2 - 1, d2);
  let days = 0;
  while (cursor.getTime() < end) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    if (cursor.getUTCDay() !== 0) days++;
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

/** Estimasi Tiba = Di-Pickup date + target days (Sundays skipped). Before pickup it is provisional: creation date + target days. */
export function etaFromPickup(pickupDate: string | null, createdDate: string, slaValue: number): string {
  return addDeliveryDaysExcludeSunday(pickupDate ?? createdDate, slaValue);
}

/** Returns the calculated ETA ("YYYY-MM-DD"), or null if no SLA was given -
 * never fabricates a date. */
export function calculateEta(startDateIso: string, slaValue: number | null, slaUnit: SlaUnit | null): string | null {
  if (slaValue === null || slaUnit === null) return null;
  if (slaUnit === "hari_kerja") return addBusinessDays(startDateIso, slaValue);
  return null;
}
