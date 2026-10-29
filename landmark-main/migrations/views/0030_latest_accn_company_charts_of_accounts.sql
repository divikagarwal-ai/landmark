DROP VIEW IF EXISTS latest_accn_company_charts_of_accounts;
CREATE VIEW latest_accn_company_charts_of_accounts
AS
SELECT acca.*,
CONCAT(prefix, gl_code, " - ", gl_code_name) as prefix_gl_code_name
FROM accn_company_charts_of_accounts AS acca
JOIN (
  SELECT MAX(accn_company_charts_of_accounts_id) AS max_id, company_charts_of_accounts_code, incremental_number
  FROM accn_company_charts_of_accounts
  GROUP BY company_charts_of_accounts_code, incremental_number
) AS subquery ON acca.accn_company_charts_of_accounts_id = subquery.max_id
ORDER BY insert_ts DESC;