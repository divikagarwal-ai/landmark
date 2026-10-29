DROP VIEW IF EXISTS latest_accn_accounts_payable_cheque;
CREATE VIEW latest_accn_accounts_payable_cheque
AS
SELECT pcdc.*
FROM accn_accounts_payable_cheque AS pcdc
JOIN (
  SELECT MAX(accn_accounts_payable_cheque_id) AS max_id, accn_accounts_payable_cheque_id
  FROM accn_accounts_payable_cheque
  GROUP BY accn_accounts_payable_cheque_id
) AS subquery ON pcdc.accn_accounts_payable_cheque_id = subquery.max_id;