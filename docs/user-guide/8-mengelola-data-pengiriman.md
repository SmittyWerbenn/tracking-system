# 5. Cara Mengelola Data Pengiriman

## 5.1 Melihat Daftar Pengiriman

1. Buka menu **Operasional → Data Pengiriman** (untuk Mitra, menu ini bernama **Paket Saya**).
2. Sistem menampilkan tabel daftar resi (AWB) dengan kolom: AWB, Tanggal, Rute,
   Status, Truck, Driver, Last Update, dan Aksi.
3. Gunakan mode tampilan **Ringkas** atau **Detail** (tombol di kanan atas tabel).
   Mode Detail menampilkan kolom tambahan: Pengirim, Penerima, Client ID,
   Service, Berat, Koli, Estimasi Tiba, Diterima Oleh, Diterima, Keterangan.

**Batasan data yang terlihat:**
- Client → hanya pengiriman dengan Client ID sendiri.
- Driver → tidak melihat halaman ini (pakai Portal Driver).
- Mitra → hanya paket yang diteruskan ke Mitra-nya.
- Semua role **tidak** melihat pengiriman berstatus **Dibatalkan** di daftar
  utama; pengiriman batal hanya muncul jika difilter status "Dibatalkan"
  (untuk SA/Admin/Client; Viewer/Driver/Mitra tidak pernah melihat Dibatalkan).
- Pengiriman berstatus **Hold** tidak muncul untuk Driver dan Mitra.

## 5.2 Mencari dan Memfilter Pengiriman

Di atas tabel tersedia:

- **Kolom pencarian** — ketik AWB, nama, kota, atau nomor truck (hasil otomatis diperbarui).
- **Filter Status** — pilih status tertentu (Semua Status / Dalam Persiapan / Berangkat / ... / Selesai / Terkirim / Dibatalkan / Hold / dll).
- **Filter Client ID** — hanya untuk non-Client (Superadmin, GMS-Admin, Viewer, Mitra).
- **Filter tanggal** — dari tanggal s/d tanggal pembuatan.
- **Filter Macet** — dari Dashboard (tautan "AWB Macet") menampilkan hanya AWB
  tanpa update dalam jumlah hari tertentu.
- Tombol **Reset** untuk menghapus semua filter.
- Tombol **Export CSV** — mengunduh seluruh data yang cocok dengan filter
  (semua halaman, bukan hanya halaman yang tampil), bukan hanya halaman yang
  sedang dilihat.
- Tombol **Refresh** untuk memuat ulang data.

## 5.3 Melihat Detail Pengiriman (Detail AWB)

1. Dari Data Pengiriman, klik ikon mata (Detail) pada baris AWB — atau klik
   judul AWB dari Dashboard.
2. Halaman **Detail Resi / AWB** menampilkan:
   - Nomor AWB + status.
   - Data pengirim & penerima (nama, telepon, email, alamat).
   - Referensi, Client ID, Layanan, Berat, Jumlah Koli, SLA/ETA, Estimasi Tiba.
   - Deskripsi barang + foto barang & foto surat jalan.
   - **Truck & Driver** (unit, jenis, nama driver) — disembunyikan untuk
     Viewer, Client, Mitra.
   - **Mitra** (kode/nama mitra ditugaskan) — hanya untuk non-Viewer/non-Client.
   - Tanggal/Jam dibuat, status email.
   - **Bukti Serah Terima** (POD) bila sudah selesai.
   - **Posisi Terakhir Driver** bila driver melaporkan posisi (dengan tombol
     "Buka di Google Maps").
   - **QR Tracking** — pindai untuk membuka halaman tracking publik.
3. Tombol di kanan atas:
   - **Refresh**
   - **Cetak Resi** / **Download Resi** — mencetak/mengunduh resi (lihat bab 6).
   - **Kirim Email** — membuka preview email pengiriman.
   - **Lihat Tracking** — membuka halaman tracking internal (admin).
   - **+ Tambah Update Tracking** — menambah status perjalanan (non-Viewer/non-Client).

## 5.4 Mengedit Data Pengiriman

**Siapa yang dapat mengedit:**
- **Superadmin & GMS-Admin**: dapat mengedit data semua pengiriman yang belum
  **Selesai / Terkirim** atau **Dibatalkan** (termasuk layanan, SLA/ETA, dan
  penugasan).
- **Client**: dapat mengedit **seluruh data** pengiriman miliknya yang masih
  berstatus **Dalam Persiapan** (atau Hold) — termasuk alamat; tetapi **tidak
  bisa** mengubah SLA/ETA, unit truck, dan penugasan Mitra (khusus admin).

**Langkah (Superadmin/GMS-Admin):**
1. Buka detail resi, atau buka halaman **Update Tracking** dari daftar
   (ikon FileEdit pada baris).
2. Klik tombol **Edit Info Pengiriman** (jika tersedia).
3. Ubah data yang diperlukan (pengirim, penerima, alamat, kota, layanan, target
   hari, berat/koli bila tampil).
4. Klik **Simpan Perubahan**.

**Langkah (Client):**
1. Buka Data Pengiriman → cari baris pengiriman Anda yang berstatus
   **Dalam Persiapan**.
2. Klik ikon pena (Edit Data Pengiriman) pada baris.
3. Ubah data pada jendela yang muncul.
4. Simpan.

**Catatan penting:**
- Pengiriman dengan status **Selesai / Terkirim** atau **Dibatalkan** **terkunci**
  dan tidak bisa diubah lagi.
- Alamat hanya bisa diubah Client selama status masih **Dalam Persiapan/Hold**.
- Mengubah layanan: nilai harus layanan yang **aktif** di Master Layanan; jika
  tidak, sistem menolak (tidak ada fallback otomatis saat edit).

## 5.5 Mengubah Status Tracking (Update Tracking)

**Siapa yang dapat:**
Superadmin & GMS-Admin (via Portal Admin); Driver (via Portal Driver untuk
pengiriman miliknya); Mitra (via Portal Admin untuk paket miliknya, tanpa
Transfer Unit / Re-route / Penarikan).

**Cara membuka halaman Update Tracking:**
- Dari **Data Pengiriman**: klik ikon **Update** (FileEdit) pada baris AWB.
- Dari **Detail Resi / AWB**: klik tombol **+ Tambah Update Tracking**
  (dashed-link di kolom kanan).

**Isi halaman Update Tracking (Portal Admin):**

### a. Kartu "Data Pengiriman" (expander)
- Untuk **Superadmin & GMS-Admin**: kartu bisa dibuka (klik bagian atas) untuk
  menyimpan form **Edit Info Pengiriman** — ubah **Pengirim** (nama, telepon,
  email), **Penerima** (nama, telepon, email), **Rute** (Kota Asal/Tujuan —
  pilihan kota datang dari Master Data Kota, Alamat Asal/Tujuan), **Layanan**
  (daftar aktive dari Master Layanan; layanan lama yang sudah nonaktif tampi
  dengan mark "(nonaktif)"), dan **Target Pengiriman (Hari)** — sistem
  menampilkan **Estimasi Tiba** di bawah saat Anda tiip angka (kosongkan untuk
  menghapus ETA). Klik **Simpan Perubahan**.
- Untuk role lain (misal Mitra): kartu hanya lihat ("Hanya lihat" badge) —
  data pengiriman tampil tanpa kolom input.

### b. Form Update Tracking
1. **Status** — pilih dari daftar (sistem hanya menampilkan status **lanjutan**
   yang sah dari status saat ini; pipeline tidak bisa dibuat mundur).
2. **Lokasi (Nama Area)** — ketik atau pilih dari saran data Kota & Titik
   Transit. Khusus status **Selesai / Terkirim**: lokasi **otomatis memakai
   kota tujuan** (tidak perlu diisi).
3. **Tanggal & Jam** — isi waktu kejadian (default: hari ini + jam sekarang,
   waktu WIB).
4. **Keterangan** — wajib; deskripsi singkat status perjalanan.
5. **Foto** (opsional, bukan selesai): lampirkan satu atau lebih foto
   perjalanan (dikompres otomatis).
6. **Informasi Truck** — untuk Superadmin/GMS-Admin: **Pilih Unit Truck**
   (searchable; menampilkan nomor unit, jenis, driver). Kolom hanya "submit"
   bila unit **diganti** dari unit saat ini (update status biasa tidak
   mengubah unit). Untuk **Mitra**: unit tampil read-only.
   - Saat status **Transfer Unit**: seksi bertulis "Unit Baru" + catatan
     "Unit sebelumnya (...) akan otomatis tercatat sebagai unit yang digantikan
     pada timeline publik."
7. Sistem menampilkan catatan: *"Update ini akan langsung muncul di halaman
   tracking publik: [tanggal] · [jam] WIB"*.
8. Klik **Simpan Update** → pesan "Update tracking berhasil disimpan" → sistem
   diarahkan ke halaman tracking publik AWB tersebut.

**Saat memilih status Selesai / Terkirim (form lengkap):**
- **Nama Penerima (Diterima oleh)** — wajib. Default terisi nama penerima dari
  pengiriman; ubah jika barang diterima orang lain (rekan kerja, satpam).
- **Foto Barang Diterima** — wajib; kondisi barang saat diterima di lokasi
  tujuan. Tampil ke customer sebagai bukti (POD).
- **Foto Surat Jalan** — opsional; arsip internal, tidak tampil ke customer.
- Sistem mencatat POD dan mengunci riwayat.

**Saat pengiriman berstatus Hold:**
- Banner oranje di atas form: *"Pengiriman ini sedang di-Hold, jadi belum bisa
  diproses atau diberi update tracking. Pembuat order dapat memilih Lepas Hold
  dari halaman detail resi."*

**Saat pengiriman sudah Selesai / Terkirim (locked):**
- Form update **tidak tampil**. Sebagai ganti: kartu hijau *"Pengiriman ini
  sudah Selesai/Terkirim. Sesuai kebijakan (FR-17), riwayat pengiriman yang
  sudah closing dikunci dan tidak dapat diubah lagi untuk menjaga validitas
  data"* + tombol **Lihat Tracking**.
- Kartu **Foto Bukti Serah Terima** tampil: Anda bisa mengganti
  **Foto Barang Diterima** / **Foto Surat Jalan** **selama 30 hari sejak
  pengiriman selesai** (sistem menampilkan sisa waktu: "Bisa diganti dalam
  30 hari... Sisa waktu: X hari"). Setelah 30 hari, foto terkunci.

**Aturan penting:**
- Status **tidak bisa mundur** (pipeline maju saja). Jika mencoba memilih status
  yang lebih rendah dari status saat ini, sistem menolak dengan pesan
  "Status ... tidak bisa dipilih dari status saat ini".
- Setelah **Selesai / Terkirim** atau **Dibatalkan**, riwayat terkunci.
- **Transfer Unit** (pindah truck) hanya bisa dilakukan admin.
- **Re-route** (pengalihan) dan **Penarikan** (tarik barang) hanya admin.
- Driver/Mitra tidak dapat mengubah unit truck.

## 5.6 Klaim Pengiriman oleh Driver (Pesanan Terbuka)

Pengiriman yang dibuat **tanpa unit truck** masuk ke daftar **Pesanan Terbuka**
di Portal Driver. Alurnya:

1. Driver membuka tab **Terbuka**, melihat daftar, lalu klik **Ambil Pesanan**.
2. Sistem menandai pengiriman sebagai "Diklaim: [nama driver] — menunggu konfirmasi".
3. Admin melihat **banner ungu** di atas daftar Data Pengiriman:
   **"Klaim Pengiriman Menunggu Konfirmasi (N)"** — setiap kartu klaim
   menampilkan AWB, rute, driver (nama + telepon), tanggal request, dan unit
   (nomor + jenis) — atau kartu **Truck & Driver** di Detail Resi dengan pesan
   *"Diklaim oleh [driver] (telepon) — menunggu konfirmasi"*.
4. Admin meninjau data (driver + unit yang akan dipakai) lalu klik
   **Konfirmasi** atau **Tolak**. Sistem membuka **dialog pemutuskan kedua**
   (ClaimDecisionModal) yang menampilkan **AWB, nama driver, nomor unit, jenis
   unit** — admin harus konfirmasi yang itu memang data yang akan dipakai
   (protection kontra klik tidakintensional). Konfirmasi → pengiriman resmi
   ditugaskan ke unit tersebut; Tolak → pengiriman kembali ke daftar terbuka.
5. Setelah dikonfirmasi, pengiriman muncul di dashboard driver.

**Batasan:**
- Hanya Superadmin & GMS-Admin yang bisa mengonfirmasi/menolak klaim.
- Jika pengiriman sudah berjalan (status selain Dalam Persiapan), admin tidak
  bisa **membatalkan penugasan driver**; pembatalan penugasan hanya untuk
  pengiriman yang masih Dalam Persiapan (tombol "Batalkan Penugasan" di kartu
  Truck & Driver).
- Klaim ganda dicegah: begitu satu driver mengklaim, driver lain tidak bisa
  mengklaim AWB yang sama sampai admin memutuskan.

## 5.7 Hold Pengiriman

**Tujuan:** menahan order agar tidak diproses driver, sementara AWB tetap
terbit (misalnya menunggu pembayaran). Order berstatus Hold **tidak terlihat**
oleh Driver dan Mitra, dan **tidak bisa di-update** tracking-nya.

**Siapa yang dapat Hold/Lepas Hold:**
- **Pembuat order** saja (aturan "pemilik order"):
  - Superadmin/GMS-Admin → hanya untuk order yang mereka buat sendiri.
  - Client → untuk order Client ID sendiri yang memang dibuat oleh Client.
- Syarat: status order masih **Dalam Persiapan** dan barang **belum di-pickup**.
  Order yang sudah berangkat/berjalan, Selesai, atau Dibatalkan tidak bisa di-Hold.

**Cara Hold:**
1. Buka Data Pengiriman atau Detail Resi.
2. Pada baris/aksi order, klik **Hold** (ikon/aksi Hold Order).
3. Isi **Alasan Hold** (wajib, maks. 500 karakter).
4. Konfirmasi.

**Cara Lepas Hold:**
1. Buka order berstatus Hold.
2. Klik **Lepas Hold**.
3. Isi keterangan (wajib).
4. Konfirmasi — order kembali ke status sebelum di-Hold (mis. Dalam Persiapan)
   dan bisa diproses lagi.

**Catatan:**
- Hold **saat membuat pengiriman**: centang "Hold Pengiriman" + alasan; AWB
  tetap terbit dengan status Hold.
- Order Hold tidak bisa diteruskan ke Mitra, tidak bisa dibatalkan langsung
  sampai dilepas (kecuali lewat alur pembatalan yang menunggu keputusan Client —
  pembatalan tetap berlaku untuk order Hold karena dianggap belum di-pickup).
- Riwayat setiap Hold (siapa, kapan, alasan, kapan dilepas) tersimpan dan
  ditampilkan di detail.

## 5.8 Pembatalan Pengiriman

**Aturan utama:** order hanya bisa dibatalkan selama barang **belum di-pickup**
(status Dalam Persiapan atau Hold, dan belum ada bukti pengambilan).

**Siapa yang dapat membatalkan:**
- **Client** — membatalkan langsung order miliknya (belum di-pickup).
- **Superadmin / GMS-Admin**:
  - Order yang **dibuat GMS** (bukan Client): dapat dibatalkan langsung.
  - Order yang **dibuat Client**: **tidak bisa dibatalkan langsung** — GMS harus
    mengajukan permintaan pembatalan, dan **Client yang memutuskan**.
- **Viewer, Driver, Mitra** — tidak bisa membatalkan.

**Alur: Client membatalkan order sendiri**
1. Buka Data Pengiriman → baris order Anda.
2. Klik aksi **Batalkan Order**.
3. Isi alasan pembatalan (wajib).
4. Konfirmasi. Status menjadi **Dibatalkan** dan tercatat di timeline.

**Alur: GMS mengajukan pembatalan ke Client**
1. Admin membuka order milik Client.
2. Klik **Ajukan Pembatalan**.
3. Isi alasan (wajib). Sistem membuat permintaan dengan status Menunggu.
4. Client melihat banner "N request pembatalan menunggu keputusan Anda" di
   Data Pengiriman.
5. Client membuka aksi **Keputusan Pembatalan** → **Terima** (order Dibatalkan)
   atau **Tolak** (order tetap berjalan) — keduanya wajib memberi keterangan.

**Catatan:**
- Jika barang sudah di-pickup (sudah ada update tracking/driver position/POD),
  sistem menolak pembatalan dengan pesan "Order tidak dapat dibatalkan karena
  barang sudah dipickup."
- GMS bisa **menarik kembali** permintaan pembatalannya sendiri selama masih
  menunggu keputusan Client.
- Jika status berubah (misal barang jalan) sebelum Client memutuskan, permintaan
  dinyatakan kedaluwarsa otomatis (EXPIRED).

## 5.9 Pemulihan Order

**Tujuan:** mengembalikan order yang sudah **Dibatalkan** menjadi aktif kembali.

**Siapa yang dapat:**
- **Client** → mengajukan permintaan pemulihan untuk order Client ID sendiri
  yang berstatus Dibatalkan (dan belum ada request yang menunggu).
- **Superadmin & GMS-Admin** → menyetujui atau menolak permintaan.

**Alur:**
1. Client membuka Data Pengiriman → baris order berstatus **Dibatalkan**.
2. Klik aksi **Ajukan Pemulihan** (ikon/aksi dengan label tersebut).
3. Konfirmasi pada jendela "Ajukan Pemulihan Order?" — boleh menambahkan alasan
   (opsional).
4. Request tercatat dengan status **Menunggu Konfirmasi** (order tetap Dibatalkan
   sampai disetujui).
5. Admin membuka menu **Operasional → Pemulihan Order**.
6. Admin melihat daftar request (yang menunggu tampil paling atas; badge
   **"N menunggu"** di judul), dengan kolom AWB, Tanggal Order, Client, Status
   Order, Requested By, Tanggal Request, Status Request. Filter: pencarian AWB,
   Client, Requested By; filter status; rentang tanggal; tombol **Cari/Reset**.
7. Klik **Lihat Detail** → jendela **Detail Request Pemulihan** menampilkan
   data request (AWB, client, status order, diajukan oleh, tanggal, alasan)
   + **data order** (pengirim, penerima, rute) + **timeline lengkap** order.
8. Admin klik **Konfirmasi** (order dipulihkan) atau **Tolak** (wajib isi alasan
   penolakan).
9. Jika disetujui, order kembali ke **status sebelum dibatalkan** (misalnya
   Dalam Persiapan) dan timeline mendapat catatan "Pesanan dipulihkan setelah
   request pemulihan disetujui."

**Status request:** Menunggu Konfirmasi (PENDING) → Disetujui (APPROVED) /
Ditolak (REJECTED). Baris yang sudah diputuskan tetap tampil dengan statusnya
(bisa difilter "Semua Status").

**Catatan:**
- Jika status order sudah berubah bukan Dibatalkan saat disetujui, sistem menolak
  ("Order tidak dapat dipulihkan karena statusnya sudah ...").
- Request yang sudah diputuskan tidak bisa diubah lagi.

## 5.10 Export Data Pengiriman (CSV)

1. Buka Data Pengiriman.
2. Atur filter yang diinginkan (status, client, tanggal, pencarian).
3. Klik **Export CSV**.
4. File `data-pengiriman-<tanggal>.csv` terunduh berisi seluruh data yang cocok
   dengan filter (semua halaman).

**Siapa yang dapat:** semua role yang bisa membuka Data Pengiriman (Superadmin,
GMS-Admin, Client, Viewer, Mitra) — data yang diexport tetap mengikuti batasan
visibilitas role (misal Client hanya client ID sendiri).

## 5.11 Feedback Customer

- Customer dapat memberi **rating & komentar** dari halaman tracking publik
  setelah pengiriman selesai.
- Menu **Operasional → Feedback Customer** menampilkan semua ulasan (dengan
  ringkasan rata-rata rating) untuk **non-Mitra** (Superadmin, GMS-Admin,
  Viewer, Client).
- Mitra **tidak** melihat menu Feedback Customer (tidak muncul di sidebar-nya).

## 5.12 Notification Center

- Ikon **lonceng** di kanan atas Portal Admin menunjukkan notifikasi sistem
  (resi terbit, kendala, selesai) dengan badge belum-dibaca.
- Klik ikon lonceng untuk membuka **Notification Center**: daftar notifikasi
  yang dikirim sistem ke customer (subject, penerima, AWB) dan tautan
  "Buka Email Preview".
- Semua role yang login di Portal Admin dapat melihatnya (tampil sesuai data
  yang boleh dilihat role tersebut).