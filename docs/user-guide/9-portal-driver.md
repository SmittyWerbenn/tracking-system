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