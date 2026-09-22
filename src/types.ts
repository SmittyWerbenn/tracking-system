export type ShipmentStatus =
  | "Dalam Persiapan"
  | "Berangkat"
  | "Transit"
  | "Dalam Perjalanan"
  | "Kendala"
  | "Tiba di Tujuan"
  | "Selesai / Terkirim";

export type LayananPengiriman = "Reguler" | "Express" | "Kargo";

export type TimelineEventType =
  | "Barang Diterima"
  | "Berangkat"
  | "Transit"
  | "Dalam Perjalanan"
  | "Kendala"
  | "Transfer Unit"
  | "Tiba di Tujuan"
  | "Selesai / Terkirim";

export interface PersonInfo {
  nama: string;
  telepon: string;
  email: string;
}

/** Snapshot of a truck/driver as it was at a point in time (embedded in a
 * timeline event). See `Truck` for the master-data record it's sourced from. */
export interface TruckInfo {
  nomorUnit: string;
  jenis: string;
  driver?: string;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  lokasi: string;
  titikId?: string; // links to TitikLokasi master data, when chosen from it
  tanggal: string; // ISO date, e.g. 2026-09-11
  jam: string; // HH:mm
  keterangan: string;
  foto?: string[];
  truck?: TruckInfo;
  truckId?: string; // links to Truck master data, when chosen from it
  truckSebelumnya?: TruckInfo;
  inputBy?: string;
  inputAt?: string; // system timestamp ISO
}

export interface ProofOfDelivery {
  tanggal: string;
  jam: string;
  lokasi: string;
  fotoBarang?: string;
  fotoSuratJalan: string;
  namaPenerima: string;
  catatan?: string;
}

export interface Shipment {
  awb: string;
  tanggalDibuat: string; // ISO date
  jamDibuat: string;
  status: ShipmentStatus;
  pengirim: PersonInfo;
  penerima: PersonInfo;
  alamatAsal: string;
  kotaAsal: string;
  alamatTujuan: string;
  kotaTujuan: string;
  deskripsiBarang: string;
  layanan: LayananPengiriman;
  beratKg: number;
  jumlahKoli: number;
  fotoBarang?: string;
  truck: TruckInfo;
  truckId?: string; // links to Truck master data
  timeline: TimelineEvent[];
  pod?: ProofOfDelivery;
  emailTerkirim: boolean;
  emailTerkirimAt?: string;
  estimasiTiba?: string; // ISO date, ditampilkan ke customer bila tersedia
}

export interface ShipmentFormData {
  pengirim: PersonInfo;
  penerima: PersonInfo;
  alamatAsal: string;
  kotaAsal: string;
  alamatTujuan: string;
  kotaTujuan: string;
  deskripsiBarang: string;
  layanan: LayananPengiriman;
  beratKg: number;
  jumlahKoli: number;
  fotoBarang?: string;
  truckId: string;
}

export interface TrackingUpdateFormData {
  awb: string;
  type: TimelineEventType;
  lokasi: string;
  titikId?: string;
  tanggal: string;
  jam: string;
  keterangan: string;
  foto?: string[];
  truckId?: string;
}

export interface UpdateShipmentInfoData {
  pengirim: PersonInfo;
  penerima: PersonInfo;
  alamatAsal: string;
  kotaAsal: string;
  alamatTujuan: string;
  kotaTujuan: string;
}

// ---------------------------------------------------------------------------
// Master Armada (Truck / Driver)
// ---------------------------------------------------------------------------

export type ArmadaStatus = "Available" | "On Trip" | "Maintenance" | "Inactive";

export interface Driver {
  id: string;
  nama: string;
  telepon: string;
}

export interface Truck {
  id: string;
  nomorUnit: string;
  jenis: string;
  kapasitas: string;
  driverId: string;
  status: ArmadaStatus;
  keterangan?: string;
}

// ---------------------------------------------------------------------------
// Master Kota / Titik Transit
// ---------------------------------------------------------------------------

export type TitikJenis = "Gudang" | "Hub" | "Transit" | "Cabang" | "Tujuan";

export interface TitikLokasi {
  id: string;
  namaKota: string;
  kodeKota: string;
  provinsi: string;
  jenis: TitikJenis;
  aktif: boolean;
}

// ---------------------------------------------------------------------------
// Multi-role user management
// ---------------------------------------------------------------------------

export type UserRole = "Admin" | "Management";

export interface AppUser {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  aktif: boolean;
  lastLogin?: string;
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export type AuditAction =
  | "CREATE_AWB"
  | "UPDATE_STATUS"
  | "UPDATE_TRUCK"
  | "TRANSFER_TRUCK"
  | "ADD_ISSUE"
  | "UPLOAD_POD"
  | "CLOSE_SHIPMENT"
  | "SEND_NOTIFICATION"
  | "CREATE_TRUCK"
  | "UPDATE_TRUCK_MASTER"
  | "CREATE_LOCATION"
  | "UPDATE_LOCATION"
  | "CREATE_USER"
  | "UPDATE_USER"
  | "UPDATE_SHIPMENT_INFO"
  | "UPDATE_POD_PHOTO";

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO
  userName: string;
  role: UserRole;
  action: AuditAction;
  actionLabel: string; // human readable, e.g. "UPDATE STATUS"
  module: string; // e.g. "Shipment", "Master Armada", "Master Kota", "User"
  awb?: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Notification center (mock email triggers)
// ---------------------------------------------------------------------------

export type NotificationTrigger = "AWB_CREATED" | "KENDALA" | "SELESAI";

export interface NotificationItem {
  id: string;
  awb: string;
  trigger: NotificationTrigger;
  subject: string;
  toEmail: string;
  toName: string;
  recipientRole: "penerima" | "pengirim";
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Customer feedback
// ---------------------------------------------------------------------------

export interface Feedback {
  id: string;
  awb: string;
  customerName: string;
  rating: number; // 1-5
  comment?: string;
  submittedAt: string;
}
