import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { initialShipments } from "../data/mockData";
import type { Shipment, ShipmentFormData, TrackingUpdateFormData } from "../types";
import { generateAWB } from "../utils/awb";
import { nowHHMM, nowISO, todayISO } from "../utils/format";
import { eventTypeToShipmentStatus } from "../utils/status";

// Bump this suffix whenever the seed data in mockData.ts changes meaningfully
// so browsers with an older cached copy in localStorage pick up the new set
// instead of silently keeping stale data forever.
const STORAGE_KEY = "gms-tracking-shipments-v2";

interface ShipmentContextValue {
  shipments: Shipment[];
  getByAwb: (awb: string) => Shipment | undefined;
  createShipment: (data: ShipmentFormData) => Shipment;
  markEmailSent: (awb: string) => void;
  addTrackingUpdate: (data: TrackingUpdateFormData) => void;
  resetToMockData: () => void;
}

const ShipmentContext = createContext<ShipmentContextValue | null>(null);

function loadInitial(): Shipment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Shipment[];
  } catch {
    // ignore corrupted storage, fall back to mock data
  }
  return initialShipments;
}

export function ShipmentProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
    } catch (err) {
      // Most likely a quota error from storing many base64 photos - data
      // stays in memory for this session either way, so don't crash the
      // app over a failed persist.
      console.error("[ShipmentContext] gagal menyimpan ke localStorage:", err);
    }
  }, [shipments]);

  const value = useMemo<ShipmentContextValue>(
    () => ({
      shipments,
      getByAwb: (awb: string) =>
        shipments.find((s) => s.awb.toLowerCase() === awb.trim().toLowerCase()),
      createShipment: (data: ShipmentFormData) => {
        const awb = generateAWB(shipments.map((s) => s.awb));
        const newShipment: Shipment = {
          awb,
          tanggalDibuat: todayISO(),
          jamDibuat: nowHHMM(),
          status: "Dalam Persiapan",
          pengirim: data.pengirim,
          penerima: data.penerima,
          alamatAsal: data.alamatAsal,
          kotaAsal: data.kotaAsal,
          alamatTujuan: data.alamatTujuan,
          kotaTujuan: data.kotaTujuan,
          deskripsiBarang: data.deskripsiBarang,
          fotoBarang: data.fotoBarang,
          truck: data.truck,
          emailTerkirim: false,
          timeline: [
            {
              id: `${awb}-t1`,
              type: "Barang Diterima",
              lokasi: `Gudang ${data.kotaAsal}`,
              tanggal: todayISO(),
              jam: nowHHMM(),
              keterangan: "Barang diterima dan siap dikirim.",
              foto: data.fotoBarang ? [data.fotoBarang] : undefined,
              inputBy: "Admin",
              inputAt: nowISO(),
            },
          ],
        };
        setShipments((prev) => [newShipment, ...prev]);
        return newShipment;
      },
      markEmailSent: (awb: string) => {
        setShipments((prev) =>
          prev.map((s) =>
            s.awb === awb ? { ...s, emailTerkirim: true, emailTerkirimAt: nowISO() } : s,
          ),
        );
      },
      addTrackingUpdate: (data: TrackingUpdateFormData) => {
        setShipments((prev) =>
          prev.map((s) => {
            if (s.awb !== data.awb) return s;

            const truck =
              data.nomorUnit && data.jenisTruck
                ? { nomorUnit: data.nomorUnit, jenis: data.jenisTruck, driver: data.driver }
                : undefined;

            const isTransfer = data.type === "Transfer Unit";
            const newEvent = {
              id: `${data.awb}-t${s.timeline.length + 1}-${Date.now()}`,
              type: data.type,
              lokasi: data.lokasi,
              tanggal: data.tanggal,
              jam: data.jam,
              keterangan: data.keterangan,
              foto: data.foto && data.foto.length > 0 ? data.foto : undefined,
              truck,
              truckSebelumnya: isTransfer ? s.truck : undefined,
              inputBy: "Admin",
              inputAt: nowISO(),
            };

            const newStatus = eventTypeToShipmentStatus(data.type);
            const isSelesai = data.type === "Selesai / Terkirim";

            return {
              ...s,
              status: newStatus,
              truck: truck ?? s.truck,
              timeline: [...s.timeline, newEvent],
              pod: isSelesai
                ? {
                    tanggal: data.tanggal,
                    jam: data.jam,
                    lokasi: data.lokasi,
                    fotoBarang: data.foto?.[0] ?? s.fotoBarang ?? "",
                    fotoSuratJalan: data.foto?.[1] ?? data.foto?.[0] ?? "",
                    namaPenerima: s.penerima.nama,
                    catatan: data.keterangan,
                  }
                : s.pod,
            };
          }),
        );
      },
      resetToMockData: () => {
        setShipments(initialShipments);
      },
    }),
    [shipments],
  );

  return <ShipmentContext.Provider value={value}>{children}</ShipmentContext.Provider>;
}

export function useShipments() {
  const ctx = useContext(ShipmentContext);
  if (!ctx) throw new Error("useShipments must be used within ShipmentProvider");
  return ctx;
}
