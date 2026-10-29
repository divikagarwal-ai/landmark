DROP VIEW IF EXISTS latest_accn_accounts_payable;
CREATE VIEW latest_accn_accounts_payable
AS
SELECT pcdc.*
FROM accn_accounts_payable AS pcdc
JOIN (
  SELECT MAX(accn_accounts_payable_id) AS max_id, accn_accounts_payable_id
  FROM accn_accounts_payable
  GROUP BY accn_accounts_payable_id
) AS subquery ON pcdc.accn_accounts_payable_id = subquery.max_id;