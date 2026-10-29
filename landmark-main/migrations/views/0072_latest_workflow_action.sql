DROP VIEW IF EXISTS latest_workflow_action;
CREATE VIEW latest_workflow_action AS
SELECT ft.*
FROM workflow_action AS ft
LEFT JOIN workflow_action AS rt
  ON ft.workflow_action_unique_id = rt.workflow_action_unique_id
  AND ft.workflow_action_id < rt.workflow_action_id
WHERE rt.workflow_action_id IS NULL;