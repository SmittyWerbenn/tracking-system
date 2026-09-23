import type { AppUser, AuditLogEntry, Driver, Feedback, NotificationItem, TitikLokasi, Truck } from "../types";

// ---------------------------------------------------------------------------
// Master Armada: Driver
// ---------------------------------------------------------------------------

export const initialDrivers: Driver[] = [
  { id: "drv-1", nama: "Budi Santoso", telepon: "0812-3456-7801" },
  { id: "drv-2", nama: "Slamet Riyadi", telepon: "0812-3456-7802" },
  { id: "drv-3", nama: "Andi Firmansyah", telepon: "0812-3456-7803" },
  { id: "drv-4", nama: "Joko Prasetyo", telepon: "0812-3456-7804" },
  { id: "drv-5", nama: "Gunawan Setiadi", telepon: "0812-3456-7805" },
  { id: "drv-6", nama: "Yanto Prabowo", telepon: "0812-3456-7806" },
  { id: "drv-7", nama: "Yoga Pratama", telepon: "0812-3456-7807" },
];

// ---------------------------------------------------------------------------
// Master Armada: Truck
// ---------------------------------------------------------------------------

export const initialTrucks: Truck[] = [
  {
    id: "trk-1",
    nomorUnit: "B 9123 XYZ",
    jenis: "Wingbox",
    kapasitas: "8 Ton",
    driverId: "drv-1",
    status: "Available",
    keterangan: "Baru menyelesaikan pengantaran leg pertama AWB GMS260911-001.",
  },
  {
    id: "trk-2",
    nomorUnit: "L 8877 ABC",
    jenis: "CDD",
    kapasitas: "5 Ton",
    driverId: "drv-2",
    status: "On Trip",
  },
  {
    id: "trk-3",
    nomorUnit: "F 5566 LMN",
    jenis: "Wingbox",
    kapasitas: "8 Ton",
    driverId: "drv-4",
    status: "Available",
  },
  {
    id: "trk-4",
    nomorUnit: "D 7788 QRS",
    jenis: "Box",
    kapasitas: "3 Ton",
    driverId: "drv-3",
    status: "On Trip",
  },
  {
    id: "trk-5",
    nomorUnit: "L 3345 ZAB",
    jenis: "Wingbox",
    kapasitas: "8 Ton",
    driverId: "drv-5",
    status: "Maintenance",
    keterangan: "Servis rutin di bengkel rekanan, estimasi selesai 2 hari.",
  },
  {
    id: "trk-6",
    nomorUnit: "B 4521 DEF",
    jenis: "Box",
    kapasitas: "3 Ton",
    driverId: "drv-6",
    status: "Available",
  },
  {
    id: "trk-7",
    nomorUnit: "B 2290 HIJ",
    jenis: "CDD",
    kapasitas: "5 Ton",
    driverId: "drv-7",
    status: "Inactive",
    keterangan: "Unit nonaktif sementara akibat kendala teknis pada sistem pendingin muatan.",
  },
];

// ---------------------------------------------------------------------------
// Master Kota / Titik Transit
// ---------------------------------------------------------------------------

export const initialTitikLokasi: TitikLokasi[] = [
  { id: "loc-jakarta", namaKota: "Jakarta", kodeKota: "JKT", provinsi: "DKI Jakarta", jenis: "Gudang", aktif: true },
  { id: "loc-cirebon", namaKota: "Cirebon", kodeKota: "CRB", provinsi: "Jawa Barat", jenis: "Transit", aktif: true },
  { id: "loc-semarang", namaKota: "Semarang", kodeKota: "SMG", provinsi: "Jawa Tengah", jenis: "Hub", aktif: true },
  { id: "loc-surabaya", namaKota: "Surabaya", kodeKota: "SBY", provinsi: "Jawa Timur", jenis: "Tujuan", aktif: true },
  { id: "loc-bandung", namaKota: "Bandung", kodeKota: "BDG", provinsi: "Jawa Barat", jenis: "Cabang", aktif: true },
  { id: "loc-yogyakarta", namaKota: "Yogyakarta", kodeKota: "YOG", provinsi: "DI Yogyakarta", jenis: "Tujuan", aktif: true },
  { id: "loc-bekasi", namaKota: "Bekasi", kodeKota: "BKS", provinsi: "Jawa Barat", jenis: "Transit", aktif: true },
  { id: "loc-cikampek", namaKota: "Cikampek", kodeKota: "CKP", provinsi: "Jawa Barat", jenis: "Transit", aktif: true },
  { id: "loc-purwakarta", namaKota: "Purwakarta", kodeKota: "PWK", provinsi: "Jawa Barat", jenis: "Transit", aktif: true },
  { id: "loc-lampung", namaKota: "Lampung", kodeKota: "LPG", provinsi: "Lampung", jenis: "Transit", aktif: true },
  { id: "loc-medan", namaKota: "Medan", kodeKota: "MDN", provinsi: "Sumatera Utara", jenis: "Tujuan", aktif: true },
  { id: "loc-makassar", namaKota: "Makassar", kodeKota: "MKS", provinsi: "Sulawesi Selatan", jenis: "Tujuan", aktif: true },
  { id: "loc-denpasar", namaKota: "Denpasar", kodeKota: "DPS", provinsi: "Bali", jenis: "Tujuan", aktif: true },
  { id: "loc-palembang", namaKota: "Palembang", kodeKota: "PLB", provinsi: "Sumatera Selatan", jenis: "Tujuan", aktif: true },
  { id: "loc-balikpapan", namaKota: "Balikpapan", kodeKota: "BPP", provinsi: "Kalimantan Timur", jenis: "Tujuan", aktif: true },
  { id: "loc-solo", namaKota: "Solo", kodeKota: "SLO", provinsi: "Jawa Tengah", jenis: "Tujuan", aktif: true },
  { id: "loc-malang", namaKota: "Malang", kodeKota: "MLG", provinsi: "Jawa Timur", jenis: "Tujuan", aktif: true },
  { id: "loc-depok", namaKota: "Depok", kodeKota: "DPK", provinsi: "Jawa Barat", jenis: "Transit", aktif: true },
  { id: "loc-tangerang", namaKota: "Tangerang", kodeKota: "TGR", provinsi: "Banten", jenis: "Transit", aktif: true },
  { id: "loc-cikarang", namaKota: "Cikarang", kodeKota: "CKR", provinsi: "Jawa Barat", jenis: "Transit", aktif: true },
  { id: "loc-sukabumi", namaKota: "Sukabumi", kodeKota: "SKB", provinsi: "Jawa Barat", jenis: "Tujuan", aktif: true },
  { id: "loc-karawang", namaKota: "Karawang", kodeKota: "KRW", provinsi: "Jawa Barat", jenis: "Transit", aktif: true },
  { id: "loc-sidoarjo", namaKota: "Sidoarjo", kodeKota: "SDA", provinsi: "Jawa Timur", jenis: "Transit", aktif: true },
  { id: "loc-pekanbaru", namaKota: "Pekanbaru", kodeKota: "PKU", provinsi: "Riau", jenis: "Tujuan", aktif: true },
  { id: "loc-manado", namaKota: "Manado", kodeKota: "MND", provinsi: "Sulawesi Utara", jenis: "Tujuan", aktif: true },
  { id: "loc-bogor", namaKota: "Bogor", kodeKota: "BGR", provinsi: "Jawa Barat", jenis: "Transit", aktif: true },
];

// ---------------------------------------------------------------------------
// Manajemen User (Superadmin / Admin / Driver / Viewer)
// ---------------------------------------------------------------------------

export const initialUsers: AppUser[] = [
  {
    id: "usr-1",
    nama: "Siti Rahayu",
    email: "siti@gangsarmitrasuatama.co.id",
    role: "Admin",
    aktif: true,
    lastLogin: "2026-09-12T07:45:00.000Z",
  },
  {
    id: "usr-2",
    nama: "Rian Saputra",
    email: "rian@gangsarmitrasuatama.co.id",
    role: "Admin",
    aktif: true,
    lastLogin: "2026-09-11T16:10:00.000Z",
  },
  {
    id: "usr-3",
    nama: "Amir Wijaya",
    email: "amir@gangsarmitrasuatama.co.id",
    role: "Viewer",
    aktif: true,
    lastLogin: "2026-09-10T09:00:00.000Z",
  },
  {
    id: "usr-4",
    nama: "Bayu Prasetyo",
    email: "bayu@gangsarmitrasuatama.co.id",
    role: "Driver",
    aktif: true,
    lastLogin: "2026-09-13T05:30:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Audit Log (seed history)
// ---------------------------------------------------------------------------

export const initialAuditLog: AuditLogEntry[] = [
  {
    id: "log-1",
    timestamp: "2026-09-11T08:32:00.000Z",
    userName: "Admin - Dewi",
    role: "Admin",
    action: "CREATE_AWB",
    actionLabel: "CREATE AWB",
    module: "Shipment",
    awb: "GMS260911-001",
    description: "Resi diterbitkan untuk pengiriman Jakarta -> Surabaya.",
  },
  {
    id: "log-2",
    timestamp: "2026-09-11T12:50:00.000Z",
    userName: "Admin - Dewi",
    role: "Admin",
    action: "UPDATE_STATUS",
    actionLabel: "UPDATE STATUS",
    module: "Shipment",
    awb: "GMS260911-001",
    description: "Status berubah: Dalam Persiapan -> Berangkat.",
  },
  {
    id: "log-3",
    timestamp: "2026-09-11T18:25:00.000Z",
    userName: "Admin - Dewi",
    role: "Admin",
    action: "UPDATE_STATUS",
    actionLabel: "UPDATE STATUS",
    module: "Shipment",
    awb: "GMS260911-001",
    description: "Status berubah: Berangkat -> Transit (Cirebon).",
  },
  {
    id: "log-4",
    timestamp: "2026-09-12T09:20:00.000Z",
    userName: "Admin - Rian",
    role: "Admin",
    action: "TRANSFER_TRUCK",
    actionLabel: "TRANSFER TRUCK",
    module: "Shipment",
    awb: "GMS260911-001",
    description: "Truck: B 9123 XYZ -> L 8877 ABC di Semarang.",
  },
  {
    id: "log-5",
    timestamp: "2026-09-12T14:05:00.000Z",
    userName: "Admin - Rian",
    role: "Admin",
    action: "UPDATE_STATUS",
    actionLabel: "UPDATE STATUS",
    module: "Shipment",
    awb: "GMS260911-001",
    description: "Status berubah: Transit -> Dalam Perjalanan.",
  },
  {
    id: "log-6",
    timestamp: "2026-09-11T09:02:00.000Z",
    userName: "Admin - Dewi",
    role: "Admin",
    action: "CREATE_AWB",
    actionLabel: "CREATE AWB",
    module: "Shipment",
    awb: "GMS260911-002",
    description: "Resi diterbitkan untuk pengiriman Jakarta -> Bandung.",
  },
  {
    id: "log-7",
    timestamp: "2026-09-10T17:35:00.000Z",
    userName: "Admin - Rian",
    role: "Admin",
    action: "UPLOAD_POD",
    actionLabel: "UPLOAD POD",
    module: "Shipment",
    awb: "GMS260911-003",
    description: "Foto barang diterima dan surat jalan diunggah sebagai bukti serah terima.",
  },
  {
    id: "log-8",
    timestamp: "2026-09-10T17:35:00.000Z",
    userName: "Admin - Rian",
    role: "Admin",
    action: "CLOSE_SHIPMENT",
    actionLabel: "CLOSE SHIPMENT",
    module: "Shipment",
    awb: "GMS260911-003",
    description: "Status berubah: Tiba di Tujuan -> Selesai / Terkirim. Data dikunci.",
  },
  {
    id: "log-9",
    timestamp: "2026-09-10T17:36:00.000Z",
    userName: "System",
    role: "Admin",
    action: "SEND_NOTIFICATION",
    actionLabel: "SEND NOTIFICATION",
    module: "Notification",
    awb: "GMS260911-003",
    description: "Notifikasi \"Pengiriman Anda Telah Selesai\" dibuat untuk customer.",
  },
  {
    id: "log-10",
    timestamp: "2026-09-09T14:35:00.000Z",
    userName: "Admin - Rian",
    role: "Admin",
    action: "ADD_ISSUE",
    actionLabel: "ADD ISSUE",
    module: "Shipment",
    awb: "GMS260909-004",
    description: "Kendala dicatat: keterlambatan akibat kendala teknis pada sistem pendingin muatan.",
  },
  {
    id: "log-11",
    timestamp: "2026-09-09T14:36:00.000Z",
    userName: "System",
    role: "Admin",
    action: "SEND_NOTIFICATION",
    actionLabel: "SEND NOTIFICATION",
    module: "Notification",
    awb: "GMS260909-004",
    description: "Notifikasi \"Update Pengiriman - Terdapat Kendala\" dibuat untuk customer.",
  },
  {
    id: "log-12",
    timestamp: "2026-09-08T00:00:00.000Z",
    userName: "Admin - Dewi",
    role: "Admin",
    action: "CREATE_TRUCK",
    actionLabel: "CREATE TRUCK",
    module: "Master Armada",
    description: "Unit truck B 2290 HIJ ditambahkan ke master armada.",
  },
  {
    id: "log-13",
    timestamp: "2026-09-08T00:05:00.000Z",
    userName: "Admin - Dewi",
    role: "Admin",
    action: "CREATE_LOCATION",
    module: "Master Kota",
    actionLabel: "CREATE LOCATION",
    description: "Titik transit Lampung ditambahkan ke master kota.",
  },
  {
    id: "log-14",
    timestamp: "2026-09-07T10:00:00.000Z",
    userName: "Dewi Anggraini",
    role: "Admin",
    action: "CREATE_USER",
    actionLabel: "CREATE USER",
    module: "User",
    description: "User \"Amir Wijaya\" (Management) ditambahkan.",
  },
];

// ---------------------------------------------------------------------------
// Customer Feedback (seed data)
// ---------------------------------------------------------------------------

export const initialFeedback: Feedback[] = [
  {
    id: "fb-1",
    awb: "GMS260911-003",
    customerName: "Rudi Hartono",
    rating: 5,
    comment: "Pengiriman cepat dan barang sampai dalam kondisi baik. Tracking-nya juga sangat membantu.",
    submittedAt: "2026-09-10T18:00:00.000Z",
  },
  {
    id: "fb-2",
    awb: "GMS260909-006",
    customerName: "Eko Prasetyo",
    rating: 4,
    comment: "Cukup puas, hanya sedikit terlambat dari estimasi.",
    submittedAt: "2026-09-09T08:30:00.000Z",
  },
  {
    id: "fb-3",
    awb: "GMS260908-003",
    customerName: "Rahmat Hidayat",
    rating: 5,
    submittedAt: "2026-09-08T10:00:00.000Z",
  },
  {
    id: "fb-4",
    awb: "GMS260908-004",
    customerName: "Yuni Lestari",
    rating: 3,
    comment: "Barang sampai dengan selamat namun komunikasi update status agak kurang.",
    submittedAt: "2026-09-08T09:15:00.000Z",
  },
  {
    id: "fb-5",
    awb: "GMS260907-001",
    customerName: "Siti Nurhaliza",
    rating: 5,
    comment: "Layanan sangat memuaskan, akan pakai lagi untuk pengiriman berikutnya.",
    submittedAt: "2026-09-07T11:20:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// Notification Center (seed history, mirrors the SEND_NOTIFICATION log entries)
// ---------------------------------------------------------------------------

export const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    awb: "GMS260911-001",
    trigger: "AWB_CREATED",
    subject: "Resi Pengiriman Anda - AWB GMS260911-001",
    toEmail: "siti.rahmawati@example.com",
    toName: "Siti Rahmawati",
    recipientRole: "penerima",
    createdAt: "2026-09-11T08:35:00.000Z",
  },
  {
    id: "notif-2",
    awb: "GMS260909-004",
    trigger: "KENDALA",
    subject: "Update Pengiriman - Terdapat Kendala (AWB GMS260909-004)",
    toEmail: "nurul.aini@example.com",
    toName: "Nurul Aini",
    recipientRole: "penerima",
    createdAt: "2026-09-09T14:36:00.000Z",
  },
  {
    id: "notif-3",
    awb: "GMS260911-003",
    trigger: "SELESAI",
    subject: "Pengiriman Anda Telah Selesai (AWB GMS260911-003)",
    toEmail: "rudi.hartono@example.com",
    toName: "Rudi Hartono",
    recipientRole: "penerima",
    createdAt: "2026-09-10T17:36:00.000Z",
  },
];
