DROP VIEW IF EXISTS latest_template_module_mapping;
CREATE VIEW latest_template_module_mapping
AS
SELECT ft.*
FROM template_module_mapping AS ft
LEFT JOIN template_module_mapping AS rt 
  ON ft.template_module_mapping_code = rt.template_module_mapping_code
  AND ft.template_module_mapping_id < rt.template_module_mapping_id
WHERE rt.template_module_mapping_id IS NULL;