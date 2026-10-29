DROP VIEW IF EXISTS latest_occupancy;

CREATE VIEW latest_occupancy AS
SELECT ft.*
FROM occupancy AS ft
LEFT JOIN occupancy AS rt
  ON ft.occupancy_unique_id = rt.occupancy_unique_id
  AND ft.occupancy_id < rt.occupancy_id
WHERE rt.occupancy_id IS NULL and ft.status <> 'INACTIVE';
