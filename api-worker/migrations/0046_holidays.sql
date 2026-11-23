-- Master data Hari Libur / Tanggal Merah: tanggal yang dikecualikan (selain hari Minggu) dari hitungan
-- Estimasi Tiba dan KPI Percentage. Dikelola di Konfigurasi > Hari Libur (Superadmin / Admin).
CREATE TABLE IF NOT EXISTS holidays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,           -- YYYY-MM-DD
  name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 -- 1 = dipakai dalam perhitungan, 0 = dinonaktifkan
);

-- Seed 2026 (SKB 3 Menteri: libur nasional + cuti bersama) dan 2027 (libur nasional; cek ulang terhadap SKB resmi).
INSERT OR IGNORE INTO holidays (date, name) VALUES
  ('2026-01-01', 'Tahun Baru 2026 Masehi'),
  ('2026-01-16', 'Isra Mikraj Nabi Muhammad SAW'),
  ('2026-02-16', 'Cuti Bersama Tahun Baru Imlek'),
  ('2026-02-17', 'Tahun Baru Imlek 2577 Kongzili'),
  ('2026-03-18', 'Cuti Bersama Hari Suci Nyepi'),
  ('2026-03-19', 'Hari Suci Nyepi (Tahun Baru Saka 1948)'),
  ('2026-03-20', 'Cuti Bersama Idul Fitri'),
  ('2026-03-21', 'Hari Raya Idul Fitri 1447 H'),
  ('2026-03-22', 'Hari Raya Idul Fitri 1447 H'),
  ('2026-03-23', 'Cuti Bersama Idul Fitri'),
  ('2026-03-24', 'Cuti Bersama Idul Fitri'),
  ('2026-04-03', 'Wafat Yesus Kristus'),
  ('2026-04-05', 'Hari Paskah'),
  ('2026-05-01', 'Hari Buruh Internasional'),
  ('2026-05-14', 'Kenaikan Yesus Kristus'),
  ('2026-05-15', 'Cuti Bersama Kenaikan Yesus Kristus'),
  ('2026-05-27', 'Hari Raya Idul Adha 1447 H'),
  ('2026-05-28', 'Cuti Bersama Idul Adha'),
  ('2026-05-31', 'Hari Raya Waisak 2570 BE'),
  ('2026-06-01', 'Hari Lahir Pancasila'),
  ('2026-06-16', 'Tahun Baru Islam 1448 H'),
  ('2026-08-17', 'Hari Kemerdekaan RI'),
  ('2026-08-25', 'Maulid Nabi Muhammad SAW'),
  ('2026-12-24', 'Cuti Bersama Hari Raya Natal'),
  ('2026-12-25', 'Hari Raya Natal'),
  ('2027-01-01', 'Tahun Baru 2027 Masehi'),
  ('2027-01-05', 'Isra Mikraj Nabi Muhammad SAW'),
  ('2027-02-06', 'Tahun Baru Imlek 2578 Kongzili'),
  ('2027-03-09', 'Hari Suci Nyepi (Tahun Baru Saka 1949)'),
  ('2027-03-10', 'Hari Raya Idul Fitri 1448 H'),
  ('2027-03-11', 'Hari Raya Idul Fitri 1448 H'),
  ('2027-03-26', 'Wafat Yesus Kristus'),
  ('2027-03-28', 'Hari Paskah'),
  ('2027-05-01', 'Hari Buruh Internasional'),
  ('2027-05-06', 'Kenaikan Yesus Kristus'),
  ('2027-05-17', 'Hari Raya Idul Adha 1448 H'),
  ('2027-05-20', 'Hari Raya Waisak 2571 BE'),
  ('2027-06-01', 'Hari Lahir Pancasila'),
  ('2027-06-07', 'Tahun Baru Islam 1449 H'),
  ('2027-08-15', 'Maulid Nabi Muhammad SAW'),
  ('2027-08-17', 'Hari Kemerdekaan RI'),
  ('2027-12-25', 'Hari Raya Natal');
