-- "Keterangan Internal (Khusus Internal GMS)": private ops note (vendor waybill / vendor name / etc).
-- Never exposed by the public tracking API; only Superadmin/Admin can read or write it.
ALTER TABLE shipments ADD COLUMN internal_notes TEXT;
ALTER TABLE shipment_timeline_events ADD COLUMN internal_notes TEXT;
