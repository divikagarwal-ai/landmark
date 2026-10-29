DROP VIEW IF EXISTS latest_workflow_action_message;
CREATE VIEW latest_workflow_action_message AS
SELECT ft.*
FROM workflow_action_message AS ft
LEFT JOIN workflow_action_message AS rt
  ON ft.workflow_action_message_unique_id = rt.workflow_action_message_unique_id
  AND ft.workflow_action_message_id < rt.workflow_action_message_id
WHERE rt.workflow_action_message_id IS NULL;