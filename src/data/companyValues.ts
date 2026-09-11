import { PackageCheck, ShieldCheck, Truck, type LucideIcon } from "lucide-react";

export interface CompanyValue {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export const COMPANY_VALUES: CompanyValue[] = [
  {
    icon: ShieldCheck,
    title: "Transparan",
    desc: "Setiap pengiriman dapat dipantau customer secara mandiri melalui resi digital dan tracking real-time.",
  },
  {
    icon: PackageCheck,
    title: "Terpercaya",
    desc: "Setiap update status divalidasi oleh tim internal kami, mulai dari penerimaan hingga serah terima barang.",
  },
  {
    icon: Truck,
    title: "Handal",
    desc: "Didukung armada dan mitra transportasi di berbagai kota untuk menjangkau tujuan pengiriman Anda.",
  },
];
