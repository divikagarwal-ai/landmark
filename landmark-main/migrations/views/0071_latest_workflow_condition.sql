DROP VIEW IF EXISTS latest_workflow_condition;
CREATE VIEW latest_workflow_condition AS
SELECT ft.*
FROM workflow_condition AS ft
LEFT JOIN workflow_condition AS rt
  ON ft.workflow_condition_unique_id = rt.workflow_condition_unique_id
  AND ft.workflow_condition_id < rt.workflow_condition_id
WHERE rt.workflow_condition_id IS NULL;