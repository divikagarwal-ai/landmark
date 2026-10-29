DROP VIEW IF EXISTS latest_venue;

CREATE VIEW latest_venue AS
SELECT ft.*
FROM venue AS ft
LEFT JOIN venue AS rt
  ON ft.venue_unique_id = rt.venue_unique_id
  AND ft.venue_id < rt.venue_id
WHERE rt.venue_id IS NULL;
