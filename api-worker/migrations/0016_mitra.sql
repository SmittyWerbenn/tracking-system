-- Adds the "Mitra" role (third-party partner agent accounts) plus a
-- Master Mitra table. A Mitra account logs in through the existing
-- admin login/dashboard (no separate portal) and only ever sees
-- shipments explicitly forwarded/assigned to its own Mitra via
-- shipments.mitra_id - mirrors how Client accounts are scoped by
-- customer_id.
--
-- users.role has a CHECK constraint that SQLite/D1 cannot alter in
-- place, so the table is recreated with the widened CHECK (same
-- approach as migrations 0007/0010).

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE mitras (
  kode_mitra TEXT PRIMARY KEY COLLATE NOCASE,
  nama TEXT NOT NULL,
  pic TEXT,
  telepon TEXT,
  email TEXT,
  alamat TEXT,
  area TEXT,
  aktif INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  created_by TEXT,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);
CREATE INDEX idx_mitras_aktif ON mitras(aktif);

CREATE TABLE users_new (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Superadmin','Admin','Driver','Viewer','Client','Mitra')),
  aktif INTEGER NOT NULL DEFAULT 1,
  foto_file_id TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT,
  updated_by TEXT,
  customer_id TEXT,
  mitra_id TEXT REFERENCES mitras(kode_mitra)
);

INSERT INTO users_new (id, nama, email, password_hash, role, aktif, foto_file_id, last_login_at, created_at, updated_at, created_by, updated_by, customer_id, mitra_id)
  SELECT id, nama, email, password_hash, role, aktif, foto_file_id, last_login_at, created_at, updated_at, created_by, updated_by, customer_id, NULL
  FROM users;

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_customer_id ON users(customer_id);
CREATE INDEX idx_users_mitra_id ON users(mitra_id);

PRAGMA foreign_keys=ON;

-- Which Mitra (if any) a shipment has been forwarded/assigned to -
-- separate from truck_id (the Driver/unit assignment). Chain is
-- Client -> Shipment -> Mitra -> Driver: a shipment can have a mitra_id
-- and/or a truck_id independently.
ALTER TABLE shipments ADD COLUMN mitra_id TEXT REFERENCES mitras(kode_mitra);
CREATE INDEX idx_shipments_mitra_id ON shipments(mitra_id);
