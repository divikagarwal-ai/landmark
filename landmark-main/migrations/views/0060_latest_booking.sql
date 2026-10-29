DROP VIEW IF EXISTS latest_booking;

CREATE VIEW latest_booking AS
SELECT ft.*
FROM booking AS ft
LEFT JOIN booking AS rt
  ON ft.leads_uuid = rt.leads_uuid
  AND ft.booking_id < rt.booking_id
WHERE rt.booking_id IS NULL and ft.status <> 'INACTIVE';
