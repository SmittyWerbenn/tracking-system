export type ShipmentStatus =
  | "Dalam Persiapan"
  | "Berangkat"
  | "Transit"
  | "Dalam Perjalanan"
  | "Kendala"
  | "Tiba di Tujuan"
  | "Selesai / Terkirim";

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

export interface TruckInfo {
  nomorUnit: string;
  jenis: string;
  driver?: string;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  lokasi: string;
  tanggal: string; // ISO date, e.g. 2026-09-11
  jam: string; // HH:mm
  keterangan: string;
  foto?: string[];
  truck?: TruckInfo;
  truckSebelumnya?: TruckInfo;
  inputBy?: string;
  inputAt?: string; // system timestamp ISO
}

export interface ProofOfDelivery {
  tanggal: string;
  jam: string;
  lokasi: string;
  fotoBarang: string;
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
  fotoBarang?: string;
  truck: TruckInfo;
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
  fotoBarang?: string;
  truck: TruckInfo;
}

export interface TrackingUpdateFormData {
  awb: string;
  type: TimelineEventType;
  lokasi: string;
  tanggal: string;
  jam: string;
  keterangan: string;
  foto?: string[];
  nomorUnit?: string;
  jenisTruck?: string;
  driver?: string;
}
