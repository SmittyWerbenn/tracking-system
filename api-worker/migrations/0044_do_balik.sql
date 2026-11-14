-- 0044_do_balik.sql
-- DO Balik (Delivery Order Kembali): the original Surat Jalan / DO must be returned after delivery.
-- Additive and non-destructive: every existing shipment becomes requires_do_balik = 0 (no DO Balik).
--
-- requires_do_balik    : 1 when the AWB needs DO Balik.
-- do_balik_status      : NULL when not required; 'pending' (default once required) | 'returned'.
-- do_balik_returned_at : ISO timestamp the returned document was confirmed (set with status 'returned').

ALTER TABLE shipments ADD COLUMN requires_do_balik INTEGER NOT NULL DEFAULT 0;
ALTER TABLE shipments ADD COLUMN do_balik_status TEXT CHECK (do_balik_status IN ('pending', 'returned'));
ALTER TABLE shipments ADD COLUMN do_balik_returned_at TEXT;

CREATE INDEX idx_shipments_do_balik ON shipments(requires_do_balik, do_balik_status);
