DROP VIEW IF EXISTS latest_workflow_action_email;
CREATE VIEW latest_workflow_action_email AS
SELECT ft.*
FROM workflow_action_email AS ft
LEFT JOIN workflow_action_email AS rt
  ON ft.workflow_action_email_unique_id = rt.workflow_action_email_unique_id
  AND ft.workflow_action_email_id < rt.workflow_action_email_id
WHERE rt.workflow_action_email_id IS NULL;