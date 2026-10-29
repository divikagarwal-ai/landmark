DROP VIEW IF EXISTS latest_accn_bank_account;
CREATE VIEW latest_accn_bank_account
AS
SELECT pcdc.*
FROM accn_bank_account AS pcdc
JOIN (
  SELECT MAX(accn_bank_account_id) AS max_id, bank_account_code
  FROM accn_bank_account
  GROUP BY bank_account_code
) AS subquery ON pcdc.accn_bank_account_id = subquery.max_id;