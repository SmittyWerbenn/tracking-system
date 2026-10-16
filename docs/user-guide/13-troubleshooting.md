# 13. Troubleshooting (Mengatasi Masalah)

Kumpulan masalah yang sering dialami pengguna beserta cara mengatasinya.
Jika masalah tidak terselesaikan setelah mencoba langkah di bawah, hubungi
**WhatsApp Admin** (lihat bab 11.3 — Informasi Bantuan) dengan menyertakan
nomor AWB (bila ada), peran akun Anda, dan pesan kesalahan yang muncul.

---

## 13.1 Masalah Login

### Tidak bisa login (password salah / akun tidak dikenal)

1. Periksa kembali email dan password (password peka huruf besar/kecil).
2. Gunakan tombol **Lupa Password** bila tersedia — ikuti petunjuk yang
   dikirim ke email Anda.
3. Jika tetap gagal, akun Anda mungkin **dinonaktifkan** — hubungi admin.

### Muncul "Akun Anda dinonaktifkan"

Penyebab: akun Anda (atau Client/Mitra tempat Anda bernaung) dinonaktifkan
oleh Superadmin. Hubungi admin GMS untuk diaktifkan kembali.

### Sudah login tapi langsung disuruh login lagi

Kemungkinan:
- Sesi login Anda sudah **habis masa berlakunya** — login ulang.
- **Password baru saja diganti** (oleh Anda atau admin) — semua sesi lama
  diputus; login ulang dengan password terbaru.

### Akun ditolak masuk Portal yang salah

- Akun **Driver** hanya bisa login di Portal Driver
  (`https://driver.gms-logistics.id`).
- Akun **Superadmin / GMS-Admin / Viewer / Client / Mitra** hanya bisa login
  di Portal Admin (`https://admin.gms-logistics.id`).

---

## 13.2 Masalah Akses / Menu Tidak Muncul

### Menu tidak muncul di sidebar

Setiap role hanya melihat menu sesuai haknya (lihat bab 2). Contoh:
- Viewer & Client tidak melihat grup Manajemen User / Konfigurasi /
  Sistem & Keamanan.
- GMS-Admin tidak melihat Recycle Bin dan Client Company Profile.
- Mitra tidak melihat Master Armada.

Jika menu seharusnya muncul untuk role Anda tetapi tidak ada, muat ulang
halaman (refresh); jika tetap, hubungi admin.

### Bisa membuka halaman tapi tombol aksi tidak muncul / klik tidak berhasil

Itu artinya role Anda hanya boleh **melihat** (read-only), misalnya:
- Viewer: tombol Tambah/Edit/Hapus tidak ada di mana pun.
- Client: tidak ada tombol ubah harga di Rate Publish.
- GMS-Admin: tidak ada opsi **Hapus Permanen** di Rate Publish (khusus
  Superadmin).

Sistem juga memeriksa ulang di server, jadi aksi yang tidak diizinkan tetap
ditolak walau dipanggil lewat alamat langsung.

### "Tidak dapat membuka halaman ini" / diarahkan ke Dashboard

Anda mengetik alamat halaman yang memang tidak diizinkan untuk role Anda
(contoh: Client membuka alamat Recycle Bin). Kembalilah ke menu yang tersedia.

---

## 13.3 Masalah Membuat / Mengedit Pengiriman

| Masalah | Solusi |
|---|---|
| Nomor AWB sudah dipakai | Nomor resi tidak boleh dobel. Cek data pengiriman yang sudah ada, atau gunakan generate otomatis dari sistem. |
| Tidak bisa memilih truck/driver | Pastikan ada unit berstatus **Available** (bukan On Trip/Maintenance/Inactive) yang bisa dipilih. |
| Layanan tidak muncul saat membuat order | Layanan mungkin sedang **Nonaktif** — order baru memakai layanan Default (biasanya LTL/Regular). Nyalakan kembali layanan di Master Layanan bila perlu. |
| Tombol Edit tidak muncul | Status pengiriman sudah lewat *Dalam Persiapan* (mis. sudah Berangkat) — data tidak bisa diubah lagi. |
| Kesalahan validasi "Client ID wajib" / "harus milik Anda" | Akun Client hanya bisa memakai Client ID sendiri; isi/nilai Client ID benar. |
| Mengubah layanan saat edit ditolak | Saat mengedit, layanan baru harus **Aktif** — sistem tidak memakai fallback otomatis (beda dengan saat membuat order baru). |

---

## 13.4 Masalah Tracking & Status

### Status / riwayat tidak muncul di tracking publik

1. Pastikan nomor AWB benar (contoh: `TATA0001` — sama persis, tanpa spasi
   berlebih).
2. Baru saja di-update? Muat ulang halaman tracking (refresh).
3. Jika AWB tidak ditemukan, minta admin memastikan nomor tersebut memang
   diterbitkan sistem.

### AWB tampil sebagai "macet" / masuk daftar "AWB Memerlukan Perhatian"

Pengiriman dianggap macet bila **tidak ada pembaruan status selama lebih dari
jumlah hari** yang diatur di **Konfigurasi → Tracking** (default sesuai
pengaturan). Solusi: driver/admin mengisi update tracking terbaru; setelah
update, AWB tidak lagi dianggap macet.

### Pengiriman sudah selesai tapi masih muncul di daftar aktif

Pengiriman yang sudah **Selesai / Terkirim** terkunci dan tidak bisa diubah;
pastikan filter status di halaman Data Pengiriman tidak menyaring semua status.
Selesai/Terkirim tampil pada tab/status tersendiri.

### Tidak bisa update status "Selesai / Terkirim" (driver)

Status selesai wajib mengisi **Nama Penerima** dan mengunggah **Foto Barang
Diterima**. Lengkapi keduanya, lalu simpan.

### Status tertentu tidak muncul di pilihan (mis. Transfer Unit, Re-route)

Transfer Unit, Re-route, dan Penarikan **khusus admin** — Driver dan Mitra
tidak melihat opsi tersebut.

---

## 13.5 Masalah Foto / File

### Gagal mengunggah foto

- Periksa ukuran file — sistem membatasi ukuran unggahan dan otomatis
  mengompres foto kamera. Gunakan file lebih kecil bila perlu.
- Periksa koneksi internet; coba lagi.
- Format yang didukung: PNG/JPG/WebP (untuk logo client, maks. 8 MB).

### Foto bukti terima tidak tampil di tracking

Pastikan foto benar-benar terunggah saat **Simpan Status** — status selesai
wajib disertai foto. Muat ulang halaman tracking.

---

## 13.6 Masalah Notifikasi & Email

### Tidak menerima email notifikasi

1. Periksa folder Spam/Promosi.
2. Pastikan email customer yang diisi di pengiriman benar.
3. Kemungkinan besar **pengiriman email sedang dimatikan** (toggle
   "Kirim email notifikasi ke customer" nonaktif di **Konfigurasi → Tracking**)
   — minta Superadmin/GMS-Admin menyalakannya kembali.

### Tombol "Kirim Email" tampak tidak melakukan apa-apa

Saat toggle email nonaktif, tombol tidak mengirim email sungguhan dan
menampilkan peringatan. Nyalakan toggle di Konfigurasi → Tracking bila email
diperlukan.

### Notifikasi di lonceng tidak muncul

- Buka halaman **Notification Center** dari ikon lonceng; pastikan tidak ada
  filter yang menyembunyikan notifikasi.
- Muat ulang halaman.

---

## 13.7 Masalah Rate Publish & Cek Ongkir

### Harga di Cek Ongkir tidak berubah

Perubahan **Rate Publish** berlaku langsung di Cek Ongkir. Jika tampak belum
berubah: muat ulang halaman Cek Ongkir (refresh) — browser bisa menyimpan
tampilan lama.

### Tidak bisa mengubah harga / tombol Edit tidak ada

**Mengubah harga hanya Superadmin.** GMS-Admin hanya bisa melihat & mengunduh
data; Viewer & Client hanya melihat.

### Bulk Update gagal / ada baris "Error"

Sistem menampilkan **Preview** sebelum menyimpan: baris Update (akan berubah),
Sama (tidak berubah), dan Error (beserta alasannya). Jika ada error, **tidak
ada perubahan yang disimpan** — perbaiki baris bermasalah di file lalu unggah
ulang.

### Terlanjur menghapus Rate Publish

- Memilih **Hapus (ke Recycle Bin)** → masih bisa dipulihkan di
  **Recycle Bin** (bab 12.2).
- Memilih **Hapus Permanen** → **tidak bisa dipulihkan**. Riwayat harga dan
  Audit Log tetap tersimpan, tetapi data tarifnya hilang permanen. Hati-hati
  memilih opsi ini.

---

## 13.8 Masalah Portal Driver

### Kamera scan tidak terbuka

- Izinkan akses kamera saat browser meminta izin.
- Periksa pengaturan kamera browser (ikon gembok di address bar / Pengaturan
  Situs). Alternatif: gunakan **Isi AWB Manual** dengan mengetik nomor AWB.

### "Lokasi ditolak" saat melaporkan posisi

Aktifkan izin lokasi di pengaturan browser (dan pastikan GPS HP menyala).
Anda tetap bisa memakai fitur lain walau posisi tidak terkirim.

### AWB tidak ditemukan saat scan / isi manual

AWB mungkin sudah ditugaskan ke driver lain atau belum masuk daftar **Pesanan
Terbuka**. Periksa tab **Aktif** — mungkin AWB tersebut sudah menjadi tugas
Anda.

### Tombol "Ambil Pesanan" tidak ada

Pesanan mungkin sudah diklaim driver lain (status "menunggu konfirmasi") atau
sudah ditugaskan. Cari pesanan terbuka lain.

---

## 13.9 Masalah Pemulihan Data (Recycle Bin)

### Data tidak bisa dipulihkan (gagal restore)

- Data sudah berstatus **Dipulihkan** atau **Dihapus Permanen** — hanya data
  *Di Recycle Bin* yang bisa dipulihkan.
- Data terkait (mis. referensi lain) membuat pemulihan tertahan. Buka
  **Detail** untuk melihat **Data Terkait** dan telusuri penyebabnya.

### Mencari data yang terhapus

Buka **Recycle Bin** (Superadmin saja) → cari dengan kata kunci/nama/jenis/
tanggal. Data yang dihapus lewat jalur biasa selalu masuk bin ini. Kecuali
**Hapus Permanen Rate Publish** — data itu tidak akan pernah ditemukan di
Recycle Bin.

---

## 13.10 Masalah Lain-lain

### Aplikasi/portal terasa lambat

1. Muat ulang halaman dan pastikan koneksi internet stabil.
2. Tutup tab yang tidak perlu.
3. Gunakan browser terbaru (Chrome/Edge/Firefox).

### Angka/format salah (mis. harga, tanggal)

- Pastikan memakai format yang diminta form (contoh: angka bulat untuk rate
  per kg; format WhatsApp `08xxx` / `+628xxx` untuk pengaturan).
- Tanggal & jam di aplikasi ditampilkan dalam **WIB**.

### Tidak yakin data berubah / khawatir ada kesalahan

Cek **Audit Log** (Superadmin & GMS-Admin) — semua perubahan tercatat di
sana beserta nama pengguna dan waktu. Ini juga bukti bila ada kejadian yang
perlu ditelusuri.