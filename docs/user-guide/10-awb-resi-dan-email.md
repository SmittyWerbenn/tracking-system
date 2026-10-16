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