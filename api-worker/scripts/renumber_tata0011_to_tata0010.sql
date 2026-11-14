-- One-off (2026-11-14): order Cikarang -> Barito Timur was issued as AWB TATA0011 (reference TATA0010) and then
-- cancelled by the client because AWB and reference did not match. The number already given to the customer is TATA0010
-- (the earlier TATA0010 was a test order, permanently deleted 2026-11-11), so this order takes over that number and is
-- reactivated. Run: wrangler d1 execute gms-db --remote --file=scripts/renumber_tata0011_to_tata0010.sql  (atomic)
-- Guards (awb/status/last_seq in the WHERE clauses) make a second run a no-op.
PRAGMA defer_foreign_keys = ON;

-- the cancellation log goes away; the order is back at its first status (Order Dibuat)
DELETE FROM shipment_timeline_events WHERE awb = 'TATA0011' AND type = 'Dibatalkan'
   AND NOT EXISTS (SELECT 1 FROM shipments WHERE awb = 'TATA0010');

UPDATE shipments
   SET awb = 'TATA0010', status = 'Dalam Persiapan', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE awb = 'TATA0011' AND status = 'Dibatalkan' AND reference = 'TATA0010'
   AND NOT EXISTS (SELECT 1 FROM shipments x WHERE x.awb = 'TATA0010');

UPDATE shipment_timeline_events SET awb = 'TATA0010'
 WHERE awb = 'TATA0011' AND EXISTS (SELECT 1 FROM shipments WHERE awb = 'TATA0010');

-- history of this order follows its number
UPDATE audit_log SET awb = 'TATA0010'
 WHERE awb = 'TATA0011' AND EXISTS (SELECT 1 FROM shipments WHERE awb = 'TATA0010');

INSERT INTO audit_log (id, timestamp, user_id, user_name, role, action, action_label, module, awb, description)
SELECT lower(hex(randomblob(16))), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), NULL, 'System', 'Superadmin',
       'RENUMBER_AWB', 'GANTI NOMOR AWB', 'Pengiriman', 'TATA0010',
       'AWB TATA0011 (Cikarang -> Barito Timur, referensi TATA0010) diganti nomornya menjadi TATA0010 dan diaktifkan kembali (Dibatalkan -> Dalam Persiapan) atas permintaan pemilik. Nomor TATA0011 dikembalikan ke counter.'
 WHERE EXISTS (SELECT 1 FROM shipments WHERE awb = 'TATA0010')
   AND NOT EXISTS (SELECT 1 FROM audit_log WHERE action = 'RENUMBER_AWB' AND awb = 'TATA0010');

-- TATA0011 is free again: the next TATA order gets it
UPDATE awb_sequences SET last_seq = 10, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE client_id = 'TATA' AND last_seq = 11
   AND NOT EXISTS (SELECT 1 FROM shipments WHERE awb = 'TATA0011');
