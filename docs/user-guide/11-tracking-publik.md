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