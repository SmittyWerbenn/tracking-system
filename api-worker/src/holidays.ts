import type { Env } from "./types";

/** Active holiday dates ("YYYY-MM-DD") on or after `fromDate` (default: all). Skipped like Sundays by ETA / KPI day counting. */
export async function loadHolidays(db: Env["DB"], fromDate?: string): Promise<Set<string>> {
  try {
    const r = fromDate
      ? await db.prepare(`SELECT date FROM holidays WHERE is_active = 1 AND date >= ?`).bind(fromDate.slice(0, 10)).all<{ date: string }>()
      : await db.prepare(`SELECT date FROM holidays WHERE is_active = 1`).all<{ date: string }>();
    return new Set((r.results ?? []).map((x) => x.date));
  } catch {
    // Table missing (migration not applied yet): behave as before, Sundays only.
    return new Set();
  }
}
