export type ShipmentStatus =
  | "Dalam Persiapan"
  | "Berangkat"
  | "Transit"
  | "Dalam Perjalanan"
  | "Kendala"
  | "Tiba di Tujuan"
  | "Selesai / Terkirim";

export type LayananPengiriman = "Darat" | "Express" | "Kargo" | "Regular" | "Charter";

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
  /** Who actually signed for/received the package - only captured (and
   * required) when type is "Selesai / Terkirim"; can differ from the
   * shipment's named penerima (e.g. a colleague receiving on their behalf). */
  namaPenerima?: string;
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

/** Superadmin: full access, including managing other users. Admin: can
 * create/edit shipments, fleet, locations, etc. but not manage users.
 * Driver: can only open Update Tracking to log an in-transit status or mark
 * a shipment as delivered - no access to create shipments, fleet/location
 * master data, settings, or user management. Viewer: read-only everywhere. */
export type UserRole = "Superadmin" | "Admin" | "Driver" | "Viewer";

/** Roles assignable to OTHER team members via Manajemen User - Superadmin
 * itself isn't assignable there, it's the single account signed in. */
export const ASSIGNABLE_USER_ROLES: UserRole[] = ["Admin", "Driver", "Viewer"];

export interface AppUser {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  aktif: boolean;
  lastLogin?: string;
  /** File id of the user's avatar (see api-worker's `files` table) -
   * resolve to a viewable URL with `useFileUrl`, never a raw image itself. */
  foto?: string;
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
  | "UPDATE_POD_PHOTO"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "PASSWORD_CHANGED"
  | "FILE_UPLOADED"
  | "FILE_DELETED";

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
