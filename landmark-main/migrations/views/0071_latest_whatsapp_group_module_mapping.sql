DROP VIEW IF EXISTS latest_whatsapp_group_module_mapping;

CREATE VIEW latest_whatsapp_group_module_mapping AS
SELECT ub.*
FROM whatsapp_group_module_mapping AS ub
LEFT JOIN whatsapp_group_module_mapping AS rt
  ON ub.group_id = rt.group_id
  AND ub.whatsapp_group_module_mapping_id < rt.whatsapp_group_module_mapping_id
WHERE rt.whatsapp_group_module_mapping_id IS NULL;
