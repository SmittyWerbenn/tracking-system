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