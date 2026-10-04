export type ShipmentStatus =
  | "Dalam Persiapan"
  | "Berangkat"
  | "Transit"
  | "Dalam Perjalanan"
  | "Kendala"
  | "Tiba di Tujuan"
  | "Selesai / Terkirim"
  | "Dibatalkan";

/** A Master Layanan name (e.g. "Regular", "LTL", or any custom layanan) - the
 * valid set is managed in Master Layanan and enforced by the API. */
export type LayananPengiriman = string;

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
  fotoSuratJalan?: string;
  truck: TruckInfo;
  truckId?: string; // links to Truck master data
  /** Client ID this shipment is tagged to - mandatory on every
   * shipment, scopes visibility for Client accounts server-side. */
  customerId?: string | null;
  /** Kode Mitra this shipment has been forwarded/assigned to, if any -
   * scopes visibility for Mitra accounts server-side. Independent of
   * truckId: Client -> Shipment -> Mitra -> Driver. */
  mitraId?: string | null;
  mitraNama?: string | null;
  timeline: TimelineEvent[];
  pod?: ProofOfDelivery;
  emailTerkirim: boolean;
  emailTerkirimAt?: string;
  /** Admin only ever sets slaValue/slaUnit - estimasiTiba is always derived
   * server-side from those + tanggalDibuat, never entered directly. */
  slaValue?: number;
  slaUnit?: string;
  estimasiTiba?: string; // ISO date, ditampilkan ke customer bila tersedia
  /** Set while a driver has requested to claim this (still-unassigned)
   * shipment and is waiting for admin to confirm or reject it. */
  claimStatus?: "pending";
  claimDriverNama?: string;
  claimDriverTelepon?: string;
  claimRequestedAt?: string;
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
  fotoSuratJalan?: string;
  /** Optional - leave empty to create an unassigned ("Pesanan Terbuka")
   * shipment any driver can request to claim. */
  truckId?: string;
  /** SLA in business days; ETA is calculated server-side from this. */
  slaValue?: number;
  /** Client ID - mandatory. A Client's value is ignored by the
   * server and force-replaced with its own; other creator roles must
   * supply one explicitly. */
  customerId?: string;
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
  /** Omit to leave the layanan untouched; a changed value must be an active
   * Master Layanan entry (the API rejects anything else). */
  layanan?: LayananPengiriman;
  /** Omit to leave SLA/ETA untouched; pass a number to set/change it, or
   * null to clear it - either recalculates estimasiTiba server-side. */
  slaValue?: number | null;
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
  /** "Kota / Kabupaten" - also the value order forms/tracking store as city. */
  namaKota: string;
  /** Provinsi (optional). */
  provinsi: string;
  /** Nama Titik Transit. Empty for legacy rows that haven't been re-imported yet. */
  namaTitik: string;
  /** Optional code (e.g. province code). */
  kodeKota: string;
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
export type UserRole = "Superadmin" | "Admin" | "Driver" | "Viewer" | "Client" | "Mitra";

/** Roles assignable to OTHER team members via Manajemen User - Superadmin
 * itself isn't assignable there, it's the single account signed in. */
export const ASSIGNABLE_USER_ROLES: UserRole[] = ["Admin", "Driver", "Viewer", "Client", "Mitra"];

/** Display-only label for a role - the underlying value stays "Admin"
 * everywhere in code/DB/API (permission checks, ROLES arrays, etc.); only
 * user-facing text should route through this, to show "GMS-Admin" instead
 * without touching any functional role comparison. */
const ROLE_DISPLAY_LABEL: Record<UserRole, string> = {
  Superadmin: "Superadmin",
  Admin: "GMS-Admin",
  Driver: "Driver",
  Viewer: "Viewer",
  "Client": "Client",
  Mitra: "Mitra",
};

export function roleLabel(role: UserRole): string {
  return ROLE_DISPLAY_LABEL[role];
}

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
  /** Client ID - set only for role "Client", scopes that account
   * to just its own customer's shipments. */
  customerId?: string | null;
  /** Kode Mitra - set only for role "Mitra", scopes that account to just
   * the shipments forwarded/assigned to this Mitra. */
  mitraId?: string | null;
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
  | "CANCEL_SHIPMENT"
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
  isRead: boolean;
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
