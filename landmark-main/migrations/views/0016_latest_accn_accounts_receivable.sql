DROP VIEW IF EXISTS latest_accn_accounts_receivable;
CREATE VIEW latest_accn_accounts_receivable
AS
SELECT pcdc.*
FROM accn_accounts_receivable AS pcdc
JOIN (
  SELECT MAX(accn_accounts_receivable_id) AS max_id, payment_id
  FROM accn_accounts_receivable
  GROUP BY payment_id
) AS subquery ON pcdc.accn_accounts_receivable_id = subquery.max_id;