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