DROP VIEW IF EXISTS latest_package_structure;
CREATE VIEW latest_package_structure AS
SELECT ft.*
FROM package_structure AS ft
LEFT JOIN package_structure AS rt
  ON ft.package_structure_unique_id = rt.package_structure_unique_id
  AND ft.package_structure_id < rt.package_structure_id
WHERE rt.package_structure_id IS NULL;
