// Driver-portal API calls (see api-worker/src/routes/driver.ts). Every
// endpoint here is scoped server-side to the logged-in driver's own
// shipments - never pass an AWB the driver doesn't already have in hand.
import { api } from "./apiClient";

export interface DriverShipmentSummary {
  awb: string;
  status: string;
  penerima: { nama: string; telepon: string };
  alamatAsal: string;
  kotaAsal: string;
  alamatTujuan: string;
  kotaTujuan: string;
  deskripsiBarang: string;
  layanan: string;
  beratKg: number;
  jumlahKoli: number;
  truckNomorUnit: string | null;
}

export interface DriverTimelineEvent {
  id: string;
  type: string;
  lokasi: string;
  tanggal: string;
  jam: string;
  keterangan: string;
  input_at: string;
}

export interface DriverShipmentDetail {
  shipment: DriverShipmentSummary;
  timeline: DriverTimelineEvent[];
}

export interface DriverLastPosition {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  created_at: string;
}

export async function fetchDriverShipments(): Promise<DriverShipmentSummary[]> {
  const res = await api.get<{ items: DriverShipmentSummary[] }>("/api/driver/shipments");
  return res.items;
}

export async function fetchDriverShipmentDetail(awb: string): Promise<DriverShipmentDetail> {
  return api.get<DriverShipmentDetail>(`/api/driver/shipments/${encodeURIComponent(awb)}`);
}

export async function reportDriverPosition(
  awb: string,
  coords: { latitude: number; longitude: number; accuracy?: number },
): Promise<void> {
  await api.post(`/api/driver/shipments/${encodeURIComponent(awb)}/position`, coords);
}

export async function fetchDriverLastPosition(awb: string): Promise<DriverLastPosition | null> {
  const res = await api.get<{ lastPosition: DriverLastPosition | null }>(
    `/api/driver/shipments/${encodeURIComponent(awb)}/position`,
  );
  return res.lastPosition;
}
