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