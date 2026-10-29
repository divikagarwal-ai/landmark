DROP VIEW IF EXISTS latest_templates_dynamic_views;
CREATE VIEW latest_templates_dynamic_views AS
SELECT ft.*
FROM templates_dynamic_views AS ft
LEFT JOIN templates_dynamic_views AS rt 
  ON ft.templates_dynamic_views_code = rt.templates_dynamic_views_code 
  AND ft.templates_dynamic_views_id < rt.templates_dynamic_views_id
WHERE rt.templates_dynamic_views_id IS NULL;