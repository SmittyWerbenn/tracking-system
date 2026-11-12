-- 0043_ltl_tracking.sql
-- LTL (Less Than Truckload) 25-stage tracking pipeline. Purely additive and
-- non-destructive: old shipments/logs keep working (NULL / 0 = "not an LTL stage",
-- "no packing", "no transit").
--
-- shipment_timeline_events.ltl_stage : fine-grained LTL milestone code (e.g. 'PICKED_UP').
--                                      `type` still holds the coarse legacy status it maps to.
-- shipments.packing_kayu             : 1 when the cargo needs wooden packing (enables PACKING_* stages).
-- shipments.has_transit              : 1 when the route passes a transit hub (enables TRANSIT_HUB).
-- Insurance reuses the existing shipments.asuransi column.

ALTER TABLE shipment_timeline_events ADD COLUMN ltl_stage TEXT;
ALTER TABLE shipments ADD COLUMN packing_kayu INTEGER NOT NULL DEFAULT 0;
ALTER TABLE shipments ADD COLUMN has_transit INTEGER NOT NULL DEFAULT 0;
