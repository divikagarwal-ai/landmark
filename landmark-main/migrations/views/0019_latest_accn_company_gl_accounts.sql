DROP VIEW IF EXISTS latest_accn_company_gl_accounts;
CREATE VIEW latest_accn_company_gl_accounts
AS
SELECT pcdc.*
FROM accn_company_gl_accounts AS pcdc
JOIN (
  SELECT MAX(accn_company_gl_accounts_id) AS max_id, gl_account_id
  FROM accn_company_gl_accounts
  GROUP BY gl_account_id
) AS subquery ON pcdc.accn_company_gl_accounts_id = subquery.max_id;