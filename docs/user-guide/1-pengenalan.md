# 1. Pengenalan Aplikasi GMS Logistics

## Apa itu GMS Logistics?

GMS Logistics adalah aplikasi sistem tracking pengiriman barang antar kota
milik **PT Gangsar Mitra Sautama**. Aplikasi ini digunakan untuk:

- Menerbitkan resi digital (disebut **AWB** / Air Waybill).
- Mencatat perjalanan pengiriman dari gudang asal sampai ke tujuan.
- Memberikan nomor resi yang bisa dilacak **oleh customer kapan saja tanpa login**.
- Menyimpan bukti serah terima (foto) saat barang sampai.
- Mengelola armada (truck & driver), kota/titik transit, tarif ongkir, user, dan pengaturan sistem.

## Empat Bagian Aplikasi

| Bagian | Alamat | Fungsi |
|---|---|---|
| **Situs publik (COMPRO)** | `https://gms-logistics.id` | Halaman company profile, layanan, cara tracking, dan kontak. |
| **Tracking publik** | `https://gms-logistics.id/tracking` | Melacak status pengiriman memakai nomor AWB. Tanpa login. |
| **Portal Admin** | `https://admin.gms-logistics.id` | Tempat kerja Superadmin, GMS-Admin, Viewer, Client (Admin Client), dan Mitra. |
| **Portal Driver** | `https://driver.gms-logistics.id` | Tempat kerja Driver di lapangan (update status, foto, posisi). |

> **Penting:** Portal Admin dan Portal Driver adalah dua aplikasi terpisah di
> alamat yang berbeda. Akun Driver tidak bisa login di Portal Admin, dan akun
> Admin/Client/Viewer/Mitra tidak bisa login di Portal Driver.

## Siapa Saja Pengguna Aplikasi?

| Pengguna | Role di sistem | Login di |
|---|---|---|
| Pemilik sistem | Superadmin | Portal Admin |
| Staf operasional GMS | GMS-Admin (Admin) | Portal Admin |
| Staf yang hanya boleh melihat | Viewer | Portal Admin |
| Perwakilan perusahaan client | Client (Admin Client) | Portal Admin |
| Agen mitra | Mitra | Portal Admin |
| Sopir truk | Driver | Portal Driver |
| Customer / penerima barang | (tanpa akun) | Halaman tracking publik |

Penjelasan lengkap setiap role ada di bab [2. Role dan Hak Akses Pengguna](role-dan-hak-akses.md).

## Alur Singkat Pengiriman

1. Admin/Client membuat pengiriman → sistem menerbitkan **nomor AWB**.
2. Pengiriman diberi status awal **Dalam Persiapan**, lalu ditugaskan ke truck & driver
   (atau dibiarkan terbuka untuk diambil driver).
3. Driver mencatat perjalanan: **Berangkat → Transit/Dalam Perjalanan → Tiba di Tujuan → Selesai / Terkirim**.
4. Customer melacak perjalanan dari halaman tracking publik menggunakan nomor AWB.
5. Saat selesai, sistem menampilkan bukti serah terima (nama penerima + foto).

## Istilah Penting yang Sering Dipakai

- **AWB** — nomor resi, contoh `TATA0001`.
- **Koli** — satuan jumlah paket/dus.
- **Timeline** — riwayat perjalanan yang tercatat per kejadian.
- **POD (Proof of Delivery)** — bukti serah terima barang.
- **ETA (Estimasi Tiba)** — perkiraan tanggal barang tiba.
- **Client ID** — kode pelanggan, contoh `IDTMDI001`, dipakai sebagai awalan nomor AWB.
- **Status macet** — pengiriman yang tidak ada pembaruan status selama jumlah hari tertentu.

Lihat [Glosarium](glosarium.md) untuk daftar lengkap.