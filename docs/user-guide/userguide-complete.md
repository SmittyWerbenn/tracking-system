# Panduan Penggunaan Aplikasi GMS Logistics

Panduan resmi untuk karyawan, admin, client, driver, dan mitra yang menggunakan
**Sistem Tracking & Resi Digital AWB — PT Gangsar Mitra Sautama (GMS Logistics)**.

Dokumen ini berisi cara menggunakan aplikasi sesuai peran (role) masing-masing:
menu apa saja yang bisa dibuka, langkah demi langkah penggunaan fitur, serta
batasan hak akses. Ditulis dalam bahasa sederhana agar mudah dipahami tanpa
pengetahuan teknis.

> **Catatan sumber:** Panduan ini ditulis berdasarkan implementasi aplikasi yang
> sebenarnya (kode program). Nama menu, tombol, status, dan aturan akses mengikuti
> aplikasi aktual. Bagian yang belum dapat dipastikan ditandai **"Perlu dikonfirmasi"**.

---

## Alamat Aplikasi

| Portal | Alamat | Digunakan oleh |
|---|---|---|
| Situs publik (company profile) | `https://gms-logistics.id` | Semua orang (tanpa login) |
| Tracking pengiriman publik | `https://gms-logistics.id/tracking` | Customer / penerima (tanpa login) |
| Cek Ongkir | `https://gms-logistics.id/cek-ongkir` | Semua orang (tanpa login) |
| Portal Admin | `https://admin.gms-logistics.id` | Superadmin, GMS-Admin, Viewer, Client, Mitra |
| Portal Driver | `https://driver.gms-logistics.id` | Driver |

---

## Daftar Isi

1. Pengenalan Aplikasi GMS Logistics
2. Role dan Hak Akses Pengguna
3. Cara Login dan Akses Aplikasi
4. Cara Membuat Pengiriman
5. Cara Mengelola Data Pengiriman
6. Cara Mencetak / Mengunduh AWB dan Mengirim Email
7. Cara Tracking Pengiriman (Publik)
8. Panduan Portal Driver
9. Panduan Master Data
10. Panduan Manajemen User
11. Panduan Konfigurasi Sistem
12. Panduan Sistem dan Keamanan
13. Troubleshooting (Mengatasi Masalah)
14. FAQ (Pertanyaan yang Sering Diajukan)
15. Glosarium Istilah

---

## Ringkasan Singkat untuk Pemula

- **AWB** adalah nomor resi digital pengiriman, contoh: `TATA0001`. Nomor ini
  dipakai untuk melacak pengiriman di halaman tracking.
- **Pengiriman** dibuat oleh Superadmin, GMS-Admin, atau Client (Admin Client).
- **Status pengiriman** berjalan maju dari *Dalam Persiapan* sampai
  *Selesai / Terkirim* dan tidak bisa mundur.
- **Customer / penerima** tidak perlu login — cukup buka halaman tracking dan
  masukkan nomor AWB.
- **Setiap akun hanya melihat data sesuai perannya.** Sistem membatasi otomatis,
  jadi misalnya akun Client hanya melihat pengiriman dengan Client ID miliknya sendiri.

---

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

Penjelasan lengkap setiap role ada di bab 2. Role dan Hak Akses Pengguna.

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

Lihat Glosarium untuk daftar lengkap.

---

# 2. Role dan Hak Akses Pengguna

Aplikasi GMS Logistics memiliki **6 role**. Setiap akun memiliki satu role, dan
role itulah yang menentukan:

- Menu apa saja yang muncul di sisi kiri layar (sidebar).
- Halaman apa saja yang boleh dibuka.
- Data apa saja yang bisa dilihat (ada pembatasan tambahan di sisi server,
  misalnya Client hanya melihat pengiriman Client ID sendiri).
- Tindakan apa saja yang boleh dilakukan (melihat, membuat, mengubah, menghapus).

> **Catatan penting:** Menyembunyikan menu bukan satu-satunya pengaman. Setiap
> tindakan juga diperiksa ulang oleh server, jadi walau seseorang mengetik
> alamat halaman secara langsung, sistem akan menolak jika role-nya tidak
> berhak.

---

## 2.1 Superadmin

**Fungsi utama:**
Pemilik/administrator tertinggi sistem. Mengelola seluruh data dan pengaturan,
termasuk hal-hal yang hanya boleh dilakukan Superadmin.

**Pengguna yang dituju:**
Pemilik sistem atau orang yang ditunjuk sebagai administrator utama GMS.

**Menu yang dapat diakses:**
Semua menu di Portal Admin (18 menu di 5 grup):

- Operasional: Dashboard, Buat Pengiriman, Data Pengiriman, Pemulihan Order, Feedback Customer.
- Master Data: Master Armada, Kota & Titik Transit, Rate Publish, Master Layanan.
- Manajemen User: User Admin, User Driver, Clients, Mitra.
- Konfigurasi: Tracking, Informasi CS, Informasi Bantuan, Client Company Profile.
- Sistem & Keamanan: Audit Log, Recycle Bin.

**Hak akses:**
- Melihat semua data pengiriman (semua Client ID).
- Membuat pengiriman (satu per satu maupun import Excel).
- Mengedit data pengiriman (selama status mengizinkan).
- Mengubah status tracking (kecuali pengiriman sudah Selesai/Dibatalkan).
- Mengelola armada, kota/titik transit, layanan, rate publish (ubah harga), clients, mitra.
- Mengelola seluruh user (termasuk akun GMS-Admin).
- Mengubah konfigurasi Tracking, Informasi CS, Informasi Bantuan.
- Mengelola Client Company Profile (logo "Trusted by Our Clients").
- Menyetujui/menolak Pemulihan Order dan permintaan pembatalan dari Client.
- Melihat Audit Log dan mengelola Recycle Bin (menghapus/memulihkan data).
- Menghapus data Rate Publish secara permanen (fitur khusus).

**Batasan akses:**
- Data Pengiriman **tidak bisa dihapus** oleh siapa pun, termasuk Superadmin.
- Akun Superadmin lain tidak bisa diubah/disetel nonaktif lewat halaman
  Manajemen User (termasuk akun Superadmin sendiri tidak bisa mengubah baris user
  yang ber-role Superadmin).
- Superadmin terakhir tidak dapat dihapus.
- Penghapusan permanen manual untuk data selain Rate Publish tidak tersedia.

**Contoh penggunaan:**
Menambah akun GMS-Admin baru, mengubah tarif Rate Publish, menghapus user lama,
memeriksa Audit Log, dan memulihkan data yang terhapus dari Recycle Bin.

---

## 2.2 GMS-Admin (Admin)

**Fungsi utama:**
Staf operasional internal GMS yang menjalankan pekerjaan sehari-hari:
membuat pengiriman, mengelola armada, memantau status, dan mengelola data
operasional.

**Pengguna yang dituju:**
Staf kantor GMS (operasional, admin, PIC per client).

**Menu yang dapat diakses:**
Semua menu Portal Admin **kecuali Recycle Bin dan Client Company Profile**:

- Operasional: Dashboard, Buat Pengiriman, Data Pengiriman, Pemulihan Order, Feedback Customer.
- Master Data: Master Armada, Kota & Titik Transit, Rate Publish (lihat + unduh data, tidak bisa ubah harga), Master Layanan.
- Manajemen User: User Admin, User Driver, Clients, Mitra.
- Konfigurasi: Tracking, Informasi CS, Informasi Bantuan.
- Sistem & Keamanan: Audit Log.

**Hak akses:**
- Melihat semua data pengiriman.
- Membuat pengiriman dan mengedit data pengiriman.
- Mengubah status tracking.
- Mengelola armada, kota/titik transit, layanan, clients, mitra, user.
- Menyetujui/menolak Pemulihan Order dan mengajukan pembatalan ke Client.
- Melihat Audit Log.
- Melihat dan **mengunduh** data Rate Publish (tidak dapat mengubah harga).

**Batasan akses:**
- **Tidak bisa mengubah harga di Rate Publish** (kolom Aksi edit hanya muncul
  untuk Superadmin; permintaan ubah harga ditolak server).
- **Tidak bisa membuka Recycle Bin** (hanya Superadmin).
- Tidak bisa mengelola Client Company Profile.
- Tidak bisa membuat user ber-role Admin, menaikkan role user lain menjadi Admin,
  atau mengubah/menonaktifkan akun GMS-Admin lain — hanya Superadmin yang bisa.
- Tidak bisa mengubah akun ber-role Superadmin.
- Tidak bisa menghapus Data Pengiriman.

**Contoh penggunaan:**
Membuat resi (AWB) untuk pengiriman hari itu, menugaskan truck, memantau
pengiriman yang macet, menambahkan driver baru, dan menyetujui pemulihan order
yang diajukan Client.

---

## 2.3 Viewer

**Fungsi utama:**
Melihat data dan memantau operasional **tanpa bisa mengubah apa pun**
(read-only).

**Pengguna yang dituju:**
Pimpinan/manajemen yang hanya perlu memantau, atau staf yang sedang masa
pelatihan/tanpa wewenang ubah data.

**Menu yang dapat diakses:**
- Operasional: Dashboard, Data Pengiriman, Feedback Customer.
- Master Data: Master Armada (lihat saja — judul menjadi "Master Armada Dedicated"), Kota & Titik Transit (lihat saja), Rate Publish (lihat saja), Master Layanan (lihat saja).

Group Manajemen User, Konfigurasi, dan Sistem & Keamanan **tidak muncul**.
Jika alamatnya diketik langsung, sistem mengalihkan kembali ke Dashboard.

**Hak akses:**
- Melihat Dashboard, daftar & detail pengiriman, feedback customer.
- Melihat master data (armada, kota, rate publish, layanan).
- Menerima notifikasi (bisa klik lonceng dan membuka halaman Notification Center).

**Batasan akses:**
- Tidak bisa membuat/mengubah/menghapus data apa pun.
- Tidak bisa mengubah status tracking.
- Tidak ada tombol Update, tidak ada tombol tambah/edit di master data.
- Tidak bisa melihat halaman Buat Pengiriman, Manajemen User, Konfigurasi, Audit Log, Recycle Bin, Pemulihan Order.

**Contoh penggunaan:**
Memantau jumlah pengiriman hari ini dan melihat laporan feedback dari Dashboard,
tanpa risiko mengubah data.

---

## 2.4 Client (Admin Client)

**Fungsi utama:**
Perwakilan perusahaan client yang memakai jasa GMS. Client dapat membuat
pengiriman atas nama perusahaannya sendiri dan melihat semua pengiriman dengan
Client ID (Nomor Pelanggan) miliknya.

**Pengguna yang dituju:**
Staf perusahaan pengguna jasa GMS (misalnya tim logistik/layanan purna jual).
Satu perusahaan client dapat memiliki lebih dari satu akun Client.

**Menu yang dapat diakses:**
- Operasional: Dashboard, Buat Pengiriman, Data Pengiriman, Feedback Customer.
- Master Data: Master Armada (lihat — "Master Armada Dedicated"), Kota & Titik Transit (lihat), Rate Publish (lihat saja), Master Layanan (lihat saja).

**Hak akses:**
- Membuat pengiriman dengan Client ID sendiri (tidak bisa memilih Client ID lain; terkunci otomatis).
- Melihat hanya pengiriman dengan Client ID sendiri — dipaksa oleh server.
- Mengedit data pengiriman sendiri yang masih berstatus **Dalam Persiapan** (atau Hold).
- Mengubah alamat pengiriman sendiri (selama status masih Dalam Persiapan).
- Meng-Hold dan Lepas Hold order yang **dibuat oleh Client** (lihat batasan di bawah).
- Membatalkan order sendiri yang belum di-pickup, atau menyetujui/menolak
  permintaan pembatalan yang diajukan GMS untuk order miliknya.
- Mengajukan **Pemulihan Order** untuk pengiriman yang statusnya Dibatalkan.
- Melihat armada khusus yang didedikasikan untuk Client-nya (bukan semua armada GMS).
- Melihat Rate Publish (harga) — tidak bisa mengubah.

**Batasan akses:**
- Hanya melihat pengiriman Client ID sendiri — tidak melihat pengiriman client lain.
- Tidak bisa melihat pengiriman berstatus **Dibatalkan** di daftar utama
  (muncul hanya jika difilter status Dibatalkan), dan tidak bisa melihat detail order yang dibatalkan milik client lain.
- Tidak bisa melihat menu Manajemen User, Konfigurasi, Audit Log, Recycle Bin, Pemulihan Order.
- Tidak bisa mengubah data setelah pengiriman berstatus selain Dalam Persiapan/Hold.
- Tidak bisa mengubah SLA/ETA, truck, atau penugasan mitra (khusus admin internal).
- Tidak bisa menetapkan Mitra pada order.
- Tidak bisa melihat siapa Mitra yang menangani ordernya (data Mitra di-mask untuk Client).
- Tidak bisa menghapus data.

**Contoh penggunaan:**
Membuat resi pengiriman 10 koli spare part dari Jakarta ke Surabaya, memantau
statusnya, membetulkan alamat jika masih Dalam Persiapan, dan mengajukan pemulihan
 jika suatu order terlanjur dibatalkan.

---

## 2.5 Driver

**Fungsi utama:**
Sopir truk di lapangan. Melihat pengiriman yang ditugaskan, mengambil pesanan
terbuka, memperbarui status perjalanan, melaporkan posisi, dan mengunggah bukti
foto serah terima.

**Pengguna yang dituju:**
Sopir truk GMS yang memiliki akun Driver dan sudah ditautkan ke data driver +
unit truk di Master Armada.

**Menu yang dapat diakses:**
Hanya Portal Driver (`https://driver.gms-logistics.id`):

- Dashboard (beranda): ringkasan Pengiriman Aktif / Selesai / Kendala / Pesanan Terbuka.
- Data Pengiriman (riwayat pengiriman yang pernah ditugaskan).
- Detail pengiriman setiap AWB (aset, tujuan, riwayat, tombol aksi).
- Autentikasi: Login, Logout, "Butuh Bantuan?" (WhatsApp Admin).

**Hak akses:**
- Melihat hanya pengiriman yang ditugaskan ke dirinya (dipaksa oleh server).
- Melihat **Pesanan Terbuka** (pengiriman yang belum ada truck/driver) dan
  mengajukan **klaim / Ambil Pesanan**; menunggu konfirmasi admin.
- Membatalkan klaim sendiri yang masih menunggu konfirmasi.
- Memperbarui status tracking pengiriman miliknya (Berangkat, Transit, Dalam
  Perjalanan, Kendala, Tiba di Tujuan, Selesai / Terkirim).
- Mengunggah foto (bukti serah terima, foto perjalanan).
- Melaporkan posisi GPS (tombol "Perbarui Posisi").
- Melihat riwayat pengiriman dan mengunduh data (CSV/PDF).

**Batasan akses:**
- **Tidak bisa** membuka Portal Admin (ditolak dan diarahkan ke Portal Driver).
- Tidak bisa melihat pengiriman selain miliknya.
- Tidak bisa melihat status Hold / Dibatalkan (disaring sistem).
- Tidak bisa mengubah unit truck (Transfer Unit hanya admin).
- Tidak bisa mencatat Re-route / Penarikan (hanya admin).
- Tidak bisa mengubah data pengiriman, armada, user, konfigurasi, atau menghapus data.
- Tidak bisa membatalkan order.

**Contoh penggunaan:**
Pagi hari driver melihat dashboard, memilih pengiriman aktif, menekan tombol
"Rute Tujuan" untuk membuka Google Maps, mengupdate status menjadi "Berangkat",
saat tiba menekan "Perbarui Posisi", dan saat barang diterima mengisi nama
penerima + foto bukti lalu "Simpan Status" (status menjadi Selesai / Terkirim).

---

## 2.6 Mitra

**Fungsi utama:**
Agen/partner GMS yang mengerjakan pengiriman yang **diteruskan (di-assign)**
kepadanya oleh GMS. Melihat dan memperbarui status paket yang menjadi bagiannya.

**Pengguna yang dituju:**
Perusahaan/agen mitra GMS. Satu Mitra dapat memiliki lebih dari satu akun Mitra.
Akun Mitra login lewat **Portal Admin** (bukan portal driver).

**Menu yang dapat diakses:**
- Operasional: Dashboard, **Paket Saya** (nama menu Data Pengiriman untuk Mitra), Feedback Customer.
- Master Data: Kota & Titik Transit (lihat), Rate Publish (lihat), Master Layanan (lihat).

Menu Master Armada **tidak muncul** (dan ditolak server). Manajemen User,
Konfigurasi, dan Sistem & Keamanan juga tidak muncul.

**Hak akses:**
- Melihat hanya pengiriman dengan kode Mitra miliknya (dipaksa server).
- Memperbarui status tracking pengiriman miliknya (kecuali Transfer Unit,
  Re-route, Penarikan — khusus admin).
- Mengunggah foto bukti (files.upload).
- Melihat feedback customer, notifikasi, rate publish, layanan, kota.

**Batasan akses:**
- Tidak bisa melihat Master Armada (guard khusus; server menolak).
- Tidak bisa melihat Truck/unit yang dipakai pada order (kolom Truck di-mask).
- Tidak bisa melihat Hold/Cancel (data Hold & cancellation disembunyikan).
- Tidak bisa melihat siapa yang membuat order (createdBy disembunyikan).
- Tidak bisa mengubah data pengiriman, klaim pesanan, mengubah rate,
  mengelola user, konfigurasi, atau menghapus apa pun.
- Tidak bisa melihat pengiriman yang belum diteruskan ke Mitra-nya.

**Contoh penggunaan:**
Mitra membuka "Paket Saya", melihat daftar paket yang diteruskan GMS, membuka
di detail, memperbarui status sampai barang selesai dikirim, lalu mengunggah foto
serah terima.

---

## 2.7 Perbedaan Antar-Role (Ringkasan)

| Pertanyaan | Jawaban |
|---|---|
| Perbedaan Superadmin dan GMS-Admin? | GMS-Admin setara Superadmin untuk pekerjaan operasional, tetapi **tidak bisa** membuka Recycle Bin, tidak bisa mengubah harga Rate Publish, tidak bisa mengelola Client Company Profile, dan tidak bisa mengelola akun GMS-Admin/Superadmin. |
| Perbedaan Admin Client dan Viewer? | Viewer hanya melihat (read-only). Client bisa **membuat pengiriman**, mengedit order sendiri, hold/release, membatalkan/menyetujui pembatalan, dan mengajukan pemulihan — tetapi hanya untuk data milik Client ID sendiri. |
| Fungsi Driver? | Menjalankan pengiriman di lapangan lewat portal terpisah: update status, foto, posisi, dan mengambil pesanan terbuka (klaim). |
| Fungsi Mitra? | Mengerjakan paket yang diteruskan GMS kepadanya; melihat dan meng-update status paket miliknya lewat Portal Admin. |
| Role yang dapat membuat pengiriman? | Superadmin, GMS-Admin, Client (untuk Client ID sendiri). |
| Role yang dapat melihat Rate Publish? | Superadmin, GMS-Admin, Viewer, Client. **Mengubah harga hanya Superadmin.** |
| Role yang mengelola Master Armada? | Superadmin & GMS-Admin (kelola penuh); Viewer & Client lihat armada dedicated; Mitra & Driver tidak. |
| Role yang mengelola Master Layanan? | Superadmin & GMS-Admin (tambah/edit/aktif-nonaktif); Viewer & Client lihat saja. |
| Role yang mengelola user? | Superadmin & GMS-Admin (dengan batasan: akun Admin & Superadmin hanya bisa dikelola Superadmin). |
| Role yang mengubah konfigurasi Tracking / Informasi CS / Informasi Bantuan? | Superadmin & GMS-Admin dapat membuka halamannya; **field kontak hanya bisa diubah Superadmin** (ditegakkan di server). |
| Role yang menyetujui/menolak Pemulihan Order? | Superadmin & GMS-Admin. |
| Role yang mengelola Recycle Bin? | **Superadmin saja.** |
| Role yang dapat mengubah status pengiriman? | Superadmin & GMS-Admin (via Portal Admin), Driver (untuk pengiriman miliknya, via Portal Driver), Mitra (untuk paket miliknya, tanpa Transfer Unit/Re-route/Penarikan). |

---

## 2.8 Matriks Perbandingan Role

Keterangan:
- **Kelola penuh** — dapat melakukan operasi yang diizinkan pada fitur tersebut.
- **Lihat saja** — dapat melihat data tanpa mengubahnya.
- **Akses terbatas** — hanya dapat melakukan tindakan tertentu.
- **Tidak ada akses** — tidak dapat membuka/menggunakan fitur.

| Fitur / Menu | Superadmin | GMS-Admin | Client | Viewer | Driver | Mitra |
|---|---|---|---|---|---|---|
| Dashboard | Kelola penuh | Kelola penuh | Kelola penuh (data sendiri) | Lihat saja | Kelola penuh (data sendiri, portal driver) | Kelola penuh (paket sendiri) |
| Buat Pengiriman | Kelola penuh | Kelola penuh | Kelola penuh (Client ID sendiri) | Tidak ada akses | Tidak ada akses | Tidak ada akses |
| Data Pengiriman | Kelola penuh | Kelola penuh | Akses terbatas (lihat/mengedit order sendiri yang masih persiapan) | Lihat saja | Akses terbatas (pengiriman ditugaskan saja) | Akses terbatas (paket diteruskan saja; "Paket Saya") |
| Lihat Detail / Tracking | Kelola penuh | Kelola penuh | Akses terbatas (Client ID sendiri) | Lihat saja | Akses terbatas (miliknya) | Akses terbatas (miliknya, tanpa info truck/hold) |
| Update Tracking | Kelola penuh | Kelola penuh | Tidak ada akses | Tidak ada akses | Akses terbatas (miliknya; tanpa Transfer Unit/Re-route/Penarikan) | Akses terbatas (miliknya; tanpa Transfer Unit/Re-route/Penarikan) |
| Primary: Data Pengiriman (Filter) | Kelola penuh | Kelola penuh | Akses terbatas | Lihat saja | Akses terbatas | Akses terbatas |
| Pemulihan Order | Kelola penuh (setujui/tolak) | Kelola penuh (setujui/tolak) | Akses terbatas (ajukan untuk order dibatalkan miliknya) | Tidak ada akses | Tidak ada akses | Tidak ada akses |
| Hold Pengiriman | Akses terbatas (order yang dibuatnya) | Akses terbatas (order yang dibuatnya) | Akses terbatas (order Client ID sendiri yang dibuat Client) | Tidak ada akses | Tidak ada akses | Tidak ada akses |
| Pembatalan Order | Kelola penuh (langsung/persetujuan) | Kelola penuh (langsung/jika dibuat GMS; ajukan permintaan untuk order Client) | Akses terbatas (batalkan order sendiri; putuskan permintaan) | Tidak ada akses | Tidak ada akses | Tidak ada akses |
| Master Armada | Kelola penuh (tambah/edit/status/delete/hapus) | Kelola penuh (tambah/edit/status; hapus & hapus permanen tidak) | Lihat saja (armada dedicated) | Lihat saja | Tidak ada akses | Tidak ada akses |
| Kota & Titik Transit | Kelola penuh | Kelola penuh | Lihat saja | Lihat saja | Akses terbatas (dipakai saat update lokasi) | Akses terbatas (dipakai saat update lokasi) |
| Rate Publish | Kelola penuh (ubah harga, bulk update, hapus, export) | Akses terbatas (lihat + unduh data) | Lihat saja | Lihat saja | Tidak ada akses | Tidak ada akses |
| Master Layanan | Kelola penuh (tambah/edit/aktif-nonaktif) | Kelola penuh (tambah/edit/aktif-nonaktif) | Lihat saja | Lihat saja | Tidak ada akses | Tidak ada akses |
| Clients | Kelola penuh | Kelola penuh (tanpa field kontrak kerja sama*) | Tidak ada akses | Tidak ada akses | Tidak ada akses | Tidak ada akses |
| Mitra | Kelola penuh | Kelola penuh | Tidak ada akses | Tidak ada akses | Tidak ada akses | Tidak ada akses |
| Manajemen User (Admin & Driver) | Kelola penuh | Akses terbatas (hanya akun non-Admin; tidak bisa kelola akun Admin/Superadmin) | Tidak ada akses | Tidak ada akses | Tidak ada akses | Tidak ada akses |
| Konfigurasi Tracking (ambang macet & email) | Kelola penuh | Kelola penuh | Tidak ada akses | Tidak ada akses | Tidak ada akses | Tidak ada akses |
| Informasi CS / Informasi Bantuan | Kelola penuh | Lihat saja (buka halaman, field nonaktif) | Tidak ada akses | Tidak ada akses | Tidak ada akses | Tidak ada akses |
| Client Company Profile | Kelola penuh | Tidak ada akses | Tidak ada akses | Tidak ada akses | Tidak ada akses | Tidak ada akses |
| Audit Log | Kelola penuh | Kelola penuh | Tidak ada akses | Tidak ada akses | Tidak ada akses | Tidak ada akses |
| Recycle Bin | Kelola penuh (hapus/restore; tanpa hapus permanen manual) | Tidak ada akses | Tidak ada akses | Tidak ada akses | Tidak ada akses | Tidak ada akses |
| Feedback Customer | Kelola penuh (lihat) | Kelola penuh (lihat) | Lihat saja | Lihat saja | Tidak ada akses | Tidak ada akses |
| Notification Center | Kelola penuh | Kelola penuh | Akses terbatas (notifikasi terkait) | Akses terbatas (lihat) | Tidak ada akses | Tidak ada akses |

\* GMS-Admin dapat menambah/mengubah data Client dan mengaktifkan/menonaktifkan,
tetapi kolom "Kontrak Kerja Sama / No. Pelanggan" hanya bisa diubah Superadmin
(ditegakkan di server).

> **Catatan:** Matriks di atas menggabungkan aturan tampilan menu (frontend) dan
> aturan API (backend). Keduanya konsisten untuk seluruh fitur utama. Jika suatu
> menu tidak muncul tetapi alamatnya diketik manual, server tetap menolak aksi
> yang tidak diizinkan.

---

## 2.9 Alur Kerja Berdasarkan Role

### Alur kerja Superadmin
1. Login ke Portal Admin.
2. Pantau Dashboard (total pengiriman, yang macet, rating customer).
3. Kelola user & master data (armada, kota, layanan, clients, mitra, rate publish).
4. Periksa Audit Log secara berkala.
5. Kelola Recycle Bin bila ada data yang perlu dipulihkan/dihapus.
6. Setujui/tolak Pemulihan Order bila diajukan Client.

### Alur kerja GMS-Admin
1. Login ke Portal Admin.
2. Lihat Dashboard → Buat Pengiriman untuk resi baru.
3. Tugaskan truck/driver atau biarkan sebagai Pesanan Terbuka.
4. Pantau Data Pengiriman; update tracking bila perlu (atau biarkan driver meng-update).
5. Tangani klaim driver yang menunggu konfirmasi (Konfirmasi / Tolak).
6. Tangani permintaan pembatalan & pemulihan order.
7. Kelola master data sesuai kebutuhan (armada, kota, layanan, clients, mitra, user).
8. Tutup hari dengan memeriksa pengiriman macet.

### Alur kerja Client (Admin Client)
1. Login ke Portal Admin.
2. Buka menu Buat Pengiriman → isi data / import Excel → dapat nomor AWB.
3. Buka Data Pengiriman untuk melihat pengiriman Client ID sendiri.
4. Perbaiki alamat/data selama status masih Dalam Persiapan (tombol Edit).
5. Pantau status sampai Selesai / Terkirim (atau lanjutkan ke tracking publik).
6. Bila order dibatalkan, ajukan Pemulihan Order bila perlu.
7. Bila GMS mengajukan pembatalan, beri keputusan Terima/Tolak (dengan keterangan).

### Alur kerja Viewer
1. Login ke Portal Admin.
2. Buka Dashboard untuk memantau ringkasan.
3. Buka Data Pengiriman dan Feedback Customer untuk melihat laporan.
4. Buka master data untuk melihat referensi (armada, kota, rate, layanan).
5. Tidak melakukan perubahan apa pun (tombol aksi tidak tersedia).

### Alur kerja Driver
1. Buka `https://driver.gms-logistics.id` dan login.
2. Lihat Dashboard: tombol **Scan AWB**, **Isi AWB Manual**, **Data Pengiriman**.
3. Lihat daftar pengiriman (tab Aktif / Selesai / Kendala / Terbuka).
4. Untuk pengiriman baru yang belum ada truck: buka tab **Terbuka**, filter,
   klik **Ambil Pesanan**, tunggu admin konfirmasi.
5. Buka detail pengiriman → "Rute Tujuan" (Google Maps) / "Hubungi Penerima".
6. Setiap titik perjalanan: pilih status → isi lokasi & catatan → **Simpan Status**.
7. Saat barang tiba: isi Nama Penerima + foto bukti (wajib) → Simpan Status.
8. Tekan **Perbarui Posisi** untuk melaporkan koordinat.
9. Gunakan **Butuh Bantuan?** untuk menghubungi Admin bila ada kendala.
10. Logout setelah selesai.

### Alur kerja Mitra
1. Login ke Portal Admin (bukan Portal Driver).
2. Buka **Paket Saya** — lihat paket yang diteruskan GMS ke Mitra Anda.
3. Buka detail paket, perbarui status tracking (lokasi + catatan + foto bila ada).
4. Laporkan kendala bila ada (status Kendala + catatan).
5. Selesaikan pengiriman dengan bukti serah terima bila alur memungkinkan.
6. Gunakan Feedback Customer & Dashboard untuk memantau kinerja.

---

# 3. Cara Login dan Akses Aplikasi

## 3.1 Portal Admin

Portal Admin digunakan oleh **Superadmin, GMS-Admin, Viewer, Client (Admin
Client), dan Mitra**.

1. Buka `https://admin.gms-logistics.id` di browser (disarankan Chrome/Edge di
   komputer, atau browser HP).
2. Halaman **Portal Admin** akan tampil dengan kolom **Email** dan **Password**.
3. Masukkan email dan password akun Anda.
4. Klik tombol **Masuk**.
5. Setelah berhasil, Anda masuk ke **Dashboard**.

> **Penting:** Menu yang tampil di sisi kiri (sidebar) berbeda-beda tergantung
> role akun Anda. Tidak semua pengguna melihat menu yang sama. Lihat bab
> 2. Role dan Hak Akses.

**Jika akun Anda ber-role Driver:** Anda tidak bisa login di Portal Admin.
Sistem akan menampilkan pesan "Akun Driver menggunakan Portal Driver, bukan di
sini" — silakan buka `https://driver.gms-logistics.id`.

**Detail halaman login:**
- Login form **Email** + **Password**; klik **Masuk**.
- Tombol **Lupa Password?** muncul hanya bila email yang mengetik **terdaftar**
  (email yang tidak dikenal sistem tidak diberi opsi reset).
- Bila ada **akun dinonaktifkan** (Client/Mitra), sistem menampilkan pesan
  sesuai + tautan **Hubungi Admin** (WhatsApp) untuk minta diaktifkan ulang.
- Bila ketik password salah **3× berturut-turut** untuk email yang sama, sistem
  menampilkan peringatan kecil di bawah form bahwa Anda bisa menghubungi admin
  bila lupa password (peringatan hanya langkais; tidak ada lock manual).

## 3.2 Portal Driver

Portal Driver digunakan oleh **Driver** (sopir truk).

1. Buka `https://driver.gms-logistics.id` di browser HP atau komputer.
2. Halaman **Portal Driver** akan tampil dengan kolom Email dan Password.
3. Masukkan email dan password akun Driver Anda.
4. Klik **Masuk**.
5. Setelah berhasil, Anda masuk ke Dashboard Driver.

**Jika akun Anda bukan Driver:** sistem menampilkan "Akun ini bukan akun Driver.
Gunakan Portal Admin untuk login."

> **Catatan:** Login Portal Admin dan Portal Driver memakai akun (email) yang
> sama, tetapi hanya role yang sesuai yang bisa masuk ke masing-masing portal.

## 3.3 Cara Logout

**Di Portal Admin:**
1. Klik tombol **Logout** di pojok kanan atas (di samping nama/avatar Anda).
2. Konfirmasi pada jendela yang muncul.

**Di Portal Driver:**
1. Cari tombol logout di bagian atas/luar Dashboard Driver (ikon keluar/Logout).
2. Konfirmasi jika diminta.

> Setelah logout, Anda akan diarahkan kembali ke halaman login portal tersebut.

## 3.4 Lupa Password

Tidak ada menu "reset password sendiri" di aplikasi ini. Gunakan tautan
**Lupa Password?** pada halaman login:

1. Ketik email akun Anda terlebih dahulu pada kolom Email.
2. Klik **Lupa Password?** (tautan muncul hanya bila email terdaftar).
3. Sistem membuka WhatsApp ke nomor admin yang bertugas (nomor diambil dari
   pengaturan Informasi Bantuan):
   - Akun GMS-Admin → pesan terkirim ke WhatsApp **Superadmin**.
   - Akun lain (Driver, Client, Viewer, Mitra) → pesan terkirim ke WhatsApp **Admin**.
4. Kirim pesan yang sudah terisi otomatis; admin akan membantu mengganti password.

Jika nomor WhatsApp belum dikonfigurasi, sistem menampilkan keterangan "nomor
belum dikonfigurasi" — hubungi admin GMS melalui cara lain.

> **Terlalu banyak percobaan gagal:** sistem membatasi percobaan login hingga
> **maksimal 8 percobaan per 10 menit per kombinasikan email + IP**. Jika
> lewat, sistem menampilkan "Terlalu banyak percobaan login. Coba lagi dalam
> beberapa menit." — tunggu beberapa menit lalu coba lagi (peringatan tidak
> berarti akun dikunci).

## 3.5 Akun Terkunci / Dinonaktifkan

- Jika akun Anda (Client) dinonaktifkan: muncul pesan **"Akun Client Anda
  dinonaktifkan. Hubungi admin GMS."** — hubungi Admin GMS untuk diaktifkan kembali.
- Jika akun Anda (Mitra) dinonaktifkan: muncul pesan **"Akun Mitra Anda
  dinonaktifkan. Hubungi admin GMS."**
- Jika user di nonaktifkan oleh admin, akun tersebut **tidak bisa login** sampai
  diaktifkan kembali.
- Jika salah password lebih dari 3 kali berturut-turut, halaman menampilkan
  peringatan agar menghubungi admin bila lupa password.

## 3.6 Pesan Kesalahan Login yang Umum

| Pesan | Arti & Solusi |
|---|---|
| Email tidak terdaftar. | Email tidak dikenal sistem. Pastikan email benar; jika belum punya akun, minta admin membuatkannya. Tautan "Lupa Password?" tidak muncul untuk email yang tidak terdaftar. |
| Email atau password salah. | Kredensial tidak cocok. Periksa kembali email & password. |
| Akun Client Anda dinonaktifkan. Hubungi admin GMS. | Akun/Client Anda nonaktif — hubungi admin. |
| Akun Mitra Anda dinonaktifkan. Hubungi admin GMS. | Akun/Mitra Anda nonaktif — hubungi admin. |
| Akun Driver menggunakan Portal Driver, bukan di sini. | Akun Driver harus login di driver.gms-logistics.id. |
| Akun ini bukan akun Driver. Gunakan Portal Admin untuk login. | Anda login di Portal Driver memakai akun non-Driver — gunakan admin.gms-logistics.id. |
| Terlalu banyak percobaan login. Coba lagi dalam beberapa menit. | Terlalu sering gagal login (maksimal 8 percobaan per 10 menit per email+IP). Tunggu beberapa menit lalu coba lagi. |

## 3.7 Sesi Login

- Sesuatu yang masuk akan "ingat" selama sampai **24 jam** (atau sesuai
  pengaturan sistem `SESSION_TTL_HOURS`). Setelah itu Anda harus login ulang.
- Login di satu tab tidak otomatis login di tab lain (token disimpan per tab
  browser, di sessionStorage).
- Saat Anda **mengganti password**, semua sesi login lain di perangkat lain akan
  diputus (server mengrevoke semua token aktif) — Anda harus login ulang dengan
  password baru.
- Jika lupa logout di komputer bersama, tutup tab browser atau logout dari menu.
- Logout di satu tab tidak logout di tab lain (token per tab).

## 3.8 Menghubungi Admin GMS

- Tombol **Hubungi Admin** / **Butuh Bantuan?** tersedia di halaman login
  (WhatsApp) dan di Portal Driver. Nomor tujuan diambil dari
  Konfigurasi → Informasi Bantuan yang dikelola Superadmin:
  - **WhatsApp Admin** — tujuan umum (Driver, Client, Viewer, Mitra; juga
    lupa password).
  - **WhatsApp Superadmin** — tujuan lupa password untuk akun GMS-Admin.
- Bila nomor belum dikonfigurasi, tombol menampilkan keterangan bahwa nomor
  belum diatur — hubungi tim GMS melalui cara lain (telepon kantor, email).

---

# 4. Cara Membuat Pengiriman

**Siapa yang dapat menggunakan:**
Superadmin, GMS-Admin, dan Client (Admin Client). Menu **Buat Pengiriman**
hanya muncul untuk ketiga role tersebut. Viewer, Driver, dan Mitra tidak bisa
membuat pengiriman.

**Apa yang terjadi saat pengiriman dibuat:**
Sistem menerbitkan **nomor AWB** (contoh: `TATA0001`) dan mencatat kejadian
pertama *"Barang Diterima"* pada timeline. Status awal pengiriman adalah
**Dalam Persiapan** (atau **Hold** jika Anda mencentang Hold Pengiriman).

> **AWB = nomor resi.** Formatnya mengikuti Client ID + nomor urut, misalnya
> Client ID `TATA` → AWB `TATA0001`, `TATA0002`, dst. Nomor dibuat otomatis oleh
> sistem dan **tidak bisa diisi manual**.

## 4.1 Membuat Satu Pengiriman

1. Login ke Portal Admin.
2. Buka menu **Operasional → Buat Pengiriman** (atau klik tombol **Buat
   Pengiriman** di Dashboard / Data Pengiriman).
3. Halaman akan menampilkan dua mode; pastikan memilih **Satu Pengiriman**
   (di samping mode "Bulk / Import Excel").
4. Isi **Data Pengirim**:
   - Nama Pengirim (wajib).
   - Nomor HP (wajib).
   - Email (wajib — dipakai untuk notifikasi).
5. Isi **Data Penerima**:
   - Nama Penerima (wajib).
   - Nomor HP (wajib).
   - Email (wajib — email penerima dipakai untuk mengirim notifikasi resi).
6. Isi bagian **Pengiriman**:
   - Kota Asal (wajib; ketik dan pilih dari saran).
   - Kota Tujuan (wajib).
   - Alamat Asal (wajib).
   - Alamat Tujuan (wajib).
   - Layanan — pilih dari daftar (isi dari Master Layanan; yang aktif saja yang
     bisa dipilih).
   - Client ID (wajib) — untuk akun Client, otomatis terkunci ke Client ID akun
     Anda. Untuk Superadmin/GMS-Admin, pilih/ketik Client ID yang sesuai.
   - Berat (Kg) — wajib, lebih dari 0.
   - Jumlah Koli — wajib, minimal 1.
   - Target Pengiriman (Hari) — opsional; jika diisi, sistem otomatis menghitung
     **Estimasi Tiba (ETA)** dan menampilkannya ke customer.
   - Referensi — opsional, nomor order dari pihak Anda; **tidak boleh sama dua
     kali untuk Client ID yang sama** (mencegah AWB ganda).
   - Deskripsi Barang (wajib).
7. (Opsional) **Status Awal — Hold Pengiriman**: centang jika ingin menerbitkan
   AWB tetapi belum memproses pengiriman (misal menunggu pembayaran). Alasan
   Hold wajib diisi. Order berstatus Hold tidak akan muncul di daftar driver.
8. (Opsional) **Foto Barang** dan **Foto Surat Jalan**.
9. Bagian **Informasi Truck**:
   - Pilih Unit Truck — opsional.
   - Jika **dikosongkan**, pengiriman masuk daftar **Pesanan Terbuka** di Portal
     Driver — semua driver bisa melihat dan mengajukan klaim, lalu admin
     mengonfirmasi.
   - Untuk akun Client: hanya armada dedicated milik Client yang bisa dipilih.
10. Klik tombol **Terbitkan Resi**.

**Hasil yang diharapkan:**
Jendela "Resi Berhasil Dibuat" muncul menampilkan **Nomor AWB**, QR code, dan
tautan tracking. AWB langsung tersimpan di sistem dan muncul di Data Pengiriman.
Dari jendela ini Anda bisa:

- **Kirim Email** — mengirim notifikasi resi ke email penerima & pengirim
  (jika pengiriman email aktif).
- **Lihat Tracking** — membuka halaman tracking publik AWB tersebut.
- **Lihat Detail Resi** / **Preview Email**.

**Catatan penting:**
- Layanan yang tidak dikenali/nonaktif di Master Layanan otomatis memakai
  layanan **default** (fallback) — sistem memberi tahu lewat catatan kecil.
- Referensi yang sama dengan pengiriman lain (Client ID sama) ditolak dengan
  pesan "Referensi ... sudah digunakan oleh AWB ...", supaya satu order tidak
  pernah mendapat dua AWB.
- Berat maksimal 100.000 kg, jumlah koli maksimal 100.000, Referensi maksimal
  100 karakter, alasan Hold maksimal 500 karakter.

## 4.2 Membuat Banyak Pengiriman Sekaligus (Bulk / Import Excel)

1. Buka **Buat Pengiriman**, lalu pilih mode **Bulk / Import Excel**.
2. Anda dapat:
   - **Mengisi tabel langsung** di halaman (klik tombol tambah baris), atau
   - **Mengimpor file Excel/CSV**.
3. Untuk impor file:
   - Klik tombol **Download Template** untuk mengunduh
     `template-bulk-pengiriman.csv` berisi contoh kolom.
   - Isi kolom sesuai contoh: Referensi, Nama/Telepon/Email Pengirim, Nama/
     Telepon/Email Penerima, Kota Asal, Alamat Asal, Kota Tujuan, Alamat Tujuan,
     Layanan, Berat (Kg), Jumlah Koli, Deskripsi Barang, Nomor Polisi Truck,
     Target (Hari).
   - Klik tombol pilih file, pilih file `.xlsx` atau `.csv`.
4. Periksa hasil baca file — baris yang bermasalah ditandai (misal berat tidak
   valid, kolom wajib kosong, referensi ganda).
5. Klik tombol simpan/terbitkan untuk memproses.

**Hasil yang diharapkan:**
Setiap baris yang valid mendapat **nomor AWB** sendiri. Hasil proses
menampilkan per baris: status **Berhasil** (dengan AWB), **Sudah ada**
(referensi duplikat dengan AWB yang sudah ada), atau **Gagal** (dengan
keterangan).

**Catatan penting:**
- Mode bulk juga memakai aturan yang sama dengan pengiriman tunggal (referensi
  unik per Client ID, layanan aktif, dst).
- Baris yang gagal **tidak** membuat AWB; perbaiki lalu impor ulang — pengiriman
  yang sudah berhasil tidak akan dibuat dua kali.
- Untuk akun Client, semua baris otomatis memakai Client ID akun Anda.

## 4.3 Menemukan Nomor AWB

Setelah resi berhasil dibuat, nomor AWB bisa ditemukan di:

1. Jendela **"Resi Berhasil Dibuat"** (langsung setelah membuat).
2. Halaman **Data Pengiriman** — kolom AWB pada daftar.
3. **Detail Resi** — buka dari Data Pengiriman (klik ikon mata/Detail).
4. **Email notifikasi** yang diterima penerima/pengirim.

Nomor AWB juga tercetak sebagai QR code pada detail resi; QR tersebut membuka
halaman tracking publik.

## 4.4 Hal Yang Menyebabkan Pengiriman Gagal Disimpan

- Kota asal/tujuan belum dipilih atau kosong.
- Berat atau jumlah koli tidak valid (≤ 0, atau bukan angka).
- Client ID kosong.
- Alasan Hold kosong (jika Hold dicentang).
- Referensi sudah dipakai (Client ID sama).
- Email tidak valid.
- Truck yang dipilih tidak ditemukan / tidak tersedia untuk Client.
- Mitra yang dipilih tidak ditemukan / nonaktif.

Jika gagal, sistem menampilkan pesan merah di bagian bawah form — perbaiki sesuai
pesan lalu tekan **Terbitkan Resi** lagi.

---

# 5. Cara Mengelola Data Pengiriman

## 5.1 Melihat Daftar Pengiriman

1. Buka menu **Operasional → Data Pengiriman** (untuk Mitra, menu ini bernama **Paket Saya**).
2. Sistem menampilkan tabel daftar resi (AWB) dengan kolom: AWB, Tanggal, Rute,
   Status, Truck, Driver, Last Update, dan Aksi.
3. Gunakan mode tampilan **Ringkas** atau **Detail** (tombol di kanan atas tabel).
   Mode Detail menampilkan kolom tambahan: Pengirim, Penerima, Client ID,
   Service, Berat, Koli, Estimasi Tiba, Diterima Oleh, Diterima, Keterangan.

**Batasan data yang terlihat:**
- Client → hanya pengiriman dengan Client ID sendiri.
- Driver → tidak melihat halaman ini (pakai Portal Driver).
- Mitra → hanya paket yang diteruskan ke Mitra-nya.
- Semua role **tidak** melihat pengiriman berstatus **Dibatalkan** di daftar
  utama; pengiriman batal hanya muncul jika difilter status "Dibatalkan"
  (untuk SA/Admin/Client; Viewer/Driver/Mitra tidak pernah melihat Dibatalkan).
- Pengiriman berstatus **Hold** tidak muncul untuk Driver dan Mitra.

## 5.2 Mencari dan Memfilter Pengiriman

Di atas tabel tersedia:

- **Kolom pencarian** — ketik AWB, nama, kota, atau nomor truck (hasil otomatis diperbarui).
- **Filter Status** — pilih status tertentu (Semua Status / Dalam Persiapan / Berangkat / ... / Selesai / Terkirim / Dibatalkan / Hold / dll).
- **Filter Client ID** — hanya untuk non-Client (Superadmin, GMS-Admin, Viewer, Mitra).
- **Filter tanggal** — dari tanggal s/d tanggal pembuatan.
- **Filter Macet** — dari Dashboard (tautan "AWB Macet") menampilkan hanya AWB
  tanpa update dalam jumlah hari tertentu.
- Tombol **Reset** untuk menghapus semua filter.
- Tombol **Export CSV** — mengunduh seluruh data yang cocok dengan filter
  (semua halaman, bukan hanya halaman yang tampil), bukan hanya halaman yang
  sedang dilihat.
- Tombol **Refresh** untuk memuat ulang data.

## 5.3 Melihat Detail Pengiriman (Detail AWB)

1. Dari Data Pengiriman, klik ikon mata (Detail) pada baris AWB — atau klik
   judul AWB dari Dashboard.
2. Halaman **Detail Resi / AWB** menampilkan:
   - Nomor AWB + status.
   - Data pengirim & penerima (nama, telepon, email, alamat).
   - Referensi, Client ID, Layanan, Berat, Jumlah Koli, SLA/ETA, Estimasi Tiba.
   - Deskripsi barang + foto barang & foto surat jalan.
   - **Truck & Driver** (unit, jenis, nama driver) — disembunyikan untuk
     Viewer, Client, Mitra.
   - **Mitra** (kode/nama mitra ditugaskan) — hanya untuk non-Viewer/non-Client.
   - Tanggal/Jam dibuat, status email.
   - **Bukti Serah Terima** (POD) bila sudah selesai.
   - **Posisi Terakhir Driver** bila driver melaporkan posisi (dengan tombol
     "Buka di Google Maps").
   - **QR Tracking** — pindai untuk membuka halaman tracking publik.
3. Tombol di kanan atas:
   - **Refresh**
   - **Cetak Resi** / **Download Resi** — mencetak/mengunduh resi (lihat bab 6).
   - **Kirim Email** — membuka preview email pengiriman.
   - **Lihat Tracking** — membuka halaman tracking internal (admin).
   - **+ Tambah Update Tracking** — menambah status perjalanan (non-Viewer/non-Client).

## 5.4 Mengedit Data Pengiriman

**Siapa yang dapat mengedit:**
- **Superadmin & GMS-Admin**: dapat mengedit data semua pengiriman yang belum
  **Selesai / Terkirim** atau **Dibatalkan** (termasuk layanan, SLA/ETA, dan
  penugasan).
- **Client**: dapat mengedit **seluruh data** pengiriman miliknya yang masih
  berstatus **Dalam Persiapan** (atau Hold) — termasuk alamat; tetapi **tidak
  bisa** mengubah SLA/ETA, unit truck, dan penugasan Mitra (khusus admin).

**Langkah (Superadmin/GMS-Admin):**
1. Buka detail resi, atau buka halaman **Update Tracking** dari daftar
   (ikon FileEdit pada baris).
2. Klik tombol **Edit Info Pengiriman** (jika tersedia).
3. Ubah data yang diperlukan (pengirim, penerima, alamat, kota, layanan, target
   hari, berat/koli bila tampil).
4. Klik **Simpan Perubahan**.

**Langkah (Client):**
1. Buka Data Pengiriman → cari baris pengiriman Anda yang berstatus
   **Dalam Persiapan**.
2. Klik ikon pena (Edit Data Pengiriman) pada baris.
3. Ubah data pada jendela yang muncul.
4. Simpan.

**Catatan penting:**
- Pengiriman dengan status **Selesai / Terkirim** atau **Dibatalkan** **terkunci**
  dan tidak bisa diubah lagi.
- Alamat hanya bisa diubah Client selama status masih **Dalam Persiapan/Hold**.
- Mengubah layanan: nilai harus layanan yang **aktif** di Master Layanan; jika
  tidak, sistem menolak (tidak ada fallback otomatis saat edit).

## 5.5 Mengubah Status Tracking (Update Tracking)

**Siapa yang dapat:**
Superadmin & GMS-Admin (via Portal Admin); Driver (via Portal Driver untuk
pengiriman miliknya); Mitra (via Portal Admin untuk paket miliknya, tanpa
Transfer Unit / Re-route / Penarikan).

**Cara membuka halaman Update Tracking:**
- Dari **Data Pengiriman**: klik ikon **Update** (FileEdit) pada baris AWB.
- Dari **Detail Resi / AWB**: klik tombol **+ Tambah Update Tracking**
  (dashed-link di kolom kanan).

**Isi halaman Update Tracking (Portal Admin):**

### a. Kartu "Data Pengiriman" (expander)
- Untuk **Superadmin & GMS-Admin**: kartu bisa dibuka (klik bagian atas) untuk
  menyimpan form **Edit Info Pengiriman** — ubah **Pengirim** (nama, telepon,
  email), **Penerima** (nama, telepon, email), **Rute** (Kota Asal/Tujuan —
  pilihan kota datang dari Master Data Kota, Alamat Asal/Tujuan), **Layanan**
  (daftar aktive dari Master Layanan; layanan lama yang sudah nonaktif tampi
  dengan mark "(nonaktif)"), dan **Target Pengiriman (Hari)** — sistem
  menampilkan **Estimasi Tiba** di bawah saat Anda tiip angka (kosongkan untuk
  menghapus ETA). Klik **Simpan Perubahan**.
- Untuk role lain (misal Mitra): kartu hanya lihat ("Hanya lihat" badge) —
  data pengiriman tampil tanpa kolom input.

### b. Form Update Tracking
1. **Status** — pilih dari daftar (sistem hanya menampilkan status **lanjutan**
   yang sah dari status saat ini; pipeline tidak bisa dibuat mundur).
2. **Lokasi (Nama Area)** — ketik atau pilih dari saran data Kota & Titik
   Transit. Khusus status **Selesai / Terkirim**: lokasi **otomatis memakai
   kota tujuan** (tidak perlu diisi).
3. **Tanggal & Jam** — isi waktu kejadian (default: hari ini + jam sekarang,
   waktu WIB).
4. **Keterangan** — wajib; deskripsi singkat status perjalanan.
5. **Foto** (opsional, bukan selesai): lampirkan satu atau lebih foto
   perjalanan (dikompres otomatis).
6. **Informasi Truck** — untuk Superadmin/GMS-Admin: **Pilih Unit Truck**
   (searchable; menampilkan nomor unit, jenis, driver). Kolom hanya "submit"
   bila unit **diganti** dari unit saat ini (update status biasa tidak
   mengubah unit). Untuk **Mitra**: unit tampil read-only.
   - Saat status **Transfer Unit**: seksi bertulis "Unit Baru" + catatan
     "Unit sebelumnya (...) akan otomatis tercatat sebagai unit yang digantikan
     pada timeline publik."
7. Sistem menampilkan catatan: *"Update ini akan langsung muncul di halaman
   tracking publik: [tanggal] · [jam] WIB"*.
8. Klik **Simpan Update** → pesan "Update tracking berhasil disimpan" → sistem
   diarahkan ke halaman tracking publik AWB tersebut.

**Saat memilih status Selesai / Terkirim (form lengkap):**
- **Nama Penerima (Diterima oleh)** — wajib. Default terisi nama penerima dari
  pengiriman; ubah jika barang diterima orang lain (rekan kerja, satpam).
- **Foto Barang Diterima** — wajib; kondisi barang saat diterima di lokasi
  tujuan. Tampil ke customer sebagai bukti (POD).
- **Foto Surat Jalan** — opsional; arsip internal, tidak tampil ke customer.
- Sistem mencatat POD dan mengunci riwayat.

**Saat pengiriman berstatus Hold:**
- Banner oranje di atas form: *"Pengiriman ini sedang di-Hold, jadi belum bisa
  diproses atau diberi update tracking. Pembuat order dapat memilih Lepas Hold
  dari halaman detail resi."*

**Saat pengiriman sudah Selesai / Terkirim (locked):**
- Form update **tidak tampil**. Sebagai ganti: kartu hijau *"Pengiriman ini
  sudah Selesai/Terkirim. Sesuai kebijakan (FR-17), riwayat pengiriman yang
  sudah closing dikunci dan tidak dapat diubah lagi untuk menjaga validitas
  data"* + tombol **Lihat Tracking**.
- Kartu **Foto Bukti Serah Terima** tampil: Anda bisa mengganti
  **Foto Barang Diterima** / **Foto Surat Jalan** **selama 30 hari sejak
  pengiriman selesai** (sistem menampilkan sisa waktu: "Bisa diganti dalam
  30 hari... Sisa waktu: X hari"). Setelah 30 hari, foto terkunci.

**Aturan penting:**
- Status **tidak bisa mundur** (pipeline maju saja). Jika mencoba memilih status
  yang lebih rendah dari status saat ini, sistem menolak dengan pesan
  "Status ... tidak bisa dipilih dari status saat ini".
- Setelah **Selesai / Terkirim** atau **Dibatalkan**, riwayat terkunci.
- **Transfer Unit** (pindah truck) hanya bisa dilakukan admin.
- **Re-route** (pengalihan) dan **Penarikan** (tarik barang) hanya admin.
- Driver/Mitra tidak dapat mengubah unit truck.

## 5.6 Klaim Pengiriman oleh Driver (Pesanan Terbuka)

Pengiriman yang dibuat **tanpa unit truck** masuk ke daftar **Pesanan Terbuka**
di Portal Driver. Alurnya:

1. Driver membuka tab **Terbuka**, melihat daftar, lalu klik **Ambil Pesanan**.
2. Sistem menandai pengiriman sebagai "Diklaim: [nama driver] — menunggu konfirmasi".
3. Admin melihat **banner ungu** di atas daftar Data Pengiriman:
   **"Klaim Pengiriman Menunggu Konfirmasi (N)"** — setiap kartu klaim
   menampilkan AWB, rute, driver (nama + telepon), tanggal request, dan unit
   (nomor + jenis) — atau kartu **Truck & Driver** di Detail Resi dengan pesan
   *"Diklaim oleh [driver] (telepon) — menunggu konfirmasi"*.
4. Admin meninjau data (driver + unit yang akan dipakai) lalu klik
   **Konfirmasi** atau **Tolak**. Sistem membuka **dialog pemutuskan kedua**
   (ClaimDecisionModal) yang menampilkan **AWB, nama driver, nomor unit, jenis
   unit** — admin harus konfirmasi yang itu memang data yang akan dipakai
   (protection kontra klik tidakintensional). Konfirmasi → pengiriman resmi
   ditugaskan ke unit tersebut; Tolak → pengiriman kembali ke daftar terbuka.
5. Setelah dikonfirmasi, pengiriman muncul di dashboard driver.

**Batasan:**
- Hanya Superadmin & GMS-Admin yang bisa mengonfirmasi/menolak klaim.
- Jika pengiriman sudah berjalan (status selain Dalam Persiapan), admin tidak
  bisa **membatalkan penugasan driver**; pembatalan penugasan hanya untuk
  pengiriman yang masih Dalam Persiapan (tombol "Batalkan Penugasan" di kartu
  Truck & Driver).
- Klaim ganda dicegah: begitu satu driver mengklaim, driver lain tidak bisa
  mengklaim AWB yang sama sampai admin memutuskan.

## 5.7 Hold Pengiriman

**Tujuan:** menahan order agar tidak diproses driver, sementara AWB tetap
terbit (misalnya menunggu pembayaran). Order berstatus Hold **tidak terlihat**
oleh Driver dan Mitra, dan **tidak bisa di-update** tracking-nya.

**Siapa yang dapat Hold/Lepas Hold:**
- **Pembuat order** saja (aturan "pemilik order"):
  - Superadmin/GMS-Admin → hanya untuk order yang mereka buat sendiri.
  - Client → untuk order Client ID sendiri yang memang dibuat oleh Client.
- Syarat: status order masih **Dalam Persiapan** dan barang **belum di-pickup**.
  Order yang sudah berangkat/berjalan, Selesai, atau Dibatalkan tidak bisa di-Hold.

**Cara Hold:**
1. Buka Data Pengiriman atau Detail Resi.
2. Pada baris/aksi order, klik **Hold** (ikon/aksi Hold Order).
3. Isi **Alasan Hold** (wajib, maks. 500 karakter).
4. Konfirmasi.

**Cara Lepas Hold:**
1. Buka order berstatus Hold.
2. Klik **Lepas Hold**.
3. Isi keterangan (wajib).
4. Konfirmasi — order kembali ke status sebelum di-Hold (mis. Dalam Persiapan)
   dan bisa diproses lagi.

**Catatan:**
- Hold **saat membuat pengiriman**: centang "Hold Pengiriman" + alasan; AWB
  tetap terbit dengan status Hold.
- Order Hold tidak bisa diteruskan ke Mitra, tidak bisa dibatalkan langsung
  sampai dilepas (kecuali lewat alur pembatalan yang menunggu keputusan Client —
  pembatalan tetap berlaku untuk order Hold karena dianggap belum di-pickup).
- Riwayat setiap Hold (siapa, kapan, alasan, kapan dilepas) tersimpan dan
  ditampilkan di detail.

## 5.8 Pembatalan Pengiriman

**Aturan utama:** order hanya bisa dibatalkan selama barang **belum di-pickup**
(status Dalam Persiapan atau Hold, dan belum ada bukti pengambilan).

**Siapa yang dapat membatalkan:**
- **Client** — membatalkan langsung order miliknya (belum di-pickup).
- **Superadmin / GMS-Admin**:
  - Order yang **dibuat GMS** (bukan Client): dapat dibatalkan langsung.
  - Order yang **dibuat Client**: **tidak bisa dibatalkan langsung** — GMS harus
    mengajukan permintaan pembatalan, dan **Client yang memutuskan**.
- **Viewer, Driver, Mitra** — tidak bisa membatalkan.

**Alur: Client membatalkan order sendiri**
1. Buka Data Pengiriman → baris order Anda.
2. Klik aksi **Batalkan Order**.
3. Isi alasan pembatalan (wajib).
4. Konfirmasi. Status menjadi **Dibatalkan** dan tercatat di timeline.

**Alur: GMS mengajukan pembatalan ke Client**
1. Admin membuka order milik Client.
2. Klik **Ajukan Pembatalan**.
3. Isi alasan (wajib). Sistem membuat permintaan dengan status Menunggu.
4. Client melihat banner "N request pembatalan menunggu keputusan Anda" di
   Data Pengiriman.
5. Client membuka aksi **Keputusan Pembatalan** → **Terima** (order Dibatalkan)
   atau **Tolak** (order tetap berjalan) — keduanya wajib memberi keterangan.

**Catatan:**
- Jika barang sudah di-pickup (sudah ada update tracking/driver position/POD),
  sistem menolak pembatalan dengan pesan "Order tidak dapat dibatalkan karena
  barang sudah dipickup."
- GMS bisa **menarik kembali** permintaan pembatalannya sendiri selama masih
  menunggu keputusan Client.
- Jika status berubah (misal barang jalan) sebelum Client memutuskan, permintaan
  dinyatakan kedaluwarsa otomatis (EXPIRED).

## 5.9 Pemulihan Order

**Tujuan:** mengembalikan order yang sudah **Dibatalkan** menjadi aktif kembali.

**Siapa yang dapat:**
- **Client** → mengajukan permintaan pemulihan untuk order Client ID sendiri
  yang berstatus Dibatalkan (dan belum ada request yang menunggu).
- **Superadmin & GMS-Admin** → menyetujui atau menolak permintaan.

**Alur:**
1. Client membuka Data Pengiriman → baris order berstatus **Dibatalkan**.
2. Klik aksi **Ajukan Pemulihan** (ikon/aksi dengan label tersebut).
3. Konfirmasi pada jendela "Ajukan Pemulihan Order?" — boleh menambahkan alasan
   (opsional).
4. Request tercatat dengan status **Menunggu Konfirmasi** (order tetap Dibatalkan
   sampai disetujui).
5. Admin membuka menu **Operasional → Pemulihan Order**.
6. Admin melihat daftar request (yang menunggu tampil paling atas; badge
   **"N menunggu"** di judul), dengan kolom AWB, Tanggal Order, Client, Status
   Order, Requested By, Tanggal Request, Status Request. Filter: pencarian AWB,
   Client, Requested By; filter status; rentang tanggal; tombol **Cari/Reset**.
7. Klik **Lihat Detail** → jendela **Detail Request Pemulihan** menampilkan
   data request (AWB, client, status order, diajukan oleh, tanggal, alasan)
   + **data order** (pengirim, penerima, rute) + **timeline lengkap** order.
8. Admin klik **Konfirmasi** (order dipulihkan) atau **Tolak** (wajib isi alasan
   penolakan).
9. Jika disetujui, order kembali ke **status sebelum dibatalkan** (misalnya
   Dalam Persiapan) dan timeline mendapat catatan "Pesanan dipulihkan setelah
   request pemulihan disetujui."

**Status request:** Menunggu Konfirmasi (PENDING) → Disetujui (APPROVED) /
Ditolak (REJECTED). Baris yang sudah diputuskan tetap tampil dengan statusnya
(bisa difilter "Semua Status").

**Catatan:**
- Jika status order sudah berubah bukan Dibatalkan saat disetujui, sistem menolak
  ("Order tidak dapat dipulihkan karena statusnya sudah ...").
- Request yang sudah diputuskan tidak bisa diubah lagi.

## 5.10 Export Data Pengiriman (CSV)

1. Buka Data Pengiriman.
2. Atur filter yang diinginkan (status, client, tanggal, pencarian).
3. Klik **Export CSV**.
4. File `data-pengiriman-<tanggal>.csv` terunduh berisi seluruh data yang cocok
   dengan filter (semua halaman).

**Siapa yang dapat:** semua role yang bisa membuka Data Pengiriman (Superadmin,
GMS-Admin, Client, Viewer, Mitra) — data yang diexport tetap mengikuti batasan
visibilitas role (misal Client hanya client ID sendiri).

## 5.11 Feedback Customer

- Customer dapat memberi **rating & komentar** dari halaman tracking publik
  setelah pengiriman selesai.
- Menu **Operasional → Feedback Customer** menampilkan semua ulasan (dengan
  ringkasan rata-rata rating) untuk **non-Mitra** (Superadmin, GMS-Admin,
  Viewer, Client).
- Mitra **tidak** melihat menu Feedback Customer (tidak muncul di sidebar-nya).

## 5.12 Notification Center

- Ikon **lonceng** di kanan atas Portal Admin menunjukkan notifikasi sistem
  (resi terbit, kendala, selesai) dengan badge belum-dibaca.
- Klik ikon lonceng untuk membuka **Notification Center**: daftar notifikasi
  yang dikirim sistem ke customer (subject, penerima, AWB) dan tautan
  "Buka Email Preview".
- Semua role yang login di Portal Admin dapat melihatnya (tampil sesuai data
  yang boleh dilihat role tersebut).

---

# 6. Cara Mencetak / Mengunduh AWB dan Mengirim Email

## 6.1 Mencetak Resi (AWB)

**Siapa yang dapat:** semua role yang bisa membuka Detail Resi (Superadmin,
GMS-Admin, Client — untuk data sendiri, Viewer, Mitra — untuk paket sendiri).

**Langkah:**
1. Buka **Data Pengiriman** → klik baris AWB (atau ikon **Detail**).
2. Pada halaman **Detail Resi / AWB**, klik tombol **Cetak Resi**.
3. Browser menampilkan dialog cetak — pilih printer / "Save as PDF", lalu cetak.

**Hasil yang diharapkan:**
Resi tercetak/diunduh dalam satu halaman A4 (sistem otomatis menyesuaikan skala
agar muat satu halaman), memuat nomor AWB, data pengirim/penerima, rute, barang,
dan QR Code tracking.

> **Tips:** Tombol **Download Resi** di samping tombol Cetak memakai alur cetak
> yang sama (dialog print → pilih "Save as PDF").

## 6.2 QR Code pada Resi

Setiap resi memuat **QR Code** yang berisi tautan halaman tracking publik
(`https://gms-logistics.id/tracking/<AWB>`). Pindai dengan kamera HP untuk
langsung membuka status pengiriman. QR ini juga tampil di jendela "Resi Berhasil
Dibuat" saat membuat pengiriman.

## 6.3 Preview dan Kirim Email

**Tujuan:** menampilkan pratinjau email resi dan mengirimkannya ke customer.

**Langkah:**
1. Dari Detail Resi, klik **Kirim Email** — atau dari menu
   **Notification Center** klik "Buka Email Preview" pada notifikasi tertentu.
2. Halaman **Preview Email** menampilkan bentuk email resi yang akan dikirim.
3. Klik tombol kirim ke **penerima** (dan/atau ke pengirim).
4. Sistem menandai status email menjadi "Terkirim" pada detail resi.

**Catatan penting:**
- Jika pengaturan **"Pengiriman Email" dimatikan** (di Konfigurasi → Tracking),
  tombol kirim email **tidak akan mengirim email sungguhan** dan menampilkan
  pesan "Pengiriman email sedang dinonaktifkan. Aktifkan di Admin > Pengaturan."
  — email pada saat buat resi juga tidak akan terkirim.
- Email notifikasi otomatis ke customer dibuat sistem saat: resi terbit
  (dikirim manual via tombol), status **Kendala**, dan **Selesai / Terkirim**
  (tercatat sebagai notifikasi ke email penerima).
- Riwayat notifikasi/email tampil di **Notification Center** (ikon lonceng).

## 6.4 Status Email pada Pengiriman

- Detail resi menampilkan **Status Email: Terkirim / Belum dikirim**.
- Jika belum terkirim dan Anda berhak mengirim (Superadmin/GMS-Admin), gunakan
  tombol **Kirim Email** pada detail/preview.

---

# 7. Cara Tracking Pengiriman (Publik)

Halaman tracking publik bisa diakses **tanpa login** oleh siapa saja
(customer, penerima, dsb.) di:

**`https://gms-logistics.id/tracking`**

## 7.1 Melacak Pengiriman

1. Buka `https://gms-logistics.id/tracking`.
2. Masukkan **nomor AWB** pada kolom yang tersedia (contoh: `TATA0001`).
   - Huruf besar/kecil tidak masalah; sistem mencocokkan nomor.
3. Klik tombol **Lacak** (tombol pencarian).
4. Tunggu hasil pencarian.

**Cara lain — Scan AWB:**
- Klik tombol **Scan AWB** (ikon QR) untuk membuka kamera.
- Arahkan kamera ke **QR code / barcode** pada resi.
- Sistem membaca nomor AWB dan langsung membuka hasil tracking.

**Riwayat pencarian:**
Halaman tracking menyimpan riwayat AWB yang pernah dilihat di perangkat/browser
Anda (tersimpan lokal). Anda bisa mengklik salah satu riwayat untuk membuka lagi,
atau klik **Hapus Semua** untuk membersihkannya.

## 7.2 Membaca Hasil Tracking

Setelah AWB ditemukan, halaman menampilkan:

- **Nomor AWB + status saat ini** (mis. Dalam Perjalanan, Selesai / Terkirim).
- **Estimasi Tiba (ETA)** — tanggal perkiraan tiba; jika sudah lewat dan barang
  belum selesai, muncul tanda "⚠ Estimasi telah terlewati".
- **Rute**: kota asal → kota tujuan.
- **Pengirim & Penerima**.
- **Status Stepper** — bagan langkah perjalanan (Dalam Persiapan → Berangkat →
  Transit → ... → Selesai / Terkirim) yang menunjukkan posisi barang.
- **Timeline / Riwayat Perjalanan** — daftar kejadian terurut dari yang terbaru:
  setiap kejadian memuat jenis status, lokasi, tanggal & jam, dan keterangan.
- **Bukti Serah Terima (POD)** — jika pengiriman sudah selesai: nama penerima,
  tanggal & waktu diterima, dan foto bukti.
- **Feedback** — setelah selesai, customer bisa memberi rating bintang (1–5)
  dan komentar.

## 7.3 Membaca Status Pengiriman

| Status | Arti |
|---|---|
| Dalam Persiapan | Barang sudah diterima di gudang asal, belum berangkat. |
| Berangkat | Truk sudah keluar dari gudang asal. |
| Transit | Barang singgah di titik transit. |
| Dalam Perjalanan | Barang sedang menuju tujuan. |
| Kendala | Ada masalah di perjalanan (lihat keterangan). |
| Transfer Unit | Unit truck diganti oleh admin (riwayat tetap tercatat). |
| Tiba di Tujuan | Barang sudah tiba di kota tujuan. |
| Selesai / Terkirim | Barang sudah diterima; tampil bukti serah terima. |
| Re-route | Pengiriman dialihkan (keputusan admin). |
| Penarikan | Barang ditarik kembali ke gudang asal (keputusan admin). |
| Hold | Dijeda sementara (tidak tampil di tracking publik? — lihat catatan). |
| Dibatalkan | Order dibatalkan. |

> **Catatan (Perlu dikonfirmasi):** Status **Hold** dan **Dibatalkan** umumnya
> tidak tampak di halaman tracking publik untuk pengguna umum — status yang
> tampil mengikuti data yang dikirim API publik. Jika AWB dengan status tersebut
> dicari dan tidak ditemukan, artinya sistem menyembunyikannya dari publik.

## 7.4 Cara Menemukan Nomor AWB

- Dari **resi cetak** (kertas/PDF) yang diterima pengirim.
- Dari **email notifikasi** yang dikirim sistem (subjek berisi nomor AWB).
- Dari **QR code** pada resi.
- Dari Portal Admin (bagi admin/client): halaman Data Pengiriman → kolom AWB.

## 7.5 Jika AWB Tidak Ditemukan

- Pastikan nomor AWB diketik dengan benar (tanpa spasi typo, seluruh digit).
- Pastikan nomor tersebut memang milik GMS Logistics (bukan ekspedisi lain).
- Pastikan pengiriman sudah benar-benar dibuat (admin/client bisa cek di Data
  Pengiriman).
- Jika status pengiriman adalah Dibatalkan (atau Hold), sistem mungkin
  menyembunyikannya dari pencarian publik.
- Coba **muat ulang halaman** atau tunggu beberapa saat.
- Jika masih gagal, hubungi Admin GMS dengan membawa nomor AWB.

## 7.6 Jika Status Belum Diperbarui

- Status hanya berubah jika ada **update tracking** (oleh admin/driver/mitra).
- Jika barang sedang dalam perjalanan dan belum ada update terbaru, itu normal —
  update biasanya dicatat di titik-titik tertentu (berangkat, transit, tiba).
- Jika sudah lama tanpa update (melebihi ambang "macet"), hubungi Admin GMS —
  pihak GMS juga memantau pengiriman macet lewat Dashboard.

## 7.7 Verifikasi Keamanan (CAPTCHA)

Halaman tracking memiliki mekanisme verifikasi keamanan (kode pada gambar)
untuk mencegah akses berlebihan dari program otomatis. Saat ini verifikasi
tersebut **dinonaktifkan** dan normalnya tidak muncul.

> **Perlu dikonfirmasi:** Jika suatu saat verifikasi keaktifan kembali, Anda akan
> melihat kotak "Verifikasi Keamanan" — masukkan kode pada gambar lalu klik
> tombol Lacak. Setelah lolos sekali, verifikasi tidak diminta lagi untuk
> sementara waktu. (Mekanisme tersedia di aplikasi, status aktif/nonaktif
> dikendalikan oleh pengaturan sistem.)

---

# 8. Panduan Portal Driver

Portal Driver adalah aplikasi terpisah untuk **Driver** (sopir truk) di:

**`https://driver.gms-logistics.id`**

> Portal Driver **tidak memakai menu admin**. Driver hanya melihat data
> pengiriman yang ditugaskan kepadanya, dan tidak bisa membuka Portal Admin.

## 8.1 Login Driver

1. Buka `https://driver.gms-logistics.id`.
2. Masukkan email & password akun Driver Anda.
3. Klik **Masuk**.
4. Anda masuk ke **Dashboard Driver**.

Jika akun Anda belum ditautkan ke data driver + unit truk, Dashboard menampilkan
keterangan: *"Akun Anda belum ditautkan ke data driver dan unit truk. Hubungi
admin untuk dihubungkan."*

## 8.2 Dashboard Driver

Halaman ini menampilkan:

- **Tombol utama:**
  - **Scan AWB** — membuka kamera untuk memindai QR/barcode resi.
  - **Data Pengiriman** — membuka halaman riwayat pengiriman.
  - **Isi AWB Manual** — memasukkan nomor AWB dengan mengetik.
  - **Refresh Data** — memuat ulang data terkini.
- **Unit Truck Anda** — kartu berisi nomor unit + jenis truk Anda (plus tombol
  **Butuh Bantuan?** untuk menghubungi Admin via WhatsApp).
- **4 tab ringkasan** (klik untuk melihat daftarnya):
  - **Aktif** — pengiriman yang sedang berjalan.
  - **Selesai** — pengiriman yang sudah Selesai / Terkirim.
  - **Kendala** — pengiriman berstatus Kendala.
  - **Terbuka** — **Pesanan Terbuka**: pengiriman yang belum ditugaskan ke
    driver mana pun; semua driver bisa melihat & mengambil.

## 8.3 Melihat Tugas Pengiriman

1. Pada Dashboard, klik tab **Aktif** (atau Selesai/Kendala).
2. Daftar **Pengiriman Saya** tampil sebagai kartu-kartu, masing-masing berisi
   AWB, rute, status.
3. Klik salah satu kartu untuk membuka **Detail Pengiriman**.

> Jika tidak ada pengiriman: "Belum ada data pengiriman. Pengiriman yang
> ditugaskan kepada Anda akan muncul di sini. Anda juga bisa mengambil pesanan di
> tab Terbuka."

## 8.4 Mengambil Pesanan Terbuka (Klaim)

1. Buka tab **Terbuka**.
2. Gunakan filter **Client / Tujuan / Service** untuk mempersempit (filter
   berjenjang: memilih Client menyaring pilihan Tujuan & Service).
3. Klik **Ambil Pesanan** pada kartu yang diinginkan.
4. Status kartu berubah menjadi **"Klaim Anda sedang menunggu konfirmasi admin"**
   — atau klik **Batalkan Klaim** untuk menarik kembali.
5. Tunggu admin mengonfirmasi (atau menolak). Jika dikonfirmasi, pengiriman
   otomatis menjadi tugas Anda (muncul di tab Aktif).

**Aturan:**
- Satu AWB hanya bisa diklaim satu driver pada satu waktu (driver lain melihat
  "menunggu konfirmasi").
- Konfirmasi dilakukan admin di Portal Admin (menu Data Pengiriman / detail resi).

## 8.5 Scan / Isi AWB

- **Scan AWB**: klik tombol Scan AWB → izinkan kamera → arahkan ke QR/barcode
  pada resi → sistem mencari AWB di daftar Pesanan Terbuka.
  - Jika ketemu: kartu hasil scan ditampilkan, langsung bisa **Ambil Pesanan**.
  - Jika tidak: pesan "AWB ... tidak ditemukan di pesanan terbuka." (mungkin
    sudah ditugaskan atau salah nomor).
- **Isi AWB Manual**: klik tombol Isi AWB Manual → ketik nomor AWB → hasil sama
  seperti scan.

## 8.6 Detail Pengiriman (Halaman AWB)

Dari kartu pengiriman, buka **Detail Pengiriman**:

- **Kartu utama**: AWB + status, Estimasi Tiba, **Asal** (alamat pengirim),
  **Tujuan** (alamat penerima).
- Tombol:
  - **Rute Tujuan** — membuka Google Maps menuju alamat tujuan.
  - **Hubungi Penerima** — membuka WhatsApp ke nomor penerima.
  - **Hubungi Admin (Darurat/Kendala)** — WhatsApp ke admin GMS.
- **Informasi Barang**: jumlah koli, berat, layanan, deskripsi, unit truk, nama penerima.
- **Riwayat Perjalanan**: timeline lengkap (dari terbaru).
- **Perbarui Status**: form untuk mengubah status.
- **Laporkan Posisi**: tombol **Perbarui Posisi**.

## 8.7 Memperbarui Status Perjalanan

1. Buka **Detail Pengiriman** untuk AWB yang sedang dikerjakan.
2. Pada kartu **Perbarui Status**, pilih **Status Baru** dari daftar — sistem
   hanya menampilkan status yang sah untuk posisi saat ini (mis. Berangkat,
   Transit, Dalam Perjalanan, Kendala, Tiba di Tujuan, Selesai / Terkirim;
   **Transfer Unit, Re-route, Penarikan tidak tersedia untuk driver**).
3. Isi **Lokasi (Nama Area)** — ketik atau pilih dari data Kota & Titik Transit.
4. **Catatan** — wajib diisi (keterangan singkat).
5. Jika status **Kendala**: pilih **Jenis Kendala** dari pilihan cepat (Penerima
   Tidak Ada, Alamat Tidak Ditemukan, Kendaraan Bermasalah, Kecelakaan/Kondisi
   Darurat, Jalan Tidak Dapat Dilalui, Penerima Menolak Barang, Barang
   Bermasalah, dll.) — otomatis menjadi catatan.
6. (Opsional) Lampirkan **foto** perjalanan.
7. Klik **Simpan Status**.
8. Sistem menampilkan "Status berhasil diperbarui." dan riwayat langsung
   bertambah.

## 8.8 Menyelesaikan Pengiriman (Selesai / Terkirim)

Saat barang diserahkan:

1. Pilih status **Selesai / Terkirim**.
2. Isi **Nama Penerima** — nama orang yang menerima barang (wajib).
3. Upload **Foto Barang Diterima** — **wajib**, bukti serah terima yang tampil
   ke customer di tracking.
4. (Opsional) **Foto Surat Jalan** — arsip internal, tidak tampil ke customer.
5. Isi catatan singkat (wajib).
6. Klik **Simpan Status**.

Setelah selesai: status menjadi **Selesai / Terkirim**, pengiriman terkunci
(tidak bisa diubah lagi), dan kartu "Perbarui Status" diganti keterangan
"Pengiriman ini sudah Selesai/Terkirim."

## 8.9 Melaporkan Posisi GPS

1. Pada detail pengiriman, buka kartu **Laporkan Posisi**.
2. Klik **Perbarui Posisi** — browser akan meminta izin lokasi (izinkan; aktifkan
   GPS HP).
3. Sistem mengirim koordinat Anda, lalu menampilkan "Posisi berhasil dikirim."
4. Posisi terakhir tersimpan dan dapat dilihat admin di Portal Admin (kartu
   "Posisi Terakhir Driver" + tombol "Buka di Google Maps").

> Izin lokasi yang ditolak → sistem menampilkan "Izin lokasi ditolak. Aktifkan
> izin lokasi di pengaturan browser." Anda tetap bisa memakai fitur lain.

## 8.10 Riwayat Pengiriman & Unduh Data

1. Klik **Data Pengiriman** di Dashboard.
2. Halaman menampilkan **seluruh pengiriman yang pernah ditugaskan ke Anda**.
3. Gunakan filter **Status** dan **rentang tanggal** untuk mempersempit.
4. Tersedia tombol **Unduh (CSV/Excel)** dan **Unduh PDF** untuk mengekspor
   laporan pengiriman Anda.

## 8.11 Butuh Bantuan (WhatsApp Admin)

- Tombol **Butuh Bantuan?** di Dashboard dan **Hubungi Admin (Darurat/Kendala)**
  di detail pengiriman membuka WhatsApp dengan pesan yang sudah terisi (beserta
  nama/AWB).
- Nomor tujuan diambil dari pengaturan **Informasi Bantuan** (WhatsApp Admin).
  Jika nomor belum dikonfigurasi, sistem memberi tahu "nomor belum dikonfigurasi".

## 8.12 Logout

- Gunakan tombol **Logout** (ikon keluar) pada Portal Driver.
- Setelah logout Anda dikembalikan ke halaman login driver.

## 8.13 Ringkasan yang Boleh / Tidak Boleh Driver

**Boleh:** melihat pengiriman ditugaskan + pesanan terbuka; klaim/batalkan klaim;
update status (kecuali Transfer Unit/Re-route/Penarikan); upload foto; lapor
posisi; lihat riwayat; unduh data; hubungi admin.

**Tidak boleh:** membuka Portal Admin; melihat pengiriman driver lain; melihat
status Hold/Dibatalkan; mengubah unit truck; mengubah data pengiriman; mengelola
master data/user/konfigurasi; menghapus apa pun; membatalkan order.

---

# 9. Panduan Master Data

Master data adalah data acuan yang dipakai di seluruh aplikasi (armada, kota,
rate, layanan, clients, mitra). Menu ini berada di grup **Master Data** pada
Portal Admin.

| Menu | Siapa yang melihat | Siapa yang mengelola |
|---|---|---|
| Master Armada | non-Mitra (Client & Viewer lihat saja — judul "Master Armada Dedicated") | Superadmin & GMS-Admin |
| Kota & Titik Transit | non-Mitra (Client & Viewer lihat saja) | Superadmin & GMS-Admin |
| Rate Publish | Superadmin, GMS-Admin, Viewer, Client | **Ubah harga: Superadmin saja** |
| Master Layanan | Superadmin, GMS-Admin, Viewer, Client | Superadmin & GMS-Admin |
| Clients | Superadmin & GMS-Admin | Superadmin & GMS-Admin |
| Mitra | Superadmin & GMS-Admin | Superadmin & GMS-Admin |

> Viewer dan Client hanya bisa **melihat** — tombol Tambah/Edit/Hapus tidak
> muncul dan server menolak jika dipanggil.

---

## 9.1 Master Armada

**Fungsi:** mengelola data unit truck (nomor unit, jenis, kapasitas, status) dan
driver (nama, telepon) yang tertaut.

**Melihat:**
1. Buka **Master Data → Master Armada**.
2. Daftar truck tampil dengan kolom Nomor Unit, Jenis, Kapasitas, Driver, Status.
3. Gunakan pencarian (nomor unit/jenis/driver), filter **jenis**, dan filter
   **status** (Available / On Trip / Maintenance / Inactive).
4. Klik nomor unit untuk membuka **Riwayat Perjalanan** unit tersebut.

**Status armada:**
- **Available** — siap dipakai.
- **On Trip** — sedang bertugas (muncul otomatis saat pengiriman berjalan).
- **Maintenance** — perawatan.
- **Inactive** — nonaktif; tidak muncul sebagai pilihan saat membuat pengiriman.

**Menambah (Superadmin/GMS-Admin):**
1. Klik **Tambah Truck**.
2. Pilih mode **Input 1 Truck** atau **Bulk / Import Excel**.
3. Isi: Nomor Unit/Polisi (wajib, tidak boleh dobel), Jenis Truck (wajib),
   Kapasitas (wajib), Status Armada, Nama Driver (wajib), No. HP Driver (wajib),
   Keterangan.
4. Klik **Simpan Truck**.

**Mengubah (Superadmin/GMS-Admin):**
- Klik ikon **Edit** pada baris → ubah → simpan.

**Mengubah status / aktivasi:**
- Ubah status armada dari form edit, atau gunakan aksi aktif/nonaktif.
- Unit **Inactive** tidak bisa dipilih saat membuat pengiriman.

**Armada Dedicated (khusus Client):**
- Superadmin/GMS-Admin dapat menetapkan unit tertentu khusus untuk satu Client
  (tombol **Dedikasikan** pada baris; pilih Client + catatan).
- Client login hanya melihat unit yang didedikasikan untuk Client-nya
  ("Master Armada Dedicated") dan hanya bisa memakai unit itu saat membuat
  pengiriman.
- Mencabut dedikasi: tombol pada baris unit.

**Menghapus (Superadmin saja):**
- Klik ikon **Hapus** → konfirmasi → data pindah ke **Recycle Bin** (soft
  delete).
- Sistem menolak menghapus unit yang masih dipakai pengiriman aktif atau masih
  didedikasikan ke Client.

**Catatan validasi:**
- Nomor unit duplikat ditolak ("sudah ada di master data, tidak bisa dobel").
- Driver pada form adalah data driver milik unit itu; akun login Driver dibuat
  terpisah di **Manajemen User → User Driver**.

## 9.2 Kota & Titik Transit

**Fungsi:** master data lokasi (kota/kabupaten, provinsi, area) yang dipakai
untuk kota asal/tujuan pengiriman dan lokasi update tracking.

**Melihat:**
1. Buka **Master Data → Kota & Titik Transit**.
2. Daftar menampilkan Kode, Nama Area, Kota, Provinsi, Jenis, Status.
3. Pencarian & filter jenis (Gudang / Hub / Transit / Cabang / Tujuan) dan status.
4. Tombol **Export XLSX** untuk mengunduh data titik.

**Menambah (Superadmin/GMS-Admin):**
1. Klik **Tambah Titik** → **Input 1 Titik** atau **Bulk / Import Excel**.
2. Isi: Kode (opsional), Nama Area (opsional), Kota (wajib), Provinsi (opsional),
   Jenis, Aktif.
3. Simpan.

**Mengubah / nonaktifkan (Superadmin/GMS-Admin):**
- Ikon Edit untuk mengubah; aksi Nonaktifkan (konfirmasi) untuk menonaktifkan;
  aktifkan kembali dari baris nonaktif.

**Menghapus (Superadmin saja):**
- Ikon Hapus → ke Recycle Bin. Sistem menolak jika titik masih dipakai riwayat
  tracking.

**Catatan:**
- Nama Area dengan Jenis yang sama tidak boleh dobel.
- Saat driver/admin mengetik lokasi update tracking, saran Nama Area diambil
  dari data ini.

## 9.3 Rate Publish

**Fungsi:** daftar **harga publish per kg** (per wilayah: pulau, provinsi,
kabupaten/kota, kecamatan, kategori area) yang dipakai kalkulator **Cek Ongkir**
di situs publik. Nilai yang diubah di sini langsung berlaku di Cek Ongkir.

**Melihat (Superadmin, GMS-Admin, Viewer, Client):**
1. Buka **Master Data → Rate Publish**.
2. Tabel menampilkan Pulau, Jarak dari P. Jawa, Provinsi, Kabupaten/Kota,
   Kecamatan, Kategori, Lead Time, **Rate Publish / kg**.
3. Gunakan pencarian & filter: Provinsi, Kab/Kota (muncul setelah pilih
   provinsi), Kategori, Pulau, Jarak dari P. Jawa.
4. **Unduh Data** — tombol export (hanya Superadmin & GMS-Admin) untuk
   mengunduh file CSV berisi data (ID, wilayah, rate lama & rate baru).
   File ini dipakai untuk Bulk Update.

**Mengubah harga (SUPERADMIN SAJA):**
- Klik ikon **Edit** pada baris → masukkan **Rate Publish baru (Rp per kg)** →
   **Simpan Perubahan**.
- Nilai harus angka bulat > 0 (maks. 10.000.000). Sistem menolak jika tidak
   berubah.
- Jika data diubah pengguna lain saat Anda membuka form, sistem memberi tahu
   "Rate Publish baru saja diubah pengguna lain" dan meminta muat ulang.

**Bulk Update (SUPERADMIN SAJA):**
1. Klik **Unduh Data** untuk mendapat template (kolom ID, Rate Publish Lama,
   Rate Publish Baru).
2. Ubah kolom **Rate Publish Baru** pada file.
3. Klik **Bulk Update** → pilih file `.xlsx`/`.csv`.
4. Sistem menampilkan **Preview**: baris yang akan berubah (Update), yang sama
   (Sama), dan yang error (Error) beserta alasannya.
5. Periksa preview → **Konfirmasi Update** untuk menyimpan (semua perubahan
   berlaku sekaligus; jika ada error, tidak ada yang diubah).

**Menghapus (SUPERADMIN SAJA):**
- Ikon **Hapus** → pilih cara:
  - **Hapus (ke Recycle Bin)** — pindah ke Recycle Bin, bisa dipulihkan.
  - **Hapus Permanen** — data dihapus **SECARA PERMANEN** dan tidak dapat
    dipulihkan (khusus tersedia untuk data Rate Publish; wajib alasan; riwayat
    harga tetap tercatat di Audit Log & history tarif).

**Batasan:**
- **GMS-Admin tidak bisa mengubah harga** — tombol edit & bulk update tidak
  muncul; permintaan perubahan ke server ditolak ("Hanya Superadmin yang dapat
  mengubah Rate Publish").
- Viewer & Client hanya melihat (tanpa kolom Diperbarui, tanpa unduh).
- Perubahan harga **tidak** mengubah pengiriman yang sudah dibuat (order tidak
  menyimpan harga).

## 9.4 Master Layanan

**Fungsi:** daftar layanan pengiriman (mis. Regular, LTL, FTL, FCL, LCL, Air,
ProCargo, atau layanan custom) yang bisa dipilih saat membuat/mengedit order.

**Melihat:** buka **Master Data → Master Layanan** — tabel menampilkan Layanan,
Deskripsi, jumlah order pemakai, Status.

**Menambah (Superadmin/GMS-Admin):**
1. Klik **Tambah Layanan**.
2. Pilih layanan standar dari daftar, atau pilih **Custom** dan ketik nama.
3. Isi deskripsi (opsional) → simpan.

**Mengubah (Superadmin/GMS-Admin):**
- Ikon Edit → ubah nama (kecuali layanan Default) / deskripsi.

**Aktif / Nonaktif (Superadmin/GMS-Admin):**
- Nonaktif: layanan tidak muncul untuk order baru; order lama tidak berubah.
- Aktifkan kembali: muncul lagi untuk order baru.
- Layanan **Default** (fallback, biasanya LTL/Regular) **tidak bisa**
  dinonaktifkan, dihapus, atau diganti nama — karena dipakai otomatis saat order
  memakai layanan yang tidak dikenal.

**Menghapus (Superadmin saja):**
- Ikon Hapus → Recycle Bin. Layanan Default tidak bisa dihapus; layanan yang
  dipakai order ditolak sistem.

**Catatan:**
- Saat membuat pengiriman, layanan yang tidak aktif/tidak dikenal **otomatis
  memakai layanan Default** (dengan catatan kecil).
- Saat **mengedit** order, mengubah layanan harus ke layanan yang **aktif**;
  jika tidak, sistem menolak (tidak ada fallback otomatis saat edit).

## 9.5 Clients

**Fungsi:** master data perusahaan client (Client ID, nama, kota, nomor kontrak
kerja sama) yang menjadi acuan akun Client dan Client ID pada pengiriman.

**Menu:** **Manajemen User → Clients** (hanya Superadmin & GMS-Admin).

**Melihat:**
- Tabel menampilkan Client ID, Nama, Kota, Nomor Kontrak/No. Pelanggan, Status
  (Aktif/Nonaktif), jumlah pengiriman, dan akun-akun user Client.

**Menambah:**
1. Klik **Tambah Client**.
2. Isi **Client ID** (wajib, otomatis huruf besar), **Nama Client** (wajib),
   Kota, dan **Nomor Kontrak Kerja Sama** (kolom ini hanya bisa diisi/diubah
   Superadmin).
3. Simpan. Client baru langsung bisa dipilih di User Admin → Tambah User.

**Mengubah:**
- Ikon Edit → ubah Nama/Kota (dan Nomor Kontrak — Superadmin saja).

**Aktif / Nonaktif:**
- Nonaktifkan → **semua akun user Client tersebut tidak bisa login**
  (muncul pesan "Akun Client Anda dinonaktifkan").
- Aktifkan kembali → user-nya bisa login lagi.

**Menghapus (Superadmin saja):**
- Sistem menolak jika masih ada user aktif atau pengiriman aktif dengan Client
  ID tersebut. Jika lolos, data pindah ke Recycle Bin.

## 9.6 Mitra

**Fungsi:** master data agen mitra (kode mitra, nama, PIC, telepon, email,
alamat, area) yang menerima pengiriman yang diteruskan GMS.

**Menu:** **Manajemen User → Mitra** (hanya Superadmin & GMS-Admin).

**Melihat & mencari:** tabel berisi Kode Mitra, Nama, PIC, Telepon, Area, Status;
ada pencarian & filter status.

**Menambah:**
1. Klik **Tambah Mitra**.
2. Isi **Kode Mitra** (wajib, huruf besar), **Nama Mitra** (wajib), PIC, telepon,
   email, alamat, area.
3. Simpan.

**Mengubah / nonaktifkan:**
- Ikon Edit untuk mengubah (kode tidak bisa diubah).
- Nonaktifkan → akun user Mitra tersebut **tidak bisa login** ("Akun Mitra Anda
   dinonaktifkan"); aktifkan kembali untuk mengembalikan akses.

**Menghapus (Superadmin saja):**
- Sistem menolak jika masih ada user aktif atau pengiriman aktif milik Mitra.

**Meneruskan pengiriman ke Mitra:**
- dari detail resi (bagian **Mitra**): pilih Mitra → **Teruskan ke Mitra**
  (Superadmin/GMS-Admin). Pengiriman yang statusnya Hold tidak bisa diteruskan.
- **Batalkan Penugasan** untuk menarik kembali.
- Setelah diteruskan, pengiriman tampil di menu **Paket Saya** akun Mitra
  tersebut.

**Catatan:** Client **tidak** melihat data Mitra (dihapus dari tampilan order
milik Client).

---

# 10. Panduan Manajemen User

**Siapa yang dapat mengelola user:**
Hanya **Superadmin** dan **GMS-Admin** (menu **Manajemen User**). Role lain
tidak melihat menu ini.

> Batasan GMS-Admin: GMS-Admin **tidak bisa** membuat/mengubah/menonaktifkan
> akun ber-role **Admin (GMS-Admin)** — hanya Superadmin yang bisa. Akun
> **Superadmin tidak bisa diubah oleh siapa pun** lewat halaman ini.

## 10.1 Menu Manajemen User

| Menu | Isi |
|---|---|
| User Admin | Akun semua role kecuali Driver (Superadmin, GMS-Admin, Viewer, Client, Mitra) |
| User Driver | Khusus akun Driver, lengkap dengan Nopol truck yang ditautkan |
| Clients | Master data perusahaan client (lihat bab 9.5) |
| Mitra | Master data mitra (lihat bab 9.6) |

## 10.2 Melihat Daftar & Detail User

1. Buka **Manajemen User → User Admin** (atau **User Driver**).
2. Tabel menampilkan: Nama (beserta foto profil bila ada), Email, Role (untuk
   User Admin), Nopol (untuk User Driver), Status Aktif/Nonaktif, Last Login
   (User Admin).
3. Gunakan kolom pencarian **Nama / Email** (dan **Nopol** untuk driver), filter
   **Role**, filter **Status**.
4. Klik tombol **Cari** untuk menerapkan, **Reset** untuk menghapus filter.
5. Klik ikon **Detail** (mata) pada baris untuk melihat detail lengkap user.

## 10.3 Menambah User

1. Klik tombol **Tambah User** (atau **Tambah Driver** pada menu User Driver).
2. Isi form:
   - **Nama** (wajib).
   - **Email** (wajib, harus unik — email yang sudah dipakai user lain ditolak).
   - **Role** (User Admin saja): Superadmin / Admin (GMS-Admin) / Viewer /
     Client / Mitra — dengan catatan GMS-Admin tidak bisa memilih role Admin.
   - **Password** (wajib saat tambah; minimal 8 karakter).
   - **Foto profil** (opsional, bisa kamera/upload, dikompres otomatis).
   - Untuk role **Client/Viewer**: wajib pilih **Client** (Client ID).
   - Untuk role **Mitra**: wajib pilih **Mitra** (kode mitra).
   - Untuk role **Driver** (via User Driver): wajib pilih **driver** (data
     driver dari Master Armada — Nopol; hanya driver yang belum terpakai yang
     bisa dipilih).
3. Klik simpan.

**Hasil:** user baru bisa langsung login dengan email & password tersebut.

## 10.4 Mengubah Data User

1. Klik ikon **Edit** pada baris.
2. Ubah nama, email, role (sesuai batasan), foto, password (kosongkan jika
   tidak ingin mengganti), tautan Client/Mitra/Driver.
3. Simpan.

**Batasan:**
- GMS-Admin hanya bisa mengubah akun Viewer, Client, dan Mitra (bukan Admin).
- Akun Superadmin tidak bisa diubah lewat halaman ini.
- Email tidak boleh sama dengan user lain (validasi saat mengetik + ditegakkan
  server).

## 10.5 Mengaktifkan / Menonaktifkan User

- Klik ikon **Power** pada baris:
  - **Nonaktifkan** (ikon merah): muncul konfirmasi "Akun ini tidak akan bisa
    login sampai diaktifkan kembali" → konfirmasi.
  - **Aktifkan** (ikon hijau): user bisa login lagi.
- Sesi login user yang dinonaktifkan **langsung dicabut** (tidak bisa lagi
  memakai token lama).

> Jika Client/Mitra-nya dinonaktifkan dari menu Clients/Mitra, semua akun user
> terkait otomatis **tidak bisa login** (pesan "akun dinonaktifkan").

## 10.6 Menghapus User (Superadmin saja)

1. Klik ikon **Hapus** pada baris.
2. Sistem menampilkan **peringatan data terkait** (pengiriman yang dibuat akun
   itu, tracking yang diinput, audit log, dst.).
3. Isi **alasan** (wajib).
4. Konfirmasi → user dipindahkan ke **Recycle Bin** (soft delete).
   - Sesi user yang dihapus langsung dicabut.
   - Sistem menolak menghapus akun sendiri / Superadmin terakhir.

**Catatan:** akun yang dihapus (soft delete) tidak bisa login; data historisnya
(nama di record lama) tetap terbaca. Data dapat dipulihkan dari Recycle Bin oleh
Superadmin (lihat bab 12).

## 10.7 Mengatasi Kesalahan Validasi

| Pesan | Arti & Solusi |
|---|---|
| Email sudah digunakan oleh user lain. | Ganti email lain; email harus unik. |
| Client wajib dipilih untuk role Client. | Pilih Client ID di form. |
| Mitra wajib dipilih untuk role Mitra. | Pilih kode Mitra di form. |
| Password minimal 8 karakter. | Password baru minimal 8 karakter. |
| Hanya Superadmin yang dapat mengubah akun GMS-Admin lain. | Anda (GMS-Admin) tidak berhak mengelola akun Admin — minta Superadmin. |
| Akun Superadmin tidak bisa diubah lewat halaman ini. | Baris Superadmin terkunci. |

## 10.8 Unduh Data User

- Tombol **Unduh Data User** (kanan atas) mengekspor daftar user yang cocok
  dengan filter (semua halaman) ke file Excel.

## 10.9 Pengaturan Akun Sendiri (Semua role)

Setiap pengguna dapat mengubah profil & password sendiri:

1. Klik **nama/avatar** di kanan atas Portal Admin → **Pengaturan Akun**.
2. Ubah **Nama**, **Email**, **Foto profil** → **Simpan**.
3. Ganti password: isi **Password saat ini**, **Password baru** (min. 8
   karakter), **Konfirmasi** → **Simpan**.
   - Setelah ganti password, **semua sesi login lain di perangkat lain terputus**
     — Anda harus login ulang memakai password baru.

---

# 11. Panduan Konfigurasi Sistem

**Siapa yang dapat membuka halaman Konfigurasi:**
Superadmin & GMS-Admin (menu **Konfigurasi**). Viewers/Client/Mitra tidak
melihat menu ini.

**Siapa yang dapat mengubah nilai:**
- Halaman **Tracking**: Superadmin & GMS-Admin.
- Halaman **Informasi CS** & **Informasi Bantuan**: **hanya Superadmin** yang
  dapat mengubah isinya — GMS-Admin bisa membuka halaman tetapi kolomnya
  terkunci (ditegakkan juga di server).

## 11.1 Tracking (Konfigurasi → Tracking)

Menu ini memiliki dua pengaturan:

### a. "AWB dianggap macet setelah (hari)"

- **Fungsi:** menentukan ambang jumlah hari tanpa pembaruan status. Pengiriman
  yang tidak mendapat update tracking selama lebih dari jumlah hari ini disebut
  **AWB macet** dan ditampilkan pada kartu **"AWB Memerlukan Perhatian"** di
  Dashboard serta filter `macet` di Data Pengiriman.
- **Cara mengubah:**
  1. Buka **Konfigurasi → Tracking**.
  2. Isi angka hari (minimal 1) pada kolom **"AWB dianggap macet setelah (hari)"**.
  3. Klik **Simpan Pengaturan**.
- **Contoh:** isi `3` → AWB tanpa update tracking selama lebih dari 3 hari
  dianggap macet dan masuk perhatian tim.
- **Dampak:** perubahan langsung berlaku; Dashboard memakai nilai ini.

### b. Pengiriman Email (toggle)

- **Fungsi:** menyalakan/mematikan pengiriman email notifikasi ke customer
  (resi terbit, kendala, selesai).
- Matikan sementara jika ingin **menghemat kuota email**. Saat nonaktif, tombol
  "Kirim Email" pada resi **tidak mengirim email sungguhan** (menampilkan
  peringatan), dan notifikasi email otomatis juga tidak terkirim.
- **Cara mengubah:** geser toggle **"Kirim email notifikasi ke customer"**.
  Status aktif/nonaktif tampil di bawahnya.

## 11.2 Informasi CS (Konfigurasi → Informasi CS)

- **Fungsi:** data kontak customer service yang tampil di halaman **Kontak /
  Company Profile (publik)** dan dipakai tombol WhatsApp pada situs.
- **Isi field:** Telepon, **WhatsApp CS**, Email, Alamat kantor,
  Jam Operasional.
- **Cara mengubah (Superadmin saja):**
  1. Buka **Konfigurasi → Informasi CS**.
  2. Ubah field yang diperlukan (format WhatsApp: `08xxxxxxxxxx` atau
     `+628xxxxxxxxxx`).
  3. Klik **Simpan Informasi CS**.

## 11.3 Informasi Bantuan (Konfigurasi → Informasi Bantuan)

- **Fungsi:** nomor tujuan tombol bantuan (WhatsApp) di **halaman login** dan
  **Portal Driver**.
  - **WhatsApp Admin** — tujuan "Hubungi admin" untuk Driver, Client, Viewer,
    Mitra, dan lupa password.
  - **WhatsApp Superadmin** — tujuan lupa password untuk akun GMS-Admin.
- Boleh **dikosongkan** (berarti belum dikonfigurasi; tombol bantuan memberi
  tahu bahwa nomor belum diatur).
- **Cara mengubah (Superadmin saja):** sama seperti Informasi CS.

> Jangan membagikan angka WhatsApp internal ini ke publik kecuali memang
> dimaksudkan sebagai kontak bantuan.

## 11.4 Client Company Profile (Konfigurasi → Client Company Profile)

- **Fungsi:** mengelola **logo client** yang tampil pada section
  "Trusted by Our Clients" di situs publik (company profile).
- **Khusus Superadmin** — menu hanya muncul untuk Superadmin; role lain tidak
  bisa membuka (guard + server menolak).
- **Cara pakai:**
  1. Buka **Konfigurasi → Client Company Profile**.
  2. Klik **Tambah Logo** → isi nama client dan unggah file logo
     (PNG/JPG/WebP, maks. 8 MB).
  3. Edit / nonaktifkan / hapus sesuai kebutuhan (hapus → Recycle Bin, kecuali
     jalur khusus).
- Perubahan langsung tampil di situs publik.

## 11.5 Pengaturan Akun

Bukan bagian dari menu Konfigurasi — halaman **Pengaturan Akun** bisa dibuka
oleh semua role lewat klik nama/avatar di kanan atas (lihat bab 10.9):
ubah nama/email/foto profil, dan ganti password sendiri.

> **Penting:** Tidak ada password, token, atau kunci API yang ditampilkan dalam
> panduan ini. Seluruh pengaturan di atas berupa data konfigurasi aplikasi,
> bukan kredensial.

---

# 12. Panduan Sistem dan Keamanan

Grup menu **Sistem & Keamanan** di Portal Admin berisi halaman yang membantu
menjaga ketertiban dan keamanan data:

| Menu | Isi | Siapa yang bisa membuka |
|---|---|---|
| Audit Log | Riwayat lengkap siapa mengubah apa dan kapan | Superadmin & GMS-Admin |
| Recycle Bin | Tempat data yang dihapus, bisa dipulihkan | **Superadmin saja** |

Kedua halaman ini tidak bisa dilihat oleh Client, Viewer, Driver, maupun Mitra.

---

## 12.1 Audit Log

**Fungsi:** mencatat **semua aktivitas penting** yang terjadi di aplikasi —
siapa penggunanya, perannya, kapan, modul apa, dan keterangan kejadiannya.
Catatan ini **tidak bisa diubah atau dihapus** oleh pengguna; hanya sistem yang
menulisnya.

### Melihat dan Menyaring

1. Buka **Sistem & Keamanan → Audit Log**.
2. Setiap entri menampilkan: tanggal-jam (waktu WIB), nama pengguna beserta
   role-nya, label kejadian (mis. `CREATE AWB`, `UPDATE STATUS`, `LOGIN
   SUCCESS`, `HAPUS PERMANEN RATE PUBLISH`), modul, nomor AWB (bila terkait),
   dan keterangan singkat.
3. Filter yang tersedia:
   - **Semua User** — pilih nama pengguna tertentu.
   - **Semua Action** — pilih jenis kejadian.
   - **Semua Module** — pilih modul (mis. Rate Publish, User, Pengiriman).
   - Kolom **Cari deskripsi / user...** — cari kata dalam keterangan atau nama.
   - Kolom **Cari AWB...** — tampilkan hanya entri dengan AWB tertentu.
   - **Rentang tanggal** (dari – sampai) — batasi periode.
4. Klik **Reset** untuk menghapus semua filter.

> Rentang tanggal dihitung dalam zona waktu Indonesia Barat (WIB), sama seperti
> jam yang tampil pada entri.

### Mengunduh Data Audit

- Tombol **Unduh Data** (kanan atas) mengunduh **seluruh entri yang cocok
  dengan filter** (bukan hanya halaman yang sedang dibuka) ke file Excel.
- Daftar diunduh urut dari yang paling lama ke paling baru (alur audit biasa
  dibaca dari atas ke bawah).
- Jika data lebih dari 20.000 baris, unduhan dibatasi 20.000 baris pertama —
  persempit filter (misalnya rentang tanggal) untuk mengambil sisanya.

> **Tips Superadmin:** periksa Audit Log secara berkala, misalnya bila ada
> perubahan harga, penghapusan data, atau login mencurigakan. Semua perubahan
> tarif Rate Publish dan penghapusan permanen selalu tercatat di sini.

---

## 12.2 Recycle Bin

**Fungsi:** tempat penyimpanan sementara untuk data yang dihapus
(soft delete). Data di sini **masih bisa dipulihkan (restore)**, jadi
penghapusan yang salah tidak perlu membuat data hilang selamanya.

> **Penghapusan permanen otomatis sementara dinonaktifkan.** Data yang masuk
> Recycle Bin **tidak dihapus sendiri oleh sistem** — ia tetap tersimpan sampai
> Superadmin memulihkannya. Satu-satunya pengecualian adalah jalur khusus
> **Hapus Permanen Rate Publish** (lihat 12.3) yang memang langsung melewati
> Recycle Bin.

### Jenis Data yang Bisa Masuk Recycle Bin

| Jenis | Contoh yang tampil |
|---|---|
| User | Nama pengguna (email) |
| Truck / Master Armada | Nomor unit |
| Kota & Titik Transit | Nama area / kota |
| Layanan | Nama layanan |
| Client | Nama perusahaan |
| Mitra | Kode / nama mitra |
| Rate Publish (via opsi "Hapus (ke Recycle Bin)") | Wilayah + tarif |
| Logo Client (Client Company Profile) | Nama client |

> **Data Pengiriman (AWB) tidak bisa dihapus** oleh siapa pun, termasuk
> Superadmin — jadi pengiriman tidak pernah masuk Recycle Bin.

### Melihat dan Mencari

1. Buka **Sistem & Keamanan → Recycle Bin**.
2. Tabel menampilkan: Data (nama + keterangan), Jenis, Dihapus Oleh, Tanggal
   Hapus, Alasan, dan Status:
   - **Di Recycle Bin** — masih tersimpan dan bisa dipulihkan.
   - **Dipulihkan** — sudah dikembalikan ke sistem; baris ini mencatat siapa,
     kapan, dan alasannya.
   - **Dihapus Permanen** — sudah keluar dari bin (lihat penjelasan di bawah).
3. Cari dengan kata kunci (ID/AWB/nama/alasan), filter **Jenis Data**, filter
   **tanggal hapus** (dari–sampai), lalu klik **Cari** / **Reset**.

### Melihat Detail

- Klik **Detail** pada baris untuk membuka isi **Data Asli** (snapshot seluruh
  isi data saat dihapus) dan informasi: siapa menghapus, kapan, alasan, serta
  bila ada **Data Terkait** — data lain yang masih menunjuk ke data ini
  (berguna untuk menelusuri kenapa suatu pemulihan bisa tertahan).

### Memulihkan Data (Restore)

1. Pilih salah satu cara:
   - **Satu data:** klik **Restore** pada baris yang berstatus *Di Recycle
     Bin*, atau tombol Restore di dalam jendela Detail.
   - **Banyak data sekaligus:** centang kotak di samping data → klik
     **Restore Terpilih**.
2. Isi **Alasan Pemulihan** (wajib) → klik **Pulihkan Data**.
3. Data kembali ke sistem aktif dan bisa dipakai seperti biasa.

**Catatan:**
- Hanya data berstatus *Di Recycle Bin* yang bisa dipulihkan.
- Jika pemulihan sebagian gagal (misalnya data terkait sudah tidak tersedia),
  sistem menampilkan ringkasan "X berhasil, Y gagal" dan menyarankan melihat
  Audit Log untuk detail.
- Data yang sudah **Dipulihkan** tetap muncul di daftar (dengan status
  tersendiri) sebagai catatan jejak penghapusan & pemulihan.

---

## 12.3 Jalur Khusus: Hapus Permanen Rate Publish

**Ini satu-satunya penghapusan yang TIDAK lewat Recycle Bin.**

Rate Publish memiliki opsi **Hapus Permanen** langsung dari halaman
**Master Data → Rate Publish** (ikon sampah). Berbeda dengan penghapusan lain:
data **tidak masuk Recycle Bin**, sehingga **tidak bisa dipulihkan** oleh
siapa pun.

**Aturan ketat:**
- **Hanya Superadmin** yang bisa melakukannya (tombol tidak muncul untuk role
  lain; server juga menolak).
- Wajib mengisi **Alasan Penghapusan Permanen**.
- Ada peringatan merah tegas sebelum dikonfirmasi: *"Data akan dihapus SECARA
  PERMANEN dan TIDAK DAPAT DIPULIHKAN."*
- Jika data masih terhubung dengan data lain, sistem menampilkan peringatan
  daftar keterkaitan — data terkait **tidak** ikut dihapus.

**Yang tetap tersimpan meski data dihapus permanen:**
- **Riwayat perubahan tarif** (history harga) tetap ada sebagai jejak audit —
  kaitan ke tarif yang dihapus dilepas, tetapi riwayatnya tidak hilang.
- **Audit Log** mencatat kejadian `HAPUS PERMANEN RATE PUBLISH` beserta
  alasan dan tarif sebelumnya — jadi tetap ada jejak siapa menghapus, kapan,
  dan nilainya.

**Setelah dihapus permanen:**
- Rate tidak muncul lagi di pencarian, daftar Rate Publish, maupun kalkulator
  **Cek Ongkir** di situs publik.
- Riwayat transaksi/pengiriman yang sudah terjadi **tidak terpengaruh**.

> **Kapan memakai yang mana?**
>
> | Situasi | Pilihan yang tepat |
> |---|---|
> | Data salah input / duplikat / testing, tapi ragu-ragu | **Hapus (ke Recycle Bin)** — aman, bisa dipulihkan |
> | Data salah input yang sudah pasti tidak pernah dipakai dan ingin bersih total | **Hapus Permanen** — sekali jalan, tidak bisa kembali |
> | Semua data lain (user, truck, kota, layanan, client, mitra, logo) | Hanya ada opsi ke Recycle Bin — dihapus permanen manual tidak tersedia |

---

# 13. Troubleshooting (Mengatasi Masalah)

Kumpulan masalah yang sering dialami pengguna beserta cara mengatasinya.
Jika masalah tidak terselesaikan setelah mencoba langkah di bawah, hubungi
**WhatsApp Admin** (lihat bab 11.3 — Informasi Bantuan) dengan menyertakan
nomor AWB (bila ada), peran akun Anda, dan pesan kesalahan yang muncul.

---

## 13.1 Masalah Login

### Tidak bisa login (password salah / akun tidak dikenal)

1. Periksa kembali email dan password (password peka huruf besar/kecil).
2. Gunakan tombol **Lupa Password** bila tersedia — ikuti petunjuk yang
   dikirim ke email Anda.
3. Jika tetap gagal, akun Anda mungkin **dinonaktifkan** — hubungi admin.

### Muncul "Akun Anda dinonaktifkan"

Penyebab: akun Anda (atau Client/Mitra tempat Anda bernaung) dinonaktifkan
oleh Superadmin. Hubungi admin GMS untuk diaktifkan kembali.

### Sudah login tapi langsung disuruh login lagi

Kemungkinan:
- Sesi login Anda sudah **habis masa berlakunya** — login ulang.
- **Password baru saja diganti** (oleh Anda atau admin) — semua sesi lama
  diputus; login ulang dengan password terbaru.

### Akun ditolak masuk Portal yang salah

- Akun **Driver** hanya bisa login di Portal Driver
  (`https://driver.gms-logistics.id`).
- Akun **Superadmin / GMS-Admin / Viewer / Client / Mitra** hanya bisa login
  di Portal Admin (`https://admin.gms-logistics.id`).

---

## 13.2 Masalah Akses / Menu Tidak Muncul

### Menu tidak muncul di sidebar

Setiap role hanya melihat menu sesuai haknya (lihat bab 2). Contoh:
- Viewer & Client tidak melihat grup Manajemen User / Konfigurasi /
  Sistem & Keamanan.
- GMS-Admin tidak melihat Recycle Bin dan Client Company Profile.
- Mitra tidak melihat Master Armada.

Jika menu seharusnya muncul untuk role Anda tetapi tidak ada, muat ulang
halaman (refresh); jika tetap, hubungi admin.

### Bisa membuka halaman tapi tombol aksi tidak muncul / klik tidak berhasil

Itu artinya role Anda hanya boleh **melihat** (read-only), misalnya:
- Viewer: tombol Tambah/Edit/Hapus tidak ada di mana pun.
- Client: tidak ada tombol ubah harga di Rate Publish.
- GMS-Admin: tidak ada opsi **Hapus Permanen** di Rate Publish (khusus
  Superadmin).

Sistem juga memeriksa ulang di server, jadi aksi yang tidak diizinkan tetap
ditolak walau dipanggil lewat alamat langsung.

### "Tidak dapat membuka halaman ini" / diarahkan ke Dashboard

Anda mengetik alamat halaman yang memang tidak diizinkan untuk role Anda
(contoh: Client membuka alamat Recycle Bin). Kembalilah ke menu yang tersedia.

---

## 13.3 Masalah Membuat / Mengedit Pengiriman

| Masalah | Solusi |
|---|---|
| Nomor AWB sudah dipakai | Nomor resi tidak boleh dobel. Cek data pengiriman yang sudah ada, atau gunakan generate otomatis dari sistem. |
| Tidak bisa memilih truck/driver | Pastikan ada unit berstatus **Available** (bukan On Trip/Maintenance/Inactive) yang bisa dipilih. |
| Layanan tidak muncul saat membuat order | Layanan mungkin sedang **Nonaktif** — order baru memakai layanan Default (biasanya LTL/Regular). Nyalakan kembali layanan di Master Layanan bila perlu. |
| Tombol Edit tidak muncul | Status pengiriman sudah lewat *Dalam Persiapan* (mis. sudah Berangkat) — data tidak bisa diubah lagi. |
| Kesalahan validasi "Client ID wajib" / "harus milik Anda" | Akun Client hanya bisa memakai Client ID sendiri; isi/nilai Client ID benar. |
| Mengubah layanan saat edit ditolak | Saat mengedit, layanan baru harus **Aktif** — sistem tidak memakai fallback otomatis (beda dengan saat membuat order baru). |

---

## 13.4 Masalah Tracking & Status

### Status / riwayat tidak muncul di tracking publik

1. Pastikan nomor AWB benar (contoh: `TATA0001` — sama persis, tanpa spasi
   berlebih).
2. Baru saja di-update? Muat ulang halaman tracking (refresh).
3. Jika AWB tidak ditemukan, minta admin memastikan nomor tersebut memang
   diterbitkan sistem.

### AWB tampil sebagai "macet" / masuk daftar "AWB Memerlukan Perhatian"

Pengiriman dianggap macet bila **tidak ada pembaruan status selama lebih dari
jumlah hari** yang diatur di **Konfigurasi → Tracking** (default sesuai
pengaturan). Solusi: driver/admin mengisi update tracking terbaru; setelah
update, AWB tidak lagi dianggap macet.

### Pengiriman sudah selesai tapi masih muncul di daftar aktif

Pengiriman yang sudah **Selesai / Terkirim** terkunci dan tidak bisa diubah;
pastikan filter status di halaman Data Pengiriman tidak menyaring semua status.
Selesai/Terkirim tampil pada tab/status tersendiri.

### Tidak bisa update status "Selesai / Terkirim" (driver)

Status selesai wajib mengisi **Nama Penerima** dan mengunggah **Foto Barang
Diterima**. Lengkapi keduanya, lalu simpan.

### Status tertentu tidak muncul di pilihan (mis. Transfer Unit, Re-route)

Transfer Unit, Re-route, dan Penarikan **khusus admin** — Driver dan Mitra
tidak melihat opsi tersebut.

---

## 13.5 Masalah Foto / File

### Gagal mengunggah foto

- Periksa ukuran file — sistem membatasi ukuran unggahan dan otomatis
  mengompres foto kamera. Gunakan file lebih kecil bila perlu.
- Periksa koneksi internet; coba lagi.
- Format yang didukung: PNG/JPG/WebP (untuk logo client, maks. 8 MB).

### Foto bukti terima tidak tampil di tracking

Pastikan foto benar-benar terunggah saat **Simpan Status** — status selesai
wajib disertai foto. Muat ulang halaman tracking.

---

## 13.6 Masalah Notifikasi & Email

### Tidak menerima email notifikasi

1. Periksa folder Spam/Promosi.
2. Pastikan email customer yang diisi di pengiriman benar.
3. Kemungkinan besar **pengiriman email sedang dimatikan** (toggle
   "Kirim email notifikasi ke customer" nonaktif di **Konfigurasi → Tracking**)
   — minta Superadmin/GMS-Admin menyalakannya kembali.

### Tombol "Kirim Email" tampak tidak melakukan apa-apa

Saat toggle email nonaktif, tombol tidak mengirim email sungguhan dan
menampilkan peringatan. Nyalakan toggle di Konfigurasi → Tracking bila email
diperlukan.

### Notifikasi di lonceng tidak muncul

- Buka halaman **Notification Center** dari ikon lonceng; pastikan tidak ada
  filter yang menyembunyikan notifikasi.
- Muat ulang halaman.

---

## 13.7 Masalah Rate Publish & Cek Ongkir

### Harga di Cek Ongkir tidak berubah

Perubahan **Rate Publish** berlaku langsung di Cek Ongkir. Jika tampak belum
berubah: muat ulang halaman Cek Ongkir (refresh) — browser bisa menyimpan
tampilan lama.

### Tidak bisa mengubah harga / tombol Edit tidak ada

**Mengubah harga hanya Superadmin.** GMS-Admin hanya bisa melihat & mengunduh
data; Viewer & Client hanya melihat.

### Bulk Update gagal / ada baris "Error"

Sistem menampilkan **Preview** sebelum menyimpan: baris Update (akan berubah),
Sama (tidak berubah), dan Error (beserta alasannya). Jika ada error, **tidak
ada perubahan yang disimpan** — perbaiki baris bermasalah di file lalu unggah
ulang.

### Terlanjur menghapus Rate Publish

- Memilih **Hapus (ke Recycle Bin)** → masih bisa dipulihkan di
  **Recycle Bin** (bab 12.2).
- Memilih **Hapus Permanen** → **tidak bisa dipulihkan**. Riwayat harga dan
  Audit Log tetap tersimpan, tetapi data tarifnya hilang permanen. Hati-hati
  memilih opsi ini.

---

## 13.8 Masalah Portal Driver

### Kamera scan tidak terbuka

- Izinkan akses kamera saat browser meminta izin.
- Periksa pengaturan kamera browser (ikon gembok di address bar / Pengaturan
  Situs). Alternatif: gunakan **Isi AWB Manual** dengan mengetik nomor AWB.

### "Lokasi ditolak" saat melaporkan posisi

Aktifkan izin lokasi di pengaturan browser (dan pastikan GPS HP menyala).
Anda tetap bisa memakai fitur lain walau posisi tidak terkirim.

### AWB tidak ditemukan saat scan / isi manual

AWB mungkin sudah ditugaskan ke driver lain atau belum masuk daftar **Pesanan
Terbuka**. Periksa tab **Aktif** — mungkin AWB tersebut sudah menjadi tugas
Anda.

### Tombol "Ambil Pesanan" tidak ada

Pesanan mungkin sudah diklaim driver lain (status "menunggu konfirmasi") atau
sudah ditugaskan. Cari pesanan terbuka lain.

---

## 13.9 Masalah Pemulihan Data (Recycle Bin)

### Data tidak bisa dipulihkan (gagal restore)

- Data sudah berstatus **Dipulihkan** atau **Dihapus Permanen** — hanya data
  *Di Recycle Bin* yang bisa dipulihkan.
- Data terkait (mis. referensi lain) membuat pemulihan tertahan. Buka
  **Detail** untuk melihat **Data Terkait** dan telusuri penyebabnya.

### Mencari data yang terhapus

Buka **Recycle Bin** (Superadmin saja) → cari dengan kata kunci/nama/jenis/
tanggal. Data yang dihapus lewat jalur biasa selalu masuk bin ini. Kecuali
**Hapus Permanen Rate Publish** — data itu tidak akan pernah ditemukan di
Recycle Bin.

---

## 13.10 Masalah Lain-lain

### Aplikasi/portal terasa lambat

1. Muat ulang halaman dan pastikan koneksi internet stabil.
2. Tutup tab yang tidak perlu.
3. Gunakan browser terbaru (Chrome/Edge/Firefox).

### Angka/format salah (mis. harga, tanggal)

- Pastikan memakai format yang diminta form (contoh: angka bulat untuk rate
  per kg; format WhatsApp `08xxx` / `+628xxx` untuk pengaturan).
- Tanggal & jam di aplikasi ditampilkan dalam **WIB**.

### Tidak yakin data berubah / khawatir ada kesalahan

Cek **Audit Log** (Superadmin & GMS-Admin) — semua perubahan tercatat di
sana beserta nama pengguna dan waktu. Ini juga bukti bila ada kejadian yang
perlu ditelusuri.

---

# 14. FAQ (Pertanyaan yang Sering Diajukan)

## Tentang Aplikasi & Akun

**Q: Apa itu AWB dan bagaimana cara melacaknya?**
AWB (Air Waybill) adalah nomor resi digital pengiriman, contoh `TATA0001`.
Untuk melacak, buka `https://gms-logistics.id/tracking`, masukkan nomor AWB,
tanpa perlu login.

**Q: Apa bedanya Portal Admin dan Portal Driver?**
Portal Admin (`https://admin.gms-logistics.id`) dipakai Superadmin, GMS-Admin,
Viewer, Client, dan Mitra. Portal Driver (`https://driver.gms-logistics.id`)
khusus untuk akun Driver. Keduanya terpisah — akun Driver tidak bisa login di
Portal Admin, dan akun lain tidak bisa login di Portal Driver.

**Q: Saya lupa password, bagaimana?**
Gunakan tombol **Lupa Password** di halaman login. Bila tidak berhasil,
hubungi WhatsApp Admin (nomor bisa dilihat di pengaturan Informasi Bantuan
yang ditampilkan di halaman login).

**Q: Akun saya tiba-tiba tidak bisa login.**
Kemungkinan akun Anda (atau Client/Mitra tempat Anda bernaung) **dinonaktifkan**
oleh Superadmin, atau sesi login lama diputus setelah penggantian password.
Hubungi admin GMS.

**Q: Apakah bisa satu perusahaan memiliki lebih dari satu akun?**
Bisa. Client dan Mitra masing-masing dapat memiliki banyak akun user dengan
peran yang sama, selama dibuat oleh Superadmin/GMS-Admin di Manajemen User.

## Tentang Hak Akses

**Q: Mengapa saya tidak melihat menu tertentu?**
Setiap role hanya melihat menu sesuai haknya (bab 2). Contoh: Viewer dan Client
tidak melihat menu Kelola User/Konfigurasi/Audit Log/Recycle Bin; Mitra tidak
melihat Master Armada.

**Q: Siapa yang bisa membuat pengiriman?**
Superadmin, GMS-Admin, dan Client (untuk Client ID sendiri). Viewer dan Driver
tidak bisa membuat pengiriman.

**Q: Siapa yang bisa mengubah harga (Rate Publish)?**
**Hanya Superadmin.** GMS-Admin hanya bisa melihat dan mengunduh data; Viewer
dan Client hanya melihat.

**Q: Siapa yang bisa menghapus data?**
Penghapusan umumnya **khusus Superadmin** dan data dipindahkan ke Recycle Bin
(bisa dipulihkan). Khusus **Rate Publish**, Superadmin juga punya opsi
**Hapus Permanen** yang langsung menghapus tanpa Recycle Bin (tidak bisa
dipulihkan). Data Pengiriman (AWB) tidak bisa dihapus oleh siapa pun.

**Q: GMS-Admin bisa melakukan apa saja seperti Superadmin?**
Untuk pekerjaan operasional, hampir sama. Bedanya: GMS-Admin tidak bisa
membuka Recycle Bin, mengubah harga Rate Publish, mengelola Client Company
Profile, atau mengelola akun ber-role Admin/Superadmin.

## Tentang Pengiriman

**Q: Bagaimana alur pengiriman?**
Buat pengiriman → sistem menerbitkan nomor AWB (status *Dalam Persiapan*) →
ditugaskan ke truck/driver (atau dibiarkan sebagai Pesanan Terbuka) → driver
meng-update status (*Berangkat → Transit/Dalam Perjalanan → Tiba di Tujuan →
Selesai / Terkirim*) → customer melacak lewat tracking publik.

**Q: Kenapa saya tidak bisa mengedit pengiriman?**
Pengiriman hanya bisa diedit selama masih berstatus **Dalam Persiapan** (atau
Hold untuk kasus tertentu). Setelah berangkat, data tidak bisa diubah.

**Q: Apa itu Pesanan Terbuka?**
Pengiriman yang belum ditugaskan ke truck/driver mana pun. Semua driver bisa
melihatnya di tab **Terbuka** dan mengajukan **Ambil Pesanan** (klaim), lalu
menunggu konfirmasi admin.

**Q: Apa itu status "macet"?**
Pengiriman yang **tidak mendapat update tracking lebih dari jumlah hari**
tertentu (diatur di Konfigurasi → Tracking). Pengiriman macet muncul di
Dashboard ("AWB Memerlukan Perhatian") agar segera ditindaklanjuti.

**Q: Bisakah pengiriman dibatalkan?**
Bisa dalam batas tertentu: Client dapat membatalkan order miliknya yang belum
di-pickup; Superadmin/GMS-Admin dapat membatalkan dan dapat mengajukan
pembatalan ke Client untuk order milik Client. Order yang sudah dibatalkan
masih bisa diajukan **Pemulihan Order**.

## Tentang Rate Publish & Cek Ongkir

**Q: Apa itu Rate Publish?**
Daftar harga ongkir per kg per wilayah (pulau, provinsi, kabupaten/kota,
kecamatan) yang dipakai kalkulator **Cek Ongkir** di situs publik.

**Q: Kapan perubahan harga berlaku?**
Segera setelah disimpan (muat ulang halaman Cek Ongkir bila perlu). Perubahan
tidak mengubah pengiriman yang sudah dibuat.

**Q: Apa itu Bulk Update?**
Fitur Superadmin untuk mengubah banyak harga sekaligus: unduh data (CSV),
ubah kolom "Rate Publish Baru", unggah ulang, periksa preview, lalu konfirmasi.

**Q: Apakah data yang dihapus permanen masih bisa ditemukan?**
Tidak. **Hapus Permanen** Rate Publish langsung menghapus data tanpa Recycle
Bin. Yang tersisa hanyalah riwayat harga & catatan Audit Log. Berbeda dengan
**Hapus (ke Recycle Bin)** yang masih bisa dipulihkan.

## Tentang Driver

**Q: Bagaimana cara mengambil pengiriman baru?**
Buka tab **Terbuka** di Portal Driver → cari dengan filter Client/Tujuan/
Service → klik **Ambil Pesanan** → tunggu konfirmasi admin.

**Q: Apakah wajib melaporkan posisi?**
Dianjurkan. Tombol **Perbarui Posisi** mengirim koordinat Anda sehingga admin
bisa memantau posisi truk. Posisi tidak wajib untuk menyelesaikan pengiriman.

**Q: Bagaimana menyelesaikan pengiriman?**
Pilih status **Selesai / Terkirim**, isi **Nama Penerima**, unggah **Foto
Barang Diterima** (wajib), lalu simpan. Setelah selesai, pengiriman terkunci
tidak bisa diubah lagi.

## Tentang Keamanan Data

**Q: Apakah catatan perubahan bisa dilihat?**
Ya. Halaman **Audit Log** (Superadmin & GMS-Admin) mencatat siapa mengubah apa
dan kapan, termasuk login, perubahan tarif, penghapusan permanen, dan lainnya.
Catatan tidak bisa diubah/dihapus pengguna.

**Q: Apa itu Recycle Bin?**
Tempat data yang dihapus (soft delete). Data di dalamnya bisa **dipulihkan**
oleh Superadmin. Penghapusan permanen otomatis sementara **nonaktif**, jadi
data di bin tidak hilang sendiri — kecuali melalui jalur khusus Hapus Permanen
Rate Publish.

**Q: Apakah data pengiriman bisa dihapus?**
Tidak. Data pengiriman tidak bisa dihapus oleh siapa pun, termasuk Superadmin;
yang ada hanyalah pembatalan (status Dibatalkan) dan pemulihan order.

**Q: Bagaimana cara aman menangani akun?**
Gunakan password minimal 8 karakter yang tidak mudah ditebak, ganti password
secara berkala lewat **Pengaturan Akun**, dan jangan membagikan kredensial ke
siapa pun. Setiap ganti password, sesi login lain otomatis terputus.

---

# 15. Glosarium Istilah

Daftar istilah yang dipakai di aplikasi GMS Logistics beserta artinya.

| Istilah | Arti |
|---|---|
| **AWB / Air Waybill** | Nomor resi digital pengiriman, contoh `TATA0001`. Dipakai untuk melacak pengiriman. |
| **Admin (GMS-Admin)** | Role staf internal GMS yang menjalankan operasional sehari-hari. |
| **Admin Client** | Lihat **Client**. |
| **Audit Log** | Catatan otomatis siapa mengubah apa dan kapan di seluruh aplikasi. Tidak bisa diedit pengguna. |
| **AWB macet / macet** | Pengiriman yang tidak mendapat update tracking lebih dari jumlah hari tertentu (diatur di Konfigurasi → Tracking). |
| **Bulk Update (Rate Publish)** | Mengubah banyak tarif sekaligus lewat unggah file (CSV/XLSX) dengan preview sebelum disimpan. |
| **Cek Ongkir** | Kalkulator ongkir di situs publik yang memakai data Rate Publish. |
| **Client** | Perusahaan pengguna jasa GMS; juga nama role (Admin Client) untuk akun perwakilannya. |
| **Client ID** | Kode pelanggan, contoh `IDTMDI001`, dipakai sebagai acuan akun Client dan awalan nomor AWB. |
| **Client Company Profile** | Halaman khusus Superadmin untuk mengelola logo client di situs publik. |
| **COMPRO / Company Profile** | Situs publik GMS Logistics. |
| **Dashboard** | Halaman pertama setelah login, berisi ringkasan data. |
| **Data Pengiriman** | Halaman daftar pengiriman (untuk Mitra disebut **Paket Saya**). |
| **Dedicated (Armada Dedicated)** | Unit truk yang dikhususkan untuk satu Client; Client hanya melihat/memakai unit tersebut. |
| **Driver** | Role sopir truk; bekerja di Portal Driver. |
| **ETA (Estimasi Tiba)** | Perkiraan waktu/tanggal barang tiba di tujuan. |
| **Feedback Customer** | Menampilkan penilaian/komentar dari customer. |
| **Hold** | Status pengiriman yang dijeda sementara (bisa dilepas/Lepas Hold). |
| **Import Excel** | Membuat banyak data sekaligus lewat unggah file template. |
| **Kendala** | Status saat pengiriman menghadapi masalah (penerima tidak ada, kendaraan rusak, dll.). |
| **Koli** | Satuan jumlah paket/dus dalam satu pengiriman. |
| **Lead Time** | Estimasi lama waktu pengiriman (hari). |
| **Layani(an) Default** | Layanan fallback (biasanya LTL/Regular) yang dipakai otomatis saat order memakai layanan tidak dikenal/tidak aktif. |
| **Master Data** | Data acuan: armada, kota & titik transit, rate publish, layanan, clients, mitra. |
| **Master Layanan** | Daftar layanan pengiriman yang bisa dipilih saat membuat order. |
| **Mitra** | Agen/partner GMS yang mengerjakan pengiriman yang diteruskan kepadanya. |
| **Mitra (masking)** | Data Mitra disembunyikan dari Client; kolom truck di-mask untuk Mitra. |
| **Notification Center** | Halaman daftar notifikasi (ikon lonceng). |
| **Paket Saya** | Nama menu Data Pengiriman bagi role Mitra. |
| **Pemulihan Order** | Fitur mengajukan/menyetujui pengembalian order yang statusnya Dibatalkan. |
| **Penarikan (Pullback)** | Tindakan menarik kembali pengiriman (khusus admin, bukan driver). |
| **Pesanan Terbuka** | Pengiriman yang belum ditugaskan; bisa diambil (klaim) driver. |
| **POD (Proof of Delivery)** | Bukti serah terima barang (nama penerima + foto). |
| **Portal Admin** | `https://admin.gms-logistics.id`; tempat kerja Superadmin, GMS-Admin, Viewer, Client, Mitra. |
| **Portal Driver** | `https://driver.gms-logistics.id`; aplikasi khusus Driver. |
| **Preview (Bulk Update)** | Tampilan sebelum disimpan: baris Update / Sama / Error. |
| **Rating customer** | Penilaian customer terhadap pengiriman. |
| **Recycle Bin** | Tempat data yang dihapus (soft delete); bisa dipulihkan Superadmin. |
| **Re-route** | Mengarahkan ulang pengiriman (khusus admin, bukan driver). |
| **Restore** | Memulihkan data dari Recycle Bin ke sistem aktif. |
| **Rate Publish** | Harga ongkir per kg per wilayah yang dipakai Cek Ongkir. |
| **Role** | Peran pengguna: Superadmin, Admin (GMS-Admin), Viewer, Client, Driver, Mitra. |
| **Soft Delete** | Penghapusan yang memindahkan data ke Recycle Bin (masih bisa dipulihkan). |
| **Status** | Posisi pengiriman: Dalam Persiapan, Berangkat, Transit, Dalam Perjalanan, Kendala, Tiba di Tujuan, Selesai / Terkirim, Hold, Dibatalkan. |
| **Superadmin** | Role tertinggi; satu-satunya yang bisa mengubah harga, mengelola Recycle Bin, dan menghapus permanen Rate Publish. |
| **Timeline** | Riwayat perjalanan yang tercatat per kejadian. |
| **Tracking** | Melacak posisi/status pengiriman memakai nomor AWB. |
| **Transfer Unit** | Memindahkan pengiriman ke unit truk lain (khusus admin, bukan driver). |
| **Trusted by Our Clients** | Section di situs publik yang menampilkan logo client (dikelola Superadmin). |
| **Viewer** | Role yang hanya bisa melihat (read-only). |
| **WIB** | Waktu Indonesia Barat; zona waktu yang dipakai aplikasi untuk menampilkan tanggal & jam. |

---

Selesai. Untuk pertanyaan lebih lanjut, lihat FAQ atau hubungi
tim admin GMS via WhatsApp (nomor tampil di halaman login).
