import { createContext, useContext, type ReactNode } from "react";
import { initialShipments } from "../data/mockData";
import type { Shipment, ShipmentFormData, TrackingUpdateFormData, TruckInfo } from "../types";
import { generateAWB } from "../utils/awb";
import { nowHHMM, nowISO, todayISO } from "../utils/format";
import { eventTypeToShipmentStatus } from "../utils/status";
import { usePersistedState } from "../utils/usePersistedState";
import { useAuditLog } from "./AuditLogContext";
import { useAuth } from "./AuthContext";
import { useFleet } from "./FleetContext";
import { useNotifications } from "./NotificationContext";

// Bump this suffix whenever the seed data in mockData.ts changes meaningfully
// so browsers with an older cached copy in localStorage pick up the new set
// instead of silently keeping stale data forever.
const STORAGE_KEY = "gms-tracking-shipments-v3";

interface ShipmentContextValue {
  shipments: Shipment[];
  getByAwb: (awb: string) => Shipment | undefined;
  createShipment: (data: ShipmentFormData) => Shipment;
  markEmailSent: (awb: string) => void;
  addTrackingUpdate: (data: TrackingUpdateFormData) => void;
  resetToMockData: () => void;
}

const ShipmentContext = createContext<ShipmentContextValue | null>(null);

export function ShipmentProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = usePersistedState<Shipment[]>(STORAGE_KEY, initialShipments);
  const { getTruck } = useFleet();
  const { addLog } = useAuditLog();
  const { addNotification } = useNotifications();
  const { profile } = useAuth();

  function truckSnapshot(truckId: string | undefined): TruckInfo | undefined {
    if (!truckId) return undefined;
    const t = getTruck(truckId);
    if (!t) return undefined;
    return { nomorUnit: t.nomorUnit, jenis: t.jenis, driver: t.driver?.nama };
  }

  function getByAwb(awb: string) {
    return shipments.find((s) => s.awb.toLowerCase() === awb.trim().toLowerCase());
  }

  function createShipment(data: ShipmentFormData): Shipment {
    const truck = truckSnapshot(data.truckId) ?? { nomorUnit: "-", jenis: "-" };
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
      layanan: data.layanan,
      beratKg: data.beratKg,
      fotoBarang: data.fotoBarang,
      truck,
      truckId: data.truckId,
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
          inputBy: profile.nama,
          inputAt: nowISO(),
        },
      ],
    };
    setShipments((prev) => [newShipment, ...prev]);

    addLog({
      userName: profile.nama,
      role: profile.role,
      action: "CREATE_AWB",
      actionLabel: "CREATE AWB",
      module: "Shipment",
      awb,
      description: `Resi diterbitkan untuk pengiriman ${data.kotaAsal} -> ${data.kotaTujuan}.`,
    });
    const notif = addNotification({
      awb,
      trigger: "AWB_CREATED",
      subject: `Resi Pengiriman Anda - AWB ${awb}`,
      toEmail: data.penerima.email,
      toName: data.penerima.nama,
      recipientRole: "penerima",
    });
    addLog({
      userName: "System",
      role: profile.role,
      action: "SEND_NOTIFICATION",
      actionLabel: "SEND NOTIFICATION",
      module: "Notification",
      awb,
      description: `Notifikasi "${notif.subject}" dibuat untuk customer.`,
    });

    return newShipment;
  }

  function markEmailSent(awb: string) {
    setShipments((prev) =>
      prev.map((s) => (s.awb === awb ? { ...s, emailTerkirim: true, emailTerkirimAt: nowISO() } : s)),
    );
  }

  function addTrackingUpdate(data: TrackingUpdateFormData) {
    const target = shipments.find((s) => s.awb === data.awb);
    if (!target) return;

    const truck = truckSnapshot(data.truckId);
    const isTransfer = data.type === "Transfer Unit";
    const isKendala = data.type === "Kendala";
    const isSelesai = data.type === "Selesai / Terkirim";
    const newStatus = eventTypeToShipmentStatus(data.type);

    const newEvent = {
      id: `${data.awb}-t${target.timeline.length + 1}-${Date.now()}`,
      type: data.type,
      lokasi: data.lokasi,
      titikId: data.titikId,
      tanggal: data.tanggal,
      jam: data.jam,
      keterangan: data.keterangan,
      foto: data.foto && data.foto.length > 0 ? data.foto : undefined,
      truck,
      truckId: data.truckId,
      truckSebelumnya: isTransfer ? target.truck : undefined,
      inputBy: profile.nama,
      inputAt: nowISO(),
    };

    setShipments((prev) =>
      prev.map((s) => {
        if (s.awb !== data.awb) return s;
        return {
          ...s,
          status: newStatus,
          truck: truck ?? s.truck,
          truckId: data.truckId ?? s.truckId,
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

    if (isTransfer) {
      addLog({
        userName: profile.nama,
        role: profile.role,
        action: "TRANSFER_TRUCK",
        actionLabel: "TRANSFER TRUCK",
        module: "Shipment",
        awb: data.awb,
        description: `Truck: ${target.truck.nomorUnit} -> ${truck?.nomorUnit ?? "-"} di ${data.lokasi}.`,
      });
    } else if (isKendala) {
      addLog({
        userName: profile.nama,
        role: profile.role,
        action: "ADD_ISSUE",
        actionLabel: "ADD ISSUE",
        module: "Shipment",
        awb: data.awb,
        description: `Kendala dicatat: ${data.keterangan}`,
      });
    } else if (isSelesai) {
      addLog({
        userName: profile.nama,
        role: profile.role,
        action: "UPLOAD_POD",
        actionLabel: "UPLOAD POD",
        module: "Shipment",
        awb: data.awb,
        description: "Foto barang diterima dan surat jalan diunggah sebagai bukti serah terima.",
      });
      addLog({
        userName: profile.nama,
        role: profile.role,
        action: "CLOSE_SHIPMENT",
        actionLabel: "CLOSE SHIPMENT",
        module: "Shipment",
        awb: data.awb,
        description: `Status berubah: ${target.status} -> Selesai / Terkirim. Data dikunci.`,
      });
    } else {
      addLog({
        userName: profile.nama,
        role: profile.role,
        action: "UPDATE_STATUS",
        actionLabel: "UPDATE STATUS",
        module: "Shipment",
        awb: data.awb,
        description: `Status berubah: ${target.status} -> ${newStatus} (${data.lokasi}).`,
      });
    }

    if (isKendala || isSelesai) {
      const notif = addNotification({
        awb: data.awb,
        trigger: isKendala ? "KENDALA" : "SELESAI",
        subject: isKendala
          ? `Update Pengiriman - Terdapat Kendala (AWB ${data.awb})`
          : `Pengiriman Anda Telah Selesai (AWB ${data.awb})`,
        toEmail: target.penerima.email,
        toName: target.penerima.nama,
        recipientRole: "penerima",
      });
      addLog({
        userName: "System",
        role: profile.role,
        action: "SEND_NOTIFICATION",
        actionLabel: "SEND NOTIFICATION",
        module: "Notification",
        awb: data.awb,
        description: `Notifikasi "${notif.subject}" dibuat untuk customer.`,
      });
    }
  }

  function resetToMockData() {
    setShipments(initialShipments);
  }

  const value: ShipmentContextValue = {
    shipments,
    getByAwb,
    createShipment,
    markEmailSent,
    addTrackingUpdate,
    resetToMockData,
  };

  return <ShipmentContext.Provider value={value}>{children}</ShipmentContext.Provider>;
}

export function useShipments() {
  const ctx = useContext(ShipmentContext);
  if (!ctx) throw new Error("useShipments must be used within ShipmentProvider");
  return ctx;
}
