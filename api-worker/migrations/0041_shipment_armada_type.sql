-- 0041_shipment_armada_type.sql
-- Armada sewa (vendor luar): ops can type a rented truck's plate (and optionally the
-- driver's name) by hand, without registering them in Master Armada / Master Driver first.
--
-- armada_type   : 'internal' (Master Armada, default) | 'sewa' (vendor luar).
-- vehicle_plate : plate shown for the shipment. Internal = snapshot of trucks.nomor_unit,
--                 sewa = free text typed by ops.
-- driver_name   : optional free-text note, only meaningful for 'sewa'.
-- driver_id     : registered driver, only for 'internal' (snapshot of the assigned truck's
--                 driver). Always NULL for 'sewa'.
--
-- Non-destructive: every existing shipment becomes 'internal' (the DEFAULT) and is
-- backfilled from its current truck, so nothing changes for old data.
-- Sewa shipments never get a truck_id, so they must also be kept out of the driver
-- "Pesanan Terbuka" pool (truck_id IS NULL) - the query now filters on armada_type.

ALTER TABLE shipments ADD COLUMN armada_type TEXT NOT NULL DEFAULT 'internal' CHECK (armada_type IN ('internal', 'sewa'));
ALTER TABLE shipments ADD COLUMN vehicle_plate TEXT;
ALTER TABLE shipments ADD COLUMN driver_name TEXT;
ALTER TABLE shipments ADD COLUMN driver_id TEXT REFERENCES drivers(id);

UPDATE shipments
   SET vehicle_plate = (SELECT t.nomor_unit FROM trucks t WHERE t.id = shipments.truck_id),
       driver_id     = (SELECT t.driver_id  FROM trucks t WHERE t.id = shipments.truck_id)
 WHERE truck_id IS NOT NULL;

CREATE INDEX idx_shipments_armada_type ON shipments(armada_type, truck_id);
