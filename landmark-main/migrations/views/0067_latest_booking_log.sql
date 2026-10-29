DROP VIEW IF EXISTS latest_booking_log;

CREATE VIEW latest_booking_log AS
SELECT ft.*
FROM booking_log AS ft
LEFT JOIN booking_log AS rt
  ON ft.booking_log_unique_id = rt.booking_log_unique_id
  AND ft.booking_log_id < rt.booking_log_id
WHERE rt.booking_log_id IS NULL;
