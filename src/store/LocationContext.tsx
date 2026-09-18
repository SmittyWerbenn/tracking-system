import { createContext, useContext, type ReactNode } from "react";
import type { TitikJenis, TitikLokasi } from "../types";
import { initialTitikLokasi } from "../data/masterData";
import { usePersistedState } from "../utils/usePersistedState";
import { useAuditLog } from "./AuditLogContext";
import { useAuth } from "./AuthContext";

// Bump this suffix whenever initialTitikLokasi in masterData.ts changes
// meaningfully so browsers with an older cached copy in localStorage pick up
// the new set instead of silently keeping stale data forever.
const STORAGE_KEY = "gms-titik-lokasi-v3";

export interface TitikFormData {
  namaKota: string;
  kodeKota: string;
  provinsi: string;
  jenis: TitikJenis;
  aktif: boolean;
}

interface LocationContextValue {
  titikLokasi: TitikLokasi[];
  activeTitikLokasi: TitikLokasi[];
  createTitik: (data: TitikFormData) => TitikLokasi;
  updateTitik: (id: string, data: TitikFormData) => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [titikLokasi, setTitikLokasi] = usePersistedState<TitikLokasi[]>(STORAGE_KEY, initialTitikLokasi);
  const { addLog } = useAuditLog();
  const { profile } = useAuth();

  const activeTitikLokasi = titikLokasi.filter((t) => t.aktif);

  function createTitik(data: TitikFormData): TitikLokasi {
    const titik: TitikLokasi = { id: `loc-${Date.now()}`, ...data };
    setTitikLokasi((prev) => [...prev, titik]);
    addLog({
      userName: profile.nama,
      role: profile.role,
      action: "CREATE_LOCATION",
      actionLabel: "CREATE LOCATION",
      module: "Master Kota",
      description: `Titik ${data.jenis.toLowerCase()} "${data.namaKota}" ditambahkan ke master kota.`,
    });
    return titik;
  }

  function updateTitik(id: string, data: TitikFormData) {
    setTitikLokasi((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
    addLog({
      userName: profile.nama,
      role: profile.role,
      action: "UPDATE_LOCATION",
      actionLabel: "UPDATE LOCATION",
      module: "Master Kota",
      description: `Data titik "${data.namaKota}" diperbarui.`,
    });
  }

  return (
    <LocationContext.Provider value={{ titikLokasi, activeTitikLokasi, createTitik, updateTitik }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocations() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocations must be used within LocationProvider");
  return ctx;
}
