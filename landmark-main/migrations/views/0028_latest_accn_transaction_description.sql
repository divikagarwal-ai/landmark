DROP VIEW IF EXISTS latest_accn_transaction_description;
CREATE VIEW latest_accn_transaction_description
AS
SELECT pcdc.*
FROM accn_transaction_description AS pcdc
JOIN (
  SELECT MAX(accn_transactions_id) AS max_id, transaction_description_id
  FROM accn_transaction_description
  GROUP BY transaction_description_id
) AS subquery ON pcdc.accn_transactions_id = subquery.max_id;