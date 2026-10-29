DROP VIEW IF EXISTS latest_role_group;

CREATE VIEW latest_role_group AS
SELECT ft.*
FROM role_group AS ft
LEFT JOIN role_group AS rt
  ON ft.role_group_unique_id = rt.role_group_unique_id
  AND ft.role_group_id < rt.role_group_id
WHERE rt.role_group_id IS NULL;
