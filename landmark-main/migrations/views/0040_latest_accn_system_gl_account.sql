DROP VIEW IF EXISTS latest_accn_system_gl_account;
CREATE VIEW latest_accn_system_gl_account
AS
SELECT pav.*
FROM accn_system_gl_account AS pav
JOIN (
  SELECT MAX(accn_system_gl_account_id) AS max_id, accn_system_gl_account_unique_id, incremental_number
  FROM accn_system_gl_account
  GROUP BY accn_system_gl_account_unique_id, incremental_number
) AS subquery ON pav.accn_system_gl_account_id = subquery.max_id;