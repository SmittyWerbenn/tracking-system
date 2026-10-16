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