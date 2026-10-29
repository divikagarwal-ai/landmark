DROP VIEW IF EXISTS latest_workflow_basic;
CREATE VIEW latest_workflow_basic AS
SELECT ft.*
FROM workflow_basic AS ft
LEFT JOIN workflow_basic AS rt
  ON ft.workflow_basic_unique_id = rt.workflow_basic_unique_id
  AND ft.workflow_basic_id < rt.workflow_basic_id
WHERE rt.workflow_basic_id IS NULL;



