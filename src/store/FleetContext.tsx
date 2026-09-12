import { createContext, useContext, type ReactNode } from "react";
import type { ArmadaStatus, Driver, Truck } from "../types";
import { initialDrivers, initialTrucks } from "../data/masterData";
import { usePersistedState } from "../utils/usePersistedState";
import { useAuditLog } from "./AuditLogContext";
import { useAuth } from "./AuthContext";

const TRUCK_STORAGE_KEY = "gms-fleet-trucks-v1";
const DRIVER_STORAGE_KEY = "gms-fleet-drivers-v1";

export interface TruckFormData {
  nomorUnit: string;
  jenis: string;
  kapasitas: string;
  driverNama: string;
  driverTelepon: string;
  status: ArmadaStatus;
  keterangan?: string;
}

export interface TruckWithDriver extends Truck {
  driver?: Driver;
}

interface FleetContextValue {
  trucks: Truck[];
  drivers: Driver[];
  trucksWithDriver: TruckWithDriver[];
  getTruck: (id: string) => TruckWithDriver | undefined;
  createTruck: (data: TruckFormData) => Truck;
  updateTruck: (id: string, data: TruckFormData) => void;
  setTruckStatus: (id: string, status: ArmadaStatus) => void;
}

const FleetContext = createContext<FleetContextValue | null>(null);

export function FleetProvider({ children }: { children: ReactNode }) {
  const [trucks, setTrucks] = usePersistedState<Truck[]>(TRUCK_STORAGE_KEY, initialTrucks);
  const [drivers, setDrivers] = usePersistedState<Driver[]>(DRIVER_STORAGE_KEY, initialDrivers);
  const { addLog } = useAuditLog();
  const { profile } = useAuth();

  const trucksWithDriver: TruckWithDriver[] = trucks.map((t) => ({
    ...t,
    driver: drivers.find((d) => d.id === t.driverId),
  }));

  function getTruck(id: string) {
    return trucksWithDriver.find((t) => t.id === id);
  }

  function upsertDriver(nama: string, telepon: string): string {
    const existing = drivers.find((d) => d.nama.toLowerCase() === nama.toLowerCase());
    if (existing) {
      if (existing.telepon !== telepon) {
        setDrivers((prev) => prev.map((d) => (d.id === existing.id ? { ...d, telepon } : d)));
      }
      return existing.id;
    }
    const id = `drv-${Date.now()}`;
    setDrivers((prev) => [...prev, { id, nama, telepon }]);
    return id;
  }

  function createTruck(data: TruckFormData): Truck {
    const driverId = upsertDriver(data.driverNama, data.driverTelepon);
    const truck: Truck = {
      id: `trk-${Date.now()}`,
      nomorUnit: data.nomorUnit,
      jenis: data.jenis,
      kapasitas: data.kapasitas,
      driverId,
      status: data.status,
      keterangan: data.keterangan,
    };
    setTrucks((prev) => [truck, ...prev]);
    addLog({
      userName: profile.nama,
      role: profile.role,
      action: "CREATE_TRUCK",
      actionLabel: "CREATE TRUCK",
      module: "Master Armada",
      description: `Unit truck ${truck.nomorUnit} ditambahkan ke master armada.`,
    });
    return truck;
  }

  function updateTruck(id: string, data: TruckFormData) {
    const driverId = upsertDriver(data.driverNama, data.driverTelepon);
    setTrucks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              nomorUnit: data.nomorUnit,
              jenis: data.jenis,
              kapasitas: data.kapasitas,
              driverId,
              status: data.status,
              keterangan: data.keterangan,
            }
          : t,
      ),
    );
    addLog({
      userName: profile.nama,
      role: profile.role,
      action: "UPDATE_TRUCK_MASTER",
      actionLabel: "UPDATE TRUCK",
      module: "Master Armada",
      description: `Data unit truck ${data.nomorUnit} diperbarui.`,
    });
  }

  function setTruckStatus(id: string, status: ArmadaStatus) {
    const truck = trucks.find((t) => t.id === id);
    setTrucks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    if (truck) {
      addLog({
        userName: profile.nama,
        role: profile.role,
        action: "UPDATE_TRUCK_MASTER",
        actionLabel: "UPDATE TRUCK",
        module: "Master Armada",
        description: `Status unit truck ${truck.nomorUnit} diubah: ${truck.status} -> ${status}.`,
      });
    }
  }

  return (
    <FleetContext.Provider
      value={{ trucks, drivers, trucksWithDriver, getTruck, createTruck, updateTruck, setTruckStatus }}
    >
      {children}
    </FleetContext.Provider>
  );
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error("useFleet must be used within FleetProvider");
  return ctx;
}
