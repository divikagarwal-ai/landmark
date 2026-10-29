DROP VIEW IF EXISTS latest_accn_transaction_type;
CREATE VIEW latest_accn_transaction_type
AS
SELECT pcdc.*
FROM accn_transaction_type AS pcdc
JOIN (
  SELECT MAX(transaction_type_id) AS max_id, transaction_type_id
  FROM accn_transaction_type
  GROUP BY transaction_type_id
) AS subquery ON pcdc.transaction_type_id = subquery.max_id;