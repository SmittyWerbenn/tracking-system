# 14. FAQ (Pertanyaan yang Sering Diajukan)

## Tentang Aplikasi & Akun

**Q: Apa itu AWB dan bagaimana cara melacaknya?**
AWB (Air Waybill) adalah nomor resi digital pengiriman, contoh `TATA0001`.
Untuk melacak, buka `https://gms-logistics.id/tracking`, masukkan nomor AWB,
tanpa perlu login.

**Q: Apa bedanya Portal Admin dan Portal Driver?**
Portal Admin (`https://admin.gms-logistics.id`) dipakai Superadmin, GMS-Admin,
Viewer, Client, dan Mitra. Portal Driver (`https://driver.gms-logistics.id`)
khusus untuk akun Driver. Keduanya terpisah — akun Driver tidak bisa login di
Portal Admin, dan akun lain tidak bisa login di Portal Driver.

**Q: Saya lupa password, bagaimana?**
Gunakan tombol **Lupa Password** di halaman login. Bila tidak berhasil,
hubungi WhatsApp Admin (nomor bisa dilihat di pengaturan Informasi Bantuan
yang ditampilkan di halaman login).

**Q: Akun saya tiba-tiba tidak bisa login.**
Kemungkinan akun Anda (atau Client/Mitra tempat Anda bernaung) **dinonaktifkan**
oleh Superadmin, atau sesi login lama diputus setelah penggantian password.
Hubungi admin GMS.

**Q: Apakah bisa satu perusahaan memiliki lebih dari satu akun?**
Bisa. Client dan Mitra masing-masing dapat memiliki banyak akun user dengan
peran yang sama, selama dibuat oleh Superadmin/GMS-Admin di Manajemen User.

## Tentang Hak Akses

**Q: Mengapa saya tidak melihat menu tertentu?**
Setiap role hanya melihat menu sesuai haknya (bab 2). Contoh: Viewer dan Client
tidak melihat menu Kelola User/Konfigurasi/Audit Log/Recycle Bin; Mitra tidak
melihat Master Armada.

**Q: Siapa yang bisa membuat pengiriman?**
Superadmin, GMS-Admin, dan Client (untuk Client ID sendiri). Viewer dan Driver
tidak bisa membuat pengiriman.

**Q: Siapa yang bisa mengubah harga (Rate Publish)?**
**Hanya Superadmin.** GMS-Admin hanya bisa melihat dan mengunduh data; Viewer
dan Client hanya melihat.

**Q: Siapa yang bisa menghapus data?**
Penghapusan umumnya **khusus Superadmin** dan data dipindahkan ke Recycle Bin
(bisa dipulihkan). Khusus **Rate Publish**, Superadmin juga punya opsi
**Hapus Permanen** yang langsung menghapus tanpa Recycle Bin (tidak bisa
dipulihkan). Data Pengiriman (AWB) tidak bisa dihapus oleh siapa pun.

**Q: GMS-Admin bisa melakukan apa saja seperti Superadmin?**
Untuk pekerjaan operasional, hampir sama. Bedanya: GMS-Admin tidak bisa
membuka Recycle Bin, mengubah harga Rate Publish, mengelola Client Company
Profile, atau mengelola akun ber-role Admin/Superadmin.

## Tentang Pengiriman

**Q: Bagaimana alur pengiriman?**
Buat pengiriman → sistem menerbitkan nomor AWB (status *Dalam Persiapan*) →
ditugaskan ke truck/driver (atau dibiarkan sebagai Pesanan Terbuka) → driver
meng-update status (*Berangkat → Transit/Dalam Perjalanan → Tiba di Tujuan →
Selesai / Terkirim*) → customer melacak lewat tracking publik.

**Q: Kenapa saya tidak bisa mengedit pengiriman?**
Pengiriman hanya bisa diedit selama masih berstatus **Dalam Persiapan** (atau
Hold untuk kasus tertentu). Setelah berangkat, data tidak bisa diubah.

**Q: Apa itu Pesanan Terbuka?**
Pengiriman yang belum ditugaskan ke truck/driver mana pun. Semua driver bisa
melihatnya di tab **Terbuka** dan mengajukan **Ambil Pesanan** (klaim), lalu
menunggu konfirmasi admin.

**Q: Apa itu status "macet"?**
Pengiriman yang **tidak mendapat update tracking lebih dari jumlah hari**
tertentu (diatur di Konfigurasi → Tracking). Pengiriman macet muncul di
Dashboard ("AWB Memerlukan Perhatian") agar segera ditindaklanjuti.

**Q: Bisakah pengiriman dibatalkan?**
Bisa dalam batas tertentu: Client dapat membatalkan order miliknya yang belum
di-pickup; Superadmin/GMS-Admin dapat membatalkan dan dapat mengajukan
pembatalan ke Client untuk order milik Client. Order yang sudah dibatalkan
masih bisa diajukan **Pemulihan Order**.

## Tentang Rate Publish & Cek Ongkir

**Q: Apa itu Rate Publish?**
Daftar harga ongkir per kg per wilayah (pulau, provinsi, kabupaten/kota,
kecamatan) yang dipakai kalkulator **Cek Ongkir** di situs publik.

**Q: Kapan perubahan harga berlaku?**
Segera setelah disimpan (muat ulang halaman Cek Ongkir bila perlu). Perubahan
tidak mengubah pengiriman yang sudah dibuat.

**Q: Apa itu Bulk Update?**
Fitur Superadmin untuk mengubah banyak harga sekaligus: unduh data (CSV),
ubah kolom "Rate Publish Baru", unggah ulang, periksa preview, lalu konfirmasi.

**Q: Apakah data yang dihapus permanen masih bisa ditemukan?**
Tidak. **Hapus Permanen** Rate Publish langsung menghapus data tanpa Recycle
Bin. Yang tersisa hanyalah riwayat harga & catatan Audit Log. Berbeda dengan
**Hapus (ke Recycle Bin)** yang masih bisa dipulihkan.

## Tentang Driver

**Q: Bagaimana cara mengambil pengiriman baru?**
Buka tab **Terbuka** di Portal Driver → cari dengan filter Client/Tujuan/
Service → klik **Ambil Pesanan** → tunggu konfirmasi admin.

**Q: Apakah wajib melaporkan posisi?**
Dianjurkan. Tombol **Perbarui Posisi** mengirim koordinat Anda sehingga admin
bisa memantau posisi truk. Posisi tidak wajib untuk menyelesaikan pengiriman.

**Q: Bagaimana menyelesaikan pengiriman?**
Pilih status **Selesai / Terkirim**, isi **Nama Penerima**, unggah **Foto
Barang Diterima** (wajib), lalu simpan. Setelah selesai, pengiriman terkunci
tidak bisa diubah lagi.

## Tentang Keamanan Data

**Q: Apakah catatan perubahan bisa dilihat?**
Ya. Halaman **Audit Log** (Superadmin & GMS-Admin) mencatat siapa mengubah apa
dan kapan, termasuk login, perubahan tarif, penghapusan permanen, dan lainnya.
Catatan tidak bisa diubah/dihapus pengguna.

**Q: Apa itu Recycle Bin?**
Tempat data yang dihapus (soft delete). Data di dalamnya bisa **dipulihkan**
oleh Superadmin. Penghapusan permanen otomatis sementara **nonaktif**, jadi
data di bin tidak hilang sendiri — kecuali melalui jalur khusus Hapus Permanen
Rate Publish.

**Q: Apakah data pengiriman bisa dihapus?**
Tidak. Data pengiriman tidak bisa dihapus oleh siapa pun, termasuk Superadmin;
yang ada hanyalah pembatalan (status Dibatalkan) dan pemulihan order.

**Q: Bagaimana cara aman menangani akun?**
Gunakan password minimal 8 karakter yang tidak mudah ditebak, ganti password
secara berkala lewat **Pengaturan Akun**, dan jangan membagikan kredensial ke
siapa pun. Setiap ganti password, sesi login lain otomatis terputus.