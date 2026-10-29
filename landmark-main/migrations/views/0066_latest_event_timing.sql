DROP VIEW IF EXISTS latest_event_timing;

CREATE VIEW latest_event_timing AS
SELECT ft.*
FROM event_timing AS ft
LEFT JOIN event_timing AS rt
  ON ft.event_timing_unique_id = rt.event_timing_unique_id
  AND ft.event_timing_id < rt.event_timing_id
WHERE rt.event_timing_id IS NULL;
