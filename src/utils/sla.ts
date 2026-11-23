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

/** Date ("YYYY-MM-DD") of the first Di-Pickup log - ltl stage PICKED_UP, or a legacy "Di pickup" log that carries
 * no LTL stage. Order Dibuat / Tiba di Gudang Asal also store type "Di pickup" but are not the pickup itself.
 * `events` must be chronological (oldest first). Null while the cargo has not been picked up. */
export function firstPickupDate(events: ReadonlyArray<{ type: string; tanggal: string; ltlStage?: string | null }>): string | null {
  const hit = events.find((e) => e.ltlStage === "PICKED_UP" || (e.type === "Di pickup" && !e.ltlStage));
  return hit ? hit.tanggal : null;
}

/** Estimasi Tiba = Di-Pickup date + target days. Before pickup it is provisional: creation date + target days. */
export function etaFromPickup(pickupDate: string | null, createdDate: string, slaValue: number): string {
  return addCalendarDays(pickupDate ?? createdDate, slaValue);
}

