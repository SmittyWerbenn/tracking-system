import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { TitikJenis, TitikLokasi } from "../types";
import { api } from "../utils/apiClient";
import { useAuth } from "./AuthContext";

interface LocationRow {
  id: string;
  nama_kota: string;
  kode_kota: string;
  provinsi?: string;
  nama_titik?: string | null;
  jenis: TitikJenis;
  aktif?: number;
}

function toTitik(row: LocationRow): TitikLokasi {
  return {
    id: row.id,
    namaKota: row.nama_kota,
    provinsi: row.provinsi ?? "",
    namaTitik: row.nama_titik ?? "",
    kodeKota: row.kode_kota ?? "",
    jenis: row.jenis,
    aktif: row.aktif === undefined ? true : row.aktif === 1,
  };
}

export interface TitikFormData {
  namaKota: string;
  provinsi: string;
  namaTitik: string;
  kodeKota: string;
  jenis: TitikJenis;
  aktif: boolean;
}

/** One row sent to the bulk-import endpoint. `row` is the number shown to the
 * admin (file row) so server-side errors can point at it. */
export interface TitikImportItem extends Omit<TitikFormData, "jenis" | "aktif"> {
  row: number;
  jenis?: string;
  aktif?: boolean;
}

export interface TitikImportFailure {
  row: number;
  kota: string;
  provinsi: string;
  titik: string;
  message: string;
}

export interface TitikImportResult {
  total: number;
  created: number;
  failed: TitikImportFailure[];
}

interface LocationContextValue {
  titikLokasi: TitikLokasi[];
  activeTitikLokasi: TitikLokasi[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createTitik: (data: TitikFormData) => Promise<TitikLokasi>;
  updateTitik: (id: string, data: TitikFormData) => Promise<void>;
  setTitikAktif: (id: string, aktif: boolean) => Promise<void>;
  importTitik: (items: TitikImportItem[]) => Promise<TitikImportResult>;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [activeTitikLokasi, setActiveTitikLokasi] = useState<TitikLokasi[]>([]);
  const [titikLokasi, setTitikLokasi] = useState<TitikLokasi[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function refresh() {
    setIsLoading(true);
    try {
      // Public, active-only list - works for both anonymous visitors
      // (Cek Ongkir) and signed-in admins picking a route/transit point.
      const publicRes = await api.get<{ items: LocationRow[] }>("/api/public/locations", { auth: false });
      setActiveTitikLokasi(publicRes.items.map(toTitik));

      if (isAuthenticated) {
        const adminRes = await api.get<{ items: LocationRow[] }>("/api/locations");
        setTitikLokasi(adminRes.items.map(toTitik));
      } else {
        setTitikLokasi([]);
      }
    } catch {
      setActiveTitikLokasi([]);
      setTitikLokasi([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  async function createTitik(data: TitikFormData): Promise<TitikLokasi> {
    const res = await api.post<{ id: string }>("/api/locations", data);
    await refresh();
    return { id: res.id, ...data };
  }

  async function updateTitik(id: string, data: TitikFormData) {
    await api.patch(`/api/locations/${id}`, data);
    await refresh();
  }

  async function setTitikAktif(id: string, aktif: boolean) {
    await api.patch(`/api/locations/${id}`, { aktif });
    await refresh();
  }

  /** Imports in chunks (keeps each request small), merging per-row failures. */
  async function importTitik(items: TitikImportItem[]): Promise<TitikImportResult> {
    const CHUNK = 400;
    const total: TitikImportResult = { total: items.length, created: 0, failed: [] };
    for (let i = 0; i < items.length; i += CHUNK) {
      const res = await api.post<TitikImportResult>("/api/locations/bulk", { items: items.slice(i, i + CHUNK) });
      total.created += res.created;
      total.failed.push(...res.failed);
    }
    await refresh();
    return total;
  }

  return (
    <LocationContext.Provider
      value={{ titikLokasi, activeTitikLokasi, isLoading, refresh, createTitik, updateTitik, setTitikAktif, importTitik }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocations() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocations must be used within LocationProvider");
  return ctx;
}
