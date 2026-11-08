-- Hard-delete dummy/testing shipments and EVERYTHING that hangs off them.
-- Run via:  wrangler d1 execute gms-db --remote --file=scripts/cleanup_test_shipments.sql
-- (D1 runs a --file atomically: if any statement fails, nothing is applied.)
--
-- Mirrors the Recycle Bin purge (src/recycle.ts, shipment.purgeStatements), plus recycle_bin rows.
-- Object-storage (MinIO) files are NOT touched by SQL: run scripts/list_test_shipment_files.sql FIRST
-- and delete those object_keys from the bucket (see cleanup notes).
--
-- Every statement re-evaluates the same filter; shipments is deleted LAST so the filter still matches for all child deletes.
-- Target = the 7 listed AWBs OR awb starting with TEST OR starting with literal "__NONE__".
-- "_" is a LIKE wildcard, so it is escaped; review the PREVIEW query before running this.
-- audit_log (history of who did what) and awb_sequences (per-client counters) are kept on purpose.

DELETE FROM files WHERE
     (entity_type IN ('shipment_photo','shipment_surat_jalan','pod_barang','pod_surat_jalan') AND entity_id IN (SELECT awb FROM shipments WHERE awb IN ('TEST0013','TEST0012','TEST0011','TEST0010','TEST0009','TEST0008','__NONE__0005') OR awb LIKE 'TEST%' ESCAPE '\' OR awb LIKE '\_\_NONE\_\_%' ESCAPE '\'))
  OR (entity_type = 'timeline_photo' AND entity_id IN (SELECT id FROM shipment_timeline_events WHERE awb IN (SELECT awb FROM shipments WHERE awb IN ('TEST0013','TEST0012','TEST0011','TEST0010','TEST0009','TEST0008','__NONE__0005') OR awb LIKE 'TEST%' ESCAPE '\' OR awb LIKE '\_\_NONE\_\_%' ESCAPE '\')));
DELETE FROM driver_position_reports  WHERE awb IN (SELECT awb FROM shipments WHERE awb IN ('TEST0013','TEST0012','TEST0011','TEST0010','TEST0009','TEST0008','__NONE__0005') OR awb LIKE 'TEST%' ESCAPE '\' OR awb LIKE '\_\_NONE\_\_%' ESCAPE '\');
DELETE FROM shipment_timeline_events WHERE awb IN (SELECT awb FROM shipments WHERE awb IN ('TEST0013','TEST0012','TEST0011','TEST0010','TEST0009','TEST0008','__NONE__0005') OR awb LIKE 'TEST%' ESCAPE '\' OR awb LIKE '\_\_NONE\_\_%' ESCAPE '\');
DELETE FROM shipment_pod             WHERE awb IN (SELECT awb FROM shipments WHERE awb IN ('TEST0013','TEST0012','TEST0011','TEST0010','TEST0009','TEST0008','__NONE__0005') OR awb LIKE 'TEST%' ESCAPE '\' OR awb LIKE '\_\_NONE\_\_%' ESCAPE '\');
DELETE FROM notifications            WHERE awb IN (SELECT awb FROM shipments WHERE awb IN ('TEST0013','TEST0012','TEST0011','TEST0010','TEST0009','TEST0008','__NONE__0005') OR awb LIKE 'TEST%' ESCAPE '\' OR awb LIKE '\_\_NONE\_\_%' ESCAPE '\');
DELETE FROM feedback                 WHERE awb IN (SELECT awb FROM shipments WHERE awb IN ('TEST0013','TEST0012','TEST0011','TEST0010','TEST0009','TEST0008','__NONE__0005') OR awb LIKE 'TEST%' ESCAPE '\' OR awb LIKE '\_\_NONE\_\_%' ESCAPE '\');
DELETE FROM order_recovery_requests  WHERE awb IN (SELECT awb FROM shipments WHERE awb IN ('TEST0013','TEST0012','TEST0011','TEST0010','TEST0009','TEST0008','__NONE__0005') OR awb LIKE 'TEST%' ESCAPE '\' OR awb LIKE '\_\_NONE\_\_%' ESCAPE '\');
DELETE FROM cancellation_requests    WHERE awb IN (SELECT awb FROM shipments WHERE awb IN ('TEST0013','TEST0012','TEST0011','TEST0010','TEST0009','TEST0008','__NONE__0005') OR awb LIKE 'TEST%' ESCAPE '\' OR awb LIKE '\_\_NONE\_\_%' ESCAPE '\');
DELETE FROM shipment_holds           WHERE awb IN (SELECT awb FROM shipments WHERE awb IN ('TEST0013','TEST0012','TEST0011','TEST0010','TEST0009','TEST0008','__NONE__0005') OR awb LIKE 'TEST%' ESCAPE '\' OR awb LIKE '\_\_NONE\_\_%' ESCAPE '\');
DELETE FROM recycle_bin              WHERE entity_type = 'shipment' AND entity_id IN (SELECT awb FROM shipments WHERE awb IN ('TEST0013','TEST0012','TEST0011','TEST0010','TEST0009','TEST0008','__NONE__0005') OR awb LIKE 'TEST%' ESCAPE '\' OR awb LIKE '\_\_NONE\_\_%' ESCAPE '\');
DELETE FROM shipments                WHERE awb IN (SELECT awb FROM shipments WHERE awb IN ('TEST0013','TEST0012','TEST0011','TEST0010','TEST0009','TEST0008','__NONE__0005') OR awb LIKE 'TEST%' ESCAPE '\' OR awb LIKE '\_\_NONE\_\_%' ESCAPE '\');
