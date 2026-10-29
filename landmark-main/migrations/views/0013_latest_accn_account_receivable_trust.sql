DROP VIEW IF EXISTS latest_accn_account_receivable_trust;
CREATE VIEW latest_accn_account_receivable_trust
AS
SELECT pcdc.*
FROM accn_account_receivable_trust AS pcdc
JOIN (
  SELECT MAX(accn_account_receivable_trust_id) AS max_id, payment_id
  FROM accn_account_receivable_trust
  GROUP BY payment_id
) AS subquery ON pcdc.accn_account_receivable_trust_id = subquery.max_id;