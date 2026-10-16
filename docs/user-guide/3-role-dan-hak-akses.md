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