# 15. Glosarium Istilah

Daftar istilah yang dipakai di aplikasi GMS Logistics beserta artinya.

| Istilah | Arti |
|---|---|
| **AWB / Air Waybill** | Nomor resi digital pengiriman, contoh `TATA0001`. Dipakai untuk melacak pengiriman. |
| **Admin (GMS-Admin)** | Role staf internal GMS yang menjalankan operasional sehari-hari. |
| **Admin Client** | Lihat **Client**. |
| **Audit Log** | Catatan otomatis siapa mengubah apa dan kapan di seluruh aplikasi. Tidak bisa diedit pengguna. |
| **AWB macet / macet** | Pengiriman yang tidak mendapat update tracking lebih dari jumlah hari tertentu (diatur di Konfigurasi → Tracking). |
| **Bulk Update (Rate Publish)** | Mengubah banyak tarif sekaligus lewat unggah file (CSV/XLSX) dengan preview sebelum disimpan. |
| **Cek Ongkir** | Kalkulator ongkir di situs publik yang memakai data Rate Publish. |
| **Client** | Perusahaan pengguna jasa GMS; juga nama role (Admin Client) untuk akun perwakilannya. |
| **Client ID** | Kode pelanggan, contoh `IDTMDI001`, dipakai sebagai acuan akun Client dan awalan nomor AWB. |
| **Client Company Profile** | Halaman khusus Superadmin untuk mengelola logo client di situs publik. |
| **COMPRO / Company Profile** | Situs publik GMS Logistics. |
| **Dashboard** | Halaman pertama setelah login, berisi ringkasan data. |
| **Data Pengiriman** | Halaman daftar pengiriman (untuk Mitra disebut **Paket Saya**). |
| **Dedicated (Armada Dedicated)** | Unit truk yang dikhususkan untuk satu Client; Client hanya melihat/memakai unit tersebut. |
| **Driver** | Role sopir truk; bekerja di Portal Driver. |
| **ETA (Estimasi Tiba)** | Perkiraan waktu/tanggal barang tiba di tujuan. |
| **Feedback Customer** | Menampilkan penilaian/komentar dari customer. |
| **Hold** | Status pengiriman yang dijeda sementara (bisa dilepas/Lepas Hold). |
| **Import Excel** | Membuat banyak data sekaligus lewat unggah file template. |
| **Kendala** | Status saat pengiriman menghadapi masalah (penerima tidak ada, kendaraan rusak, dll.). |
| **Koli** | Satuan jumlah paket/dus dalam satu pengiriman. |
| **Lead Time** | Estimasi lama waktu pengiriman (hari). |
| **Layani(an) Default** | Layanan fallback (biasanya LTL/Regular) yang dipakai otomatis saat order memakai layanan tidak dikenal/tidak aktif. |
| **Master Data** | Data acuan: armada, kota & titik transit, rate publish, layanan, clients, mitra. |
| **Master Layanan** | Daftar layanan pengiriman yang bisa dipilih saat membuat order. |
| **Mitra** | Agen/partner GMS yang mengerjakan pengiriman yang diteruskan kepadanya. |
| **Mitra (masking)** | Data Mitra disembunyikan dari Client; kolom truck di-mask untuk Mitra. |
| **Notification Center** | Halaman daftar notifikasi (ikon lonceng). |
| **Paket Saya** | Nama menu Data Pengiriman bagi role Mitra. |
| **Pemulihan Order** | Fitur mengajukan/menyetujui pengembalian order yang statusnya Dibatalkan. |
| **Penarikan (Pullback)** | Tindakan menarik kembali pengiriman (khusus admin, bukan driver). |
| **Pesanan Terbuka** | Pengiriman yang belum ditugaskan; bisa diambil (klaim) driver. |
| **POD (Proof of Delivery)** | Bukti serah terima barang (nama penerima + foto). |
| **Portal Admin** | `https://admin.gms-logistics.id`; tempat kerja Superadmin, GMS-Admin, Viewer, Client, Mitra. |
| **Portal Driver** | `https://driver.gms-logistics.id`; aplikasi khusus Driver. |
| **Preview (Bulk Update)** | Tampilan sebelum disimpan: baris Update / Sama / Error. |
| **Rating customer** | Penilaian customer terhadap pengiriman. |
| **Recycle Bin** | Tempat data yang dihapus (soft delete); bisa dipulihkan Superadmin. |
| **Re-route** | Mengarahkan ulang pengiriman (khusus admin, bukan driver). |
| **Restore** | Memulihkan data dari Recycle Bin ke sistem aktif. |
| **Rate Publish** | Harga ongkir per kg per wilayah yang dipakai Cek Ongkir. |
| **Role** | Peran pengguna: Superadmin, Admin (GMS-Admin), Viewer, Client, Driver, Mitra. |
| **Soft Delete** | Penghapusan yang memindahkan data ke Recycle Bin (masih bisa dipulihkan). |
| **Status** | Posisi pengiriman: Dalam Persiapan, Berangkat, Transit, Dalam Perjalanan, Kendala, Tiba di Tujuan, Selesai / Terkirim, Hold, Dibatalkan. |
| **Superadmin** | Role tertinggi; satu-satunya yang bisa mengubah harga, mengelola Recycle Bin, dan menghapus permanen Rate Publish. |
| **Timeline** | Riwayat perjalanan yang tercatat per kejadian. |
| **Tracking** | Melacak posisi/status pengiriman memakai nomor AWB. |
| **Transfer Unit** | Memindahkan pengiriman ke unit truk lain (khusus admin, bukan driver). |
| **Trusted by Our Clients** | Section di situs publik yang menampilkan logo client (dikelola Superadmin). |
| **Viewer** | Role yang hanya bisa melihat (read-only). |
| **WIB** | Waktu Indonesia Barat; zona waktu yang dipakai aplikasi untuk menampilkan tanggal & jam. |

---

Selesai. Untuk pertanyaan lebih lanjut, lihat [FAQ](faq.md) atau hubungi
tim admin GMS via WhatsApp (nomor tampil di halaman login).