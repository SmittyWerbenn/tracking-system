import { initialTitikLokasi, initialTrucks } from "./masterData";
import { photos } from "../utils/photos";
import type { LayananPengiriman, PersonInfo, Shipment, ShipmentStatus, TruckInfo } from "../types";

/** Parses the "(total 85kg)" style weight already embedded in deskripsiBarang. */
function deriveBeratKg(deskripsiBarang: string): number {
  const match = deskripsiBarang.match(/(\d+)\s*kg/i);
  return match ? Number(match[1]) : 10;
}

/** Parses the "3 dus" / "2 palet" / "4 koli" style quantity already embedded
 * in deskripsiBarang (the count of packages/koli making up the shipment). */
function deriveJumlahKoli(deskripsiBarang: string): number {
  const match = deskripsiBarang.match(/,\s*(\d+)\s*(?:dus|box|palet|item|unit|koli|drum)/i);
  return match ? Number(match[1]) : 1;
}

function deriveLayanan(beratKg: number): LayananPengiriman {
  if (beratKg <= 50) return "Express";
  if (beratKg <= 150) return "Reguler";
  return "Kargo";
}

// ---------------------------------------------------------------------------
// 3 AWB utama (dipakai untuk demo flow detail: transfer unit & POD lengkap)
// ---------------------------------------------------------------------------
const featuredShipments: Shipment[] = [
  {
    awb: "GMS-20260911-0001",
    tanggalDibuat: "2026-09-11",
    jamDibuat: "08:30",
    status: "Dalam Perjalanan",
    estimasiTiba: "2026-09-13",
    pengirim: {
      nama: "Hendra Wijaya",
      telepon: "0812-3456-7890",
      email: "hendra.wijaya@example.com",
    },
    penerima: {
      nama: "Siti Rahmawati",
      telepon: "0813-9988-2211",
      email: "siti.rahmawati@example.com",
    },
    alamatAsal: "Jl. Raya Cakung No. 88, Cakung",
    kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Diponegoro No. 45, Gubeng",
    kotaTujuan: "Surabaya",
    deskripsiBarang: "Spare part mesin industri, 3 dus (total 85kg)",
    layanan: "Reguler",
    beratKg: 85,
    jumlahKoli: 3,
    fotoBarang: photos.barangDiterima,
    truck: { nomorUnit: "L 8877 ABC", jenis: "CDD", driver: "Slamet Riyadi" },
    emailTerkirim: true,
    emailTerkirimAt: "2026-09-11T08:35:00.000Z",
    timeline: [
      {
        id: "t1-1",
        type: "Barang Diterima",
        lokasi: "Gudang Jakarta",
        tanggal: "2026-09-11",
        jam: "08:30",
        keterangan: "Barang diterima dan siap dikirim.",
        foto: [photos.barangDiterima],
        inputBy: "Admin - Dewi",
        inputAt: "2026-09-11T08:32:00.000Z",
      },
      {
        id: "t1-2",
        type: "Berangkat",
        lokasi: "Jakarta",
        tanggal: "2026-09-11",
        jam: "12:45",
        keterangan: "Barang berangkat dari gudang Jakarta menuju Surabaya.",
        foto: [photos.truckWingboxA],
        truck: { nomorUnit: "B 9123 XYZ", jenis: "Wingbox", driver: "Budi Santoso" },
        inputBy: "Admin - Dewi",
        inputAt: "2026-09-11T12:50:00.000Z",
      },
      {
        id: "t1-3",
        type: "Transit",
        lokasi: "Cirebon",
        tanggal: "2026-09-11",
        jam: "18:20",
        keterangan: "Barang tiba di titik transit Cirebon.",
        foto: [photos.transitLokasi],
        truck: { nomorUnit: "B 9123 XYZ", jenis: "Wingbox", driver: "Budi Santoso" },
        inputBy: "Admin - Dewi",
        inputAt: "2026-09-11T18:25:00.000Z",
      },
      {
        id: "t1-4",
        type: "Transfer Unit",
        lokasi: "Semarang",
        tanggal: "2026-09-12",
        jam: "09:15",
        keterangan:
          "Barang dipindahkan ke unit berikutnya untuk melanjutkan perjalanan menuju Surabaya.",
        foto: [photos.truckCddA],
        truck: { nomorUnit: "L 8877 ABC", jenis: "CDD", driver: "Slamet Riyadi" },
        truckSebelumnya: { nomorUnit: "B 9123 XYZ", jenis: "Wingbox", driver: "Budi Santoso" },
        inputBy: "Admin - Rian",
        inputAt: "2026-09-12T09:20:00.000Z",
      },
      {
        id: "t1-5",
        type: "Dalam Perjalanan",
        lokasi: "Semarang",
        tanggal: "2026-09-12",
        jam: "14:00",
        keterangan: "Barang melanjutkan perjalanan menuju Surabaya.",
        foto: [photos.truckCddB],
        truck: { nomorUnit: "L 8877 ABC", jenis: "CDD", driver: "Slamet Riyadi" },
        inputBy: "Admin - Rian",
        inputAt: "2026-09-12T14:05:00.000Z",
      },
    ],
  },
  {
    awb: "GMS-20260911-0002",
    tanggalDibuat: "2026-09-11",
    jamDibuat: "09:00",
    status: "Transit",
    estimasiTiba: "2026-09-12",
    pengirim: {
      nama: "PT Sumber Makmur Abadi",
      telepon: "021-5551234",
      email: "logistik@sumbermakmur.co.id",
    },
    penerima: {
      nama: "Agus Setiawan",
      telepon: "0857-1122-3344",
      email: "agus.setiawan@example.com",
    },
    alamatAsal: "Jl. Industri Raya No. 12, Pulogadung",
    kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Soekarno Hatta No. 210, Buah Batu",
    kotaTujuan: "Bandung",
    deskripsiBarang: "Dokumen kontrak & sample produk tekstil, 1 box (12kg)",
    layanan: "Express",
    beratKg: 12,
    jumlahKoli: 1,
    fotoBarang: photos.gudangWorker,
    truck: { nomorUnit: "D 7788 QRS", jenis: "Box", driver: "Andi Firmansyah" },
    emailTerkirim: true,
    emailTerkirimAt: "2026-09-11T09:05:00.000Z",
    timeline: [
      {
        id: "t2-1",
        type: "Barang Diterima",
        lokasi: "Gudang Jakarta",
        tanggal: "2026-09-11",
        jam: "09:00",
        keterangan: "Barang diterima dan siap dikirim.",
        foto: [photos.barangDiterima],
        inputBy: "Admin - Dewi",
        inputAt: "2026-09-11T09:02:00.000Z",
      },
      {
        id: "t2-2",
        type: "Berangkat",
        lokasi: "Jakarta",
        tanggal: "2026-09-11",
        jam: "11:00",
        keterangan: "Barang berangkat dari gudang Jakarta menuju Bandung.",
        foto: [photos.truckCddA],
        truck: { nomorUnit: "D 7788 QRS", jenis: "Box", driver: "Andi Firmansyah" },
        inputBy: "Admin - Dewi",
        inputAt: "2026-09-11T11:05:00.000Z",
      },
      {
        id: "t2-3",
        type: "Transit",
        lokasi: "Purwakarta",
        tanggal: "2026-09-11",
        jam: "14:30",
        keterangan: "Barang tiba di titik transit Purwakarta, melanjutkan perjalanan sore ini.",
        foto: [photos.transitLokasi],
        truck: { nomorUnit: "D 7788 QRS", jenis: "Box", driver: "Andi Firmansyah" },
        inputBy: "Admin - Rian",
        inputAt: "2026-09-11T14:35:00.000Z",
      },
    ],
  },
  {
    awb: "GMS-20260911-0003",
    tanggalDibuat: "2026-09-10",
    jamDibuat: "08:00",
    status: "Selesai / Terkirim",
    pengirim: {
      nama: "CV Berkah Jaya Sentosa",
      telepon: "021-7776655",
      email: "cs@berkahjaya.co.id",
    },
    penerima: {
      nama: "Rudi Hartono",
      telepon: "0819-4455-6677",
      email: "rudi.hartono@example.com",
    },
    alamatAsal: "Jl. Gudang Peti Kemas No. 5, Tanjung Priok",
    kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Asia Afrika No. 88, Sumur Bandung",
    kotaTujuan: "Bandung",
    deskripsiBarang: "Peralatan elektronik rumah tangga, 5 dus (total 140kg)",
    layanan: "Reguler",
    beratKg: 140,
    jumlahKoli: 5,
    fotoBarang: photos.barangDiterima,
    truck: { nomorUnit: "F 5566 LMN", jenis: "Wingbox", driver: "Joko Prasetyo" },
    emailTerkirim: true,
    emailTerkirimAt: "2026-09-10T08:05:00.000Z",
    pod: {
      tanggal: "2026-09-10",
      jam: "17:30",
      lokasi: "Bandung",
      fotoBarang: photos.podBarang,
      fotoSuratJalan: photos.podSuratJalan,
      namaPenerima: "Rudi Hartono",
      catatan: "Barang diterima dalam kondisi baik oleh penerima langsung.",
    },
    timeline: [
      {
        id: "t3-1",
        type: "Barang Diterima",
        lokasi: "Gudang Jakarta",
        tanggal: "2026-09-10",
        jam: "08:00",
        keterangan: "Barang diterima dan siap dikirim.",
        foto: [photos.barangDiterima],
        inputBy: "Admin - Dewi",
        inputAt: "2026-09-10T08:02:00.000Z",
      },
      {
        id: "t3-2",
        type: "Berangkat",
        lokasi: "Jakarta",
        tanggal: "2026-09-10",
        jam: "10:00",
        keterangan: "Barang berangkat dari gudang Jakarta menuju Bandung.",
        foto: [photos.truckWingboxB],
        truck: { nomorUnit: "F 5566 LMN", jenis: "Wingbox", driver: "Joko Prasetyo" },
        inputBy: "Admin - Dewi",
        inputAt: "2026-09-10T10:05:00.000Z",
      },
      {
        id: "t3-3",
        type: "Transit",
        lokasi: "Cikampek",
        tanggal: "2026-09-10",
        jam: "13:00",
        keterangan: "Barang tiba di titik transit Cikampek.",
        foto: [photos.transitLokasi],
        truck: { nomorUnit: "F 5566 LMN", jenis: "Wingbox", driver: "Joko Prasetyo" },
        inputBy: "Admin - Rian",
        inputAt: "2026-09-10T13:05:00.000Z",
      },
      {
        id: "t3-4",
        type: "Tiba di Tujuan",
        lokasi: "Bandung",
        tanggal: "2026-09-10",
        jam: "16:00",
        keterangan: "Barang tiba di kota tujuan Bandung, menunggu proses serah terima.",
        foto: [photos.truckWingboxB],
        truck: { nomorUnit: "F 5566 LMN", jenis: "Wingbox", driver: "Joko Prasetyo" },
        inputBy: "Admin - Rian",
        inputAt: "2026-09-10T16:05:00.000Z",
      },
      {
        id: "t3-5",
        type: "Selesai / Terkirim",
        lokasi: "Bandung",
        tanggal: "2026-09-10",
        jam: "17:30",
        keterangan: "Barang telah diterima customer dengan baik.",
        foto: [photos.podBarang, photos.podSuratJalan],
        truck: { nomorUnit: "F 5566 LMN", jenis: "Wingbox", driver: "Joko Prasetyo" },
        inputBy: "Admin - Rian",
        inputAt: "2026-09-10T17:35:00.000Z",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Generator untuk 17 AWB tambahan (total 20) — timeline dibuat otomatis
// berdasarkan status akhir supaya konsisten & mudah dipelihara.
// ---------------------------------------------------------------------------

const TRUCK_PHOTO_POOL = [photos.truckWingboxA, photos.truckWingboxB, photos.truckCddA, photos.truckCddB];

function addTime(tanggal: string, jam: string, hoursToAdd: number): { tanggal: string; jam: string } {
  const [y, m, d] = tanggal.split("-").map(Number);
  const [hh, mm] = jam.split(":").map(Number);
  const dt = new Date(y, m - 1, d, hh, mm);
  dt.setHours(dt.getHours() + hoursToAdd);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    tanggal: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
    jam: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
  };
}

function toISO(tanggal: string, jam: string): string {
  return `${tanggal}T${jam}:00.000Z`;
}

interface ShipmentSeed {
  awb: string;
  tanggalDibuat: string;
  jamDibuat: string;
  pengirim: PersonInfo;
  penerima: PersonInfo;
  alamatAsal: string;
  kotaAsal: string;
  alamatTujuan: string;
  kotaTujuan: string;
  deskripsiBarang: string;
  truck: TruckInfo;
  status: ShipmentStatus;
  kotaTransit?: string;
  kotaLanjutan?: string;
  kendalaKeterangan?: string;
  estimasiTiba?: string;
}

function buildShipment(seed: ShipmentSeed, photoIndex: number): Shipment {
  const beratKg = deriveBeratKg(seed.deskripsiBarang);
  const layanan = deriveLayanan(beratKg);
  const jumlahKoli = deriveJumlahKoli(seed.deskripsiBarang);
  const timeline: Shipment["timeline"] = [];
  let cursor = { tanggal: seed.tanggalDibuat, jam: seed.jamDibuat };
  const truckPhotoA = TRUCK_PHOTO_POOL[photoIndex % TRUCK_PHOTO_POOL.length];
  const truckPhotoB = TRUCK_PHOTO_POOL[(photoIndex + 1) % TRUCK_PHOTO_POOL.length];
  let eventNo = 0;

  function push(
    type: Shipment["timeline"][number]["type"],
    lokasi: string,
    keterangan: string,
    opts: { foto?: string[]; truck?: TruckInfo; truckSebelumnya?: TruckInfo } = {},
  ) {
    eventNo += 1;
    timeline.push({
      id: `${seed.awb}-t${eventNo}`,
      type,
      lokasi,
      tanggal: cursor.tanggal,
      jam: cursor.jam,
      keterangan,
      foto: opts.foto,
      truck: opts.truck,
      truckSebelumnya: opts.truckSebelumnya,
      inputBy: eventNo % 2 === 0 ? "Admin - Rian" : "Admin - Dewi",
      inputAt: toISO(cursor.tanggal, cursor.jam),
    });
  }

  push("Barang Diterima", `Gudang ${seed.kotaAsal}`, "Barang diterima dan siap dikirim.", {
    foto: [photos.barangDiterima],
  });

  let pod: Shipment["pod"];

  if (seed.status !== "Dalam Persiapan") {
    cursor = addTime(cursor.tanggal, cursor.jam, 3);
    push(
      "Berangkat",
      seed.kotaAsal,
      `Barang berangkat dari gudang ${seed.kotaAsal} menuju ${seed.kotaTujuan}.`,
      { foto: [truckPhotoA], truck: seed.truck },
    );

    if (seed.status === "Kendala") {
      cursor = addTime(cursor.tanggal, cursor.jam, 5);
      push("Kendala", seed.kotaTransit ?? seed.kotaAsal, seed.kendalaKeterangan ?? "Terjadi kendala di perjalanan.", {
        foto: [photos.kendala],
        truck: seed.truck,
      });
    } else if (seed.status !== "Berangkat") {
      cursor = addTime(cursor.tanggal, cursor.jam, 6);
      push("Transit", seed.kotaTransit ?? seed.kotaTujuan, `Barang tiba di titik transit ${seed.kotaTransit ?? seed.kotaTujuan}.`, {
        foto: [photos.transitLokasi],
        truck: seed.truck,
      });

      if (seed.status !== "Transit") {
        cursor = addTime(cursor.tanggal, cursor.jam, 7);
        push(
          "Dalam Perjalanan",
          seed.kotaLanjutan ?? seed.kotaTransit ?? seed.kotaTujuan,
          `Barang melanjutkan perjalanan menuju ${seed.kotaTujuan}.`,
          { foto: [truckPhotoB], truck: seed.truck },
        );

        if (seed.status !== "Dalam Perjalanan") {
          cursor = addTime(cursor.tanggal, cursor.jam, 5);
          push("Tiba di Tujuan", seed.kotaTujuan, `Barang tiba di kota tujuan ${seed.kotaTujuan}, menunggu proses serah terima.`, {
            foto: [truckPhotoB],
            truck: seed.truck,
          });

          if (seed.status === "Selesai / Terkirim") {
            cursor = addTime(cursor.tanggal, cursor.jam, 2);
            push("Selesai / Terkirim", seed.kotaTujuan, "Barang telah diterima customer dengan baik.", {
              foto: [photos.podBarang, photos.podSuratJalan],
              truck: seed.truck,
            });
            pod = {
              tanggal: cursor.tanggal,
              jam: cursor.jam,
              lokasi: seed.kotaTujuan,
              fotoBarang: photos.podBarang,
              fotoSuratJalan: photos.podSuratJalan,
              namaPenerima: seed.penerima.nama,
              catatan: "Barang diterima dalam kondisi baik oleh penerima.",
            };
          }
        }
      }
    }
  }

  return {
    awb: seed.awb,
    tanggalDibuat: seed.tanggalDibuat,
    jamDibuat: seed.jamDibuat,
    status: seed.status,
    estimasiTiba: seed.estimasiTiba,
    pengirim: seed.pengirim,
    penerima: seed.penerima,
    alamatAsal: seed.alamatAsal,
    kotaAsal: seed.kotaAsal,
    alamatTujuan: seed.alamatTujuan,
    kotaTujuan: seed.kotaTujuan,
    deskripsiBarang: seed.deskripsiBarang,
    layanan,
    beratKg,
    jumlahKoli,
    fotoBarang: photos.barangDiterima,
    truck: seed.truck,
    emailTerkirim: true,
    emailTerkirimAt: toISO(seed.tanggalDibuat, seed.jamDibuat),
    timeline,
    pod,
  };
}

const seeds: ShipmentSeed[] = [
  // --- Dibuat 2026-09-11 (hari ini) ---
  {
    awb: "GMS-20260911-0004",
    tanggalDibuat: "2026-09-11",
    jamDibuat: "07:15",
    pengirim: { nama: "PT Cipta Boga Nusantara", telepon: "021-8801122", email: "logistik@ciptaboga.co.id" },
    penerima: { nama: "Maria Christin", telepon: "0812-6634-7788", email: "maria.christin@example.com" },
    alamatAsal: "Jl. Pulogadung Raya No. 21", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Malioboro No. 55", kotaTujuan: "Yogyakarta",
    deskripsiBarang: "Bahan baku makanan kemasan, 8 dus (total 60kg)",
    truck: { nomorUnit: "B 4521 DEF", jenis: "Box", driver: "Yanto Prabowo" },
    status: "Dalam Persiapan",
    estimasiTiba: "2026-09-13",
  },
  {
    awb: "GMS-20260911-0005",
    tanggalDibuat: "2026-09-11",
    jamDibuat: "07:40",
    pengirim: { nama: "Yusuf Kartika", telepon: "0813-2210-5544", email: "yusuf.kartika@example.com" },
    penerima: { nama: "PT Nusantara Steel", telepon: "061-4557788", email: "purchasing@nusantarasteel.co.id" },
    alamatAsal: "Jl. Rawa Bali No. 9", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Sisingamangaraja No. 130", kotaTujuan: "Medan",
    deskripsiBarang: "Komponen mesin pabrik, 2 palet (total 320kg)",
    truck: { nomorUnit: "B 7742 GHI", jenis: "Fuso", driver: "Sutrisno" },
    status: "Dalam Persiapan",
    estimasiTiba: "2026-09-15",
  },
  {
    awb: "GMS-20260911-0006",
    tanggalDibuat: "2026-09-11",
    jamDibuat: "06:50",
    pengirim: { nama: "Dian Permata", telepon: "0857-3321-9900", email: "dian.permata@example.com" },
    penerima: { nama: "Bambang Wibowo", telepon: "0812-7789-4411", email: "bambang.wibowo@example.com" },
    alamatAsal: "Jl. Kebon Jeruk Raya No. 17", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Pandanaran No. 88", kotaTujuan: "Semarang",
    deskripsiBarang: "Furnitur rumah tangga, 4 item (total 210kg)",
    truck: { nomorUnit: "B 3390 JKL", jenis: "CDD", driver: "Herman Yuliadi" },
    status: "Berangkat",
    estimasiTiba: "2026-09-12",
  },

  // --- Dibuat 2026-09-10 ---
  {
    awb: "GMS-20260910-0001",
    tanggalDibuat: "2026-09-10",
    jamDibuat: "08:10",
    pengirim: { nama: "CV Anugerah Sentosa", telepon: "021-5567890", email: "admin@anugerahsentosa.co.id" },
    penerima: { nama: "Fitri Handayani", telepon: "0813-5567-2200", email: "fitri.handayani@example.com" },
    alamatAsal: "Jl. Cempaka Putih No. 44", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Sultan Alauddin No. 76", kotaTujuan: "Makassar",
    deskripsiBarang: "Alat elektronik rumah tangga, 6 dus (total 150kg)",
    truck: { nomorUnit: "B 1188 MNO", jenis: "Tronton", driver: "Wahyu Nugroho" },
    status: "Berangkat",
    estimasiTiba: "2026-09-16",
  },
  {
    awb: "GMS-20260910-0002",
    tanggalDibuat: "2026-09-10",
    jamDibuat: "07:30",
    pengirim: { nama: "Rina Kusuma", telepon: "0812-9987-1122", email: "rina.kusuma@example.com" },
    penerima: { nama: "I Made Sudiarta", telepon: "0878-4432-6600", email: "made.sudiarta@example.com" },
    alamatAsal: "Jl. Fatmawati No. 22", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Sunset Road No. 101", kotaTujuan: "Denpasar",
    deskripsiBarang: "Peralatan fotografi, 2 koli (total 25kg)",
    truck: { nomorUnit: "B 5567 PQR", jenis: "Wingbox", driver: "Rudi Hartawan" },
    status: "Transit",
    kotaTransit: "Surabaya",
    estimasiTiba: "2026-09-13",
  },
  {
    awb: "GMS-20260910-0003",
    tanggalDibuat: "2026-09-10",
    jamDibuat: "09:20",
    pengirim: { nama: "PT Global Elektronik Indonesia", telepon: "021-7712345", email: "cs@globalelektronik.co.id" },
    penerima: { nama: "Ahmad Fauzi", telepon: "0812-3345-7788", email: "ahmad.fauzi@example.com" },
    alamatAsal: "Jl. Daan Mogot No. 65", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Jenderal Sudirman No. 30", kotaTujuan: "Palembang",
    deskripsiBarang: "Unit AC split, 5 unit (total 175kg)",
    truck: { nomorUnit: "B 9021 STU", jenis: "Box", driver: "Endro Wibisono" },
    status: "Transit",
    kotaTransit: "Lampung",
    estimasiTiba: "2026-09-13",
  },
  {
    awb: "GMS-20260910-0004",
    tanggalDibuat: "2026-09-10",
    jamDibuat: "06:45",
    pengirim: { nama: "Toko Jaya Makmur", telepon: "024-3345566", email: "tokojayamakmur@example.com" },
    penerima: { nama: "Lestari Wulandari", telepon: "0813-6678-2211", email: "lestari.wulandari@example.com" },
    alamatAsal: "Jl. Pandanaran No. 12", kotaAsal: "Semarang",
    alamatTujuan: "Jl. Melawai No. 9", kotaTujuan: "Jakarta",
    deskripsiBarang: "Produk tekstil batik, 10 dus (total 95kg)",
    truck: { nomorUnit: "H 2201 VWX", jenis: "CDD", driver: "Agus Salim" },
    status: "Transit",
    kotaTransit: "Cirebon",
    estimasiTiba: "2026-09-11",
  },

  // --- Dibuat 2026-09-09 ---
  {
    awb: "GMS-20260909-0001",
    tanggalDibuat: "2026-09-09",
    jamDibuat: "07:00",
    pengirim: { nama: "PT Mitra Logistik Utama", telepon: "021-4456778", email: "ops@mitralogistik.co.id" },
    penerima: { nama: "Dedi Kurniawan", telepon: "0812-8890-3344", email: "dedi.kurniawan@example.com" },
    alamatAsal: "Jl. Marunda Center No. 3", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Jenderal Sudirman No. 45", kotaTujuan: "Balikpapan",
    deskripsiBarang: "Suku cadang alat berat, 3 palet (total 410kg)",
    truck: { nomorUnit: "B 6634 YZA", jenis: "Fuso", driver: "Ismail Hakim" },
    status: "Dalam Perjalanan",
    kotaTransit: "Surabaya",
    estimasiTiba: "2026-09-14",
  },
  {
    awb: "GMS-20260909-0002",
    tanggalDibuat: "2026-09-09",
    jamDibuat: "08:25",
    pengirim: { nama: "Sari Indah", telepon: "0813-7789-1100", email: "sari.indah@example.com" },
    penerima: { nama: "Wayan Arta", telepon: "0878-2234-5567", email: "wayan.arta@example.com" },
    alamatAsal: "Jl. Cideng Timur No. 8", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Ijen No. 40", kotaTujuan: "Malang",
    deskripsiBarang: "Peralatan olahraga, 4 koli (total 48kg)",
    truck: { nomorUnit: "L 8877 ABC", jenis: "CDD", driver: "Slamet Riyadi" },
    status: "Dalam Perjalanan",
    kotaTransit: "Semarang",
    estimasiTiba: "2026-09-12",
  },
  {
    awb: "GMS-20260909-0003",
    tanggalDibuat: "2026-09-09",
    jamDibuat: "09:10",
    pengirim: { nama: "CV Rejeki Barokah", telepon: "022-6612233", email: "cv.rejekibarokah@example.com" },
    penerima: { nama: "Hendra Saputra", telepon: "0812-3390-7711", email: "hendra.saputra@example.com" },
    alamatAsal: "Jl. Soekarno Hatta No. 210", kotaAsal: "Bandung",
    alamatTujuan: "Jl. Rasuna Said No. 18", kotaTujuan: "Jakarta",
    deskripsiBarang: "Produk garmen, 12 dus (total 130kg)",
    truck: { nomorUnit: "D 1123 EFG", jenis: "Box", driver: "Nana Suryana" },
    status: "Dalam Perjalanan",
    kotaTransit: "Bekasi",
    estimasiTiba: "2026-09-10",
  },
  {
    awb: "GMS-20260909-0004",
    tanggalDibuat: "2026-09-09",
    jamDibuat: "06:30",
    pengirim: { nama: "PT Sumber Rejeki Abadi", telepon: "021-5589001", email: "cs@sumberrejeki.co.id" },
    penerima: { nama: "Nurul Aini", telepon: "0813-4456-7789", email: "nurul.aini@example.com" },
    alamatAsal: "Jl. Kalimalang No. 5", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Basuki Rahmat No. 22", kotaTujuan: "Surabaya",
    deskripsiBarang: "Bahan kimia industri (non-B3), 6 drum (total 240kg)",
    truck: { nomorUnit: "B 2290 HIJ", jenis: "CDD", driver: "Yoga Pratama" },
    status: "Kendala",
    kotaTransit: "Cirebon",
    kendalaKeterangan:
      "Unit mengalami keterlambatan akibat kendala teknis pada sistem pendingin muatan di titik transit Cirebon. Tim teknisi sedang menangani perbaikan.",
    estimasiTiba: "2026-09-12",
  },
  {
    awb: "GMS-20260909-0005",
    tanggalDibuat: "2026-09-09",
    jamDibuat: "07:45",
    pengirim: { nama: "Indah Permatasari", telepon: "0812-6612-3390", email: "indah.permatasari@example.com" },
    penerima: { nama: "Budi Setiawan", telepon: "0857-7723-4411", email: "budi.setiawan@example.com" },
    alamatAsal: "Jl. Tebet Raya No. 30", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Kaliurang No. 12", kotaTujuan: "Yogyakarta",
    deskripsiBarang: "Peralatan kantor, 5 koli (total 70kg)",
    truck: { nomorUnit: "B 3305 NOP", jenis: "Wingbox", driver: "Catur Wibowo" },
    status: "Tiba di Tujuan",
    kotaTransit: "Semarang",
    estimasiTiba: "2026-09-10",
  },
  {
    awb: "GMS-20260909-0006",
    tanggalDibuat: "2026-09-09",
    jamDibuat: "08:00",
    pengirim: { nama: "Wulan Sari", telepon: "0813-9091-2244", email: "wulan.sari@example.com" },
    penerima: { nama: "Eko Prasetyo", telepon: "0812-6673-1188", email: "eko.prasetyo@example.com" },
    alamatAsal: "Jl. Kemayoran No. 19", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Gajahmada No. 66", kotaTujuan: "Semarang",
    deskripsiBarang: "Peralatan dapur, 7 dus (total 88kg)",
    truck: { nomorUnit: "B 5512 TUV", jenis: "CDD", driver: "Doni Saputra" },
    status: "Selesai / Terkirim",
    kotaTransit: "Cirebon",
  },

  // --- Dibuat 2026-09-08 ---
  {
    awb: "GMS-20260908-0001",
    tanggalDibuat: "2026-09-08",
    jamDibuat: "07:20",
    pengirim: { nama: "Agus Salim Wijaya", telepon: "0812-4456-9900", email: "agus.salimwijaya@example.com" },
    penerima: { nama: "PT Kencana Abadi", telepon: "061-7789012", email: "procurement@kencanaabadi.co.id" },
    alamatAsal: "Jl. Kapuk Raya No. 8", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Gatot Subroto No. 55", kotaTujuan: "Medan",
    deskripsiBarang: "Bahan baku pabrik tekstil, 4 palet (total 380kg)",
    truck: { nomorUnit: "B 4471 KLM", jenis: "Tronton", driver: "Bayu Segara" },
    status: "Kendala",
    kotaTransit: "Lampung",
    kendalaKeterangan:
      "Unit mengalami kendala kendaraan (mogok) di area Lampung. Tim sedang mengirimkan unit pengganti untuk melanjutkan perjalanan.",
    estimasiTiba: "2026-09-13",
  },
  {
    awb: "GMS-20260908-0002",
    tanggalDibuat: "2026-09-08",
    jamDibuat: "08:15",
    pengirim: { nama: "PT Karya Mandiri Sejahtera", telepon: "021-6690012", email: "logistik@karyamandiri.co.id" },
    penerima: { nama: "Sri Wahyuni", telepon: "0813-2298-4471", email: "sri.wahyuni@example.com" },
    alamatAsal: "Jl. Ancol Selatan No. 14", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Slamet Riyadi No. 210", kotaTujuan: "Solo",
    deskripsiBarang: "Produk consumer goods, 15 dus (total 175kg)",
    truck: { nomorUnit: "B 7789 QRS", jenis: "Box", driver: "Anton Wijaya" },
    status: "Tiba di Tujuan",
    kotaTransit: "Semarang",
    estimasiTiba: "2026-09-09",
  },
  {
    awb: "GMS-20260908-0003",
    tanggalDibuat: "2026-09-08",
    jamDibuat: "09:00",
    pengirim: { nama: "CV Sentosa Jaya", telepon: "021-3345677", email: "cs@sentosajaya.co.id" },
    penerima: { nama: "Rahmat Hidayat", telepon: "0812-5567-9901", email: "rahmat.hidayat@example.com" },
    alamatAsal: "Jl. Cempaka Baru No. 6", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Siliwangi No. 40", kotaTujuan: "Cirebon",
    deskripsiBarang: "Alat tulis kantor, 9 dus (total 65kg)",
    truck: { nomorUnit: "B 6698 WXY", jenis: "Pickup", driver: "Deni Ramdani" },
    status: "Selesai / Terkirim",
  },
  {
    awb: "GMS-20260908-0004",
    tanggalDibuat: "2026-09-08",
    jamDibuat: "06:40",
    pengirim: { nama: "PT Baja Perkasa Mandiri", telepon: "031-5567890", email: "logistik@bajaperkasa.co.id" },
    penerima: { nama: "Yuni Lestari", telepon: "0813-7789-2244", email: "yuni.lestari@example.com" },
    alamatAsal: "Jl. Rungkut Industri No. 12", kotaAsal: "Surabaya",
    alamatTujuan: "Jl. Pramuka No. 8", kotaTujuan: "Jakarta",
    deskripsiBarang: "Material konstruksi ringan, 3 palet (total 290kg)",
    truck: { nomorUnit: "L 3345 ZAB", jenis: "Wingbox", driver: "Gunawan Setiadi" },
    status: "Selesai / Terkirim",
    kotaTransit: "Semarang",
  },

  // --- Dibuat 2026-09-07 ---
  {
    awb: "GMS-20260907-0001",
    tanggalDibuat: "2026-09-07",
    jamDibuat: "08:00",
    pengirim: { nama: "Toko Elektronik Jaya", telepon: "021-4471100", email: "tokojaya@example.com" },
    penerima: { nama: "Siti Nurhaliza", telepon: "0812-7789-3345", email: "siti.nurhaliza@example.com" },
    alamatAsal: "Jl. Mangga Dua Raya No. 20", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Diponegoro No. 15", kotaTujuan: "Bandung",
    deskripsiBarang: "Peralatan elektronik, 3 dus (total 40kg)",
    truck: { nomorUnit: "B 4521 DEF", jenis: "Box", driver: "Yanto Prabowo" },
    status: "Selesai / Terkirim",
    kotaTransit: "Bekasi",
  },

  // --- Dibuat 2026-09-20 - sengaja belum ada feedback, untuk demo form rating ---
  {
    awb: "GMS-20260920-0001",
    tanggalDibuat: "2026-09-20",
    jamDibuat: "09:00",
    pengirim: { nama: "CV Sumber Rejeki", telepon: "021-8845200", email: "cvsumberrejeki@example.com" },
    penerima: { nama: "Ahmad Fauzan", telepon: "0857-1122-3344", email: "ahmad.fauzan@example.com" },
    alamatAsal: "Jl. Gudang Raya No. 12", kotaAsal: "Jakarta",
    alamatTujuan: "Jl. Margonda Raya No. 88", kotaTujuan: "Depok",
    deskripsiBarang: "Peralatan rumah tangga, 4 dus (total 55kg)",
    truck: { nomorUnit: "F 5566 LMN", jenis: "Wingbox", driver: "Joko Prasetyo" },
    status: "Selesai / Terkirim",
    kotaTransit: "Bekasi",
  },
];

const generatedShipments = seeds.map((seed, i) => buildShipment(seed, i));

/**
 * Links a shipment (and its timeline events) to master Truck/TitikLokasi
 * records wherever the denormalized nomorUnit/lokasi text matches one, so
 * Truck History and location-aware features work without hand-editing
 * every seed. Non-matches are left as plain text, same as before.
 */
function linkToMasterData(shipment: Shipment): Shipment {
  const truckByPlate = new Map(initialTrucks.map((t) => [t.nomorUnit, t.id]));
  const titikByName = new Map(initialTitikLokasi.map((t) => [t.namaKota, t.id]));

  return {
    ...shipment,
    truckId: truckByPlate.get(shipment.truck.nomorUnit),
    timeline: shipment.timeline.map((event) => ({
      ...event,
      truckId: event.truck ? truckByPlate.get(event.truck.nomorUnit) : undefined,
      titikId: titikByName.get(event.lokasi.replace(/^Gudang /, "")),
    })),
  };
}

export const initialShipments: Shipment[] = [...featuredShipments, ...generatedShipments].map(
  linkToMasterData,
);
