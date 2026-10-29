DROP VIEW IF EXISTS latest_user_branch;

CREATE VIEW latest_user_branch AS
SELECT ub.*
FROM user_branch AS ub
LEFT JOIN user_branch AS rt
  ON ub.user_uuid = rt.user_uuid
  AND ub.branch_uuid = rt.branch_uuid
  AND ub.user_branch_id < rt.user_branch_id
WHERE rt.user_branch_id IS NULL;
