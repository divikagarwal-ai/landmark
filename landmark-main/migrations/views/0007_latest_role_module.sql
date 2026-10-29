DROP VIEW IF EXISTS latest_role_module;
CREATE VIEW latest_role_module
AS
SELECT pccp.*, module_name, submodule_name, table_name, UPPER(CONCAT(module_name,"|",submodule_name,"|",table_name)) as module_key
FROM role_module AS pccp
JOIN (
  SELECT MAX(role_module_id) AS role_module_id, role_module_unique_id
  FROM role_module
  GROUP BY role_module_unique_id
) AS subquery ON pccp.role_module_id = subquery.role_module_id
INNER join `module` on `module`.module_uuid = pccp.module_uuid