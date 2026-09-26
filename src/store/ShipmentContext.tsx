import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type {
  Shipment,
  ShipmentFormData,
  ShipmentStatus,
  TimelineEvent,
  TimelineEventType,
  TrackingUpdateFormData,
  UpdateShipmentInfoData,
} from "../types";
import { api, ApiError, uploadFile } from "../utils/apiClient";
import { resolveFileUrls, type FileRef } from "../utils/resolveFiles";
import { useAuth } from "./AuthContext";

interface RawShipmentSummary {
  awb: string;
  tanggalDibuat: string;
  jamDibuat: string;
  status: ShipmentStatus;
  pengirim: { nama: string; telepon: string; email: string };
  penerima: { nama: string; telepon: string; email: string };
  alamatAsal: string;
  kotaAsal: string;
  alamatTujuan: string;
  kotaTujuan: string;
  deskripsiBarang: string;
  layanan: Shipment["layanan"];
  beratKg: number;
  jumlahKoli: number;
  truckId: string | null;
  truckNomorUnit: string | null;
  truckJenis: string | null;
  truckDriverNama: string | null;
  emailTerkirim: boolean;
  emailTerkirimAt: string | null;
  slaValue: number | null;
  slaUnit: string | null;
  estimasiTiba: string | null;
  pod: { tanggal: string; jam: string; namaPenerima: string } | null;
  lastUpdate: { tanggal: string; jam: string } | null;
}

interface RawTimelineRow {
  id: string;
  type: TimelineEventType;
  lokasi: string;
  titik_id: string | null;
  tanggal: string;
  jam: string;
  keterangan: string;
  truck_id: string | null;
  truck_nomor_unit: string | null;
  truck_driver_nama: string | null;
  truck_sebelumnya_nomor_unit: string | null;
  input_by_name: string | null;
  input_at: string;
}

interface RawPodRow {
  tanggal: string;
  jam: string;
  lokasi: string;
  nama_penerima: string;
  catatan: string | null;
}

function toShipment(row: RawShipmentSummary): Shipment {
  return {
    awb: row.awb,
    tanggalDibuat: row.tanggalDibuat,
    jamDibuat: row.jamDibuat,
    status: row.status,
    pengirim: row.pengirim,
    penerima: row.penerima,
    alamatAsal: row.alamatAsal,
    kotaAsal: row.kotaAsal,
    alamatTujuan: row.alamatTujuan,
    kotaTujuan: row.kotaTujuan,
    deskripsiBarang: row.deskripsiBarang,
    layanan: row.layanan,
    beratKg: row.beratKg,
    jumlahKoli: row.jumlahKoli,
    truck: {
      nomorUnit: row.truckNomorUnit ?? "-",
      jenis: row.truckJenis ?? "-",
      driver: row.truckDriverNama ?? undefined,
    },
    truckId: row.truckId ?? undefined,
    timeline: row.lastUpdate
      ? [{ id: "last", type: row.status as TimelineEventType, lokasi: "", tanggal: row.lastUpdate.tanggal, jam: row.lastUpdate.jam, keterangan: "" }]
      : [],
    pod: row.pod
      ? { tanggal: row.pod.tanggal, jam: row.pod.jam, namaPenerima: row.pod.namaPenerima, lokasi: "", fotoSuratJalan: "" }
      : undefined,
    emailTerkirim: row.emailTerkirim,
    emailTerkirimAt: row.emailTerkirimAt ?? undefined,
    slaValue: row.slaValue ?? undefined,
    slaUnit: row.slaUnit ?? undefined,
    estimasiTiba: row.estimasiTiba ?? undefined,
  };
}

function toTimelineEvent(row: RawTimelineRow, fotoUrls: string[]): TimelineEvent {
  return {
    id: row.id,
    type: row.type,
    lokasi: row.lokasi,
    titikId: row.titik_id ?? undefined,
    tanggal: row.tanggal,
    jam: row.jam,
    keterangan: row.keterangan,
    foto: fotoUrls.length > 0 ? fotoUrls : undefined,
    truck: row.truck_nomor_unit ? { nomorUnit: row.truck_nomor_unit, jenis: "-", driver: row.truck_driver_nama ?? undefined } : undefined,
    truckId: row.truck_id ?? undefined,
    truckSebelumnya: row.truck_sebelumnya_nomor_unit ? { nomorUnit: row.truck_sebelumnya_nomor_unit, jenis: "-" } : undefined,
    inputBy: row.input_by_name ?? undefined,
    inputAt: row.input_at,
  };
}

interface ShipmentDetailResponse {
  shipment: RawShipmentSummary;
  timeline: RawTimelineRow[];
  pod: RawPodRow | null;
  files: FileRef[];
}

interface ShipmentListResponse {
  items: RawShipmentSummary[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ShipmentListParams {
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}

interface ShipmentContextValue {
  shipments: Shipment[];
  isLoading: boolean;
  listMeta: { total: number; totalPages: number; page: number };
  refresh: (params?: ShipmentListParams) => Promise<void>;
  getByAwb: (awb: string) => Promise<Shipment | null>;
  createShipment: (data: ShipmentFormData) => Promise<{ awb: string }>;
  markEmailSent: (awb: string) => void;
  addTrackingUpdate: (data: TrackingUpdateFormData) => Promise<{ ok: true } | { ok: false; error: string }>;
  updateShipmentInfo: (awb: string, data: UpdateShipmentInfoData) => Promise<{ ok: true } | { ok: false; error: string }>;
  updatePodPhoto: (awb: string, slot: "barang" | "suratJalan", fotoDataUrl: string | undefined) => Promise<void>;
}

const ShipmentContext = createContext<ShipmentContextValue | null>(null);

export function ShipmentProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listMeta, setListMeta] = useState({ total: 0, totalPages: 1, page: 1 });

  async function refresh(params: ShipmentListParams = {}) {
    setIsLoading(true);
    try {
      const search = new URLSearchParams();
      search.set("limit", String(params.limit ?? 100));
      search.set("page", String(params.page ?? 1));
      if (params.status) search.set("status", params.status);
      if (params.q) search.set("q", params.q);

      const res = await api.get<ShipmentListResponse>(`/api/shipments?${search.toString()}`);
      setShipments(res.items.map(toShipment));
      setListMeta({ total: res.meta.total, totalPages: res.meta.totalPages, page: res.meta.page });
    } catch {
      setShipments([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) refresh();
    else setShipments([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  async function getByAwb(awb: string): Promise<Shipment | null> {
    try {
      const res = await api.get<ShipmentDetailResponse>(`/api/shipments/${encodeURIComponent(awb)}`);
      const urlMap = await resolveFileUrls(res.files);
      const fotoBarangUrls = urlMap.get(`shipment_photo:${res.shipment.awb}`) ?? [];
      const fotoSuratJalanUrls = urlMap.get(`shipment_surat_jalan:${res.shipment.awb}`) ?? [];
      const podBarangUrls = urlMap.get(`pod_barang:${res.shipment.awb}`) ?? [];
      const podSuratJalanUrls = urlMap.get(`pod_surat_jalan:${res.shipment.awb}`) ?? [];

      const timeline = res.timeline.map((row) => toTimelineEvent(row, urlMap.get(`timeline_photo:${row.id}`) ?? []));

      return {
        ...toShipment(res.shipment),
        fotoBarang: fotoBarangUrls[0],
        fotoSuratJalan: fotoSuratJalanUrls[0],
        timeline,
        pod: res.pod
          ? {
              tanggal: res.pod.tanggal,
              jam: res.pod.jam,
              lokasi: res.pod.lokasi,
              namaPenerima: res.pod.nama_penerima,
              catatan: res.pod.catatan ?? undefined,
              fotoBarang: podBarangUrls[0],
              fotoSuratJalan: podSuratJalanUrls[0] ?? "",
            }
          : undefined,
      };
    } catch {
      return null;
    }
  }

  async function createShipment(data: ShipmentFormData): Promise<{ awb: string }> {
    const res = await api.post<{ awb: string }>("/api/shipments", {
      pengirimNama: data.pengirim.nama,
      pengirimTelepon: data.pengirim.telepon,
      pengirimEmail: data.pengirim.email,
      penerimaNama: data.penerima.nama,
      penerimaTelepon: data.penerima.telepon,
      penerimaEmail: data.penerima.email,
      alamatAsal: data.alamatAsal,
      kotaAsal: data.kotaAsal,
      alamatTujuan: data.alamatTujuan,
      kotaTujuan: data.kotaTujuan,
      deskripsiBarang: data.deskripsiBarang,
      layanan: data.layanan,
      beratKg: data.beratKg,
      jumlahKoli: data.jumlahKoli,
      truckId: data.truckId || undefined,
      slaValue: data.slaValue,
    });

    if (data.fotoBarang) {
      await uploadFile(data.fotoBarang, "shipment_photo", res.awb).catch(() => {});
    }
    if (data.fotoSuratJalan) {
      await uploadFile(data.fotoSuratJalan, "shipment_surat_jalan", res.awb).catch(() => {});
    }

    await refresh();
    return res;
  }

  function markEmailSent(awb: string) {
    setShipments((prev) => prev.map((s) => (s.awb === awb ? { ...s, emailTerkirim: true, emailTerkirimAt: new Date().toISOString() } : s)));
  }

  async function addTrackingUpdate(data: TrackingUpdateFormData) {
    try {
      const isSelesai = data.type === "Selesai / Terkirim";
      const res = await api.post<{ eventId: string }>(`/api/shipments/${encodeURIComponent(data.awb)}/timeline`, {
        type: data.type,
        lokasi: data.lokasi,
        titikId: data.titikId,
        tanggal: data.tanggal,
        jam: data.jam,
        keterangan: data.keterangan,
        truckId: data.truckId,
        namaPenerima: data.namaPenerima,
      });

      if (data.foto && data.foto.length > 0) {
        if (isSelesai) {
          await uploadFile(data.foto[0], "pod_barang", data.awb).catch(() => {});
          await uploadFile(data.foto[1] ?? data.foto[0], "pod_surat_jalan", data.awb).catch(() => {});
        } else {
          await Promise.all(data.foto.map((f) => uploadFile(f, "timeline_photo", res.eventId).catch(() => {})));
        }
      }

      await refresh();
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: err instanceof ApiError ? err.message : "Gagal menyimpan update tracking." };
    }
  }

  async function updateShipmentInfo(awb: string, data: UpdateShipmentInfoData) {
    try {
      await api.patch(`/api/shipments/${encodeURIComponent(awb)}`, {
        pengirimNama: data.pengirim.nama,
        pengirimTelepon: data.pengirim.telepon,
        pengirimEmail: data.pengirim.email,
        penerimaNama: data.penerima.nama,
        penerimaTelepon: data.penerima.telepon,
        penerimaEmail: data.penerima.email,
        alamatAsal: data.alamatAsal,
        kotaAsal: data.kotaAsal,
        alamatTujuan: data.alamatTujuan,
        kotaTujuan: data.kotaTujuan,
        ...(data.slaValue !== undefined ? { slaValue: data.slaValue } : {}),
      });
      await refresh();
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: err instanceof ApiError ? err.message : "Gagal menyimpan perubahan." };
    }
  }

  async function updatePodPhoto(awb: string, slot: "barang" | "suratJalan", fotoDataUrl: string | undefined) {
    if (!fotoDataUrl) return;
    const entityType = slot === "suratJalan" ? "pod_surat_jalan" : "pod_barang";
    const uploaded = await uploadFile(fotoDataUrl, entityType, awb);
    await api.patch(`/api/shipments/${encodeURIComponent(awb)}/pod-photo`, { fotoFileId: uploaded.id, slot });
  }

  return (
    <ShipmentContext.Provider
      value={{ shipments, isLoading, listMeta, refresh, getByAwb, createShipment, markEmailSent, addTrackingUpdate, updateShipmentInfo, updatePodPhoto }}
    >
      {children}
    </ShipmentContext.Provider>
  );
}

export function useShipments() {
  const ctx = useContext(ShipmentContext);
  if (!ctx) throw new Error("useShipments must be used within ShipmentProvider");
  return ctx;
}
