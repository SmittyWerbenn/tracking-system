# 3. Cara Login dan Akses Aplikasi

## 3.1 Portal Admin

Portal Admin digunakan oleh **Superadmin, GMS-Admin, Viewer, Client (Admin
Client), dan Mitra**.

1. Buka `https://admin.gms-logistics.id` di browser (disarankan Chrome/Edge di
   komputer, atau browser HP).
2. Halaman **Portal Admin** akan tampil dengan kolom **Email** dan **Password**.
3. Masukkan email dan password akun Anda.
4. Klik tombol **Masuk**.
5. Setelah berhasil, Anda masuk ke **Dashboard**.

> **Penting:** Menu yang tampil di sisi kiri (sidebar) berbeda-beda tergantung
> role akun Anda. Tidak semua pengguna melihat menu yang sama. Lihat bab
> [2. Role dan Hak Akses](role-dan-hak-akses.md).

**Jika akun Anda ber-role Driver:** Anda tidak bisa login di Portal Admin.
Sistem akan menampilkan pesan "Akun Driver menggunakan Portal Driver, bukan di
sini" — silakan buka `https://driver.gms-logistics.id`.

**Detail halaman login:**
- Login form **Email** + **Password**; klik **Masuk**.
- Tombol **Lupa Password?** muncul hanya bila email yang mengetik **terdaftar**
  (email yang tidak dikenal sistem tidak diberi opsi reset).
- Bila ada **akun dinonaktifkan** (Client/Mitra), sistem menampilkan pesan
  sesuai + tautan **Hubungi Admin** (WhatsApp) untuk minta diaktifkan ulang.
- Bila ketik password salah **3× berturut-turut** untuk email yang sama, sistem
  menampilkan peringatan kecil di bawah form bahwa Anda bisa menghubungi admin
  bila lupa password (peringatan hanya langkais; tidak ada lock manual).

## 3.2 Portal Driver

Portal Driver digunakan oleh **Driver** (sopir truk).

1. Buka `https://driver.gms-logistics.id` di browser HP atau komputer.
2. Halaman **Portal Driver** akan tampil dengan kolom Email dan Password.
3. Masukkan email dan password akun Driver Anda.
4. Klik **Masuk**.
5. Setelah berhasil, Anda masuk ke Dashboard Driver.

**Jika akun Anda bukan Driver:** sistem menampilkan "Akun ini bukan akun Driver.
Gunakan Portal Admin untuk login."

> **Catatan:** Login Portal Admin dan Portal Driver memakai akun (email) yang
> sama, tetapi hanya role yang sesuai yang bisa masuk ke masing-masing portal.

## 3.3 Cara Logout

**Di Portal Admin:**
1. Klik tombol **Logout** di pojok kanan atas (di samping nama/avatar Anda).
2. Konfirmasi pada jendela yang muncul.

**Di Portal Driver:**
1. Cari tombol logout di bagian atas/luar Dashboard Driver (ikon keluar/Logout).
2. Konfirmasi jika diminta.

> Setelah logout, Anda akan diarahkan kembali ke halaman login portal tersebut.

## 3.4 Lupa Password

Tidak ada menu "reset password sendiri" di aplikasi ini. Gunakan tautan
**Lupa Password?** pada halaman login:

1. Ketik email akun Anda terlebih dahulu pada kolom Email.
2. Klik **Lupa Password?** (tautan muncul hanya bila email terdaftar).
3. Sistem membuka WhatsApp ke nomor admin yang bertugas (nomor diambil dari
   pengaturan Informasi Bantuan):
   - Akun GMS-Admin → pesan terkirim ke WhatsApp **Superadmin**.
   - Akun lain (Driver, Client, Viewer, Mitra) → pesan terkirim ke WhatsApp **Admin**.
4. Kirim pesan yang sudah terisi otomatis; admin akan membantu mengganti password.

Jika nomor WhatsApp belum dikonfigurasi, sistem menampilkan keterangan "nomor
belum dikonfigurasi" — hubungi admin GMS melalui cara lain.

> **Terlalu banyak percobaan gagal:** sistem membatasi percobaan login hingga
> **maksimal 8 percobaan per 10 menit per kombinasikan email + IP**. Jika
> lewat, sistem menampilkan "Terlalu banyak percobaan login. Coba lagi dalam
> beberapa menit." — tunggu beberapa menit lalu coba lagi (peringatan tidak
> berarti akun dikunci).

## 3.5 Akun Terkunci / Dinonaktifkan

- Jika akun Anda (Client) dinonaktifkan: muncul pesan **"Akun Client Anda
  dinonaktifkan. Hubungi admin GMS."** — hubungi Admin GMS untuk diaktifkan kembali.
- Jika akun Anda (Mitra) dinonaktifkan: muncul pesan **"Akun Mitra Anda
  dinonaktifkan. Hubungi admin GMS."**
- Jika user di nonaktifkan oleh admin, akun tersebut **tidak bisa login** sampai
  diaktifkan kembali.
- Jika salah password lebih dari 3 kali berturut-turut, halaman menampilkan
  peringatan agar menghubungi admin bila lupa password.

## 3.6 Pesan Kesalahan Login yang Umum

| Pesan | Arti & Solusi |
|---|---|
| Email tidak terdaftar. | Email tidak dikenal sistem. Pastikan email benar; jika belum punya akun, minta admin membuatkannya. Tautan "Lupa Password?" tidak muncul untuk email yang tidak terdaftar. |
| Email atau password salah. | Kredensial tidak cocok. Periksa kembali email & password. |
| Akun Client Anda dinonaktifkan. Hubungi admin GMS. | Akun/Client Anda nonaktif — hubungi admin. |
| Akun Mitra Anda dinonaktifkan. Hubungi admin GMS. | Akun/Mitra Anda nonaktif — hubungi admin. |
| Akun Driver menggunakan Portal Driver, bukan di sini. | Akun Driver harus login di driver.gms-logistics.id. |
| Akun ini bukan akun Driver. Gunakan Portal Admin untuk login. | Anda login di Portal Driver memakai akun non-Driver — gunakan admin.gms-logistics.id. |
| Terlalu banyak percobaan login. Coba lagi dalam beberapa menit. | Terlalu sering gagal login (maksimal 8 percobaan per 10 menit per email+IP). Tunggu beberapa menit lalu coba lagi. |

## 3.7 Sesi Login

- Sesuatu yang masuk akan "ingat" selama sampai **24 jam** (atau sesuai
  pengaturan sistem `SESSION_TTL_HOURS`). Setelah itu Anda harus login ulang.
- Login di satu tab tidak otomatis login di tab lain (token disimpan per tab
  browser, di sessionStorage).
- Saat Anda **mengganti password**, semua sesi login lain di perangkat lain akan
  diputus (server mengrevoke semua token aktif) — Anda harus login ulang dengan
  password baru.
- Jika lupa logout di komputer bersama, tutup tab browser atau logout dari menu.
- Logout di satu tab tidak logout di tab lain (token per tab).

## 3.8 Menghubungi Admin GMS

- Tombol **Hubungi Admin** / **Butuh Bantuan?** tersedia di halaman login
  (WhatsApp) dan di Portal Driver. Nomor tujuan diambil dari
  Konfigurasi → Informasi Bantuan yang dikelola Superadmin:
  - **WhatsApp Admin** — tujuan umum (Driver, Client, Viewer, Mitra; juga
    lupa password).
  - **WhatsApp Superadmin** — tujuan lupa password untuk akun GMS-Admin.
- Bila nomor belum dikonfigurasi, tombol menampilkan keterangan bahwa nomor
  belum diatur — hubungi tim GMS melalui cara lain (telepon kantor, email).