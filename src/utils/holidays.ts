import { useSyncExternalStore } from "react";
import { api } from "./apiClient";

export interface Holiday {
  id: number;
  date: string; // YYYY-MM-DD
  name: string;
  isActive: boolean;
}

/**
 * Cache hari libur (Tanggal Merah) di sisi klien. Perhitungan Estimasi Tiba & KPI Percentage di CSV
 * bersifat sinkron, jadi daftar tanggal aktif disimpan di sini dan di-refresh dari GET /api/holidays.
 * Backend tetap source of truth.
 */
let holidays: Holiday[] = [];
let activeSet: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

function publish(next: Holiday[]) {
  holidays = next;
  activeSet = new Set(next.filter((h) => h.isActive).map((h) => h.date));
  listeners.forEach((l) => l());
}

export async function refreshHolidays(): Promise<Holiday[]> {
  const list = await api.get<Holiday[]>("/api/holidays");
  publish(list);
  return list;
}

/** Set tanggal libur aktif untuk helper sla (addDeliveryDaysExcludeSunday dst). */
export function getHolidaySet(): ReadonlySet<string> {
  return activeSet;
}

export function useHolidays(): { holidays: Holiday[]; activeSet: ReadonlySet<string> } {
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => holidays,
  );
  return { holidays, activeSet };
}
