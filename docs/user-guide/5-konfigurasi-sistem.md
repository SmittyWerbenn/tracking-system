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