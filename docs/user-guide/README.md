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

## Daftar Isi

1. [Pengenalan Aplikasi GMS Logistics](pengenalan.md)
2. [Role dan Hak Akses Pengguna](role-dan-hak-akses.md)
3. [Cara Login dan Akses Aplikasi](login-dan-akses.md)
4. [Cara Membuat Pengiriman](membuat-pengiriman.md)
5. [Cara Mengelola Data Pengiriman](mengelola-data-pengiriman.md)
6. [Cara Mencetak / Mengunduh AWB dan Mengirim Email](awb-resi-dan-email.md)
7. [Cara Tracking Pengiriman (Publik)](tracking-publik.md)
8. [Panduan Portal Driver](portal-driver.md)
9. [Panduan Master Data](master-data.md)
10. [Panduan Manajemen User](manajemen-user.md)
11. [Panduan Konfigurasi Sistem](konfigurasi-sistem.md)
12. [Panduan Sistem dan Keamanan](sistem-keamanan.md)
13. [Troubleshooting (Mengatasi Masalah)](troubleshooting.md)
14. [FAQ (Pertanyaan yang Sering Diajukan)](faq.md)
15. [Glosarium Istilah](glosarium.md)

> **Mau versi satu dokumen utuh?** Buka
> [userguide-complete.md](userguide-complete.md) — seluruh panduan bab 1–15
> digabung dalam satu file (link antar-bab sudah disesuaikan).

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